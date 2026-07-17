const { RouterOSAPI } = require("node-routeros");
const dns = require("dns").promises;

function gerarLoginHtml(redirectUrl, portal = null, systemDomain = '') {
  const corFundo = portal?.cor_fundo || '#0f111a';
  const corPrimaria = portal?.cor_primaria || '#3b82f6';
  const logoUrl = portal?.logo_url
    ? (portal.logo_url.startsWith('http') ? portal.logo_url : (systemDomain ? `https://${systemDomain}${portal.logo_url}` : ''))
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <meta http-equiv="pragma" content="no-cache">
  <meta http-equiv="expires" content="-1">
  <title>Hotspot Login</title>
  <style>
    body { background: ${corFundo}; color: #fff; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { text-align: center; padding: 40px; max-width: 400px; }
    .logo { max-height: 80px; max-width: 200px; margin: 0 auto 24px; display: block; object-fit: contain; }
    .spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.15); border-top: 4px solid ${corPrimaria}; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    a { color: ${corPrimaria}; }
    .info { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 15px; }
  </style>
  <script>
    var params = new URLSearchParams(window.location.search);
    if (params.has("username") && params.get("username") !== "") {
      window.location.href = "/status";
    } else {
      window.location.href = "${redirectUrl}";
    }
  </script>
</head>
<body>
  <div class="box">
    ${logoUrl ? `<img class="logo" src="${logoUrl}" alt="Logo">` : ''}
    <div class="spinner"></div>
    <h2>Conectando...</h2>
    <p>Redirecionando para o portal de acesso</p>
    <p class="info">MAC: $(mac) | IP: $(ip)</p>
    <p class="info">Se nao for redirecionado, <a href="${redirectUrl}">clique aqui</a></p>
  </div>
</body>
</html>`;
}

function gerarStatusHtml(portal = null, systemDomain = '') {
  const corFundo = portal?.cor_fundo || '#0f111a';
  const corPrimaria = portal?.cor_primaria || '#3b82f6';
  // Fundo levemente transparente — da o "gostinho" da navegacao que vem depois
  const corFundoTransp = /^#[0-9a-fA-F]{6}$/.test(corFundo) ? `${corFundo}d9` : corFundo;
  // Destino do botao "Ir para navegacao" — so usa o url_redirect do portal se
  // for URL externa (rotas internas tipo /campanha-pre-acesso voltariam pro portal)
  const urlNavegacao = portal?.url_redirect && /^https?:\/\//i.test(portal.url_redirect)
    ? portal.url_redirect
    : 'https://www.google.com';
  const logoUrl = portal?.logo_url
    ? (portal.logo_url.startsWith('http') ? portal.logo_url : (systemDomain ? `https://${systemDomain}${portal.logo_url}` : ''))
    : '';

  const avatarHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" style="max-height:64px;max-width:160px;margin:0 auto 16px;display:block;object-fit:contain;">`
    : `<div class="avatar"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg></div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="pragma" content="no-cache">
  <meta http-equiv="expires" content="-1">
  $(if refresh-timeout)<meta http-equiv="refresh" content="$(refresh-timeout-secs)">$(endif)
  <title>Status - Hotspot</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${corFundoTransp}; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); backdrop-filter: blur(6px); }
    .header { text-align: center; margin-bottom: 24px; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, ${corPrimaria}, ${corPrimaria}cc); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: white; font-weight: bold; }
    .header h1 { font-size: 20px; font-weight: 700; color: #f1f5f9; }
    .header p { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(6,95,70,0.5); color: #6ee7b7; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .status-dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
    .stat { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; text-align: center; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .stat-value { font-size: 18px; font-weight: 700; color: #f1f5f9; }
    .stat-value.blue { color: ${corPrimaria}; }
    .stat-value.green { color: #34d399; }
    .stat-value.orange { color: #fb923c; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; }
    .info-value { color: #e2e8f0; font-weight: 500; font-family: monospace; }
    .info-box { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; margin-bottom: 8px; }
    .btn-nav { display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, ${corPrimaria}, ${corPrimaria}cc); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 20px; transition: all 0.2s; text-align: center; text-decoration: none; box-sizing: border-box; }
    .btn-nav:hover { opacity: 0.9; transform: translateY(-1px); }
    .countdown { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 10px; }
    .countdown b { color: #f1f5f9; }
    .btn-logout { display: block; width: 100%; padding: 12px; background: transparent; color: #f87171; border: 1px solid rgba(248,113,113,0.4); border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 12px; transition: all 0.2s; }
    .btn-logout:hover { background: rgba(248,113,113,0.1); }
    .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #475569; }
    $(if refresh-timeout).refresh-bar { height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 16px; overflow: hidden; }
    .refresh-bar-fill { height: 100%; background: linear-gradient(90deg, ${corPrimaria}, ${corPrimaria}99); animation: refill $(refresh-timeout-secs)s linear infinite; }
    @keyframes refill { from { width: 0%; } to { width: 100%; } }
    $(endif)
  </style>
  <script>
    $(if advert-pending == 'yes')
    function openAdvert() { window.open('$(link-advert)', 'hotspot_advert', ''); }
    $(endif)
    function doLogout() {
      if (window.name == 'hotspot_status') {
        window.open('$(link-logout)', 'hotspot_logout', 'toolbar=0,location=0,status=0,menubar=0,resizable=1,width=300,height=200');
        window.close();
        return false;
      }
      return true;
    }
    // Sem navegacao automatica: o cliente precisa clicar no botao "Ir para
    // navegacao" pra sair da tela de status. Nada redireciona sozinho aqui.
  </script>
</head>
<body $(if advert-pending == 'yes')onload="openAdvert()"$(endif)>
  <div class="card">
    <div class="header">
      ${avatarHtml}
      $(if login-by == 'trial')<h1>Acesso Trial</h1>$(elif login-by != 'mac')<h1>$(username)</h1>$(else)<h1>Conectado</h1>$(endif)
      <p>Sessao hotspot ativa</p>
      <div class="status-badge"><span class="status-dot"></span>Online</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-label">Tempo Online</div><div class="stat-value green">$(uptime)</div></div>
      $(if session-time-left)
      <div class="stat"><div class="stat-label">Tempo Restante</div><div class="stat-value orange">$(session-time-left)</div></div>
      $(else)
      <div class="stat"><div class="stat-label">IP</div><div class="stat-value blue">$(ip)</div></div>
      $(endif)
      <div class="stat"><div class="stat-label">Download</div><div class="stat-value blue">$(bytes-out-nice)</div></div>
      <div class="stat"><div class="stat-label">Upload</div><div class="stat-value">$(bytes-in-nice)</div></div>
    </div>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Endereco IP</span><span class="info-value">$(ip)</span></div>
      <div class="info-row"><span class="info-label">MAC Address</span><span class="info-value">$(mac)</span></div>
      $(if session-time-left)
      <div class="info-row"><span class="info-label">Conectado / Restante</span><span class="info-value">$(uptime) / $(session-time-left)</span></div>
      $(endif)
      $(if blocked == 'yes')
      <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:#fb923c;"><a href="$(link-advert)" target="hotspot_advert" style="color:#fb923c;text-decoration:none;">Publicidade pendente</a></span></div>
      $(elif refresh-timeout)
      <div class="info-row"><span class="info-label">Atualiza em</span><span class="info-value">$(refresh-timeout)</span></div>
      $(endif)
    </div>
    <a href="${urlNavegacao}" class="btn-nav">Ir para navega&ccedil;&atilde;o</a>
    <div class="countdown">Clique no botao acima quando estiver pronto pra navegar</div>
    $(if login-by-mac != 'yes')
    <form action="$(link-logout)" name="logout" onsubmit="return doLogout()">
      <button type="submit" class="btn-logout">Desconectar</button>
    </form>
    $(endif)
    $(if refresh-timeout)<div class="refresh-bar"><div class="refresh-bar-fill"></div></div>$(endif)
    <div class="footer">Hotspot WiFi &bull; Protegido por LGPD</div>
  </div>
</body>
</html>`;
}

async function escreverArquivoMikrotik(conn, filename, content) {
  // Timeouts curtos de propósito: se o RouterOS não responde a um método em
  // poucos segundos, esperar 15-30s não muda o resultado — só atrasa a
  // tentativa do próximo método (ou do próximo arquivo). Antes disso, um
  // MikroTik sem resposta podia gastar quase 1min só nesta função.
  const apiWrite = (path, args, ms = 6000) => Promise.race([
    conn.write(path, args).then(() => 'ok').catch(e => 'err:' + e.message),
    new Promise(r => setTimeout(() => r('timeout'), ms)),
  ]);

  const apiPrint = (ms = 4000) => Promise.race([
    conn.write('/file/print').then(r => Array.isArray(r) ? r : []).catch(() => []),
    new Promise(r => setTimeout(() => r([]), ms)),
  ]);

  const verificar = async () => {
    const files = await apiPrint();
    const altName = filename.startsWith('flash/') ? filename : `flash/${filename}`;
    const found = files.find(f => f.name === filename || f.name === altName);
    if (!found) return { ok: false, reason: 'not_found' };
    const size = parseInt(found.size || found['file-size'] || '0', 10);
    if (size === 0) return { ok: false, reason: 'empty', name: found.name };
    return { ok: true, size, name: found.name };
  };

  // Garante que o diretório pai existe antes de tentar criar o arquivo
  if (filename.includes('/')) {
    const dir = filename.split('/').slice(0, -1).join('/');
    await apiWrite('/file/add', [`=name=${dir}`, '=type=directory']).catch(() => {});
  }

  // 1. Tentar criar o arquivo com conteúdo diretamente
  const r1 = await apiWrite('/file/add', [`=name=${filename}`, `=contents=${content}`]);
  if (r1 === 'ok') {
    const v = await verificar();
    if (v.ok) { console.log(`[file] Criado e verificado: ${filename} (${v.size} bytes)`); return { ok: true, size: v.size, method: 'file/add' }; }
    console.log(`[file] Criado mas verificacao falhou: ${JSON.stringify(v)}`);
  }
  console.log(`[file] /file/add resultado: ${r1}`);

  // 1b. Dois passos: criar arquivo vazio primeiro, depois set contents
  // (RouterOS 7.x aceita melhor este método; /file/add com =contents= pode ser rejeitado)
  const rCreate = await apiWrite('/file/add', [`=name=${filename}`]);
  if (rCreate === 'ok' || rCreate === 'exists') {
    await new Promise(r => setTimeout(r, 800));
    const fa = await apiPrint(5000);
    const altNc = filename.startsWith('flash/') ? filename : `flash/${filename}`;
    const fc = fa.find(f => f.name === filename || f.name === altNc);
    if (fc) {
      const rSet = await apiWrite('/file/set', [`=.id=${fc['.id']}`, `=contents=${content}`], 10000);
      if (rSet === 'ok') {
        const v = await verificar();
        if (v.ok) { console.log(`[file] Criado (2 passos) e verificado: ${filename} (${v.size} bytes)`); return { ok: true, size: v.size, method: 'file/add+set' }; }
        console.log(`[file] 2 passos: verificacao falhou: ${JSON.stringify(v)}`);
      }
      console.log(`[file] /file/set resultado: ${rSet}`);
    } else {
      console.log(`[file] Arquivo nao encontrado apos /file/add vazio. Listados: ${fa.map(f => f.name).join(', ') || '(nenhum)'}`);
    }
  }
  console.log(`[file] /file/add (vazio) resultado: ${rCreate}`);

  // 2. Arquivo pode já existir — buscar .id para sobrescrever
  const files = await apiPrint();
  const altName = filename.startsWith('flash/') ? filename : `flash/${filename}`;
  const existing = files.find(f => f.name === filename || f.name === altName);
  console.log(`[file] Arquivos listados: ${files.map(f => f.name).join(', ') || '(nenhum)'}`);

  if (existing) {
    const r2 = await apiWrite('/file/set', [`=.id=${existing['.id']}`, `=contents=${content}`]);
    if (r2 === 'ok') {
      const v = await verificar();
      if (v.ok) { console.log(`[file] Atualizado e verificado: ${filename} (${v.size} bytes)`); return { ok: true, size: v.size, method: 'file/set' }; }
      console.log(`[file] Atualizado mas verificacao falhou: ${JSON.stringify(v)}`);
    }
    console.log(`[file] /file/set resultado: ${r2}`);
  }

  // 3. Último recurso: tentar com prefixo flash/
  if (!filename.startsWith('flash/')) {
    const r3 = await apiWrite('/file/add', [`=name=flash/${filename}`, `=contents=${content}`]);
    if (r3 === 'ok') {
      const v = await verificar();
      if (v.ok) { console.log(`[file] Criado (flash/) e verificado: ${filename} (${v.size} bytes)`); return { ok: true, size: v.size, method: 'file/add-flash' }; }
    }
    console.log(`[file] /file/add (flash/) resultado: ${r3}`);
  }

  return { ok: false, reason: 'all_methods_failed' };
}

async function reiniciarHotspotServer(conn, serverId = null) {
  const apiWrite = (path, args, ms = 10000) => Promise.race([
    conn.write(path, args).then(() => 'ok').catch(e => 'err:' + e.message),
    new Promise(r => setTimeout(() => r('timeout'), ms)),
  ]);
  const apiPrint = (ms = 12000) => Promise.race([
    conn.write('/ip/hotspot/print').then(r => Array.isArray(r) ? r : []).catch(() => []),
    new Promise(r => setTimeout(() => r([]), ms)),
  ]);

  const servers = await apiPrint();
  if (servers.length === 0) return { ok: false, reason: 'no_hotspot_server_found' };

  // Prefere o servidor pelo ID passado (encontrado no step 5), fallback para o primeiro
  let target = (serverId && servers.find(s => s['.id'] === serverId)) || servers[0];
  const r1 = await apiWrite('/ip/hotspot/set', [`=.id=${target['.id']}`, '=disabled=yes']);
  if (r1 !== 'ok') return { ok: false, reason: `disable_failed: ${r1}` };

  await new Promise(r => setTimeout(r, 500));

  const r2 = await apiWrite('/ip/hotspot/set', [`=.id=${target['.id']}`, '=disabled=no']);
  if (r2 !== 'ok') return { ok: false, reason: `enable_failed: ${r2}` };

  return { ok: true, serverName: target.name || 'hotspot' };
}

/**
 * Configura hotspot completo no MikroTik via API com streaming de steps.
 * Cada step é enviado em tempo real via callback onStep(step).
 *
 * Etapas:
 * 1. IP na interface
 * 2. Pool de IPs
 * 3. DHCP server + network
 * 4. Hotspot profile (com RADIUS)
 * 5. Hotspot server
 * 6. RADIUS client
 * 7. Walled garden
 * 8. Masquerade (NAT)
 * 9. Login page (download via /tool/fetch ou escrita direta via API)
 * 10. Status page (idem)
 */
async function configurarHotspot(mikrotik, portal, systemDomain, config = {}, empresa = {}, onStep = null) {
  const conn = new RouterOSAPI({
    host: mikrotik.ip,
    user: mikrotik.usuario,
    password: mikrotik.senha,
    port: mikrotik.porta || 8728,
    keepalive: false,
    timeout: 30, // segundos (node-routeros multiplica por 1000)
  });
  // Sem listener de 'error', emissoes tardias (SOCKTMOUT) derrubam o processo
  conn.on("error", (e) => console.warn("[hotspotSetup] RouterOS error:", e.message));

  const steps = [];
  const ifName = config.interface || "ether2";
  const localAddress = config.localAddress || "10.5.50.1/24";
  const poolName = config.poolName || "hs-pool";
  const poolRange = config.poolRange || "10.5.50.10-10.5.50.254";
  const dnsName = config.dnsName || "";
  const radiusServerIp = config.radiusServerIp || process.env.RADIUS_SERVER_IP || "10.8.0.1";
  const radiusSecret = config.radiusSecret || mikrotik.senha;

  const gateway = localAddress.split("/")[0];
  const mask = localAddress.split("/")[1] || "24";
  const ipParts = gateway.split(".");
  const network = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/${mask}`;

  // Usado tanto pelo walled garden (abaixo) quanto pelo Advertise do hotspot
  // profile — hoisted aqui porque não depende de nada calculado depois.
  const systemProto = process.env.SYSTEM_PROTO || 'https';
  const systemPortStr = process.env.SYSTEM_PORT ? `:${process.env.SYSTEM_PORT}` : '';
  const baseUrl = `${systemProto}://${systemDomain}${systemPortStr}`;

  // Pop-up pós-login (task 007, Parte C) — best-effort via RouterOS Advertise:
  // não testado contra hardware real, ver docs/tasks/007-popup-modo-exibicao.md.
  let popupConfig = {};
  try { popupConfig = JSON.parse(portal?.configuracoes || "{}"); } catch (_) { popupConfig = {}; }
  const popupPosLoginAtivo = !!popupConfig.popup_pos_login_enabled;
  const popupIntervaloMin = parseInt(popupConfig.popup_pos_login_intervalo_minutos, 10) || 15;

  const PRINT_TIMEOUT = 3000;
  const WRITE_TIMEOUT = 10000;

  const safePrint = async (path) => {
    return Promise.race([
      conn.write(path).then(r => Array.isArray(r) ? r : []).catch(e => {
        if (e.errno === "UNKNOWNREPLY" || (e.message && e.message.includes("!empty"))) return [];
        throw e;
      }),
      new Promise(resolve => setTimeout(() => resolve([]), PRINT_TIMEOUT))
    ]);
  };

  const safeWrite = async (path, args, ms = WRITE_TIMEOUT) => {
    return Promise.race([
      conn.write(path, args).catch(e => {
        if (e.errno === "UNKNOWNREPLY") return "ok";
        if (e.message && e.message.includes("already")) return "exists";
        throw e;
      }),
      new Promise(resolve => setTimeout(() => resolve("timeout"), ms))
    ]);
  };

  const addStep = (name, status, message) => {
    const step = { step: name, status, message, timestamp: new Date().toISOString() };
    steps.push(step);
    console.log(`[hotspot] ${status}: ${message}`);
    if (onStep) onStep(step);
  };

  // Declarada aqui para ser acessível no bloco catch externo
  let conn2 = null;

  try {
    await conn.connect();
    addStep("conexao", "ok", `Conectado a ${mikrotik.ip}`);

    // === 0. Verificação da interface (falha rápido) ===
    // Sem isso, um nome de interface errado só aparece como erro depois de ~10
    // passos (RADIUS, ~26 dominios de walled garden, masquerade, QUIC, e ate 2
    // tentativas de escrita de arquivo com retry pesado cada) — minutos de
    // trabalho inutil, porque nenhum desses passos funciona sem a interface
    // existir. Checar aqui evita o timeout de 30s do passo 5 (criar hotspot
    // server) e todo o resto que dependeria dele.
    try {
      const interfaces = await safePrint("/interface/print");
      const ifaceExiste = interfaces && interfaces.find(i => i.name === ifName);
      if (!ifaceExiste) {
        const nomes = (interfaces || []).map(i => i.name).join(", ") || "(nenhuma encontrada)";
        addStep("interface", "erro", `Interface '${ifName}' nao existe neste MikroTik. Interfaces disponiveis: ${nomes}`);
        try { await conn.close(); } catch (e) {}
        return {
          success: false,
          steps,
          log: steps.map(s => `[${s.status}] ${s.message}`),
          error: `Interface '${ifName}' nao encontrada`,
        };
      }
      addStep("interface", "ok", `Interface '${ifName}' encontrada`);
    } catch (e) {
      addStep("interface", "aviso", `Nao foi possivel verificar interfaces (seguindo mesmo assim): ${e.message}`);
    }

    // === 1. IP na interface ===
    try {
      const addresses = await safePrint("/ip/address/print");
      const hasAddr = addresses && addresses.find(a => a.interface === ifName);
      if (!hasAddr) {
        await safeWrite("/ip/address/add", [`=address=${localAddress}`, `=interface=${ifName}`]);
        addStep("ip", "ok", `IP ${localAddress} atribuido a ${ifName}`);
      } else {
        addStep("ip", "ok", `${ifName} ja tem IP: ${hasAddr.address}`);
      }
    } catch (e) {
      addStep("ip", "aviso", e.message);
    }

    // === 2. Pool ===
    try {
      const pools = await safePrint("/ip/pool/print");
      const exists = pools && pools.find(p => p.name === poolName);
      if (!exists) {
        await safeWrite("/ip/pool/add", [`=name=${poolName}`, `=ranges=${poolRange}`]);
        addStep("pool", "ok", `Pool ${poolName} criado (${poolRange})`);
      } else {
        addStep("pool", "ok", `Pool ${poolName} existe`);
      }
    } catch (e) {
      addStep("pool", "aviso", e.message);
    }

    // === 3. DHCP Server + Network ===
    try {
      const nets = await safePrint("/ip/dhcp-server/network/print");
      const netExists = nets && nets.find(n => n.address === network);
      if (!netExists) {
        await safeWrite("/ip/dhcp-server/network/add", [
          `=address=${network}`,
          `=gateway=${gateway}`,
          `=dns-server=8.8.8.8`,
        ]);
      }

      const dhcps = await safePrint("/ip/dhcp-server/print");
      const dhcpExists = dhcps && dhcps.find(d => d.interface === ifName);
      if (!dhcpExists) {
        await safeWrite("/ip/dhcp-server/add", [
          `=name=dhcp-hotspot`,
          `=interface=${ifName}`,
          `=address-pool=${poolName}`,
          `=disabled=no`,
        ]);
        addStep("dhcp", "ok", `DHCP server criado em ${ifName}`);
      } else {
        // Atualiza o pool caso o servidor existente aponte para pool errado/inexistente
        if (dhcpExists['address-pool'] !== poolName) {
          await safeWrite("/ip/dhcp-server/set", [
            `=.id=${dhcpExists['.id']}`,
            `=address-pool=${poolName}`,
            `=disabled=no`,
          ]);
          addStep("dhcp", "ok", `DHCP ${dhcpExists.name} corrigido: pool ${dhcpExists['address-pool'] || 'vazio'} → ${poolName}`);
        } else {
          addStep("dhcp", "ok", `DHCP ${dhcpExists.name} ja usa pool ${poolName}`);
        }
      }
    } catch (e) {
      addStep("dhcp", "aviso", e.message);
    }

    // === 4. Hotspot Profile ===
    // Cria/atualiza hsprof-hotspot E garante html-directory=hotspot em TODOS os perfis existentes
    // (o servidor existente pode usar 'default' ou outro perfil — sem isso o login.html customizado é ignorado)
    try {
      const profiles = await safePrint("/ip/hotspot/profile/print");
      const prof = profiles && profiles.find(p => p.name === "hsprof-hotspot");
      // Args core sempre compatíveis — advertise tratado separadamente (quebra RouterOS < 6.49)
      const profCoreArgs = [
        "=login-by=http-chap,http-pap",
        "=use-radius=yes",
        "=radius-accounting=yes",
        "=html-directory=hotspot",
        ...(dnsName ? [`=dns-name=${dnsName}`] : []),
      ];

      if (prof) {
        await safeWrite("/ip/hotspot/profile/set", [`=.id=${prof[".id"]}`, ...profCoreArgs]);
        addStep("profile", "ok", "Profile hsprof-hotspot atualizado (RADIUS habilitado)");
      } else {
        await safeWrite("/ip/hotspot/profile/add", ["=name=hsprof-hotspot", ...profCoreArgs]);
        addStep("profile", "ok", "Profile hsprof-hotspot criado");
      }

      // Advertise (popup pós-login) — best-effort isolado: nao impede criacao do hotspot se falhar
      if (popupPosLoginAtivo) {
        try {
          const profAtual = (await safePrint("/ip/hotspot/profile/print"))?.find(p => p.name === "hsprof-hotspot");
          if (profAtual) {
            await safeWrite("/ip/hotspot/profile/set", [
              `=.id=${profAtual[".id"]}`,
              "=advertise=yes",
              `=advertise-url=${baseUrl}/campanha-popup?mikrotik_id=${mikrotik.id}&mac=$(mac)&orig=$(link-orig-esc)`,
              `=advertise-interval=${popupIntervaloMin}m,10000d`,
              "=advertise-timeout=30s",
            ]);
            addStep("profile_advertise", "ok", "Popup pos-login (advertise) configurado");
          }
        } catch (e) {
          addStep("profile_advertise", "aviso", `Advertise nao suportado nesta versao do RouterOS: ${e.message}`);
        }
      }

      // Força html-directory=hotspot em TODOS os outros perfis existentes
      // (garante que o servidor WiFi existente sirva nosso login.html independente do perfil que usa)
      // Usa 'hotspot' sem prefixo flash/ — RouterOS pode normalizar para flash/hotspot internamente,
      // mas definir flash/hotspot gera flash/flash/hotspot em alguns modelos (dupla prefixação).
      let updatedProfiles = 0;
      for (const p of (profiles || [])) {
        if (p.name === "hsprof-hotspot") continue;
        const dir = p['html-directory'] || '';
        if (!['hotspot', 'flash/hotspot'].includes(dir)) {
          await safeWrite("/ip/hotspot/profile/set", [`=.id=${p['.id']}`, '=html-directory=hotspot']).catch(() => {});
          updatedProfiles++;
        }
      }
      if (updatedProfiles > 0) {
        addStep("profile_all", "ok", `${updatedProfiles} outro(s) perfil(is) atualizado(s) com html-directory=hotspot`);
      }
    } catch (e) {
      addStep("profile", "aviso", e.message);
    }

    // === 5. Hotspot Server ===
    // Busca por interface primeiro (servidor WiFi existente), depois por nome hotspot1
    let hsServerId = null;
    try {
      const servers = await safePrint("/ip/hotspot/print");
      // Prioriza o servidor que já está na interface configurada (independente do nome)
      const hs = servers && (
        servers.find(s => s.interface === ifName) ||
        servers.find(s => s.name === "hotspot1")
      );
      if (hs) {
        hsServerId = hs['.id'];
        await safeWrite("/ip/hotspot/set", [
          `=.id=${hs[".id"]}`,
          `=interface=${ifName}`,
          `=address-pool=${poolName}`,
          "=profile=hsprof-hotspot",
          "=disabled=no",
        ]);
        addStep("hotspot", "ok", `Hotspot '${hs.name}' atualizado → perfil hsprof-hotspot`);
      } else {
        const r = await safeWrite("/ip/hotspot/add", [
          "=name=hotspot1",
          `=interface=${ifName}`,
          `=address-pool=${poolName}`,
          "=profile=hsprof-hotspot",
          "=disabled=no",
        ], 30000);
        if (r === "timeout") {
          addStep("hotspot", "aviso", `Criacao do hotspot server demorou mais de 30s — verifique se a interface '${ifName}' existe e tem IP configurado no MikroTik`);
        } else if (typeof r === "string" && r.startsWith('err:')) {
          addStep("hotspot", "aviso", `Falha ao criar hotspot server: ${r.replace('err:', '')} — verifique a interface '${ifName}'`);
        } else {
          const newServers = await safePrint("/ip/hotspot/print");
          const newHs = newServers && newServers.find(s => s.name === "hotspot1");
          if (newHs) {
            hsServerId = newHs['.id'];
            addStep("hotspot", "ok", `Hotspot server criado em ${ifName}`);
          } else {
            addStep("hotspot", "aviso", `Hotspot server nao encontrado apos criacao — verifique se a interface '${ifName}' existe no MikroTik`);
          }
        }
      }
    } catch (e) {
      addStep("hotspot", "aviso", e.message);
    }

    // === 6. RADIUS Client ===
    try {
      const radiusList = await safePrint("/radius/print");
      const existing = radiusList && radiusList.find(r => r.service && r.service.includes("hotspot"));
      const radiusArgs = [
        `=address=${radiusServerIp}`,
        `=secret=${radiusSecret}`,
        "=service=hotspot",
        "=authentication-port=1812",
        "=accounting-port=1813",
      ];

      if (existing) {
        await safeWrite("/radius/set", [`=.id=${existing[".id"]}`, ...radiusArgs]);
        addStep("radius", "ok", `RADIUS atualizado (${radiusServerIp})`);
      } else {
        await safeWrite("/radius/add", radiusArgs);
        addStep("radius", "ok", `RADIUS criado (${radiusServerIp})`);
      }

      await safeWrite("/radius/incoming/set", ["=accept=yes", "=port=3799"]);
    } catch (e) {
      addStep("radius", "aviso", e.message);
    }

    // === 7. Walled Garden ===
    // baseUrl (SYSTEM_PROTO/SYSTEM_PORT) já calculado no topo da função.
    if (systemDomain) {
      try {
        const wg = await safePrint("/ip/hotspot/walled-garden/print");
        const exists = wg && wg.find(w => w["dst-host"] && w["dst-host"].includes(systemDomain));
        if (!exists) {
          await safeWrite("/ip/hotspot/walled-garden/add", [
            `=dst-host=*${systemDomain}*`,
            "=action=allow",
          ]);
          addStep("walled_garden", "ok", `Dominio liberado: ${systemDomain}`);
        } else {
          addStep("walled_garden", "ok", `Walled garden ja tem ${systemDomain}`);
        }
        // Walled Garden IP (permite QUALQUER porta para o servidor — necessário quando porta não é 80/443)
        const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(systemDomain);
        if (isIp) {
          try {
            const wgIp = await safePrint("/ip/hotspot/walled-garden/ip/print");
            const ipExists = wgIp && wgIp.find(w => w["dst-address"] && w["dst-address"].includes(systemDomain));
            if (!ipExists) {
              await safeWrite("/ip/hotspot/walled-garden/ip/add", [
                `=dst-address=${systemDomain}`,
                "=action=accept",
              ]);
              addStep("walled_garden_ip", "ok", `IP liberado (todas as portas): ${systemDomain}`);
            } else {
              addStep("walled_garden_ip", "ok", `Walled garden IP ja tem ${systemDomain}`);
            }
          } catch (e) { addStep("walled_garden_ip", "aviso", `IP walled garden: ${e.message}`); }
        } else {
          // systemDomain e hostname (nao IP): a regra dst-host acima so "casa"
          // se o MikroTik conseguir espionar a resolucao DNS do cliente pra
          // aprender o IP. Celulares/navegadores com DNS criptografado (DNS
          // sobre HTTPS/TLS, padrao em Android/Chrome recentes) nunca deixam
          // essa consulta passar em texto claro pelo roteador — o dominio fica
          // "liberado" na lista mas com 0 hits pra sempre, e a conexao HTTPS
          // e derrubada mesmo assim. Resolver aqui e liberar por IP direto
          // remove essa dependencia por completo.
          try {
            const enderecos = await dns.resolve4(systemDomain);
            const wgIp = await safePrint("/ip/hotspot/walled-garden/ip/print");
            let novos = 0;
            for (const addr of enderecos) {
              const ipExists = wgIp && wgIp.find(w => w["dst-address"] === addr);
              if (!ipExists) {
                await safeWrite("/ip/hotspot/walled-garden/ip/add", [
                  `=dst-address=${addr}`,
                  "=action=accept",
                ]);
                novos++;
              }
            }
            addStep("walled_garden_ip", "ok", `IP(s) de ${systemDomain} liberado(s) diretamente: ${enderecos.join(", ")}${novos < enderecos.length ? " (alguns ja existiam)" : ""} — evita depender de DNS snooping quando o cliente usa DNS criptografado`);
          } catch (e) {
            addStep("walled_garden_ip", "aviso", `Nao foi possivel resolver IP de ${systemDomain}: ${e.message}`);
          }
        }
        // Dominios do Mercado Pago SDK (necessario para pagamento com cartao)
        // www.mercadopago.com hospeda o security.js (device fingerprint anti-fraude).
        // Sem ele o window.MP_DEVICE_SESSION_ID nao popula e o MP rejeita cartao como high_risk.
        const mpDomains = ["www.mercadopago.com", "sdk.mercadopago.com", "api.mercadopago.com", "http2.mlstatic.com", "secure-fields.mercadopago.com", "api-static.mercadopago.com", "api.mercadolibre.com"];
        for (const domain of mpDomains) {
          const mpExists = wg && wg.find(w => w["dst-host"] && w["dst-host"].includes(domain));
          if (!mpExists) {
            await safeWrite("/ip/hotspot/walled-garden/add", [
              `=dst-host=*${domain}*`,
              "=action=allow",
            ]);
          }
        }
        addStep("walled_garden_mp", "ok", "Dominios Mercado Pago SDK liberados");
        // Dominios do Google AdSense (necessarios para exibir anuncios em
        // slides de campanha antes da autenticacao no hotspot)
        const adsenseDomains = [
          "pagead2.googlesyndication.com",
          "googleads.g.doubleclick.net",
          "securepubads.g.doubleclick.net",
          "tpc.googlesyndication.com",
          "www.googletagservices.com",
          "adservice.google.com",
          "partner.googleadservices.com",
          "www.google.com",
          "www.gstatic.com",
          "csi.gstatic.com",
          "fundingchoicesmessages.google.com",
          "ep1.adtrafficquality.google",
          "ep2.adtrafficquality.google",
        ];
        for (const domain of adsenseDomains) {
          const adExists = wg && wg.find(w => w["dst-host"] && w["dst-host"].includes(domain));
          if (!adExists) {
            await safeWrite("/ip/hotspot/walled-garden/add", [
              `=dst-host=*${domain}*`,
              "=action=allow",
            ]);
          }
        }
        addStep("walled_garden_adsense", "ok", "Dominios Google AdSense liberados");
        // Dominios do YouTube (necessarios para slides de video do YouTube na
        // campanha; googlevideo.com serve o stream do video)
        const youtubeDomains = [
          "www.youtube.com",
          "www.youtube-nocookie.com",
          "i.ytimg.com",
          "s.ytimg.com",
          "yt3.ggpht.com",
          "googlevideo.com",
        ];
        for (const domain of youtubeDomains) {
          const ytExists = wg && wg.find(w => w["dst-host"] && w["dst-host"].includes(domain));
          if (!ytExists) {
            await safeWrite("/ip/hotspot/walled-garden/add", [
              `=dst-host=*${domain}*`,
              "=action=allow",
            ]);
          }
        }
        addStep("walled_garden_youtube", "ok", "Dominios YouTube liberados");
      } catch (e) {
        addStep("walled_garden", "aviso", e.message);
      }
    }

    // === 8. Masquerade (NAT) ===
    try {
      const natRules = await safePrint("/ip/firewall/nat/print");
      const hasMasquerade = natRules && natRules.find(r =>
        r.chain === "srcnat" && r.action === "masquerade" && r["src-address"] === network
      );
      if (!hasMasquerade) {
        await safeWrite("/ip/firewall/nat/add", [
          "=chain=srcnat",
          `=src-address=${network}`,
          "=action=masquerade",
          `=comment=hotspot-masquerade`,
        ]);
        addStep("masquerade", "ok", `NAT masquerade criado para ${network}`);
      } else {
        addStep("masquerade", "ok", `Masquerade ja existe para ${network}`);
      }
    } catch (e) {
      addStep("masquerade", "aviso", e.message);
    }

    // === 8b. Bloqueio de QUIC (UDP/443) ===
    // Navegadores modernos tentam HTTP/3 (QUIC, UDP/443) antes de cair para TCP.
    // A walled garden do hotspot so inspeciona SNI de conexoes TCP/TLS - trafego
    // QUIC nao autenticado fica pendurado ate o navegador desistir (timeout),
    // mesmo com o dominio liberado. Bloquear forca o fallback imediato pra TCP,
    // que ai sim passa pela walled garden normalmente. Efeito colateral minimo
    // (mesmo em clientes ja autenticados): apenas força HTTP/2 em vez de HTTP/3.
    try {
      const filterRules = await safePrint("/ip/firewall/filter/print");
      const hasQuicBlock = filterRules && filterRules.find(r =>
        r.chain === "forward" && r.protocol === "udp" && r["dst-port"] === "443" && r.action === "drop"
      );
      if (!hasQuicBlock) {
        await safeWrite("/ip/firewall/filter/add", [
          "=chain=forward",
          "=protocol=udp",
          "=dst-port=443",
          "=action=drop",
          "=comment=hotspot-block-quic",
        ]);
        addStep("bloqueio_quic", "ok", "QUIC (UDP/443) bloqueado - forca fallback TCP na walled garden");
      } else {
        addStep("bloqueio_quic", "ok", "Bloqueio de QUIC ja existe");
      }
    } catch (e) {
      addStep("bloqueio_quic", "aviso", e.message);
    }

    // === Conexão dedicada para operações de arquivo (steps 9-11) ===
    // A conn principal pode estar lenta/exausta após 30+ writes na walled garden.
    // Uma conexão nova garante estado limpo para escrita de arquivo e restart.
    // conn2 já declarada como null antes do try externo (necessário para o catch externo acessar)
    try {
      conn2 = new RouterOSAPI({
        host: mikrotik.ip,
        user: mikrotik.usuario,
        password: mikrotik.senha,
        port: mikrotik.porta || 8728,
        keepalive: false,
        timeout: 30,
      });
      conn2.on("error", (e) => console.warn("[hotspotSetup] conn2 error:", e.message));
      await conn2.connect();
      console.log("[hotspotSetup] conn2: conexão de arquivo estabelecida");
    } catch (e) {
      console.warn("[hotspotSetup] conn2 falhou, usando conn principal para arquivos:", e.message);
      conn2 = null;
    }
    const connArquivos = conn2 || conn;

    // === 9-11. Login page, status page e restart só fazem sentido se o
    // hotspot server existe (hsServerId setado no passo 5). Sem isso, cada
    // escrita de arquivo ainda tenta 2-3 métodos com timeouts de até 30s
    // (duas vezes, login + status) e o restart falha com "no_hotspot_server_found"
    // no final — minutos gastos num resultado que já era previsível aqui.
    if (!hsServerId) {
      addStep("login_page", "aviso", "Hotspot server nao foi criado no passo anterior — login.html, status.html e restart pulados. Corrija a interface/servidor e rode o wizard novamente.");
    } else {

    // === 9. Login Page (download via /tool/fetch ou escrita direta via API) ===
    try {
      const empresaId = empresa.id || mikrotik.empresa_id || '';
      const empresaSlug = empresa.slug || 'default';
      const fetchUrl = `${baseUrl}/api/hotspot-login/${mikrotik.id}`;
      const fullUrl = `${baseUrl}/hotspot/redirect/${mikrotik.id}?mac=$(mac)&ip=$(ip)&mikrotik_id=${mikrotik.id}&empresa_id=${empresaId}&empresa=${empresaSlug}`;
      const fetchMode = systemProto === 'https' ? 'https' : 'http';

      let ok = false;

      // IMPORTANTE: usar flash/hotspot/login.html como dst-path — no RouterOS 7.x,
      // "hotspot/login.html" cria pasta separada na raiz, NÃO sobrescreve flash/hotspot/
      try {
        const r = await safeWrite("/tool/fetch", [
          `=url=${fetchUrl}`,
          "=dst-path=flash/hotspot/login.html",
          `=mode=${fetchMode}`,
          "=check-certificate=no",
        ], 15000);
        if (r !== "timeout" && (typeof r !== "string" || !r.startsWith('err:'))) {
          addStep("login_page", "ok", `login.html baixado via fetch (${systemProto.toUpperCase()})`);
          ok = true;
        } else if (typeof r === "string" && r.startsWith('err:')) {
          console.warn("[hotspotSetup] /tool/fetch login.html erro:", r);
        }
      } catch (e) {
        console.warn("[hotspotSetup] /tool/fetch login.html exception:", e.message);
      }

      // Fallback 1: escrever HTML completo via conn dedicada (connArquivos = conn2 ou conn)
      if (!ok) {
        try {
          const loginHtml = gerarLoginHtml(fullUrl, portal, systemDomain);
          const escrito = await escreverArquivoMikrotik(connArquivos, "flash/hotspot/login.html", loginHtml);
          if (escrito?.ok) {
            addStep("login_page", "ok", `login.html enviado via API (${escrito.size} bytes) → ${baseUrl}`);
            ok = true;
          } else if (escrito) {
            addStep("login_page", "aviso", `login.html escrita falhou: ${escrito.reason}`);
          }
        } catch (e) { /* tenta minimal abaixo */ }
      }

      // Fallback 2: HTML mínimo (apenas redirect, < 300 bytes)
      if (!ok) {
        try {
          const minHtml = `<html><head><meta http-equiv="refresh" content="0;url=${fullUrl}"><script>location.replace("${fullUrl}")</script></head><body></body></html>`;
          const escrito = await escreverArquivoMikrotik(connArquivos, "flash/hotspot/login.html", minHtml);
          if (escrito?.ok) {
            addStep("login_page", "ok", `login.html (minimal, ${escrito.size} bytes) enviado — versao completa requer acesso do MikroTik a ${baseUrl}`);
            ok = true;
          }
        } catch (e) { /* aviso manual */ }
      }

      if (!ok) {
        addStep("login_page", "aviso",
          `Nao conseguiu enviar login.html. Configure manualmente com redirect para: ${fullUrl}`
        );
      }
    } catch (e) {
      addStep("login_page", "aviso", e.message);
    }

    // === 10. Status Page (download via /tool/fetch ou escrita direta via API) ===
    // A page de status é exibida APÓS o login bem-sucedido. Sem ela, o MikroTik
    // mostra sua page padrão (sem estilo/logo da empresa).
    try {
      const statusUrl = `${baseUrl}/api/hotspot-status/${mikrotik.id}`;
      const fetchMode = systemProto === 'https' ? 'https' : 'http';
      let statusOk = false;

      // IMPORTANTE: usar flash/hotspot/status.html como dst-path — mesmo motivo do login.html
      try {
        const r = await safeWrite("/tool/fetch", [
          `=url=${statusUrl}`,
          "=dst-path=flash/hotspot/status.html",
          `=mode=${fetchMode}`,
          "=check-certificate=no",
        ], 15000);
        if (r !== "timeout" && (typeof r !== "string" || !r.startsWith('err:'))) {
          addStep("status_page", "ok", `status.html baixado via fetch (${systemProto.toUpperCase()})`);
          statusOk = true;
        } else if (typeof r === "string" && r.startsWith('err:')) {
          console.warn("[hotspotSetup] /tool/fetch status.html erro:", r);
        }
      } catch (e) {
        console.warn("[hotspotSetup] /tool/fetch status.html exception:", e.message);
      }

      // Fallback 1: escrever HTML via conn dedicada
      if (!statusOk) {
        try {
          const statusHtml = gerarStatusHtml(portal, systemDomain);
          const escrito = await escreverArquivoMikrotik(connArquivos, "flash/hotspot/status.html", statusHtml);
          if (escrito?.ok) {
            addStep("status_page", "ok", `status.html enviado via API (${escrito.size} bytes)`);
            statusOk = true;
          } else if (escrito) {
            addStep("status_page", "aviso", `status.html escrita falhou: ${escrito.reason}`);
          }
        } catch (e) { /* tenta minimal abaixo */ }
      }

      // Fallback 2: status HTML mínimo (< 300 bytes)
      if (!statusOk) {
        try {
          const minStatus = `<html><head><title>Status WiFi</title></head><body style="font-family:sans-serif;padding:20px"><b>$(username)</b><br>IP: $(ip) | Tempo: $(uptime)<br><br><a href="$(link-logout)">Desconectar</a></body></html>`;
          const escrito = await escreverArquivoMikrotik(connArquivos, "flash/hotspot/status.html", minStatus);
          if (escrito?.ok) {
            addStep("status_page", "ok", `status.html (minimal, ${escrito.size} bytes) enviado`);
            statusOk = true;
          }
        } catch (e) { /* aviso */ }
      }

      if (!statusOk) {
        addStep("status_page", "aviso", "Nao conseguiu enviar status.html. Use o botao 'Status' na listagem de Mikrotiks.");
      }
    } catch (e) {
      addStep("status_page", "aviso", e.message);
    }

    // === 11. Restart Hotspot Server (para forçar recarga dos arquivos HTML) ===
    // Usa connArquivos (conn2 se disponível) — estado limpo garante que o /ip/hotspot/print retorna correto
    try {
      const restartRes = await reiniciarHotspotServer(connArquivos, hsServerId);
      if (restartRes.ok) {
        addStep("hotspot_restart", "ok", `Hotspot '${restartRes.serverName}' reiniciado — arquivos HTML recarregados`);
      } else {
        addStep("hotspot_restart", "aviso", `Restart do hotspot: ${restartRes.reason}`);
      }
    } catch (e) {
      addStep("hotspot_restart", "aviso", e.message);
    }

    } // fim do if (hsServerId)

    try { if (conn2) await conn2.close(); } catch (e) {}
    try { await conn.close(); } catch (e) {}
    addStep("finalizado", "ok", "Configuracao concluida!");

    const hasErrors = steps.some(s => s.status === "erro");
    return { success: !hasErrors, steps, log: steps.map(s => `[${s.status}] ${s.message}`) };
  } catch (err) {
    addStep("fatal", "erro", err.message);
    try { if (conn2) await conn2.close(); } catch (e) {}
    try { await conn.close(); } catch (e) {}
    return { success: false, steps, log: steps.map(s => `[${s.status}] ${s.message}`), error: err.message };
  }
}

module.exports = { configurarHotspot, gerarLoginHtml, gerarStatusHtml, escreverArquivoMikrotik, reiniciarHotspotServer };
