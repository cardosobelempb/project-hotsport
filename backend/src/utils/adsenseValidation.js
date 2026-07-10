// Validação compartilhada de campos Google AdSense (slides de campanha e banners)
const AD_CLIENT_RE = /^ca-pub-\d{6,20}$/;
const AD_SLOT_RE = /^\d{5,20}$/;
const AD_FORMATS = ["auto", "rectangle", "horizontal", "vertical", "fluid"];

module.exports = { AD_CLIENT_RE, AD_SLOT_RE, AD_FORMATS };
