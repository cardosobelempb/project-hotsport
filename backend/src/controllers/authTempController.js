const db = require("../../db");
const radius = require("../services/radiusService");
const { criarHotspotUser } = require("../utils/mikrotikClient");

function gerarUsernameAleatorio(empresaId) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6);
  return `pix_e${empresaId || 0}_${timestamp}_${random}`;
}

async function gerarAcessoTemporario(mac, ip, planoId, empresaId, opts = {}) {
  try {
    const username = opts.usernamePrefix
      ? `${opts.usernamePrefix}_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`
      : gerarUsernameAleatorio(empresaId);
    const senha = username;
    const rateLimit = opts.rateLimit || "2M/2M";
    const tempoSegundos = opts.duracaoSegundos || 300;

    // Limpa APENAS registros pix antigos DESTA empresa (sem sessao ativa)
    await radius.cleanupTempUsers(`pix_e${empresaId || 0}_%`);

    // Busca o Mikrotik vinculado ao plano (filtrando por empresa)
    let planoQuery = "SELECT mikrotik_id, empresa_id FROM planos WHERE id = ?";
    const planoParams = [planoId];
    if (empresaId) {
      planoQuery += " AND empresa_id = ?";
      planoParams.push(empresaId);
    }
    planoQuery += " LIMIT 1";

    const [planos] = await db.query(planoQuery, planoParams);
    const mikrotikId = planos[0]?.mikrotik_id;

    const [mtk] = await db.query(
      "SELECT end_hotspot, ip, usuario, senha, porta FROM mikrotiks WHERE id = ? LIMIT 1",
      [mikrotikId]
    );
    const mtkData = mtk[0] || null;

    const gateway = mtkData?.end_hotspot || mtkData?.ip || null;

    // Cria usuario temporario: modo 'sessao' = Session-Timeout no radcheck
    // (nao usa Max-Daily-Session, acesso e por sessao unica)
    await radius.provisionUser({
      username,
      senha,
      empresaId: empresaId || null,
      planoId: planoId || null,
      nasId: mikrotikId || null,
      tempoSegundos,
      rateLimit,
      sharedUsers: 1,
      modo: "sessao",
    });

    // RADIUS sozinho nao libera internet nesse ambiente — precisa tambem do
    // usuario local no hotspot do MikroTik (fire-and-forget, ver mikrotikClient.js)
    if (mtkData?.ip) {
      criarHotspotUser(
        { ip: mtkData.ip, usuario: mtkData.usuario, senha: mtkData.senha, porta: mtkData.porta },
        { username, senha, rateLimit, duracaoMinutos: Math.ceil(tempoSegundos / 60) }
      ).catch(e => console.warn("[gerarAcessoTemporario] criarHotspotUser:", e.message));
    }

    return { username, password: senha, gateway };
  } catch (err) {
    console.error("Erro ao gerar acesso temporario:", err);
    throw err;
  }
}

module.exports = {
  gerarAcessoTemporario,
};
