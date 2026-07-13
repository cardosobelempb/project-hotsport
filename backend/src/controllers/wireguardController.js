const axios = require('axios');
const db = require('../../db');

// -------------------------------------------------------
// CORRECAO DOCKER:
// Antes: http://127.0.0.1:51821  (nao funciona no Docker)
// Depois: http://wg-easy:51821   (nome do servico na rede Docker)
//
// WG_EASY_HOST -> nome do servico Docker (padrao: wg-easy)
// WG_PANEL_PORT -> porta do painel wg-easy (padrao: 51950)
// WG_HOST       -> IP publico/dominio da VPS (para os peers)
// WG_VPN_PORT   -> porta UDP do WireGuard (padrao: 51820)
// WG_PASS       -> senha do painel wg-easy
// -------------------------------------------------------

const WG_EASY_HOST = process.env.WG_EASY_HOST || 'wg-easy';
const WG_PANEL_PORT = process.env.WG_PANEL_PORT || '51950';
const WG_URL = `http://${WG_EASY_HOST}:${WG_PANEL_PORT}`;
const WG_PASS = process.env.WG_PASS || '';

// IP publico / dominio da VPS para montar o endpoint dos peers
const WG_HOST = process.env.WG_HOST || '';
// Porta UDP do WireGuard (a que os peers conectam)
const WG_VPN_PORT = process.env.WG_VPN_PORT || '51820';

let wgCookie = null;

const authenticate = async () => {
  try {
    const res = await axios.post(`${WG_URL}/api/session`, {
      password: WG_PASS
    }, { validateStatus: () => true });

    console.log(`[WG] auth status: ${res.status}`);
    console.log(`[WG] auth set-cookie: ${JSON.stringify(res.headers['set-cookie'])}`);

    if (res.status !== 200 && res.status !== 204) {
      console.error(`[WG] auth falhou (${res.status}):`, JSON.stringify(res.data));
      return false;
    }

    const setCookieHeader = res.headers['set-cookie'];
    if (!setCookieHeader) {
      console.error('[WG] auth ok mas sem cookie na resposta');
      return false;
    }
    wgCookie = Array.isArray(setCookieHeader)
      ? setCookieHeader[0].split(';')[0]
      : setCookieHeader.split(';')[0];

    console.log(`[WG] cookie capturado: ${wgCookie}`);
    return true;
  } catch (error) {
    console.error('[WG] erro ao autenticar:', error.message);
    return false;
  }
};

const makeRequest = async (method, endpoint, data = null) => {
  if (!wgCookie) await authenticate();
  try {
    const res = await axios({
      method,
      url: `${WG_URL}${endpoint}`,
      data,
      headers: { Cookie: wgCookie }
    });
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      await authenticate();
      const res = await axios({
        method,
        url: `${WG_URL}${endpoint}`,
        data,
        headers: { Cookie: wgCookie }
      });
      return res.data;
    }
    throw error;
  }
};

// Configuracoes vem de variaveis de ambiente (nao de docker-compose.yml)
const getSettings = () => ({
  wgPort: WG_VPN_PORT,
  wgHost: WG_HOST,
  panelPort: WG_PANEL_PORT
});

exports.getServerSettings = async (req, res) => {
  try {
    res.json(getSettings());
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Erro ao ler configuracoes da VPN' });
  }
};

// Atualizar settings agora apenas retorna aviso:
// em ambiente Docker as configs sao definidas no .env / docker-compose
exports.updateServerSettings = async (req, res) => {
  try {
    res.json({
      success: false,
      message:
        'Em ambiente Docker as configuracoes sao definidas no arquivo .env. Edite WG_HOST e WG_VPN_PORT no .env e reinicie os containers.',
      currentSettings: getSettings()
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar configuracoes da VPN' });
  }
};

exports.getVpnStatus = async (req, res) => {
  try {
    const allClients = await makeRequest('GET', '/api/wireguard/client');
    const settings = getSettings();
    let serverPublicKey = 'Carregando (adicione um peer para ver)';
    const serverAddress = '10.8.0.1';
    let endpoint = `${settings.wgHost}:${settings.wgPort}`;

    const [peerRows] = await db.execute(
      'SELECT wg_client_id FROM empresa_vpn_peers WHERE empresa_id = ?',
      [req.empresa_id]
    );
    const allowedIds = new Set(peerRows.map(r => r.wg_client_id));
    const clients = allClients.filter(c => allowedIds.has(c.id));

    if (allClients.length > 0) {
      const conf = await makeRequest(
        'GET',
        `/api/wireguard/client/${allClients[0].id}/configuration`
      );
      const pkMatch = conf.match(/PublicKey\s*=\s*(.*)/);
      if (pkMatch) serverPublicKey = pkMatch[1];
      const epMatch = conf.match(/Endpoint\s*=\s*(.*)/);
      if (epMatch) endpoint = epMatch[1];
    }

    res.json({
      clients,
      server: {
        publicKey: serverPublicKey,
        address: serverAddress,
        endpoint,
        subNet: '10.8.0.0/24'
      }
    });
  } catch (err) {
    console.error('Erro no getVpnStatus:', err.stack);
    res
      .status(500)
      .json({ message: 'Erro ao consultar status da VPN' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name } = req.body;
    const client = await makeRequest('POST', '/api/wireguard/client', { name });

    const clients = await makeRequest('GET', '/api/wireguard/client');
    const newClient = clients.find(c => c.name === name);
    if (newClient) {
      await db.execute(
        'INSERT INTO empresa_vpn_peers (empresa_id, wg_client_id, nome) VALUES (?, ?, ?)',
        [req.empresa_id, newClient.id, name]
      );
    }

    res.json(client);
  } catch (err) {
    console.error('Erro ao criar peer:', err);
    res.status(500).json({ message: 'Erro ao criar peer' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const [[peer]] = await db.execute(
      'SELECT id FROM empresa_vpn_peers WHERE wg_client_id = ? AND empresa_id = ?',
      [id, req.empresa_id]
    );
    if (!peer) {
      return res
        .status(403)
        .json({ message: 'Peer nao pertence a esta empresa' });
    }

    await makeRequest('DELETE', `/api/wireguard/client/${id}`);
    await db.execute(
      'DELETE FROM empresa_vpn_peers WHERE wg_client_id = ? AND empresa_id = ?',
      [id, req.empresa_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao deletar peer:', err);
    res
      .status(500)
      .json({ message: 'Erro ao deletar peer' });
  }
};

exports.getClientConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const settings = getSettings();
    const conf = await makeRequest(
      'GET',
      `/api/wireguard/client/${id}/configuration`
    );

    const privKey = conf.match(/PrivateKey\s*=\s*(.*)/)[1].trim();
    const addressMatch = conf.match(/Address\s*=\s*(.*)/);
    const address = addressMatch ? addressMatch[1].trim() : '10.8.0.2/24';
    const pubKey = conf.match(/PublicKey\s*=\s*(.*)/)[1].trim();
    const pskMatch = conf.match(/PresharedKey\s*=\s*(.*)/);
    const presharedKey = pskMatch ? pskMatch[1].trim() : null;

    const pskLine = presharedKey ? ` preshared-key="${presharedKey}"` : '';

    const routerOsScript =
      `/interface wireguard add listen-port=13231 mtu=1420 name=wg-hotspot private-key="${privKey}"\n` +
      `/interface wireguard peers add allowed-address=10.8.0.0/24 endpoint-address=${settings.wgHost} endpoint-port=${settings.wgPort} interface=wg-hotspot public-key="${pubKey}"${pskLine} persistent-keepalive=25s\n` +
      `/ip address add address=${address} interface=wg-hotspot`;

    res.json({ conf, routerOsScript });
  } catch (err) {
    console.error('Erro ao obter config do peer:', err);
    res
      .status(500)
      .json({ message: 'Erro ao obter config do peer' });
  }
};
