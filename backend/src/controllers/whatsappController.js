let _client = null;

/**
 * Set the active WppConnect client instance.
 * Called by whatsappServer.js once the client is ready.
 * @param {import('@wppconnect-team/wppconnect').Whatsapp} client
 */
function setClient(client) {
  _client = client;
}

/**
 * Send a WhatsApp text message.
 * @param {string} telefone - Phone number (digits only, with country code).
 * @param {string} mensagem - Message text.
 */
async function enviarMensagem(telefone, mensagem) {
  if (!_client) {
    throw new Error('WhatsApp client não está pronto');
  }
  await _client.sendText(`${telefone}@c.us`, mensagem);
}

module.exports = { setClient, enviarMensagem };
