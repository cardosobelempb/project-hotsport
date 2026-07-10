// Deteccao simples de dispositivo/SO via navigator.userAgent — usada tanto no
// player publico (tracking) quanto no admin (previa das regras de segmentacao).
export function detectarDispositivo() {
  const ua = navigator.userAgent || "";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobi|android(?!.*tablet)|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export function detectarSistemaOperacional() {
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/windows/i.test(ua)) return "windows";
  if (/mac os/i.test(ua)) return "macos";
  if (/linux/i.test(ua)) return "linux";
  return "outro";
}
