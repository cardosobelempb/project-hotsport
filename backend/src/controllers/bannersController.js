const path = require("path");
const fs = require("fs");
const db = require("../../db");
const { UPLOAD_ROOT } = require("../middleware/uploadBanner");
const { AD_CLIENT_RE, AD_SLOT_RE, AD_FORMATS } = require("../utils/adsenseValidation");

const PAGINAS_VALIDAS = [
  "todas", "lgpd", "lead", "lead_passivo", "trial_tempo",
  "cadastro_cliente", "planos", "pagamento", "login", "reconexao", "acesso_ativo",
];

function parsePaginas(raw) {
  let arr;
  try {
    arr = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    return null;
  }
  if (!Array.isArray(arr) || arr.length === 0) return null;
  if (!arr.every((p) => PAGINAS_VALIDAS.includes(p))) return null;
  return arr.includes("todas") ? ["todas"] : arr;
}

function comPaginasParseadas(banner) {
  let paginas = ["todas"];
  try {
    paginas = JSON.parse(banner.paginas);
  } catch (e) {}
  return { ...banner, paginas };
}

exports.listar = async (req, res) => {
  try {
    const [banners] = await db.execute(
      "SELECT * FROM banners WHERE empresa_id = ? ORDER BY criado_em DESC",
      [req.empresa_id]
    );
    res.json({ success: true, data: banners.map(comPaginasParseadas) });
  } catch (err) {
    console.error("Erro ao listar banners:", err);
    res.status(500).json({ error: "Erro ao listar banners" });
  }
};

exports.criar = async (req, res) => {
  const limparUpload = () => {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
  };

  try {
    const { nome, tipo, posicao, link_destino,
            ad_client, ad_slot, ad_format, ad_full_width, ad_width, ad_height } = req.body;

    if (!nome || !nome.trim()) {
      limparUpload();
      return res.status(400).json({ error: "O campo nome é obrigatório" });
    }
    if (!["imagem", "adsense"].includes(tipo)) {
      limparUpload();
      return res.status(400).json({ error: "Tipo de banner inválido" });
    }
    if (!["topo", "rodape"].includes(posicao)) {
      limparUpload();
      return res.status(400).json({ error: "Posição inválida (use topo ou rodape)" });
    }
    const paginas = parsePaginas(req.body.paginas);
    if (!paginas) {
      limparUpload();
      return res.status(400).json({ error: "Selecione ao menos uma página válida para exibir o banner" });
    }

    let imagemUrl = null;
    let linkDestino = null;
    let ad = { client: null, slot: null, format: null, fullWidth: 1, width: null, height: null };

    if (tipo === "imagem") {
      if (!req.file) {
        return res.status(400).json({ error: "Envie a imagem do banner" });
      }
      imagemUrl = `/uploads/banners/${req.empresa_id}/${req.file.filename}`;
      if (link_destino && link_destino.trim()) {
        if (!/^https?:\/\//i.test(link_destino.trim())) {
          limparUpload();
          return res.status(400).json({ error: "O link de destino deve começar com http:// ou https://" });
        }
        linkDestino = link_destino.trim();
      }
    } else {
      if (!AD_CLIENT_RE.test(ad_client || "")) {
        return res.status(400).json({ error: "Código AdSense inválido: data-ad-client deve ter o formato ca-pub-XXXXXXXXXX" });
      }
      if (!AD_SLOT_RE.test(String(ad_slot || ""))) {
        return res.status(400).json({ error: "Código AdSense inválido: data-ad-slot deve ser numérico" });
      }
      if (ad_format && !AD_FORMATS.includes(ad_format)) {
        return res.status(400).json({ error: "Formato de anúncio não suportado" });
      }
      const w = ad_width ? parseInt(ad_width, 10) : null;
      const h = ad_height ? parseInt(ad_height, 10) : null;
      if ((w !== null && (isNaN(w) || w < 50 || w > 2000)) ||
          (h !== null && (isNaN(h) || h < 50 || h > 2000))) {
        return res.status(400).json({ error: "Dimensões do anúncio inválidas" });
      }
      ad = {
        client: ad_client,
        slot: String(ad_slot),
        format: ad_format || null,
        // FormData entrega strings — "true"/"1" ligam
        fullWidth: ad_full_width === "true" || ad_full_width === "1" || ad_full_width === true ? 1 : 0,
        width: w,
        height: h,
      };
    }

    const [result] = await db.execute(
      `INSERT INTO banners
         (empresa_id, nome, tipo, posicao, paginas, imagem_url, link_destino,
          ad_client, ad_slot, ad_format, ad_full_width, ad_width, ad_height)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.empresa_id, nome.trim(), tipo, posicao, JSON.stringify(paginas),
        imagemUrl, linkDestino,
        ad.client, ad.slot, ad.format, ad.fullWidth, ad.width, ad.height,
      ]
    );
    const [[banner]] = await db.execute("SELECT * FROM banners WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: comPaginasParseadas(banner) });
  } catch (err) {
    console.error("Erro ao criar banner:", err);
    limparUpload();
    res.status(500).json({ error: "Erro ao criar banner" });
  }
};

exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, posicao, link_destino, ativo } = req.body;
  try {
    const [[existing]] = await db.execute(
      "SELECT * FROM banners WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!existing) return res.status(404).json({ error: "Banner não encontrado" });

    if (posicao !== undefined && !["topo", "rodape"].includes(posicao)) {
      return res.status(400).json({ error: "Posição inválida (use topo ou rodape)" });
    }
    let paginas = null;
    if (req.body.paginas !== undefined) {
      paginas = parsePaginas(req.body.paginas);
      if (!paginas) {
        return res.status(400).json({ error: "Selecione ao menos uma página válida para exibir o banner" });
      }
    }
    if (link_destino !== undefined && link_destino && !/^https?:\/\//i.test(String(link_destino).trim())) {
      return res.status(400).json({ error: "O link de destino deve começar com http:// ou https://" });
    }

    await db.execute(
      `UPDATE banners
         SET nome          = COALESCE(?, nome),
             posicao       = COALESCE(?, posicao),
             paginas       = COALESCE(?, paginas),
             link_destino  = COALESCE(?, link_destino),
             ativo         = COALESCE(?, ativo)
       WHERE id = ? AND empresa_id = ?`,
      [
        nome !== undefined ? String(nome).trim() : null,
        posicao !== undefined ? posicao : null,
        paginas !== null ? JSON.stringify(paginas) : null,
        link_destino !== undefined ? (link_destino ? String(link_destino).trim() : null) : null,
        ativo !== undefined ? (ativo ? 1 : 0) : null,
        id,
        req.empresa_id,
      ]
    );
    const [[banner]] = await db.execute("SELECT * FROM banners WHERE id = ?", [id]);
    res.json({ success: true, data: comPaginasParseadas(banner) });
  } catch (err) {
    console.error("Erro ao atualizar banner:", err);
    res.status(500).json({ error: "Erro ao atualizar banner" });
  }
};

exports.deletar = async (req, res) => {
  const { id } = req.params;
  try {
    const [[banner]] = await db.execute(
      "SELECT * FROM banners WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!banner) return res.status(404).json({ error: "Banner não encontrado" });

    if (banner.imagem_url) {
      const filePath = path.join(UPLOAD_ROOT, String(req.empresa_id), path.basename(banner.imagem_url));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {
          console.error("Erro ao remover arquivo físico do banner:", e);
        }
      }
    }

    await db.execute("DELETE FROM banners WHERE id = ? AND empresa_id = ?", [id, req.empresa_id]);
    res.json({ success: true, message: "Banner removido com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar banner:", err);
    res.status(500).json({ error: "Erro ao deletar banner" });
  }
};

/**
 * Banners ativos de uma página pública. Rota pública — sem autenticação.
 * GET /api/public/banners?empresa_id=X&pagina=lgpd
 */
exports.listarPublico = async (req, res) => {
  const { empresa_id, pagina } = req.query;
  if (!empresa_id || !pagina || !PAGINAS_VALIDAS.includes(pagina)) {
    return res.status(400).json({ error: "Parâmetros empresa_id e pagina são obrigatórios" });
  }
  try {
    const [banners] = await db.execute(
      `SELECT id, tipo, posicao, paginas, imagem_url, link_destino,
              ad_client, ad_slot, ad_format, ad_full_width, ad_width, ad_height
         FROM banners
        WHERE empresa_id = ? AND ativo = 1
        ORDER BY criado_em DESC`,
      [empresa_id]
    );
    const filtrados = banners
      .map(comPaginasParseadas)
      .filter((b) => b.paginas.includes("todas") || b.paginas.includes(pagina));
    res.json({ success: true, data: filtrados });
  } catch (err) {
    console.error("Erro ao listar banners públicos:", err);
    res.status(500).json({ error: "Erro ao listar banners" });
  }
};
