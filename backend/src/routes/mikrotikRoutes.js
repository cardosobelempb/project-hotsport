const express = require("express")
const router = express.Router()
const db = require("../../db")
const { exec } = require("child_process");
const { testarConexao } = require("../utils/mikrotikClient");
const { obterInformacoes } = require("../controllers/mikrotikAPIController");

// Envia SIGHUP para FreeRADIUS recarregar clientes NAS do MySQL.
// read_clients=yes carrega na inicialização; SIGHUP força um reload sem parar o serviço.
function reloadFreeRADIUS() {
  exec("systemctl reload freeradius 2>/dev/null || kill -HUP $(pidof freeradius) 2>/dev/null || true", (err) => {
    if (err) {
      console.warn("⚠️ reloadFreeRADIUS: não foi possível recarregar (permissão ou serviço não encontrado):", err.message);
    } else {
      console.log("✅ FreeRADIUS recarregado — novo NAS reconhecido.");
    }
  });
}
console.log("DEBUG obterInformacoes:", typeof obterInformacoes);

// Criar Mikrotik
// Criar Mikrotik
router.post("/", async (req, res) => {
  const { nome, ip, usuario, senha, porta, end_hotspot, portal_id, vpn_ip } = req.body;

  if (!nome || !ip || !usuario || !senha || !porta) {
    console.log("⚠️ Campos obrigatórios faltando:", req.body);
    return res.status(400).json({ message: "Campos obrigatórios faltando." });
  }

  // Quando o MikroTik usa VPN, os pacotes RADIUS chegam ao FreeRADIUS vindos
  // do vpn_ip (ex: 10.8.0.2), não do ip local. O nasname deve refletir isso.
  const nasName = (vpn_ip && vpn_ip.trim()) ? vpn_ip.trim() : ip;

  try {
    // Verificar se já existe Mikrotik com esse IP
    const [existente] = await db.query("SELECT id FROM mikrotiks WHERE ip = ? AND empresa_id = ?", [ip, req.empresa_id]);
    if (existente.length > 0) {
      return res.status(400).json({ message: "Já existe um Mikrotik com este IP." });
    }

    // Verificar se já existe NAS com esse nasname
    const [nasExiste] = await db.query("SELECT id FROM nas WHERE nasname = ?", [nasName]);
    if (nasExiste.length > 0) {
      return res.status(400).json({ message: "Já existe um NAS com este IP/VPN IP." });
    }

    // Inserir Mikrotik com empresa_id
    const [mikrotikResult] = await db.execute(
      "INSERT INTO mikrotiks (empresa_id, nome, ip, usuario, senha, porta, end_hotspot, portal_id, vpn_ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [req.empresa_id, nome, ip, usuario, senha, porta, end_hotspot || null, portal_id || null, vpn_ip || null]
    );

    // Inserir NAS — secret é o segredo RADIUS compartilhado (deve bater com clients.conf
    // e com o que o wizard configura no MikroTik). NÃO usar a senha admin do MikroTik.
    const radiusSecret = process.env.RADIUS_SECRET || 'testing123';
    await db.execute(
      "INSERT INTO nas (empresa_id, nasname, shortname, type, secret, description) VALUES (?, ?, ?, 'other', ?, 'RADIUS Client')",
      [req.empresa_id, nasName, nome, radiusSecret]
    );

    console.log("✅ Mikrotik e NAS cadastrados com sucesso. NAS nasname:", nasName);
    reloadFreeRADIUS();
    res.status(201).json({ message: "Mikrotik cadastrado com sucesso.", id: mikrotikResult.insertId });

  } catch (err) {
    console.error("❌ Erro ao salvar Mikrotik ou NAS:", err);
    res.status(500).json({ message: "Erro interno ao salvar Mikrotik." });
  }
});


router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT m.*, p.nome as portal_nome, p.tipo as portal_tipo
      FROM mikrotiks m LEFT JOIN portais p ON m.portal_id = p.id
      WHERE m.empresa_id = ?
      ORDER BY m.id DESC
    `, [req.empresa_id]);
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar Mikrotiks." })
  }
})


// Atualizar Mikrotik
// Atualizar Mikrotik
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, ip, usuario, senha, porta, end_hotspot, portal_id, vpn_ip } = req.body;

  try {
    // Buscar MikroTik atual para saber o nasname antigo antes de atualizar
    const [[curr]] = await db.execute(
      "SELECT ip, vpn_ip FROM mikrotiks WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!curr) return res.status(404).json({ message: "Mikrotik não encontrado." });

    const oldNasName = (curr.vpn_ip && curr.vpn_ip.trim()) ? curr.vpn_ip.trim() : curr.ip;
    const newNasName = (vpn_ip && vpn_ip.trim()) ? vpn_ip.trim() : ip;

    await db.execute(
      "UPDATE mikrotiks SET nome = ?, ip = ?, usuario = ?, senha = ?, porta = ?, end_hotspot = ?, portal_id = ?, vpn_ip = ? WHERE id = ? AND empresa_id = ?",
      [nome, ip, usuario, senha, porta, end_hotspot || null, portal_id || null, vpn_ip || null, id, req.empresa_id]
    );

    // Atualiza NAS — secret é o segredo RADIUS compartilhado (não a senha admin do MikroTik)
    const radiusSecretUpd = process.env.RADIUS_SECRET || 'testing123';
    await db.execute(
      "UPDATE nas SET nasname = ?, shortname = ?, secret = ? WHERE nasname = ?",
      [newNasName, nome, radiusSecretUpd, oldNasName]
    );

    reloadFreeRADIUS();
    res.json({ message: "Atualizado com sucesso." });
  } catch (err) {
    console.error("❌ Erro ao atualizar Mikrotik/NAS:", err);
    res.status(500).json({ message: "Erro ao atualizar Mikrotik." });
  }
});


// Deletar Mikrotik
// Deletar Mikrotik e correspondente na tabela NAS
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar IP e VPN IP do Mikrotik — nasname pode ser vpn_ip quando VPN está configurada
    const [[mikrotik]] = await db.execute("SELECT ip, vpn_ip FROM mikrotiks WHERE id = ? AND empresa_id = ?", [id, req.empresa_id]);
    if (!mikrotik) return res.status(404).json({ message: "Mikrotik não encontrado." });

    const nasName = (mikrotik.vpn_ip && mikrotik.vpn_ip.trim()) ? mikrotik.vpn_ip.trim() : mikrotik.ip.trim();

    // Deletar Mikrotik
    await db.execute("DELETE FROM mikrotiks WHERE id = ? AND empresa_id = ?", [id, req.empresa_id]);

    // Remover NAS usando o mesmo nasname que foi usado ao criar (vpn_ip preferido)
    const [nas] = await db.execute("SELECT id FROM nas WHERE nasname = ?", [nasName]);
    if (nas.length > 0) {
      await db.execute("DELETE FROM nas WHERE nasname = ?", [nasName]);
      console.log(`✅ NAS com nasname ${nasName} removido.`);
    } else {
      console.warn(`⚠️ Nenhum NAS encontrado com nasname ${nasName}`);
    }

    reloadFreeRADIUS();
    res.json({ message: "Removido com sucesso." });
  } catch (err) {
    console.error("❌ Erro ao deletar Mikrotik/NAS:", err);
    res.status(500).json({ message: "Erro ao deletar Mikrotik." });
  }
});

router.post("/:id/testar", async (req, res) => {
  const { id } = req.params;
  try {
    const [[mikrotik]] = await db.execute("SELECT * FROM mikrotiks WHERE id = ? AND empresa_id = ?", [id, req.empresa_id]);
    if (!mikrotik) return res.status(404).json({ message: "Mikrotik não encontrado" });

    const resultado = await testarConexao(mikrotik);

    if (resultado.sucesso) {
      res.json({ status: "online", message: "Conexão bem-sucedida" });
    } else {
      res.status(400).json({ status: "offline", message: resultado.erro });
    }
  } catch (err) {
    console.error("Erro ao testar Mikrotik:", err);
    res.status(500).json({ message: "Erro interno ao testar Mikrotik" });
  }
});


router.post("/:id/info", obterInformacoes);

// Escanear Mikrotik para obter interfaces, pools e IPs
router.post("/:id/scan", async (req, res) => {
  const { id } = req.params;
  try {
    const [[mikrotik]] = await db.execute("SELECT * FROM mikrotiks WHERE id = ? AND empresa_id = ?", [id, req.empresa_id]);
    if (!mikrotik) return res.status(404).json({ message: "Mikrotik não encontrado" });

    const { RouterOSAPI } = require("node-routeros");
    const conn = new RouterOSAPI({
      host: mikrotik.ip,
      user: mikrotik.usuario,
      password: mikrotik.senha,
      port: mikrotik.porta || 8728,
      keepalive: false,
      timeout: 10, // segundos (node-routeros multiplica por 1000)
    });
    conn.on("error", (e) => console.warn("[mikrotikRoutes] RouterOS error:", e.message));

    await conn.connect();

    // node-routeros !empty bug: Promise never resolves on empty lists
    // Use Promise.race with timeout to handle this
    const timedQuery = (path, timeoutMs = 3000) => {
      return Promise.race([
        conn.write(path).then(r => Array.isArray(r) ? r : []).catch(() => []),
        new Promise(resolve => setTimeout(() => resolve([]), timeoutMs))
      ]);
    };

    const result = { interfaces: [], pools: [], addresses: [], hotspots: [], profiles: [], radius: [] };

    // Interfaces e addresses sempre existem
    const interfaces = await timedQuery("/interface/print");
    result.interfaces = interfaces.map(i => ({ name: i.name, type: i.type, disabled: i.disabled }));

    const addresses = await timedQuery("/ip/address/print");
    result.addresses = addresses.map(a => ({ address: a.address, interface: a.interface, network: a.network }));

    // Pools, hotspot, profiles, radius podem estar vazios (!empty)
    const pools = await timedQuery("/ip/pool/print");
    result.pools = pools.map(p => ({ name: p.name, ranges: p.ranges }));

    const hotspots = await timedQuery("/ip/hotspot/print");
    result.hotspots = hotspots.map(h => ({ name: h.name, interface: h.interface, profile: h.profile }));

    const profiles = await timedQuery("/ip/hotspot/profile/print");
    result.profiles = profiles.map(p => ({ name: p.name }));

    const radiusList = await timedQuery("/radius/print");
    result.radius = radiusList.map(r => ({ address: r.address, service: r.service }));

    try { await conn.close(); } catch (e) {}

    res.json(result);
  } catch (err) {
    console.error("Erro ao escanear Mikrotik:", err.message);
    res.status(500).json({ message: "Erro ao escanear: " + err.message });
  }
});

// Enviar configuração completa de Hotspot para o Mikrotik (SSE - streaming de steps)
router.post("/:id/enviar-hotspot", async (req, res) => {
  const { id } = req.params;
  const config = req.body;

  // Configurar SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Desabilitar buffering do Nginx
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const [[mikrotik]] = await db.execute(
      "SELECT * FROM mikrotiks WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!mikrotik) {
      sendEvent({ type: "error", message: "Mikrotik não encontrado" });
      res.end();
      return;
    }

    let portal = null;
    if (mikrotik.portal_id) {
      const [[p]] = await db.execute("SELECT * FROM portais WHERE id = ?", [mikrotik.portal_id]);
      portal = p;
    }

    const [[empresa]] = await db.execute("SELECT id, slug FROM empresas WHERE id = ?", [req.empresa_id]);

    // Preferir x-forwarded-host (domínio público do Traefik/Coolify) quando SYSTEM_DOMAIN
    // não está configurado no env — req.headers.host dentro do container Docker retorna
    // o hostname interno (ex: hotspot-backend:3001), que não funciona como redirect externo.
    const systemDomain = process.env.SYSTEM_DOMAIN
      || req.headers['x-forwarded-host']?.split(',')[0]?.trim()?.replace(/:\d+$/, "")
      || req.headers.host?.replace(/:\d+$/, "");
    const { configurarHotspot } = require("../utils/hotspotSetup");

    // Callback chamado a cada step - envia em tempo real via SSE
    const onStep = (step) => {
      sendEvent({ type: "step", ...step });
    };

    const result = await configurarHotspot(
      mikrotik, portal, systemDomain.replace(/:\d+$/, ""), config, empresa || {}, onStep
    );

    // Atualizar end_hotspot
    // IMPORTANTE: priorizar dnsName (DNS Name do Server Profile do hotspot) sobre o IP.
    // O MikroTik usa esse DNS Name como destino dos redirects HTTP do captive portal.
    // Quando salvamos o IP cru aqui, o cliente as vezes nao consegue logar (problema
    // de redirect HTTPS sem cert valido para o IP). Usando o DNS Name, o redirect
    // bate em algo que tem cert e roteamento certo.
    const localAddr = config.localAddress || "10.5.50.1/24";
    const gatewayIp = localAddr.split("/")[0];
    const dnsNameTrimmed = (config.dnsName || "").trim();
    const systemDomainClean = (systemDomain || "").replace(/:\d+$/, "").toLowerCase();
    let endHotspot = dnsNameTrimmed || gatewayIp;

    // Guarda: "DNS Name" aqui e o nome que o PRÓPRIO MikroTik usa como destino
    // do redirect pos-login — nao pode ser igual ao dominio do sistema (backend).
    // Se for, o cliente e mandado de volta pro backend em vez do MikroTik, e
    // cai numa pagina em branco (nenhuma rota do frontend mapeia isso).
    if (dnsNameTrimmed && dnsNameTrimmed.toLowerCase() === systemDomainClean) {
      endHotspot = gatewayIp;
      sendEvent({
        type: "step",
        step: "end_hotspot",
        status: "aviso",
        message: `DNS Name '${dnsNameTrimmed}' e igual ao dominio do sistema — isso quebraria o redirect pos-login (o cliente voltaria pro backend, nao pro MikroTik). Usando o IP do gateway (${gatewayIp}) em vez disso. Se este MikroTik tem um DNS proprio configurado no Server Profile, informe-o aqui.`,
        timestamp: new Date().toISOString(),
      });
    }

    await db.execute(
      "UPDATE mikrotiks SET end_hotspot = ? WHERE id = ? AND empresa_id = ?",
      [endHotspot, id, req.empresa_id]
    );

    // Evento final
    sendEvent({
      type: "done",
      success: result.success,
      end_hotspot: endHotspot,
    });
  } catch (err) {
    console.error("Erro ao enviar hotspot:", err);
    sendEvent({ type: "error", message: "Erro interno: " + err.message });
  }

  res.end();
});

// Enviar apenas login.html para o Mikrotik (sem reconfigurar hotspot)
router.post("/:id/enviar-login", async (req, res) => {
  const { id } = req.params;
  try {
    const [[mikrotik]] = await db.execute(
      "SELECT * FROM mikrotiks WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!mikrotik) return res.status(404).json({ message: "Mikrotik não encontrado" });

    const [[empresa]] = await db.execute("SELECT id, slug FROM empresas WHERE id = ?", [req.empresa_id]);
    const empresaId = empresa?.id || mikrotik.empresa_id || '';
    const empresaSlug = empresa?.slug || 'default';

    let portal = null;
    if (mikrotik.portal_id) {
      const [[p]] = await db.execute("SELECT * FROM portais WHERE id = ?", [mikrotik.portal_id]);
      portal = p || null;
    }

    const { RouterOSAPI } = require("node-routeros");
    const { gerarLoginHtml, escreverArquivoMikrotik, reiniciarHotspotServer } = require("../utils/hotspotSetup");
    const conn = new RouterOSAPI({
      host: mikrotik.ip,
      user: mikrotik.usuario,
      password: mikrotik.senha,
      port: mikrotik.porta || 8728,
      keepalive: false,
      timeout: 20, // segundos (node-routeros multiplica por 1000)
    });
    conn.on("error", (e) => console.warn("[mikrotikRoutes] RouterOS error:", e.message));

    await conn.connect();

    const systemDomain = process.env.SYSTEM_DOMAIN
      || req.headers['x-forwarded-host']?.split(',')[0]?.trim()?.replace(/:\d+$/, "")
      || req.headers.host?.replace(/:\d+$/, "");
    const systemProto = process.env.SYSTEM_PROTO || 'https';
    const systemPort = process.env.SYSTEM_PORT ? `:${process.env.SYSTEM_PORT}` : '';
    const baseUrl = `${systemProto}://${systemDomain}${systemPort}`;
    const fetchUrl = `${baseUrl}/api/hotspot-login/${mikrotik.id}`;
    const fullUrl = `${baseUrl}/hotspot/redirect/${mikrotik.id}?mac=$(mac)&ip=$(ip)&mikrotik_id=${mikrotik.id}&empresa_id=${empresaId}&empresa=${empresaSlug}`;

    const safeWrite = (path, args) => Promise.race([
      conn.write(path, args).then(() => 'ok').catch(e => 'err:' + e.message),
      new Promise(resolve => setTimeout(() => resolve("timeout"), 20000))
    ]);

    let ok = false;
    let mensagem = "";

    // Garantir que os perfis usem html-directory=hotspot
    // Usar 'hotspot' sem prefixo flash/ — definir flash/hotspot gera flash/flash/hotspot em RouterOS 7.x
    try {
      const profiles = await Promise.race([
        conn.write('/ip/hotspot/profile/print').then(r => Array.isArray(r) ? r : []).catch(() => []),
        new Promise(r => setTimeout(() => r([]), 5000))
      ]);
      for (const p of profiles) {
        const dir = p['html-directory'] || '';
        if (!['hotspot', 'flash/hotspot'].includes(dir)) {
          await conn.write('/ip/hotspot/profile/set', [`=.id=${p['.id']}`, '=html-directory=hotspot']).catch(() => {});
        }
      }
    } catch (e) { /* best effort */ }

    // Tentar fetch (MikroTik baixa HTML da URL e salva em flash/hotspot — caminho explícito)
    // IMPORTANTE: usar flash/hotspot/login.html como dst-path pois no RouterOS 7.x
    // "hotspot/login.html" cria uma pasta separada na raiz, NÃO sobrescreve flash/hotspot/
    const fetchMode = systemProto === 'https' ? 'https' : 'http';
    const r1 = await safeWrite("/tool/fetch", [
      `=url=${fetchUrl}`,
      "=dst-path=flash/hotspot/login.html",
      `=mode=${fetchMode}`,
      "=check-certificate=no",
    ]);
    if (r1 === 'ok') { ok = true; mensagem = `login.html enviado via fetch (${systemProto.toUpperCase()})`; }

    // Fallback: escrever HTML diretamente via RouterOS API (também em flash/hotspot/)
    if (!ok) {
      try {
        const escrito = await escreverArquivoMikrotik(conn, "flash/hotspot/login.html", gerarLoginHtml(fullUrl, portal, systemDomain));
        if (escrito?.ok) { ok = true; mensagem = `login.html enviado via API (${escrito.size} bytes) → ${fullUrl.replace('$(mac)', 'XX:XX').replace('$(ip)', '0.0.0.0')}`; }
        else { mensagem = `Escrita falhou: ${escrito?.reason || 'erro desconhecido'}`; }
      } catch (e) { console.error('[enviar-login] escrever falhou:', e.message); mensagem = 'Erro ao escrever: ' + e.message; }
    }

    if (ok) {
      const restartRes = await reiniciarHotspotServer(conn);
      mensagem += restartRes.ok
        ? ' | Hotspot reiniciado para recarregar arquivos.'
        : ` | Aviso: restart falhou (${restartRes.reason}).`;
    }

    try { await conn.close(); } catch (e) {}

    if (ok) {
      res.json({ success: true, message: mensagem });
    } else {
      res.status(207).json({
        success: false,
        message: `Não conseguiu enviar login.html. ${mensagem || ''} URL de redirect: ${fullUrl}`
      });
    }
  } catch (err) {
    console.error("Erro ao enviar login.html:", err.message);
    res.status(500).json({ message: "Erro ao conectar: " + err.message });
  }
});

// Enviar status.html para o Mikrotik (sem reconfigurar hotspot)
router.post("/:id/enviar-status", async (req, res) => {
  const { id } = req.params;
  try {
    const [[mikrotik]] = await db.execute(
      "SELECT * FROM mikrotiks WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!mikrotik) return res.status(404).json({ message: "Mikrotik não encontrado" });

    let portal = null;
    if (mikrotik.portal_id) {
      const [[p]] = await db.execute("SELECT * FROM portais WHERE id = ?", [mikrotik.portal_id]);
      portal = p || null;
    }

    const { RouterOSAPI } = require("node-routeros");
    const { gerarStatusHtml, escreverArquivoMikrotik, reiniciarHotspotServer } = require("../utils/hotspotSetup");
    const conn = new RouterOSAPI({
      host: mikrotik.ip,
      user: mikrotik.usuario,
      password: mikrotik.senha,
      port: mikrotik.porta || 8728,
      keepalive: false,
      timeout: 20, // segundos (node-routeros multiplica por 1000)
    });
    conn.on("error", (e) => console.warn("[mikrotikRoutes] RouterOS error:", e.message));

    await conn.connect();

    const systemDomain = process.env.SYSTEM_DOMAIN
      || req.headers['x-forwarded-host']?.split(',')[0]?.trim()?.replace(/:\d+$/, "")
      || req.headers.host?.replace(/:\d+$/, "");
    const systemProto = process.env.SYSTEM_PROTO || 'https';
    const systemPort = process.env.SYSTEM_PORT ? `:${process.env.SYSTEM_PORT}` : '';
    const baseUrl = `${systemProto}://${systemDomain}${systemPort}`;
    const fetchUrl = `${baseUrl}/api/hotspot-status/${mikrotik.id}`;

    const safeWrite = (path, args) => Promise.race([
      conn.write(path, args).then(() => 'ok').catch(e => 'err:' + e.message),
      new Promise(resolve => setTimeout(() => resolve("timeout"), 20000))
    ]);

    let ok = false;
    let mensagem = "";

    // Tentar fetch (MikroTik baixa HTML da URL e salva em flash/hotspot — caminho explícito)
    // IMPORTANTE: usar flash/hotspot/status.html como dst-path pois no RouterOS 7.x
    // "hotspot/status.html" cria uma pasta separada na raiz, NÃO sobrescreve flash/hotspot/
    // RouterOS também não sobrescreve arquivo existente via /tool/fetch — apagar antes.
    const fetchMode = systemProto === 'https' ? 'https' : 'http';
    try {
      const fileList = await Promise.race([
        conn.write('/file/print').then(r => Array.isArray(r) ? r : []).catch(() => []),
        new Promise(resolve => setTimeout(() => resolve([]), 5000))
      ]);
      const existingStatus = fileList.find(f => f.name === 'flash/hotspot/status.html' || f.name === 'hotspot/status.html');
      if (existingStatus) {
        await safeWrite('/file/remove', [`=.id=${existingStatus['.id']}`]);
      }
    } catch (e) { /* ignora falha no delete */ }

    const r1 = await safeWrite("/tool/fetch", [
      `=url=${fetchUrl}`,
      "=dst-path=flash/hotspot/status.html",
      `=mode=${fetchMode}`,
      "=check-certificate=no",
    ]);
    if (r1 === 'ok') { ok = true; mensagem = `status.html enviado via fetch (${systemProto.toUpperCase()})`; }

    // Fallback: escrever via API diretamente (também em flash/hotspot/)
    if (!ok) {
      try {
        const escrito = await escreverArquivoMikrotik(conn, "flash/hotspot/status.html", gerarStatusHtml(portal, systemDomain));
        if (escrito?.ok) { ok = true; mensagem = `status.html enviado via API (${escrito.size} bytes)`; }
        else { mensagem = `Escrita falhou: ${escrito?.reason || 'erro desconhecido'}`; }
      } catch (e) { console.error('[enviar-status] escrever falhou:', e.message); mensagem = 'Erro ao escrever: ' + e.message; }
    }

    if (ok) {
      const restartRes = await reiniciarHotspotServer(conn);
      mensagem += restartRes.ok
        ? ' | Hotspot reiniciado para recarregar arquivos.'
        : ` | Aviso: restart falhou (${restartRes.reason}).`;
    }

    try { await conn.close(); } catch (e) {}

    if (ok) {
      res.json({ success: true, message: mensagem });
    } else {
      res.status(207).json({
        success: false,
        message: `Não conseguiu enviar status.html. ${mensagem || ''} URL: ${fetchUrl}`
      });
    }
  } catch (err) {
    console.error("Erro ao enviar status.html:", err.message);
    res.status(500).json({ message: "Erro ao conectar: " + err.message });
  }
});

// Diagnóstico do hotspot: verifica arquivos, perfil e status do servidor
router.post("/:id/diagnostico-hotspot", async (req, res) => {
  const { id } = req.params;
  try {
    const [[mikrotik]] = await db.execute(
      "SELECT * FROM mikrotiks WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!mikrotik) return res.status(404).json({ message: "Mikrotik não encontrado" });

    const { RouterOSAPI } = require("node-routeros");
    const conn = new RouterOSAPI({
      host: mikrotik.ip,
      user: mikrotik.usuario,
      password: mikrotik.senha,
      port: mikrotik.porta || 8728,
      keepalive: false,
      timeout: 15, // segundos (node-routeros multiplica por 1000)
    });
    conn.on("error", (e) => console.warn("[mikrotikRoutes] RouterOS error:", e.message));
    await conn.connect();

    const timedQuery = (path, ms = 5000) => Promise.race([
      conn.write(path).then(r => Array.isArray(r) ? r : []).catch(() => []),
      new Promise(r => setTimeout(() => r([]), ms)),
    ]);

    const [todosArquivos, perfis, servidores] = await Promise.all([
      timedQuery('/file/print', 8000),
      timedQuery('/ip/hotspot/profile/print'),
      timedQuery('/ip/hotspot/print'),
    ]);

    try { await conn.close(); } catch (e) {}

    const arquivosHotspot = todosArquivos.filter(f =>
      f.name && (f.name.startsWith('hotspot/') || f.name.startsWith('flash/hotspot/'))
    );

    const loginEntry = todosArquivos.find(f =>
      f.name === 'hotspot/login.html' || f.name === 'flash/hotspot/login.html'
    );
    const statusEntry = todosArquivos.find(f =>
      f.name === 'hotspot/status.html' || f.name === 'flash/hotspot/status.html'
    );

    const alertas = [];
    if (!loginEntry) alertas.push('login.html não encontrado no MikroTik');
    else if (parseInt(loginEntry.size || loginEntry['file-size'] || '0') === 0) alertas.push('login.html existe mas está vazio (0 bytes)');

    if (!statusEntry) alertas.push('status.html não encontrado');
    else if (parseInt(statusEntry.size || statusEntry['file-size'] || '0') === 0) alertas.push('status.html existe mas está vazio (0 bytes)');

    // RouterOS 7.x stores html-directory as "flash/hotspot" even when set to "hotspot" — both are valid
    const VALID_HTML_DIRS = ['hotspot', 'flash/hotspot'];
    const htmlDirOk = perfis.length > 0 && perfis.every(p => VALID_HTML_DIRS.includes(p['html-directory']));
    if (perfis.length > 0 && !htmlDirOk) {
      const invalid = perfis.filter(p => !VALID_HTML_DIRS.includes(p['html-directory']));
      alertas.push(`Perfil(is) com html-directory inválido: ${invalid.map(p => `${p.name}="${p['html-directory'] || '(vazio)'}"`).join(', ')} — execute o Wizard`);
    }
    if (perfis.length === 0) alertas.push('Nenhum perfil hotspot encontrado — configure o hotspot via Wizard primeiro');

    const hotspotAtivo = servidores.some(s => s.disabled === 'false' || !s.disabled);
    if (servidores.length === 0) alertas.push('Nenhum hotspot server configurado — execute o Wizard');
    else if (!hotspotAtivo) alertas.push('Hotspot server está desabilitado');

    res.json({
      arquivos: arquivosHotspot,
      perfis: perfis.map(p => ({
        name: p.name,
        'html-directory': p['html-directory'],
        'login-by': p['login-by'],
        'use-radius': p['use-radius'],
      })),
      servidores: servidores.map(s => ({
        name: s.name,
        interface: s.interface,
        profile: s.profile,
        disabled: s.disabled,
      })),
      diagnostico: {
        login_html_ok: !!(loginEntry && parseInt(loginEntry.size || loginEntry['file-size'] || '0') > 0),
        login_html_size: loginEntry ? (loginEntry.size || loginEntry['file-size'] || '0') : null,
        status_html_ok: !!(statusEntry && parseInt(statusEntry.size || statusEntry['file-size'] || '0') > 0),
        status_html_size: statusEntry ? (statusEntry.size || statusEntry['file-size'] || '0') : null,
        html_directory_ok: htmlDirOk,
        hotspot_ativo: hotspotAtivo,
        alertas,
      },
    });
  } catch (err) {
    console.error('[diagnostico-hotspot]', err.message);
    res.status(500).json({ message: 'Erro ao conectar: ' + err.message });
  }
});

module.exports = router
