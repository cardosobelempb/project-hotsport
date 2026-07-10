// Utilitários Google AdSense compartilhados (slides de campanha e banners).

/**
 * Extrai client/slot/formato/dimensões do código colado do painel AdSense.
 * Retorna { error } se o código não tiver client/slot identificáveis.
 */
export function parseAdsenseCode(code) {
  if (!code || !code.trim()) return null;

  const insMatch = code.match(/<ins\b[^>]*class=["'][^"']*adsbygoogle[^"']*["'][^>]*>/i);
  const scope = insMatch ? insMatch[0] : code;

  const client = (scope.match(/data-ad-client=["']?(ca-pub-\d+)/i) ||
                  code.match(/[?&]client=(ca-pub-\d+)/i) || [])[1];
  const slot = (scope.match(/data-ad-slot=["']?(\d+)/i) || [])[1];
  const format = (scope.match(/data-ad-format=["']?([a-z-]+)/i) || [])[1] || null;
  const fullWidth = /data-full-width-responsive=["']?true/i.test(scope);

  const dims = scope.match(/style=["'][^"']*width:\s*(\d+)px[^"']*height:\s*(\d+)px/i);
  const width = dims ? parseInt(dims[1], 10) : null;
  const height = dims ? parseInt(dims[2], 10) : null;

  if (!client) {
    return { error: "Não foi possível identificar o data-ad-client (ca-pub-...). Cole o código completo gerado pelo painel do AdSense." };
  }
  if (!slot) {
    return { error: "Não foi possível identificar o data-ad-slot. Cole o código completo do bloco de anúncio." };
  }

  return {
    ad_client: client,
    ad_slot: slot,
    ad_format: format,
    ad_full_width: fullWidth,
    ad_width: width,
    ad_height: height,
  };
}

/**
 * Gera o documento de um iframe AdSense a partir dos campos estruturados
 * (ad_client/ad_slot validados por regex no backend — interpolação segura).
 * O iframe srcDoc isola o adsbygoogle.js do SPA e, com key única por uso,
 * cada montagem cria um documento virgem (evita erro de push({}) duplicado).
 * Caveat: em srcdoc a URL do documento é about:srcdoc; se o fill rate zerar em
 * produção, o plano B é servir este HTML por um endpoint público real
 * (GET /api/public/adsense-frame/:itemId) com URL verdadeira.
 */
export function buildAdSrcDoc(item) {
  const isFixed = item.ad_width && item.ad_height;
  const insStyle = isFixed
    ? `display:inline-block;width:${item.ad_width}px;height:${item.ad_height}px`
    : "display:block;width:100%";
  const fmt = !isFixed && item.ad_format ? ` data-ad-format="${item.ad_format}"` : "";
  const fw = !isFixed && item.ad_full_width ? ` data-full-width-responsive="true"` : "";
  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:transparent}</style>` +
    `</head><body>` +
    `<ins class="adsbygoogle" style="${insStyle}" data-ad-client="${item.ad_client}" data-ad-slot="${item.ad_slot}"${fmt}${fw}></ins>` +
    `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${item.ad_client}" crossorigin="anonymous"><\/script>` +
    `<script>(adsbygoogle=window.adsbygoogle||[]).push({});<\/script>` +
    `</body></html>`
  );
}
