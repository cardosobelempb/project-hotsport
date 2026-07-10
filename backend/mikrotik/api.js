const MikroNode = require("mikronode-ng");

/**
 * Envia um perfil PPP para um dispositivo MikroTik via API
 * @param {Object} plano - Objeto contendo as configurações do plano
 * @param {string} plano.ip - Endereço IP do MikroTik
 * @param {string} plano.usuario - Nome de usuário para autenticação
 * @param {string} plano.senha - Senha para autenticação
 * @param {string} plano.nome - Nome do perfil a ser criado
 * @param {number} plano.velocidade_down - Velocidade de download em Mbps
 * @param {number} plano.velocidade_up - Velocidade de upload em Mbps
 * @param {number} plano.duracao_minutos - Duração da sessão em minutos
 * @returns {Promise<void>} Promise que resolve quando o perfil é criado com sucesso
 * @throws {Error} Se ocorrer erro na conexão ou criação do perfil
 */
async function enviarProfileParaMikrotik(plano) {
  // Validação de entrada
  if (!plano) {
    throw new Error('Objeto plano é obrigatório');
  }

  const requiredFields = ['ip', 'usuario', 'senha', 'nome', 'velocidade_down', 'velocidade_up', 'duracao_minutos'];
  for (const field of requiredFields) {
    if (plano[field] === undefined || plano[field] === null) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  // Validação de tipos e valores
  if (typeof plano.ip !== 'string' || plano.ip.trim() === '') {
    throw new Error('IP deve ser uma string não vazia');
  }

  if (typeof plano.usuario !== 'string' || plano.usuario.trim() === '') {
    throw new Error('Usuário deve ser uma string não vazia');
  }

  if (typeof plano.senha !== 'string') {
    throw new Error('Senha deve ser uma string');
  }

  if (typeof plano.nome !== 'string' || plano.nome.trim() === '') {
    throw new Error('Nome do perfil deve ser uma string não vazia');
  }

  if (typeof plano.velocidade_down !== 'number' || plano.velocidade_down <= 0) {
    throw new Error('Velocidade de download deve ser um número positivo');
  }

  if (typeof plano.velocidade_up !== 'number' || plano.velocidade_up <= 0) {
    throw new Error('Velocidade de upload deve ser um número positivo');
  }

  if (typeof plano.duracao_minutos !== 'number' || plano.duracao_minutos <= 0) {
    throw new Error('Duração deve ser um número positivo');
  }

  const { ip, usuario, senha, nome, velocidade_down, velocidade_up, duracao_minutos } = plano;

  let client;
  try {
    client = MikroNode.getConnection(ip, usuario, senha);
    
    // Conecta ao MikroTik
    const [login] = await client.connect();
    login.closeOnDone(true);

    // Envia o comando para criar o perfil
    await login.write('/ppp/profile/add', [
      `=name=${nome}`,
      `=rate-limit=${velocidade_down}M/${velocidade_up}M`,
      `=only-one=yes`,
      `=idle-timeout=none`,
      `=session-timeout=${duracao_minutos}m`,
      `=shared-users=1`
    ]);

    console.log(`Perfil '${nome}' criado com sucesso no Mikrotik ${ip}`);
  } catch (err) {
    console.error(`Erro ao enviar perfil '${nome}' para Mikrotik ${ip}:`, err);
    throw err; // Re-throw para que o chamador possa tratar o erro
  } finally {
    // Garante que a conexão seja fechada mesmo em caso de erro
    if (client) {
      try {
        await client.close();
      } catch (closeErr) {
        console.warn(`Erro ao fechar conexão com Mikrotik ${ip}:`, closeErr);
      }
    }
  }
}

module.exports = { enviarProfileParaMikrotik };

