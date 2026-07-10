// backend/src/services/radiusService.js
//
// Camada unica de acesso as tabelas RADIUS (radcheck, radreply, radusergroup,
// radacct, radpostauth) e a tabela custom radius_users.
//
// REGRA: nenhum controller deve tocar essas tabelas diretamente. Todo
// provisionamento/remocao/consulta passa por aqui. Isso centraliza a
// normalizacao de username, o dedupe (UNIQUE em radius_users.username,
// migration 018) e permite trocar o backend de autenticacao no futuro
// reimplementando apenas este arquivo.
const db = require("../../db");
const { RouterOSAPI } = require("node-routeros");

// ── Normalizacao ─────────────────────────────────────────────────────────────

// CPF/telefone: somente digitos. Retorna null se vazio.
function normalizeDoc(valor) {
  if (valor === null || valor === undefined) return null;
  const digits = String(valor).replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

// Retorna o primeiro candidato nao-vazio na ordem informada, ja normalizado.
// cpf/telefone viram digitos; email/mac sao usados como estao.
function resolveUsername({ cpf, telefone, email, mac } = {}, ordem = ["cpf", "telefone", "email", "mac"]) {
  const candidatos = {
    cpf: normalizeDoc(cpf),
    telefone: normalizeDoc(telefone),
    email: email || null,
    mac: mac || null,
  };
  for (const campo of ordem) {
    if (candidatos[campo]) return candidatos[campo];
  }
  return null;
}

// ── Consulta ─────────────────────────────────────────────────────────────────

async function getUserByUsername(username) {
  if (!username) return null;
  const [[row]] = await db.query("SELECT * FROM radius_users WHERE username = ? LIMIT 1", [username]);
  return row || null;
}

// Procura um usuario RADIUS ja existente para esta pessoa, por qualquer
// identificador (CPF, telefone, email, MAC). Se nao achar direto em
// radius_users, tenta mapear via leads (ex: device volta so com MAC mas o
// cliente ja tem conta criada pelo CPF).
// Retorna { username, radiusUser, lead } ou null.
async function findExistingUser({ cpf, telefone, email, mac, empresaId } = {}) {
  if (!empresaId) return null;

  const cpfN = normalizeDoc(cpf);
  const telN = normalizeDoc(telefone);
  const candidatos = [cpfN, telN, email || null, mac || null].filter(Boolean);

  if (candidatos.length > 0) {
    const placeholders = candidatos.map(() => "?").join(",");
    const [[row]] = await db.query(
      `SELECT * FROM radius_users WHERE username IN (${placeholders}) AND empresa_id = ? LIMIT 1`,
      [...candidatos, empresaId]
    );
    if (row) return { username: row.username, radiusUser: row, lead: null };
  }

  // Fallback: mapear via leads (cpf normalizado > telefone > mac)
  const condicoes = [];
  const params = [];
  if (cpfN) {
    condicoes.push("REPLACE(REPLACE(REPLACE(cpf,'.',''),'-',''),' ','') = ?");
    params.push(cpfN);
  }
  if (telN) {
    condicoes.push("REPLACE(REPLACE(REPLACE(REPLACE(telefone,'(',''),')',''),' ',''),'-','') = ?");
    params.push(telN);
  }
  if (mac) {
    condicoes.push("mac = ?");
    params.push(mac);
  }
  if (condicoes.length === 0) return null;

  // Prioriza leads mais completos (com CPF/telefone): visitas so-MAC criam
  // leads vazios que nao devem ofuscar o cadastro real do cliente.
  const [leadRows] = await db.query(
    `SELECT * FROM leads WHERE empresa_id = ? AND (${condicoes.join(" OR ")})
     ORDER BY (cpf IS NOT NULL AND cpf <> '') DESC,
              (telefone IS NOT NULL AND telefone <> '') DESC,
              id DESC
     LIMIT 5`,
    [empresaId, ...params]
  );
  if (leadRows.length === 0) return null;

  // Deriva os usernames possiveis dos leads e procura em radius_users
  const leadCandidatos = [];
  for (const l of leadRows) {
    for (const c of [normalizeDoc(l.cpf), normalizeDoc(l.telefone), l.email || null, l.mac || null]) {
      if (c && !leadCandidatos.includes(c)) leadCandidatos.push(c);
    }
  }
  if (leadCandidatos.length > 0) {
    const placeholders = leadCandidatos.map(() => "?").join(",");
    // FIELD() preserva a ordem de prioridade dos candidatos
    const [[row]] = await db.query(
      `SELECT * FROM radius_users WHERE username IN (${placeholders}) AND empresa_id = ?
       ORDER BY FIELD(username, ${placeholders}) LIMIT 1`,
      [...leadCandidatos, empresaId, ...leadCandidatos]
    );
    if (row) {
      const lead = leadRows.find(l =>
        [normalizeDoc(l.cpf), normalizeDoc(l.telefone), l.email, l.mac].includes(row.username)
      ) || leadRows[0];
      return { username: row.username, radiusUser: row, lead };
    }
  }
  return null;
}

// Segundos usados hoje — MESMA formula do dailycounter do FreeRADIUS
// (sessao aberta conta como agora - inicio; fechada usa acctsessiontime).
async function getDailyUsage(username) {
  const [[row]] = await db.query(
    `SELECT COALESCE(SUM(IF(acctstoptime IS NULL,
        UNIX_TIMESTAMP() - UNIX_TIMESTAMP(acctstarttime),
        acctsessiontime)), 0) AS usado
     FROM radacct WHERE username = ? AND DATE(acctstarttime) = CURDATE()`,
    [username]
  );
  return Number(row?.usado || 0);
}

// Situacao do acesso diario de um cliente identificado pelo MAC:
//   { status: 'desconhecido' }  — sem usuario RADIUS ou sem quota diaria (pix temporario)
//   { status: 'com_saldo', ... } — quota diaria com > 60s de margem util
//   { status: 'esgotado', ... }  — usuario existe mas consumiu a quota de hoje
async function getAccessStatusByMac({ mac, empresaId }) {
  if (!mac || !empresaId) return { status: "desconhecido" };

  const found = await findExistingUser({ mac, empresaId });
  if (!found?.username) return { status: "desconhecido" };

  const attrs = await getUserAttributes(found.username);
  const senha = attrs.find(a => a.attribute === "Cleartext-Password")?.value;
  const maxDiario = parseInt(attrs.find(a => a.attribute === "Max-Daily-Session")?.value || "0", 10);
  if (!senha || !maxDiario) return { status: "desconhecido" };

  const usadoHoje = await getDailyUsage(found.username);
  const restante = maxDiario - usadoHoje;

  const base = {
    username: found.username,
    password: senha,
    maxDiarioSegundos: maxDiario,
    usadoHojeSegundos: usadoHoje,
    restanteSegundos: Math.max(0, restante),
    lead: found.lead || null,
  };
  return restante > 60 ? { status: "com_saldo", ...base } : { status: "esgotado", ...base };
}

// Compat: retorna o saldo apenas quando ha tempo util disponivel.
async function getAccessBalanceByMac({ mac, empresaId }) {
  const info = await getAccessStatusByMac({ mac, empresaId });
  return info.status === "com_saldo" ? info : null;
}

async function hasActiveSessionByMac(mac) {
  const [[row]] = await db.query(
    "SELECT radacctid FROM radacct WHERE callingstationid = ? AND acctstoptime IS NULL LIMIT 1",
    [mac]
  );
  return !!row;
}

// Atributos do radcheck (Cleartext-Password, Max-Daily-Session, ...)
async function getUserAttributes(username) {
  const [rows] = await db.query("SELECT attribute, value FROM radcheck WHERE username = ?", [username]);
  return rows;
}

// ── Escrita ──────────────────────────────────────────────────────────────────

/**
 * Provisiona (cria ou recria) um usuario RADIUS completo.
 * Padrao DELETE→INSERT: limpa credenciais antigas e insere as novas em transacao.
 *
 * @param {Object} p
 * @param {string} p.username        Username ja resolvido/normalizado
 * @param {string} p.senha
 * @param {number} p.empresaId
 * @param {number} [p.planoId]       Gravado em radius_users.plano_id
 * @param {number} [p.grupoId]       Se informado, INSERT em radusergroup (groupname).
 *                                   Fluxos de plano passam o id do plano; trial/campanha/pix nao usam grupo.
 * @param {number} [p.nasId]         Gravado em radius_users.nas_id
 * @param {number} p.tempoSegundos
 * @param {string} [p.rateLimit]     Ex: "2M/10M" (up/down)
 * @param {number} [p.sharedUsers]   Simultaneous-Use (default 1)
 * @param {string} [p.modo]          'diario' = Max-Daily-Session no radcheck (fluxos hotspot);
 *                                   'sessao' = Session-Timeout no radcheck (acesso temporario pix)
 * @param {boolean} [p.limparSessoesDoDia] DELETE radacct de hoje (reinicia dailycounter)
 */
async function provisionUser({
  username,
  senha,
  empresaId,
  planoId = null,
  grupoId = null,
  nasId = null,
  tempoSegundos = null,
  rateLimit = null,
  sharedUsers = 1,
  modo = "diario",
  limparSessoesDoDia = false,
}) {
  if (!username || !senha) throw new Error("username e senha são obrigatórios");

  // Guarda cross-empresa: com o UNIQUE em radius_users.username, o upsert
  // abaixo ATUALIZARIA o registro — sem esta guarda, uma empresa "roubaria"
  // o usuario de outra.
  if (empresaId) {
    const existente = await getUserByUsername(username);
    if (existente && existente.empresa_id && existente.empresa_id !== empresaId) {
      const err = new Error("Username já em uso por outra empresa");
      err.status = 400;
      throw err;
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("DELETE FROM radcheck WHERE username = ?", [username]);
    await conn.query("DELETE FROM radreply WHERE username = ?", [username]);
    await conn.query("DELETE FROM radusergroup WHERE username = ?", [username]);

    if (limparSessoesDoDia) {
      await conn.query("DELETE FROM radacct WHERE username = ? AND acctstarttime >= CURDATE()", [username]);
    }

    // radcheck: senha + limite de tempo + sessoes simultaneas
    const checkRows = [[username, "Cleartext-Password", ":=", senha]];
    if (tempoSegundos) {
      const attrTempo = modo === "sessao" ? "Session-Timeout" : "Max-Daily-Session";
      checkRows.push([username, attrTempo, ":=", String(tempoSegundos)]);
    }
    checkRows.push([username, "Simultaneous-Use", ":=", String(sharedUsers || 1)]);
    await conn.query(
      `INSERT INTO radcheck (username, attribute, op, value) VALUES ${checkRows.map(() => "(?, ?, ?, ?)").join(", ")}`,
      checkRows.flat()
    );

    // radreply: banda + timeout de sessao
    const replyRows = [];
    if (rateLimit) replyRows.push([username, "Mikrotik-Rate-Limit", ":=", rateLimit]);
    if (tempoSegundos) replyRows.push([username, "Session-Timeout", ":=", String(tempoSegundos)]);
    if (replyRows.length > 0) {
      await conn.query(
        `INSERT INTO radreply (username, attribute, op, value) VALUES ${replyRows.map(() => "(?, ?, ?, ?)").join(", ")}`,
        replyRows.flat()
      );
    }

    if (grupoId) {
      await conn.query("INSERT INTO radusergroup (username, groupname) VALUES (?, ?)", [username, String(grupoId)]);
    }

    // radius_users: upsert real (UNIQUE uq_radius_users_username, migration 018)
    await conn.query(
      `INSERT INTO radius_users (empresa_id, username, plano_id, nas_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE plano_id = VALUES(plano_id), nas_id = VALUES(nas_id), empresa_id = VALUES(empresa_id)`,
      [empresaId || null, username, planoId, nasId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return { username };
}

// Vincula um plano a um usuario ja existente (preserva Cleartext-Password).
async function applyPlan({ username, empresaId, plano }) {
  const tempoSegundos = plano.duracao_minutos * 60;
  const sharedUsers = plano.shared_users || 1;
  const rateLimit = `${plano.velocidade_up}M/${plano.velocidade_down}M`;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM radcheck WHERE username = ? AND attribute != "Cleartext-Password"', [username]);
    await conn.query("DELETE FROM radreply WHERE username = ?", [username]);
    await conn.query("DELETE FROM radusergroup WHERE username = ?", [username]);

    await conn.query(
      `INSERT INTO radcheck (username, attribute, op, value) VALUES
       (?, 'Max-Daily-Session', ':=', ?),
       (?, 'Simultaneous-Use', ':=', ?)`,
      [username, String(tempoSegundos), username, String(sharedUsers)]
    );
    await conn.query(
      `INSERT INTO radreply (username, attribute, op, value) VALUES
       (?, 'Mikrotik-Rate-Limit', ':=', ?),
       (?, 'Session-Timeout', ':=', ?)`,
      [username, rateLimit, username, String(tempoSegundos)]
    );
    await conn.query("INSERT INTO radusergroup (username, groupname) VALUES (?, ?)", [username, String(plano.id)]);

    await conn.query(
      "UPDATE radius_users SET plano_id = ?, nas_id = ? WHERE username = ? AND empresa_id = ?",
      [plano.id, plano.mikrotik_id, username, empresaId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Remove o usuario de TODAS as tabelas RADIUS + radius_users.
async function deleteUser(username, { incluirPostauth = false } = {}) {
  await db.query("DELETE FROM radcheck WHERE username = ?", [username]);
  await db.query("DELETE FROM radreply WHERE username = ?", [username]);
  await db.query("DELETE FROM radusergroup WHERE username = ?", [username]);
  if (incluirPostauth) {
    await db.query("DELETE FROM radpostauth WHERE username = ?", [username]);
  }
  await db.query("DELETE FROM radius_users WHERE username = ?", [username]);
}

// Remove todos os usuarios RADIUS de uma empresa (limpeza administrativa).
async function deleteUsersByEmpresa(empresaId) {
  const [users] = await db.query("SELECT username FROM radius_users WHERE empresa_id = ?", [empresaId]);
  for (const { username } of users) {
    await db.query("DELETE FROM radcheck WHERE username = ?", [username]);
    await db.query("DELETE FROM radreply WHERE username = ?", [username]);
    await db.query("DELETE FROM radusergroup WHERE username = ?", [username]);
  }
  await db.query("DELETE FROM radius_users WHERE empresa_id = ?", [empresaId]);
  return users.length;
}

// Limpa usuarios temporarios (pix_*/pixfree_*) que nao tem sessao ativa.
async function cleanupTempUsers(prefixoLike) {
  const [antigos] = await db.query(
    `SELECT DISTINCT rc.username FROM radcheck rc
     WHERE rc.username LIKE ? AND rc.username NOT IN (
       SELECT username FROM radacct WHERE acctstoptime IS NULL
     )`,
    [prefixoLike]
  );
  for (const { username } of antigos) {
    await deleteUser(username);
  }
  return antigos.length;
}

// Limpa RADIUS a partir de um MAC (username pode ser CPF vinculado por sessao ou o proprio MAC).
async function deleteUserByMac(mac) {
  const [checks] = await db.query(
    `SELECT DISTINCT rc.username FROM radcheck rc
     JOIN radacct ra ON ra.username = rc.username
     WHERE ra.callingstationid = ?
     UNION
     SELECT username FROM radcheck WHERE username = ?`,
    [mac, mac]
  );
  for (const { username } of checks) {
    await deleteUser(username);
  }
  return checks.length;
}

// ── Sessoes ──────────────────────────────────────────────────────────────────

// Sessoes ativas da empresa (radacct sem acctstoptime).
// EXISTS em vez de INNER JOIN: imune a duplicatas residuais em radius_users.
async function getActiveSessions(empresaId) {
  const [sessoes] = await db.query(
    `SELECT
       ra.username,
       ll.cpf,
       ra.callingstationid AS mac,
       ra.framedipaddress AS ip,
       ra.nasipaddress AS gateway,
       COALESCE(m.nome, ra.nasipaddress) AS nas_nome,
       ra.acctstarttime,
       ra.acctsessiontime AS segundos,
       ra.acctinputoctets AS bytes_entrada,
       ra.acctoutputoctets AS bytes_saida
     FROM radacct ra
     LEFT JOIN mikrotiks m ON (
       m.ip COLLATE utf8mb4_unicode_ci = ra.nasipaddress COLLATE utf8mb4_unicode_ci
       OR (m.vpn_ip IS NOT NULL AND m.vpn_ip COLLATE utf8mb4_unicode_ci = ra.nasipaddress COLLATE utf8mb4_unicode_ci)
     )
     LEFT JOIN (
        SELECT mac, empresa_id, MAX(cpf) as cpf
        FROM leads
        GROUP BY mac, empresa_id
     ) ll ON ll.mac COLLATE utf8mb4_unicode_ci = ra.callingstationid COLLATE utf8mb4_unicode_ci
          AND ll.empresa_id = ?
     WHERE ra.acctstoptime IS NULL
       AND EXISTS (
         SELECT 1 FROM radius_users ru
         WHERE ru.username = ra.username AND ru.empresa_id = ?
       )
     ORDER BY ra.acctstarttime DESC`,
    [empresaId, empresaId]
  );
  return sessoes;
}

// Contagem de sessoes REAIS (mesmo criterio de getActiveSessions) — usada no dashboard.
async function getActiveSessionCounts(empresaId) {
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM radacct ra
     WHERE ra.acctstoptime IS NULL
       AND EXISTS (
         SELECT 1 FROM radius_users ru
         WHERE ru.username = ra.username AND ru.empresa_id = ?
       )`,
    [empresaId]
  );

  const [porMikrotik] = await db.query(
    `SELECT m.id, m.nome, m.ip, m.vpn_ip,
       COUNT(ra.radacctid) AS conectados,
       COALESCE(SUM(ra.acctinputoctets), 0) AS bytes_entrada,
       COALESCE(SUM(ra.acctoutputoctets), 0) AS bytes_saida,
       (SELECT COUNT(*) FROM radius_users ru
         WHERE ru.nas_id = m.id AND ru.empresa_id = m.empresa_id) AS cadastrados,
       (SELECT MAX(ra2.acctstarttime) FROM radacct ra2
         WHERE ra2.nasipaddress COLLATE utf8mb4_unicode_ci = m.ip COLLATE utf8mb4_unicode_ci
            OR (m.vpn_ip IS NOT NULL AND ra2.nasipaddress COLLATE utf8mb4_unicode_ci = m.vpn_ip COLLATE utf8mb4_unicode_ci)
       ) AS ultima_conexao
     FROM mikrotiks m
     LEFT JOIN radacct ra ON ra.acctstoptime IS NULL
       AND (ra.nasipaddress COLLATE utf8mb4_unicode_ci = m.ip COLLATE utf8mb4_unicode_ci
            OR (m.vpn_ip IS NOT NULL AND ra.nasipaddress COLLATE utf8mb4_unicode_ci = m.vpn_ip COLLATE utf8mb4_unicode_ci))
     WHERE m.empresa_id = ?
     GROUP BY m.id, m.nome, m.ip, m.vpn_ip`,
    [empresaId]
  );

  return { total: Number(total), porMikrotik };
}

// Watchdog: a node-routeros pode deixar a promise do connect() pendurada para
// sempre (ex: UNKNOWNREPLY no meio do login) — sem isso, a request HTTP nunca responde.
function withTimeout(promise, ms, mensagem) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        const err = new Error(mensagem);
        err.status = 504;
        reject(err);
      }, ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

// Desconecta uma sessao ativa no MikroTik (via RouterOS API).
// Lanca Error com .status (400/404/504) para o controller mapear.
async function disconnectSession({ empresaId, username, mac, nasIp }) {
  if (!nasIp) {
    const err = new Error("nas_ip é obrigatório");
    err.status = 400;
    throw err;
  }
  if (!username && !mac) {
    const err = new Error("username ou mac é obrigatório");
    err.status = 400;
    throw err;
  }

  const [[mikrotik]] = await db.query(
    `SELECT * FROM mikrotiks
     WHERE empresa_id = ?
       AND (ip = ? OR (vpn_ip IS NOT NULL AND vpn_ip = ?))
     LIMIT 1`,
    [empresaId, nasIp, nasIp]
  );
  if (!mikrotik) {
    const err = new Error("MikroTik não encontrada para este NAS IP");
    err.status = 404;
    throw err;
  }

  let conn;
  try {
    conn = new RouterOSAPI({
      host: mikrotik.vpn_ip || mikrotik.ip,
      user: mikrotik.usuario,
      password: mikrotik.senha,
      port: mikrotik.porta || 8728,
      keepalive: false,
      timeout: 10, // segundos (node-routeros multiplica por 1000)
    });
    // node-routeros emite 'error' no proprio objeto fora da promise
    // (ex: SOCKTMOUT tardio) — sem listener, derruba o processo Node
    conn.on("error", (e) => console.warn("[radiusService] RouterOS error:", e.message));

    const executar = async () => {
      await conn.connect();

      // Localiza sessao ativa por username, com fallback para MAC
      let sessaoId = null;
      if (username) {
        try {
          const [encontrado] = await conn.write("/ip/hotspot/active/print", [`?user=${username}`]);
          if (encontrado && encontrado !== "!done" && encontrado !== "!empty" && encontrado[".id"]) {
            sessaoId = encontrado[".id"];
          }
        } catch (_) { /* nao encontrado, tenta pelo MAC */ }
      }
      if (!sessaoId && mac) {
        try {
          const [encontrado] = await conn.write("/ip/hotspot/active/print", [`?mac-address=${mac}`]);
          if (encontrado && encontrado !== "!done" && encontrado !== "!empty" && encontrado[".id"]) {
            sessaoId = encontrado[".id"];
          }
        } catch (_) { /* nao encontrado */ }
      }

      if (!sessaoId) {
        const err = new Error("Sessão ativa não encontrada no MikroTik");
        err.status = 404;
        throw err;
      }

      await conn.write("/ip/hotspot/active/remove", [`=.id=${sessaoId}`]);
    };

    await withTimeout(executar(), 12000, "MikroTik não respondeu em 12s. Verifique a conexão com o equipamento.");
  } finally {
    // close() fire-and-forget: se a conexao esta pendurada, aguardar o close
    // penduraria a resposta HTTP junto
    if (conn) { try { Promise.resolve(conn.close()).catch(() => {}); } catch (_) {} }
  }
}

module.exports = {
  normalizeDoc,
  resolveUsername,
  getUserByUsername,
  findExistingUser,
  getDailyUsage,
  getAccessBalanceByMac,
  getAccessStatusByMac,
  hasActiveSessionByMac,
  getUserAttributes,
  provisionUser,
  applyPlan,
  deleteUser,
  deleteUsersByEmpresa,
  cleanupTempUsers,
  deleteUserByMac,
  getActiveSessions,
  getActiveSessionCounts,
  disconnectSession,
};
