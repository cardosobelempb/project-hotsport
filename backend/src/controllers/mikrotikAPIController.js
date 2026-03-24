const MikroNode = require('mikronode-ng');
const db = require('../config/db');

/**
 * Remove a connected user from all Mikrotik devices by MAC address.
 * @param {string} mac - MAC address of the user to remove.
 */
async function removerUsuarioPorMac(mac) {
  const [mikrotiks] = await db.query('SELECT * FROM mikrotiks');

  for (const mk of mikrotiks) {
    const { ip, usuario, senha, porta } = mk;
    const client = MikroNode.getConnection(ip, usuario, senha, porta || 8728);

    await new Promise((resolve) => {
      client
        .connect()
        .then(([login]) => {
          login.closeOnDone(true);
          return login.write('/ip/hotspot/active/print', [`?mac-address=${mac}`]);
        })
        .then((rows) => {
          if (!rows || rows.length === 0) {
            resolve(undefined);
            return;
          }
          const id = rows[0]['.id'];
          return client.connect().then(([login2]) => {
            login2.closeOnDone(true);
            return login2.write('/ip/hotspot/active/remove', [`=.id=${id}`]);
          });
        })
        .then(() => resolve(undefined))
        .catch((err) => {
          console.error(`Erro ao remover MAC ${mac} do Mikrotik ${ip}:`, err);
          resolve(undefined);
        });
    });
  }
}

module.exports = { removerUsuarioPorMac };
