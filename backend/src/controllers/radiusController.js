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
          return db.query("SELECT ip, usuario, senha, porta FROM mikrotiks WHERE id = ?", [plano.mikrotik_id])
            .then(([[mtkRow]]) => {
              if (!mtkRow) return;
              const rateLimit = `${plano.velocidade_up}M/${plano.velocidade_down}M`;
              return criarHotspotUser(mtkRow, { username, senha: cred.value, rateLimit, duracaoMinutos: plano.duracao_minutos });
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

const verificarStatusRadius = async (req, res) => {
  const host = process.env.RADIUS_HOST || 'freeradius';
  const port = parseInt(process.env.RADIUS_PORT || '1812', 10);
  const secret = process.env.RADIUS_SECRET || 'testing123';
  const inicio = Date.now();

  try {
    const latencia = await new Promise((resolve, reject) => {
      const socket = dgram.createSocket('udp4');
      const timer = setTimeout(() => {
        try { socket.close(); } catch (_) {}
        reject(new Error('timeout'));
      }, 3000);

      // Status-Server packet (Code=12) com Message-Authenticator obrigatorio
      const id = Math.floor(Math.random() * 256);
      const packet = Buffer.alloc(38); // 20 header + 18 Message-Authenticator
      packet[0] = 12; // Code: Status-Server
      packet[1] = id;
      packet.writeUInt16BE(38, 2); // Length
      // Bytes 4-19: Request Authenticator = zeros (padrao para Status-Server)
      packet[20] = 80;  // Type: Message-Authenticator
      packet[21] = 18;  // Length: 18
      // Bytes 22-37: HMAC-MD5 (comeca zerado para calculo)

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

    res.json({ online: true, latencia_ms: latencia });
  } catch (err) {
    const motivo = err.message === 'timeout'
      ? 'Sem resposta (timeout 3s) — verifique se o FreeRADIUS está rodando'
      : err.message;
    res.json({ online: false, erro: motivo });
  }
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

module.exports = {
  criarUsuarioRadius,
  vincularPlano,
  listarUsuarios,
  deletarUsuarioRadius,
  listarSessoesAtivas,
  desconectarSessao,
  verificarStatusRadius,
};
