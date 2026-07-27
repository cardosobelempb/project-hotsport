// backend/src/controllers/radiusController.js
const db = require('../../db');
const dgram = require('dgram');
const crypto = require('crypto');
const radius = require('../services/radiusService');
const { criarHotspotUser } = require('../utils/mikrotikClient');

// Cria um novo usuário no FreeRADIUS com isolamento por empresa
async function criarUsuarioRadius(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios' });
  }

  try {
    // Verificar se já existe username em outra empresa
    const existente = await radius.getUserByUsername(username);
    if (existente && existente.empresa_id !== req.empresa_id) {
      return res.status(400).json({ error: 'Username já em uso por outra empresa' });
    }

    await radius.provisionUser({
      username,
      senha: password,
      empresaId: req.empresa_id,
    });

    res.status(201).json({ message: 'Usuário RADIUS criado com sucesso.' });
  } catch (error) {
    console.error('Erro ao criar usuário RADIUS:', error);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Erro ao criar usuário RADIUS.' });
  }
}

const vincularPlano = async (req, res) => {
  const { username, planoId } = req.body;

  try {
    // Verificar se o username pertence a esta empresa
    const [[ru]] = await db.query(
      'SELECT id FROM radius_users WHERE username = ? AND empresa_id = ?',
      [username, req.empresa_id]
    );
    if (!ru) {
      return res.status(404).json({ error: 'Usuário não encontrado nesta empresa' });
    }

    const [[plano]] = await db.query(
      'SELECT id, nome, velocidade_down, velocidade_up, duracao_minutos, mikrotik_id, shared_users FROM planos WHERE id = ? AND empresa_id = ?',
      [planoId, req.empresa_id]
    );
    if (!plano) return res.status(404).json({ error: 'Plano não encontrado' });

    await radius.applyPlan({ username, empresaId: req.empresa_id, plano });

    res.status(200).json({ message: 'Plano vinculado ao usuário com sucesso.' });

    // Empurra o usuário como hotspot user local no MikroTik do plano (fire-and-forget),
    // igual aos fluxos públicos (lgpd/lead/trial) — sem isso o RADIUS tem os dados
    // certos mas o roteador nunca fica sabendo do usuário e a internet não libera.
    if (plano.mikrotik_id) {
      db.query(
        "SELECT value FROM radcheck WHERE username = ? AND attribute = 'Cleartext-Password'",
        [username]
      )
        .then(([[cred]]) => {
          if (!cred) return;
          return db.query("SELECT ip, vpn_ip, usuario, senha, porta FROM mikrotiks WHERE id = ?", [plano.mikrotik_id])
            .then(([[mtkRow]]) => {
              if (!mtkRow) return;
              return criarHotspotUser(mtkRow, { username, senha: cred.value, duracaoMinutos: plano.duracao_minutos });
            });
        })
        .catch(e => console.warn('[vincularPlano] criarHotspotUser:', e.message));
    }
  } catch (error) {
    console.error('Erro ao vincular plano:', error);
    res.status(500).json({ error: 'Erro ao vincular plano ao usuário.' });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page     || '1',  10));
    const per_page = Math.min(200, Math.max(1, parseInt(req.query.per_page || '12', 10)));
    const offset   = (page - 1) * per_page;

    const condicoes = ["rc.attribute = 'Cleartext-Password'", 'ru.empresa_id = ?'];
    const params    = [req.empresa_id];

    if (req.query.username) { condicoes.push('rc.username LIKE ?'); params.push(`%${req.query.username}%`); }
    if (req.query.plano)    { condicoes.push('p.nome LIKE ?');      params.push(`%${req.query.plano}%`);    }

    const WHERE = condicoes.join(' AND ');

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM radcheck rc
       INNER JOIN radius_users ru ON ru.username = rc.username
       LEFT JOIN planos p ON p.id = ru.plano_id
       WHERE ${WHERE}`,
      params
    );

    // Usuarios sem plano vinculado (trial, campanha, pix temporario) tem os
    // valores reais nos atributos RADIUS — subselects servem de fallback
    const [usuarios] = await db.query(
      `SELECT
         rc.username,
         rc.value AS senha,
         p.nome AS plano,
         p.duracao_minutos,
         p.velocidade_down,
         p.velocidade_up,
         p.shared_users,
         m.nome AS nas,
         m.ip   AS nas_ip,
         ru.criado_em,
         (SELECT rr.value FROM radreply rr
           WHERE rr.username = rc.username AND rr.attribute = 'Mikrotik-Rate-Limit' LIMIT 1) AS rate_limit,
         (SELECT rc2.value FROM radcheck rc2
           WHERE rc2.username = rc.username AND rc2.attribute = 'Max-Daily-Session' LIMIT 1) AS max_daily_session,
         (SELECT rc3.value FROM radcheck rc3
           WHERE rc3.username = rc.username AND rc3.attribute = 'Session-Timeout' LIMIT 1) AS session_timeout,
         (SELECT rc4.value FROM radcheck rc4
           WHERE rc4.username = rc.username AND rc4.attribute = 'Simultaneous-Use' LIMIT 1) AS simultaneous_use
       FROM radcheck rc
       INNER JOIN radius_users ru ON ru.username = rc.username
       LEFT JOIN planos p ON p.id = ru.plano_id
       LEFT JOIN mikrotiks m ON m.id = ru.nas_id
       WHERE ${WHERE}
       ORDER BY ru.criado_em DESC
       LIMIT ? OFFSET ?`,
      [...params, per_page, offset]
    );

    res.json({
      data:       usuarios,
      total:      Number(total),
      page,
      totalPages: Math.ceil(Number(total) / per_page),
    });
  } catch (error) {
    console.error('Erro ao listar usuários RADIUS:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

const obterUsuario = async (req, res) => {
  const { username } = req.params;

  try {
    const [[usuario]] = await db.query(
      `SELECT
         rc.username,
         rc.value AS senha,
         ru.plano_id,
         p.nome AS plano,
         p.duracao_minutos,
         p.velocidade_down,
         p.velocidade_up,
         p.shared_users,
         m.nome AS nas,
         m.ip   AS nas_ip,
         ru.criado_em,
         (SELECT rr.value FROM radreply rr
           WHERE rr.username = rc.username AND rr.attribute = 'Mikrotik-Rate-Limit' LIMIT 1) AS rate_limit,
         (SELECT rc2.value FROM radcheck rc2
           WHERE rc2.username = rc.username AND rc2.attribute = 'Max-Daily-Session' LIMIT 1) AS max_daily_session,
         (SELECT rc3.value FROM radcheck rc3
           WHERE rc3.username = rc.username AND rc3.attribute = 'Session-Timeout' LIMIT 1) AS session_timeout,
         (SELECT rc4.value FROM radcheck rc4
           WHERE rc4.username = rc.username AND rc4.attribute = 'Simultaneous-Use' LIMIT 1) AS simultaneous_use
       FROM radcheck rc
       INNER JOIN radius_users ru ON ru.username = rc.username
       LEFT JOIN planos p ON p.id = ru.plano_id
       LEFT JOIN mikrotiks m ON m.id = ru.nas_id
       WHERE rc.attribute = 'Cleartext-Password' AND rc.username = ? AND ru.empresa_id = ?`,
      [username, req.empresa_id]
    );

    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ data: usuario });
  } catch (error) {
    console.error('Erro ao buscar usuário RADIUS:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário RADIUS.' });
  }
};

const atualizarUsuario = async (req, res) => {
  const { username } = req.params;
  const { password, plano_id } = req.body;

  if (!password && !plano_id) {
    return res.status(400).json({ error: 'Informe ao menos a nova senha ou o novo plano.' });
  }

  try {
    const [[ru]] = await db.query(
      'SELECT id FROM radius_users WHERE username = ? AND empresa_id = ?',
      [username, req.empresa_id]
    );
    if (!ru) return res.status(404).json({ error: 'Usuário não encontrado nesta empresa' });

    if (password) {
      await radius.updatePassword(username, password);
    }

    if (plano_id) {
      const [[plano]] = await db.query(
        'SELECT id, nome, velocidade_down, velocidade_up, duracao_minutos, mikrotik_id, shared_users FROM planos WHERE id = ? AND empresa_id = ?',
        [plano_id, req.empresa_id]
      );
      if (!plano) return res.status(404).json({ error: 'Plano não encontrado' });

      await radius.applyPlan({ username, empresaId: req.empresa_id, plano });
    }

    res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar usuário RADIUS:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário RADIUS.' });
  }
};

async function deletarUsuarioRadius(req, res) {
  const { username } = req.params;

  try {
    const [[ru]] = await db.query(
      'SELECT id FROM radius_users WHERE username = ? AND empresa_id = ?',
      [username, req.empresa_id]
    );
    if (!ru) return res.status(404).json({ error: 'Usuário não encontrado nesta empresa' });

    await radius.deleteUser(username, { incluirPostauth: true });

    res.status(200).json({ message: 'Usuário RADIUS deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar usuário RADIUS:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário RADIUS.' });
  }
}

const listarSessoesAtivas = async (req, res) => {
  try {
    const sessoes = await radius.getActiveSessions(req.empresa_id);
    res.json(sessoes);
  } catch (error) {
    console.error("Erro ao buscar sessões ativas:", error);
    res.status(500).json({ error: "Erro ao buscar sessões ativas" });
  }
};

async function pingFreeRadius() {
  const host = process.env.RADIUS_HOST || 'freeradius';
  const port = parseInt(process.env.RADIUS_PORT || '1812', 10);
  const secret = process.env.RADIUS_SECRET || 'testing123';
  const inicio = Date.now();

  try {
    const latencia_ms = await new Promise((resolve, reject) => {
      const socket = dgram.createSocket('udp4');
      const timer = setTimeout(() => {
        try { socket.close(); } catch (_) {}
        reject(new Error('timeout'));
      }, 3000);

      const id = Math.floor(Math.random() * 256);
      const packet = Buffer.alloc(38);
      packet[0] = 12; // Code: Status-Server
      packet[1] = id;
      packet.writeUInt16BE(38, 2);
      packet[20] = 80;  // Type: Message-Authenticator
      packet[21] = 18;  // Length: 18

      const hmac = crypto.createHmac('md5', secret);
      hmac.update(packet);
      hmac.digest().copy(packet, 22);

      socket.on('message', () => {
        clearTimeout(timer);
        try { socket.close(); } catch (_) {}
        resolve(Date.now() - inicio);
      });

      socket.on('error', (err) => {
        clearTimeout(timer);
        try { socket.close(); } catch (_) {}
        reject(err);
      });

      socket.send(packet, port, host, (err) => {
        if (err) {
          clearTimeout(timer);
          try { socket.close(); } catch (_) {}
          reject(err);
        }
      });
    });
    return { online: true, latencia_ms };
  } catch (err) {
    return {
      online: false,
      erro: err.message === 'timeout' ? 'Sem resposta (timeout 3s)' : err.message,
    };
  }
}

const verificarStatusRadius = async (req, res) => {
  const resultado = await pingFreeRadius();
  if (!resultado.online) {
    return res.json({ online: false, erro: resultado.erro + ' — verifique se o container freeradius está rodando' });
  }
  res.json(resultado);
};

const desconectarSessao = async (req, res) => {
  const { username, mac, nas_ip } = req.body;

  try {
    await radius.disconnectSession({
      empresaId: req.empresa_id,
      username,
      mac,
      nasIp: nas_ip,
    });

    res.json({ message: `Sessão de ${username || mac} desconectada com sucesso.` });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Erro ao desconectar sessão:', err);
    res.status(500).json({ error: 'Erro ao desconectar sessão' });
  }
};

// Diagnóstico completo do RADIUS: tabelas, ping ao FreeRADIUS e tentativas de auth.
const diagnosticarRadius = async (req, res) => {
  try {
    const empresaId = req.empresa_id;
    const radiusSecretEsperado = process.env.RADIUS_SECRET || 'testing123';

    // 1. NAS desta empresa
    const [nasRows] = await db.query(
      "SELECT nasname, shortname, secret = ? AS secret_ok FROM nas WHERE empresa_id = ?",
      [radiusSecretEsperado, empresaId]
    );

    // 2. radacct (global — não filtra por empresa pra enxergar tudo)
    const [[{ total_radacct }]] = await db.query("SELECT COUNT(*) AS total_radacct FROM radacct");
    const [[{ sessoes_ativas }]] = await db.query("SELECT COUNT(*) AS sessoes_ativas FROM radacct WHERE acctstoptime IS NULL");
    const [ultimasRadacct] = await db.query(
      `SELECT username, callingstationid AS mac, framedipaddress AS ip,
              nasipaddress AS nas_ip, acctstarttime, acctstoptime
       FROM radacct ORDER BY radacctid DESC LIMIT 5`
    );

    // 3. radpostauth — confirma se alguma tentativa de auth chegou ao FreeRADIUS
    const [[{ total_postauth }]] = await db.query("SELECT COUNT(*) AS total_postauth FROM radpostauth");
    const [ultimasPostauth] = await db.query(
      "SELECT username, reply, authdate FROM radpostauth ORDER BY id DESC LIMIT 5"
    );

    // 4. radius_users desta empresa
    const [[{ total_radius_users }]] = await db.query(
      "SELECT COUNT(*) AS total_radius_users FROM radius_users WHERE empresa_id = ?",
      [empresaId]
    );

    // 5. Sessões visíveis desta empresa
    const [[{ sessoes_empresa }]] = await db.query(
      `SELECT COUNT(*) AS sessoes_empresa FROM radacct ra
       WHERE ra.acctstoptime IS NULL
         AND EXISTS (SELECT 1 FROM radius_users ru WHERE ru.username = ra.username AND ru.empresa_id = ?)`,
      [empresaId]
    );

    // 6. Ping FreeRADIUS (Status-Server UDP)
    const freeradiusStatus = await pingFreeRadius();

    const totalPostauth = Number(total_postauth);
    const totalRadacct  = Number(total_radacct);
    const totalRU       = Number(total_radius_users);
    const sessoesEmp    = Number(sessoes_empresa);
    const sessoesAt     = Number(sessoes_ativas);

    let problema_provavel;
    if (!freeradiusStatus.online) {
      problema_provavel = 'FreeRADIUS offline — reiniciar o container hotspot-freeradius.';
    } else if (totalPostauth === 0) {
      problema_provavel = 'FreeRADIUS online mas sem nenhuma tentativa de autenticação — re-executar o wizard do MikroTik (botão Wifi) para reconfigurar o secret RADIUS.';
    } else if (totalRadacct === 0) {
      problema_provavel = 'Autenticações chegando ao RADIUS mas sem accounting — verificar módulo sql no FreeRADIUS.';
    } else if (totalRU === 0) {
      problema_provavel = 'radius_users vazio — nenhum cliente passou pelo portal ainda.';
    } else if (sessoesEmp === 0 && sessoesAt > 0) {
      problema_provavel = 'radacct tem sessões mas nenhuma pertence a esta empresa (radius_users.empresa_id não bate).';
    } else {
      problema_provavel = 'Nenhum problema detectado — verifique se há clientes conectados agora.';
    }

    res.json({
      empresa_id: empresaId,
      nas: nasRows.map(n => ({
        nasname: n.nasname,
        shortname: n.shortname,
        secret_correto: !!n.secret_ok,
        secret_esperado: radiusSecretEsperado,
      })),
      freeradius: freeradiusStatus,
      radacct: {
        total: totalRadacct,
        sessoes_ativas: sessoesAt,
        ultimas: ultimasRadacct,
      },
      radpostauth: {
        total: totalPostauth,
        ultimas: ultimasPostauth,
      },
      radius_users: { total_empresa: totalRU },
      sessoes_visiveis_empresa: sessoesEmp,
      diagnostico: {
        radacct_vazio: totalRadacct === 0,
        nas_sem_secret_correto: nasRows.filter(n => !n.secret_ok).length,
        freeradius_online: freeradiusStatus.online,
        postauth_vazio: totalPostauth === 0,
        problema_provavel,
      },
    });
  } catch (err) {
    console.error('Erro ao diagnosticar RADIUS:', err);
    res.status(500).json({ error: 'Erro ao executar diagnóstico RADIUS.' });
  }
};

module.exports = {
  criarUsuarioRadius,
  vincularPlano,
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  deletarUsuarioRadius,
  listarSessoesAtivas,
  desconectarSessao,
  verificarStatusRadius,
  diagnosticarRadius,
};
