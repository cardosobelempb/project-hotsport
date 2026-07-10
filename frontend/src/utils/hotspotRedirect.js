/**
 * Redireciona para o login do MikroTik (captive portal).
 * Padroniza o tratamento do gateway que pode vir como:
 * - hostname puro: "hotspot.empresa.com"
 * - IP puro: "192.168.1.1"
 * - URL completa: "http://hotspot.empresa.com/login"
 *
 * @param {string} gateway - Hostname/IP/URL retornado pelo backend
 * @param {string} username - Username para login no RADIUS
 * @param {string} password - Senha (geralmente igual ao username)
 * @param {number} delayMs - Delay opcional antes do redirect (ms)
 */
export function redirecionarHotspot(gateway, username, password, delayMs = 0) {
  if (!gateway || !username) {
    console.error("redirecionarHotspot: gateway ou username vazios", { gateway, username });
    return;
  }

  // Normalizar gateway: garantir que tem http:// e /login
  let url = String(gateway).trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `http://${url}`;
  }
  if (!url.includes("/login")) {
    url = url.replace(/\/$/, "") + "/login";
  }

  const finalUrl = `${url}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password || username)}`;

  const doRedirect = () => {
    window.location.href = finalUrl;
  };

  if (delayMs > 0) {
    setTimeout(doRedirect, delayMs);
  } else {
    doRedirect();
  }
}

/**
 * Fluxo dos portais grátis: cadastro → propaganda (campanha) → status.
 * Navega pro player de campanha do portal levando as credenciais; ao fim
 * da campanha (ou se o portal não tiver campanha ativa) o player faz o
 * login no MikroTik via redirecionarHotspot. Sem portalId, conecta direto.
 */
export function conectarComPropaganda({
  portalId,
  gateway,
  username,
  password,
  mac,
  ip,
  mikrotikId,
  empresaId,
  delayMs = 0,
}) {
  if (!portalId || !gateway || !username) {
    redirecionarHotspot(gateway, username, password, delayMs);
    return;
  }

  const params = new URLSearchParams({
    gateway: gateway || "",
    username: username || "",
    password: password || username || "",
    mac: mac || "",
    ip: ip || "",
    mikrotik_id: mikrotikId || "",
    empresa_id: empresaId || "",
  });
  const go = () => {
    window.location.href = `/campanha/${portalId}?${params.toString()}`;
  };

  if (delayMs > 0) {
    setTimeout(go, delayMs);
  } else {
    go();
  }
}

/**
 * Limpa CPF removendo caracteres especiais.
 */
export function limparCpf(cpf) {
  return cpf ? String(cpf).replace(/\D/g, "") : null;
}
