const { RouterOSAPI } = require("node-routeros");

// node-routeros emite 'error' no proprio objeto fora da promise (ex: SOCKTMOUT
// tardio) — sem listener, derruba o processo Node inteiro.
function guardarErros(conn, contexto) {
  conn.on("error", (e) => console.warn(`[${contexto}] RouterOS error:`, e.message));
  return conn;
}

async function testarConexao({ ip, usuario, senha, porta }) {
  const conn = guardarErros(new RouterOSAPI({
    host: ip,
    user: usuario,
    password: senha,
    port: porta || 8728,
    keepalive: false,
    // node-routeros interpreta timeout em SEGUNDOS (multiplica por 1000 internamente)
    timeout: 8,
  }), "testarConexao");

  try {
    await conn.connect();
    await conn.close();
    return { sucesso: true };
  } catch (error) {
    return { sucesso: false, erro: error.message };
  }
}

/**
 * Cria (ou atualiza) o usuário no hotspot do MikroTik com rate-limit do plano.
 * Deve ser chamado de forma fire-and-forget (.catch()) para não bloquear o fluxo principal.
 *
 * @param {{ ip, usuario, senha, porta }} mikrotik  Credenciais do MikroTik
 * @param {{ username, senha, rateLimit, duracaoMinutos }} opts  Dados do usuário
 */
async function criarHotspotUser(mikrotik, { username, senha, rateLimit, duracaoMinutos }) {
  const conn = guardarErros(new RouterOSAPI({
    host: mikrotik.ip,
    user: mikrotik.usuario,
    password: mikrotik.senha,
    port: mikrotik.porta || 8728,
    keepalive: false,
    timeout: 8, // segundos (node-routeros multiplica por 1000)
  }), "criarHotspotUser");

  try {
    await conn.connect();

    // Remove entrada anterior do mesmo username (clean slate para reconexão)
    const users = await conn.write('/ip/hotspot/user/print').catch(() => []);
    const existing = (Array.isArray(users) ? users : []).find(u => u.name === username);
    if (existing) {
      await conn.write('/ip/hotspot/user/remove', [`=.id=${existing['.id']}`]).catch(() => {});
    }

    // Cria usuário com rate-limit do plano
    // rate-limit formato: rx-rate/tx-rate onde rx=upload do cliente, tx=download do cliente
    const args = [
      `=name=${username}`,
      `=password=${senha}`,
      `=rate-limit=${rateLimit}`,
    ];
    if (duracaoMinutos) {
      args.push(`=limit-uptime=${duracaoMinutos}m`);
    }

    await conn.write('/ip/hotspot/user/add', args);
    console.log(`[mikrotik] Hotspot user criado: ${username} | rate: ${rateLimit} | uptime: ${duracaoMinutos || '∞'}m`);
    return { ok: true };
  } catch (err) {
    console.warn(`[mikrotik] criarHotspotUser falhou (${username}):`, err.message);
    return { ok: false, reason: err.message };
  } finally {
    try { await conn.close(); } catch (_) {}
  }
}

/**
 * Libera domínios na walled garden do hotspot (mesma técnica usada no wizard
 * de setup pra Mercado Pago/AdSense/YouTube, em hotspotSetup.js). Idempotente
 * — checa o que já existe antes de adicionar. Deve ser chamado fire-and-forget.
 *
 * @param {{ ip, usuario, senha, porta }} mikrotik  Credenciais do MikroTik
 * @param {string[]} hosts  Domínios (sem wildcard, ex: "mercadolivre.com.br")
 */
async function liberarWalledGarden(mikrotik, hosts) {
  const lista = (hosts || []).filter(Boolean);
  if (lista.length === 0) return { ok: true, adicionados: [] };

  const conn = guardarErros(new RouterOSAPI({
    host: mikrotik.ip,
    user: mikrotik.usuario,
    password: mikrotik.senha,
    port: mikrotik.porta || 8728,
    keepalive: false,
    timeout: 8,
  }), "liberarWalledGarden");

  try {
    await conn.connect();
    const wg = await conn.write('/ip/hotspot/walled-garden/print').catch(() => []);
    const existentes = Array.isArray(wg) ? wg : [];
    const adicionados = [];

    for (const host of lista) {
      const jaExiste = existentes.some((w) => w["dst-host"] && w["dst-host"].includes(host));
      if (jaExiste) continue;
      await conn.write('/ip/hotspot/walled-garden/add', [
        `=dst-host=*${host}*`,
        "=action=allow",
      ]);
      adicionados.push(host);
    }

    if (adicionados.length > 0) {
      console.log(`[mikrotik] Walled garden liberado: ${adicionados.join(", ")}`);
    }
    return { ok: true, adicionados };
  } catch (err) {
    console.warn(`[mikrotik] liberarWalledGarden falhou:`, err.message);
    return { ok: false, reason: err.message };
  } finally {
    try { await conn.close(); } catch (_) {}
  }
}

module.exports = { testarConexao, criarHotspotUser, liberarWalledGarden, guardarErros };
