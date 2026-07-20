const db = require("../../db");
const { criarHotspotUser } = require("../utils/mikrotikClient");

exports.login = async (req, res) => {
  const { username, password, mikrotik_id } = req.body;

  if (!username || !password || !mikrotik_id) {
    return res.status(400).json({ message: "Usuário, senha ou mikrotik não informados" });
  }

  try {
    // Busca a senha do usuário na tabela radcheck
    const [[user]] = await db.execute(
      "SELECT value FROM radcheck WHERE username = ? AND attribute = 'Cleartext-Password'",
      [username]
    );

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    if (user.value !== password) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // Limpa sessões travadas recentes para permitir novo login (Simultaneous-Use blocker)
    await db.query(`DELETE FROM radacct WHERE username = ? AND acctstarttime >= CURDATE()`, [username]);

    // Plano vinculado ao usuário (se houver) — define rate-limit/duracao e qual
    // MikroTik deve receber o hotspot user local (ver abaixo)
    const [[vinculo]] = await db.query(
      `SELECT p.velocidade_down, p.velocidade_up, p.duracao_minutos, p.mikrotik_id
       FROM radius_users ru
       LEFT JOIN planos p ON p.id = ru.plano_id
       WHERE ru.username = ?`,
      [username]
    );

    const mtkIdConexao = (vinculo && vinculo.mikrotik_id) || parseInt(mikrotik_id, 10);

    // Pega o domínio do gateway (Mikrotik) para redirecionamento
    const [[mk]] = await db.query(
      "SELECT ip, vpn_ip, usuario, senha, porta, end_hotspot FROM mikrotiks WHERE id = ?",
      [mtkIdConexao]
    );

    if (!mk || !mk.ip) {
      return res.status(404).json({ message: "Gateway não encontrado" });
    }

    const gateway = mk.end_hotspot || mk.ip;

    res.json({ message: "Autenticado com sucesso", gateway, username });

    // Reforça o usuário como hotspot user local no MikroTik a cada login (fire-and-forget) —
    // garante acesso mesmo se o usuário foi cadastrado direto no RADIUS ou se o roteador
    // perdeu o cadastro local (reboot). Sem plano vinculado não há rate-limit/router pra aplicar.
    if (vinculo && vinculo.velocidade_down != null && vinculo.velocidade_up != null) {
      const rateLimit = `${vinculo.velocidade_up}M/${vinculo.velocidade_down}M`;
      criarHotspotUser(mk, { username, senha: password, rateLimit, duracaoMinutos: vinculo.duracao_minutos })
        .catch(e => console.warn("[login-portal] criarHotspotUser:", e.message));
    }

  } catch (err) {
    console.error("Erro no login-portal:", err);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
};
