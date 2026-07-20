const path = require("path");
const fs   = require("fs");
const db   = require("../../db");
const { ALLOWED_MIMES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, UPLOAD_ROOT } = require("../middleware/uploadCampanha");
const { liberarWalledGarden } = require("../utils/mikrotikClient");
const { validarRegras } = require("../utils/campanhaSegmentacao");

// ─────────────────────────────────────────────────────────────────────────────
// CRUD Campanhas
// ─────────────────────────────────────────────────────────────────────────────

exports.listar = async (req, res) => {
  try {
    const [campanhas] = await db.execute(
      `SELECT c.*,
         (SELECT COUNT(*) FROM campanha_itens ci WHERE ci.campanha_id = c.id) AS total_itens
       FROM campanhas c
       WHERE c.empresa_id = ?
       ORDER BY c.criado_em DESC`,
      [req.empresa_id]
    );
    res.json({ success: true, data: campanhas });
  } catch (err) {
    console.error("Erro ao listar campanhas:", err);
    res.status(500).json({ error: "Erro ao listar campanhas" });
  }
};

const CATEGORIAS_CAMPANHA = ["promocao_local", "campanha_institucional", "oferta_patrocinada"];

exports.criar = async (req, res) => {
  const { nome, descricao, categoria } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: "O campo nome é obrigatório" });
  }
  if (categoria && !CATEGORIAS_CAMPANHA.includes(categoria)) {
    return res.status(400).json({ error: "Categoria inválida" });
  }
  try {
    const [result] = await db.execute(
      `INSERT INTO campanhas (empresa_id, nome, descricao, categoria) VALUES (?, ?, ?, ?)`,
      [req.empresa_id, nome.trim(), descricao || null, categoria || null]
    );
    const [[campanha]] = await db.execute(
      "SELECT * FROM campanhas WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json({ success: true, data: campanha });
  } catch (err) {
    console.error("Erro ao criar campanha:", err);
    res.status(500).json({ error: "Erro ao criar campanha" });
  }
};

exports.obter = async (req, res) => {
  const { id } = req.params;
  try {
    const [[campanha]] = await db.execute(
      "SELECT * FROM campanhas WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!campanha) return res.status(404).json({ error: "Campanha não encontrada" });

    const [itens] = await db.execute(
      "SELECT * FROM campanha_itens WHERE campanha_id = ? ORDER BY ordem ASC, id ASC",
      [id]
    );
    itens.forEach((it) => {
      if (it.tipo === "afiliado" && typeof it.afiliado_destaques === "string") {
        try { it.afiliado_destaques = JSON.parse(it.afiliado_destaques); }
        catch (_) { it.afiliado_destaques = []; }
      }
    });

    const [portaisVinculados] = await db.execute(
      `SELECT p.id, p.nome FROM portais p
         JOIN portal_campanhas pc ON pc.portal_id = p.id
        WHERE pc.campanha_id = ?`,
      [id]
    );

    res.json({ success: true, data: { ...campanha, itens, portais_vinculados: portaisVinculados } });
  } catch (err) {
    console.error("Erro ao obter campanha:", err);
    res.status(500).json({ error: "Erro ao obter campanha" });
  }
};

exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const {
    nome, descricao, ativo, categoria,
    data_inicio, data_fim, horario_inicio, horario_fim,
    dias_semana, dispositivos, sistemas_operacionais, mikrotiks_permitidos,
    regra_acesso,
  } = req.body;
  try {
    const [[existing]] = await db.execute(
      "SELECT * FROM campanhas WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!existing) return res.status(404).json({ error: "Campanha não encontrada" });

    if (categoria && !CATEGORIAS_CAMPANHA.includes(categoria)) {
      return res.status(400).json({ error: "Categoria inválida" });
    }

    const { erro } = validarRegras(req.body);
    if (erro) return res.status(400).json({ error: erro });

    if (mikrotiks_permitidos !== undefined && mikrotiks_permitidos !== null && mikrotiks_permitidos.length > 0) {
      const [rows] = await db.query(
        "SELECT id FROM mikrotiks WHERE id IN (?) AND empresa_id = ?",
        [mikrotiks_permitidos, req.empresa_id]
      );
      if (rows.length !== mikrotiks_permitidos.length) {
        return res.status(400).json({ error: "Um ou mais hotspots selecionados não pertencem a esta empresa." });
      }
    }

    // Lista vazia == sem restrição (mesmo significado que null) — o frontend
    // sempre manda array (nunca null) pros campos de segmentação, então sem essa
    // normalização um "salvar regras" com tudo desmarcado gravava `[]`, e
    // JSON_CONTAINS([], x) nunca é verdadeiro: a campanha sumia pra todo mundo.
    // Retorna JS null (-> SQL NULL) pra lista vazia/ausente, nunca a string "null"
    // (JSON.stringify(null) seria armazenado como valor JSON null, não SQL NULL).
    const normalizarLista = (arr) => (!Array.isArray(arr) || arr.length === 0 ? null : JSON.stringify(arr));

    await db.execute(
      `UPDATE campanhas
         SET nome                  = COALESCE(?, nome),
             descricao             = COALESCE(?, descricao),
             ativo                 = COALESCE(?, ativo),
             categoria             = ?,
             data_inicio           = ?,
             data_fim              = ?,
             horario_inicio        = ?,
             horario_fim           = ?,
             dias_semana           = ?,
             dispositivos          = ?,
             sistemas_operacionais = ?,
             mikrotiks_permitidos  = ?,
             regra_acesso          = ?,
             atualizado_em         = NOW()
       WHERE id = ? AND empresa_id = ?`,
      [
        nome !== undefined ? nome.trim() : null,
        descricao !== undefined ? descricao : null,
        ativo !== undefined ? (ativo ? 1 : 0) : null,
        categoria !== undefined ? (categoria || null) : existing.categoria,
        data_inicio !== undefined ? (data_inicio || null) : existing.data_inicio,
        data_fim !== undefined ? (data_fim || null) : existing.data_fim,
        horario_inicio !== undefined ? (horario_inicio || null) : existing.horario_inicio,
        horario_fim !== undefined ? (horario_fim || null) : existing.horario_fim,
        dias_semana !== undefined ? normalizarLista(dias_semana) : normalizarLista(existing.dias_semana),
        dispositivos !== undefined ? normalizarLista(dispositivos) : normalizarLista(existing.dispositivos),
        sistemas_operacionais !== undefined ? normalizarLista(sistemas_operacionais) : normalizarLista(existing.sistemas_operacionais),
        mikrotiks_permitidos !== undefined ? normalizarLista(mikrotiks_permitidos) : normalizarLista(existing.mikrotiks_permitidos),
        regra_acesso !== undefined ? (regra_acesso || "qualquer") : existing.regra_acesso,
        id,
        req.empresa_id,
      ]
    );
    const [[campanha]] = await db.execute(
      "SELECT * FROM campanhas WHERE id = ?",
      [id]
    );
    res.json({ success: true, data: campanha });
  } catch (err) {
    console.error("Erro ao atualizar campanha:", err);
    res.status(500).json({ error: "Erro ao atualizar campanha" });
  }
};

exports.deletar = async (req, res) => {
  const { id } = req.params;
  try {
    const [[campanha]] = await db.execute(
      "SELECT * FROM campanhas WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!campanha) return res.status(404).json({ error: "Campanha não encontrada" });

    // Remove physical files before deleting from DB
    const dir = path.join(UPLOAD_ROOT, String(req.empresa_id), String(id));
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }

    await db.execute(
      "DELETE FROM campanhas WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    res.json({ success: true, message: "Campanha removida com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar campanha:", err);
    res.status(500).json({ error: "Erro ao deletar campanha" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Itens
// ─────────────────────────────────────────────────────────────────────────────

const MODOS_EXIBICAO = ["sequencia", "popup"];

function validarModoExibicao(modo_exibicao) {
  if (modo_exibicao === undefined || modo_exibicao === null || modo_exibicao === "") return "sequencia";
  return MODOS_EXIBICAO.includes(modo_exibicao) ? modo_exibicao : null;
}

async function getCampanhaOuFalha(req, res) {
  const campanhaId = req.params.id;
  const [[campanha]] = await db.execute(
    "SELECT * FROM campanhas WHERE id = ? AND empresa_id = ?",
    [campanhaId, req.empresa_id]
  );
  if (!campanha) {
    res.status(404).json({ error: "Campanha não encontrada" });
    return null;
  }
  return campanha;
}

exports.uploadItem = async (req, res) => {
  try {
    const campanha = await getCampanhaOuFalha(req, res);
    if (!campanha) return;

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const meta = ALLOWED_MIMES[req.file.mimetype];
    if (!meta) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Tipo de arquivo não permitido" });
    }

    // Per-type size validation
    if (meta.tipo === "imagem" && req.file.size > MAX_IMAGE_BYTES) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Imagem excede o limite de 10 MB" });
    }
    if (meta.tipo === "video" && req.file.size > MAX_VIDEO_BYTES) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Vídeo excede o limite de 50 MB" });
    }

    // Compute next ordem
    const [[ordemRow]] = await db.execute(
      "SELECT IFNULL(MAX(ordem), -1) + 1 AS proxima FROM campanha_itens WHERE campanha_id = ?",
      [campanha.id]
    );
    const ordem = ordemRow.proxima;

    const { duracao_segundos, titulo, link_destino, modo_exibicao } = req.body;
    const modoExibicao = validarModoExibicao(modo_exibicao);
    if (modoExibicao === null) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Modo de exibição inválido" });
    }
    const arquivo_url = `/uploads/campanhas/${req.empresa_id}/${campanha.id}/${req.file.filename}`;

    const [result] = await db.execute(
      `INSERT INTO campanha_itens
         (campanha_id, empresa_id, tipo, arquivo_url, ordem, duracao_segundos, titulo, link_destino, modo_exibicao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campanha.id,
        req.empresa_id,
        meta.tipo,
        arquivo_url,
        ordem,
        duracao_segundos ? parseInt(duracao_segundos, 10) : 5,
        titulo || null,
        link_destino || null,
        modoExibicao,
      ]
    );
    const [[item]] = await db.execute(
      "SELECT * FROM campanha_itens WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error("Erro ao fazer upload de item:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    res.status(500).json({ error: "Erro ao fazer upload de item" });
  }
};

const { AD_CLIENT_RE, AD_SLOT_RE, AD_FORMATS } = require("../utils/adsenseValidation");

exports.criarItemAdsense = async (req, res) => {
  try {
    const campanha = await getCampanhaOuFalha(req, res);
    if (!campanha) return;

    const { ad_client, ad_slot, ad_format, ad_full_width, ad_width, ad_height,
            duracao_segundos, titulo, modo_exibicao } = req.body;

    const modoExibicao = validarModoExibicao(modo_exibicao);
    if (modoExibicao === null) {
      return res.status(400).json({ error: "Modo de exibição inválido" });
    }

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

    const [[ordemRow]] = await db.execute(
      "SELECT IFNULL(MAX(ordem), -1) + 1 AS proxima FROM campanha_itens WHERE campanha_id = ?",
      [campanha.id]
    );
    const ordem = ordemRow.proxima;

    const [result] = await db.execute(
      `INSERT INTO campanha_itens
         (campanha_id, empresa_id, tipo, arquivo_url, ordem, duracao_segundos, titulo,
          ad_client, ad_slot, ad_format, ad_full_width, ad_width, ad_height, modo_exibicao)
       VALUES (?, ?, 'adsense', NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campanha.id,
        req.empresa_id,
        ordem,
        duracao_segundos ? parseInt(duracao_segundos, 10) : 10,
        titulo || null,
        ad_client,
        String(ad_slot),
        ad_format || null,
        ad_full_width ? 1 : 0,
        w,
        h,
        modoExibicao,
      ]
    );
    const [[item]] = await db.execute(
      "SELECT * FROM campanha_itens WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error("Erro ao adicionar bloco AdSense:", err);
    res.status(500).json({ error: "Erro ao adicionar bloco AdSense" });
  }
};

// Extrai o ID de 11 caracteres de URLs youtube.com/watch, youtu.be, shorts, embed e live
const YT_URL_RE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

exports.criarItemYoutube = async (req, res) => {
  try {
    const campanha = await getCampanhaOuFalha(req, res);
    if (!campanha) return;

    const { youtube_url, duracao_segundos, titulo, modo_exibicao } = req.body;
    const modoExibicao = validarModoExibicao(modo_exibicao);
    if (modoExibicao === null) {
      return res.status(400).json({ error: "Modo de exibição inválido" });
    }
    const match = YT_URL_RE.exec(youtube_url || "");
    if (!match) {
      return res.status(400).json({ error: "Link do YouTube inválido. Use um link como https://www.youtube.com/watch?v=... ou https://youtu.be/..." });
    }
    const videoId = match[1];

    const [[ordemRow]] = await db.execute(
      "SELECT IFNULL(MAX(ordem), -1) + 1 AS proxima FROM campanha_itens WHERE campanha_id = ?",
      [campanha.id]
    );
    const ordem = ordemRow.proxima;

    const [result] = await db.execute(
      `INSERT INTO campanha_itens
         (campanha_id, empresa_id, tipo, arquivo_url, ordem, duracao_segundos, titulo, modo_exibicao)
       VALUES (?, ?, 'youtube', ?, ?, ?, ?, ?)`,
      [
        campanha.id,
        req.empresa_id,
        `https://www.youtube.com/watch?v=${videoId}`,
        ordem,
        duracao_segundos ? parseInt(duracao_segundos, 10) : 10,
        titulo || null,
        modoExibicao,
      ]
    );
    const [[item]] = await db.execute(
      "SELECT * FROM campanha_itens WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error("Erro ao adicionar vídeo do YouTube:", err);
    res.status(500).json({ error: "Erro ao adicionar vídeo do YouTube" });
  }
};

const AFILIADO_URL_RE = /^https?:\/\/.+/i;
const MAX_DESTAQUES = 5;
const MAX_DESTAQUE_LEN = 60;

// Sufixos de 2º nível comuns (ccTLD com "com"/"net"/"org"/"co" antes do país) —
// heurística simples de eTLD+1 pra pegar "mercadolivre.com.br" em vez de só
// "com.br" a partir de "www.mercadolivre.com.br". Não é uma lista de sufixo
// público completa, mas cobre os casos comuns de links de afiliado latino-americanos.
const SUFIXOS_SEGUNDO_NIVEL = new Set(["com", "net", "org", "gov", "edu", "co"]);

function dominioBase(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const partes = hostname.split(".").filter(Boolean);
    if (partes.length <= 2) return hostname;
    const [, penultimo, ultimo] = partes.slice(-3);
    if (SUFIXOS_SEGUNDO_NIVEL.has(penultimo) && ultimo.length === 2) {
      return partes.slice(-3).join(".");
    }
    return partes.slice(-2).join(".");
  } catch (_) {
    return null;
  }
}

// Extrai os domínios dos links de um item de afiliado e libera na walled
// garden de todos os MikroTiks vinculados a portais que usam esta campanha —
// sem isso, o produto não carrega pro cliente (ainda não autenticado no
// hotspot, preso na walled garden). Síncrono e retorna o resultado — quem
// chama deve aguardar e repassar pro admin, senão falhas (roteador offline,
// credencial errada, campanha sem portal vinculado) ficam invisíveis.
async function liberarDominiosAfiliado(campanhaId, empresaId, urls) {
  const hosts = [...new Set((urls || []).map(dominioBase).filter(Boolean))];
  if (hosts.length === 0) {
    return { ok: true, hosts, mensagem: null };
  }

  try {
    const [portais] = await db.execute(
      `SELECT p.id FROM portais p
         JOIN portal_campanhas pc ON pc.portal_id = p.id
        WHERE pc.campanha_id = ? AND p.empresa_id = ?`,
      [campanhaId, empresaId]
    );
    if (portais.length === 0) {
      return {
        ok: false,
        hosts,
        mensagem: "Campanha ainda não vinculada a nenhum portal — libere o domínio manualmente quando associar.",
      };
    }

    const portalIds = portais.map((p) => p.id);
    const [mikrotiks] = await db.query(
      `SELECT ip, vpn_ip, usuario, senha, porta FROM mikrotiks WHERE portal_id IN (?)`,
      [portalIds]
    );
    if (mikrotiks.length === 0) {
      return { ok: false, hosts, mensagem: "Nenhum MikroTik encontrado para os portais desta campanha." };
    }

    const resultados = [];
    for (const mtk of mikrotiks) {
      try {
        const r = await liberarWalledGarden(mtk, hosts);
        resultados.push({ mikrotikIp: mtk.ip, ...r });
      } catch (e) {
        resultados.push({ mikrotikIp: mtk.ip, ok: false, reason: e.message });
      }
    }

    const falhas = resultados.filter((r) => !r.ok);
    if (falhas.length > 0) {
      return {
        ok: false,
        hosts,
        mensagem: `Falha ao liberar em ${falhas.length} de ${resultados.length} MikroTik(s): ${falhas.map((f) => f.reason).join("; ")}`,
      };
    }

    return { ok: true, hosts, mensagem: null };
  } catch (e) {
    console.warn("[liberarDominiosAfiliado] erro:", e.message);
    return { ok: false, hosts, mensagem: `Erro ao liberar domínio: ${e.message}` };
  }
}

exports.criarItemAfiliado = async (req, res) => {
  try {
    const campanha = await getCampanhaOuFalha(req, res);
    if (!campanha) return;

    const { titulo, link, imagem_url, descricao, preco, preco_original, destaques, duracao_segundos, modo_exibicao } = req.body;

    const modoExibicao = validarModoExibicao(modo_exibicao);
    if (modoExibicao === null) {
      return res.status(400).json({ error: "Modo de exibição inválido" });
    }

    if (!AFILIADO_URL_RE.test(link || "")) {
      return res.status(400).json({ error: "Link de afiliado inválido. Use uma URL http(s) completa." });
    }
    if (!AFILIADO_URL_RE.test(imagem_url || "")) {
      return res.status(400).json({ error: "URL da imagem do produto inválida. Use uma URL http(s) completa." });
    }
    if (titulo && titulo.length > 200) {
      return res.status(400).json({ error: "Nome do produto deve ter até 200 caracteres." });
    }
    if (descricao && descricao.length > 500) {
      return res.status(400).json({ error: "Descrição deve ter até 500 caracteres." });
    }

    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum <= 0) {
      return res.status(400).json({ error: "Preço atual inválido." });
    }

    let precoOriginalNum = null;
    if (preco_original !== undefined && preco_original !== null && preco_original !== "") {
      precoOriginalNum = parseFloat(preco_original);
      if (isNaN(precoOriginalNum) || precoOriginalNum <= 0) {
        return res.status(400).json({ error: "Preço original inválido." });
      }
      if (precoOriginalNum <= precoNum) {
        return res.status(400).json({ error: "O preço original deve ser maior que o preço atual para calcular o desconto." });
      }
    }

    let destaquesArr = [];
    if (destaques !== undefined && destaques !== null) {
      if (!Array.isArray(destaques)) {
        return res.status(400).json({ error: "Destaques deve ser uma lista de textos." });
      }
      destaquesArr = destaques.map((d) => String(d).trim()).filter(Boolean);
      if (destaquesArr.length > MAX_DESTAQUES) {
        return res.status(400).json({ error: `Máximo de ${MAX_DESTAQUES} destaques.` });
      }
      if (destaquesArr.some((d) => d.length > MAX_DESTAQUE_LEN)) {
        return res.status(400).json({ error: `Cada destaque deve ter até ${MAX_DESTAQUE_LEN} caracteres.` });
      }
    }

    const [[ordemRow]] = await db.execute(
      "SELECT IFNULL(MAX(ordem), -1) + 1 AS proxima FROM campanha_itens WHERE campanha_id = ?",
      [campanha.id]
    );

    const [result] = await db.execute(
      `INSERT INTO campanha_itens
         (campanha_id, empresa_id, tipo, arquivo_url, ordem, duracao_segundos, titulo,
          afiliado_link, afiliado_imagem_url, afiliado_descricao, afiliado_preco,
          afiliado_preco_original, afiliado_destaques, modo_exibicao)
       VALUES (?, ?, 'afiliado', NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campanha.id,
        req.empresa_id,
        ordemRow.proxima,
        duracao_segundos ? parseInt(duracao_segundos, 10) : 15,
        titulo || null,
        link.trim(),
        imagem_url.trim(),
        descricao ? descricao.trim() : null,
        precoNum,
        precoOriginalNum,
        JSON.stringify(destaquesArr),
        modoExibicao,
      ]
    );
    const [[item]] = await db.execute("SELECT * FROM campanha_itens WHERE id = ?", [result.insertId]);
    item.afiliado_destaques = destaquesArr;

    const walledGarden = await liberarDominiosAfiliado(campanha.id, req.empresa_id, [link.trim(), imagem_url.trim()]);
    res.status(201).json({ success: true, data: item, walled_garden: walledGarden });
  } catch (err) {
    console.error("Erro ao adicionar item de afiliado:", err);
    res.status(500).json({ error: "Erro ao adicionar item de afiliado" });
  }
};

const CUPOM_DESCONTO_TIPOS = ["percentual", "valor_fixo"];
const CUPOM_LINK_RE = /^https?:\/\/.+/i;

function validarCupom(body) {
  const { codigo, desconto_tipo, desconto_valor, validade, descricao, link } = body;

  if (!codigo || !String(codigo).trim()) {
    return { erro: "Informe o código do cupom." };
  }
  if (String(codigo).trim().length > 50) {
    return { erro: "Código do cupom deve ter até 50 caracteres." };
  }
  if (!CUPOM_DESCONTO_TIPOS.includes(desconto_tipo)) {
    return { erro: "Tipo de desconto inválido. Use percentual ou valor fixo." };
  }
  const valorNum = parseFloat(desconto_valor);
  if (isNaN(valorNum) || valorNum <= 0) {
    return { erro: "Valor do desconto inválido." };
  }
  if (desconto_tipo === "percentual" && valorNum > 100) {
    return { erro: "Desconto percentual não pode ser maior que 100%." };
  }
  if (validade && isNaN(new Date(validade).getTime())) {
    return { erro: "Data de validade inválida." };
  }
  if (descricao && String(descricao).length > 500) {
    return { erro: "Descrição deve ter até 500 caracteres." };
  }
  if (link && !CUPOM_LINK_RE.test(link)) {
    return { erro: "Link do cupom inválido. Use uma URL http(s) completa." };
  }

  return { erro: null, valorNum };
}

exports.criarItemCupom = async (req, res) => {
  try {
    const campanha = await getCampanhaOuFalha(req, res);
    if (!campanha) return;

    const { codigo, desconto_tipo, desconto_valor, validade, descricao, link, titulo, duracao_segundos, modo_exibicao } = req.body;

    const modoExibicao = validarModoExibicao(modo_exibicao);
    if (modoExibicao === null) {
      return res.status(400).json({ error: "Modo de exibição inválido" });
    }

    const { erro, valorNum } = validarCupom(req.body);
    if (erro) return res.status(400).json({ error: erro });

    const [[ordemRow]] = await db.execute(
      "SELECT IFNULL(MAX(ordem), -1) + 1 AS proxima FROM campanha_itens WHERE campanha_id = ?",
      [campanha.id]
    );

    const [result] = await db.execute(
      `INSERT INTO campanha_itens
         (campanha_id, empresa_id, tipo, arquivo_url, ordem, duracao_segundos, titulo,
          cupom_codigo, cupom_desconto_tipo, cupom_desconto_valor, cupom_validade, cupom_descricao, cupom_link, modo_exibicao)
       VALUES (?, ?, 'cupom', NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campanha.id,
        req.empresa_id,
        ordemRow.proxima,
        duracao_segundos ? parseInt(duracao_segundos, 10) : 15,
        titulo || null,
        String(codigo).trim(),
        desconto_tipo,
        valorNum,
        validade || null,
        descricao ? descricao.trim() : null,
        link ? link.trim() : null,
        modoExibicao,
      ]
    );
    const [[item]] = await db.execute("SELECT * FROM campanha_itens WHERE id = ?", [result.insertId]);

    const walledGarden = link ? await liberarDominiosAfiliado(campanha.id, req.empresa_id, [link.trim()]) : null;
    res.status(201).json({ success: true, data: item, walled_garden: walledGarden });
  } catch (err) {
    console.error("Erro ao adicionar item de cupom:", err);
    res.status(500).json({ error: "Erro ao adicionar item de cupom" });
  }
};

const PESQUISA_FORMATOS = ["multipla_escolha", "escala"];
const MIN_OPCOES_PESQUISA = 2;
const MAX_OPCOES_PESQUISA = 6;
const MAX_OPCAO_LEN = 60;

function validarPesquisa(body) {
  const { pergunta, formato, opcoes } = body;

  if (!pergunta || !String(pergunta).trim()) {
    return { erro: "Informe a pergunta da pesquisa." };
  }
  if (String(pergunta).trim().length > 300) {
    return { erro: "Pergunta deve ter até 300 caracteres." };
  }
  if (!PESQUISA_FORMATOS.includes(formato)) {
    return { erro: "Formato de pesquisa inválido. Use múltipla escolha ou escala." };
  }

  let opcoesArr = null;
  if (formato === "multipla_escolha") {
    if (!Array.isArray(opcoes)) {
      return { erro: "Informe as opções de resposta." };
    }
    opcoesArr = opcoes.map((o) => String(o).trim()).filter(Boolean);
    if (opcoesArr.length < MIN_OPCOES_PESQUISA || opcoesArr.length > MAX_OPCOES_PESQUISA) {
      return { erro: `Informe entre ${MIN_OPCOES_PESQUISA} e ${MAX_OPCOES_PESQUISA} opções de resposta.` };
    }
    if (opcoesArr.some((o) => o.length > MAX_OPCAO_LEN)) {
      return { erro: `Cada opção deve ter até ${MAX_OPCAO_LEN} caracteres.` };
    }
  }

  return { erro: null, opcoesArr };
}

exports.criarItemPesquisa = async (req, res) => {
  try {
    const campanha = await getCampanhaOuFalha(req, res);
    if (!campanha) return;

    const { pergunta, formato, opcoes, titulo, duracao_segundos, modo_exibicao } = req.body;

    const modoExibicao = validarModoExibicao(modo_exibicao);
    if (modoExibicao === null) {
      return res.status(400).json({ error: "Modo de exibição inválido" });
    }

    const { erro, opcoesArr } = validarPesquisa(req.body);
    if (erro) return res.status(400).json({ error: erro });

    const [[ordemRow]] = await db.execute(
      "SELECT IFNULL(MAX(ordem), -1) + 1 AS proxima FROM campanha_itens WHERE campanha_id = ?",
      [campanha.id]
    );

    const [result] = await db.execute(
      `INSERT INTO campanha_itens
         (campanha_id, empresa_id, tipo, arquivo_url, ordem, duracao_segundos, titulo,
          pesquisa_pergunta, pesquisa_formato, pesquisa_opcoes, modo_exibicao)
       VALUES (?, ?, 'pesquisa', NULL, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campanha.id,
        req.empresa_id,
        ordemRow.proxima,
        duracao_segundos ? parseInt(duracao_segundos, 10) : 15,
        titulo || null,
        String(pergunta).trim(),
        formato,
        opcoesArr ? JSON.stringify(opcoesArr) : null,
        modoExibicao,
      ]
    );
    const [[item]] = await db.execute("SELECT * FROM campanha_itens WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error("Erro ao adicionar item de pesquisa:", err);
    res.status(500).json({ error: "Erro ao adicionar item de pesquisa" });
  }
};

exports.atualizarItem = async (req, res) => {
  const { itemId } = req.params;
  const campanhaId = req.params.id;
  try {
    const [[item]] = await db.execute(
      `SELECT ci.*
         FROM campanha_itens ci
         JOIN campanhas c ON c.id = ci.campanha_id
       WHERE ci.id = ? AND ci.campanha_id = ? AND c.empresa_id = ?`,
      [itemId, campanhaId, req.empresa_id]
    );
    if (!item) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    const sets = [];
    const values = [];

    const { titulo, duracao_segundos, link_destino, modo_exibicao } = req.body;
    if (titulo !== undefined) {
      if (titulo && titulo.length > 200) {
        return res.status(400).json({ error: "Título deve ter até 200 caracteres." });
      }
      sets.push("titulo = ?");
      values.push(titulo || null);
    }
    if (duracao_segundos !== undefined) {
      sets.push("duracao_segundos = ?");
      values.push(parseInt(duracao_segundos, 10));
    }
    if (link_destino !== undefined) {
      sets.push("link_destino = ?");
      values.push(link_destino || null);
    }
    if (modo_exibicao !== undefined) {
      if (!MODOS_EXIBICAO.includes(modo_exibicao)) {
        return res.status(400).json({ error: "Modo de exibição inválido" });
      }
      sets.push("modo_exibicao = ?");
      values.push(modo_exibicao);
    }

    if (item.tipo === "youtube") {
      const { youtube_url } = req.body;
      if (youtube_url !== undefined) {
        const match = YT_URL_RE.exec(youtube_url || "");
        if (!match) {
          return res.status(400).json({ error: "Link do YouTube inválido. Use um link como https://www.youtube.com/watch?v=... ou https://youtu.be/..." });
        }
        sets.push("arquivo_url = ?");
        values.push(`https://www.youtube.com/watch?v=${match[1]}`);
      }
    } else if (item.tipo === "adsense") {
      const { ad_client, ad_slot, ad_format, ad_full_width, ad_width, ad_height } = req.body;
      if (ad_client !== undefined) {
        if (!AD_CLIENT_RE.test(ad_client || "")) {
          return res.status(400).json({ error: "Código AdSense inválido: data-ad-client deve ter o formato ca-pub-XXXXXXXXXX" });
        }
        sets.push("ad_client = ?");
        values.push(ad_client);
      }
      if (ad_slot !== undefined) {
        if (!AD_SLOT_RE.test(String(ad_slot || ""))) {
          return res.status(400).json({ error: "Código AdSense inválido: data-ad-slot deve ser numérico" });
        }
        sets.push("ad_slot = ?");
        values.push(String(ad_slot));
      }
      if (ad_format !== undefined) {
        if (ad_format && !AD_FORMATS.includes(ad_format)) {
          return res.status(400).json({ error: "Formato de anúncio não suportado" });
        }
        sets.push("ad_format = ?");
        values.push(ad_format || null);
      }
      if (ad_full_width !== undefined) {
        sets.push("ad_full_width = ?");
        values.push(ad_full_width ? 1 : 0);
      }
      if (ad_width !== undefined || ad_height !== undefined) {
        const w = ad_width ? parseInt(ad_width, 10) : null;
        const h = ad_height ? parseInt(ad_height, 10) : null;
        if ((w !== null && (isNaN(w) || w < 50 || w > 2000)) ||
            (h !== null && (isNaN(h) || h < 50 || h > 2000))) {
          return res.status(400).json({ error: "Dimensões do anúncio inválidas" });
        }
        sets.push("ad_width = ?");
        values.push(w);
        sets.push("ad_height = ?");
        values.push(h);
      }
    } else if (item.tipo === "afiliado") {
      const { link, imagem_url, descricao, preco, preco_original, destaques } = req.body;

      let precoNum = item.afiliado_preco;
      if (preco !== undefined) {
        precoNum = parseFloat(preco);
        if (isNaN(precoNum) || precoNum <= 0) {
          return res.status(400).json({ error: "Preço atual inválido." });
        }
      }

      let precoOriginalNum = item.afiliado_preco_original;
      if (preco_original !== undefined) {
        if (preco_original === null || preco_original === "") {
          precoOriginalNum = null;
        } else {
          precoOriginalNum = parseFloat(preco_original);
          if (isNaN(precoOriginalNum) || precoOriginalNum <= 0) {
            return res.status(400).json({ error: "Preço original inválido." });
          }
        }
      }

      if (precoOriginalNum !== null && precoOriginalNum !== undefined && precoOriginalNum <= precoNum) {
        return res.status(400).json({ error: "O preço original deve ser maior que o preço atual para calcular o desconto." });
      }

      if (link !== undefined) {
        if (!AFILIADO_URL_RE.test(link || "")) {
          return res.status(400).json({ error: "Link de afiliado inválido. Use uma URL http(s) completa." });
        }
        sets.push("afiliado_link = ?");
        values.push(link.trim());
      }
      if (imagem_url !== undefined) {
        if (!AFILIADO_URL_RE.test(imagem_url || "")) {
          return res.status(400).json({ error: "URL da imagem do produto inválida. Use uma URL http(s) completa." });
        }
        sets.push("afiliado_imagem_url = ?");
        values.push(imagem_url.trim());
      }
      if (descricao !== undefined) {
        if (descricao && descricao.length > 500) {
          return res.status(400).json({ error: "Descrição deve ter até 500 caracteres." });
        }
        sets.push("afiliado_descricao = ?");
        values.push(descricao ? descricao.trim() : null);
      }
      if (preco !== undefined) {
        sets.push("afiliado_preco = ?");
        values.push(precoNum);
      }
      if (preco_original !== undefined) {
        sets.push("afiliado_preco_original = ?");
        values.push(precoOriginalNum);
      }
      if (destaques !== undefined) {
        if (!Array.isArray(destaques)) {
          return res.status(400).json({ error: "Destaques deve ser uma lista de textos." });
        }
        const destaquesArr = destaques.map((d) => String(d).trim()).filter(Boolean);
        if (destaquesArr.length > MAX_DESTAQUES) {
          return res.status(400).json({ error: `Máximo de ${MAX_DESTAQUES} destaques.` });
        }
        if (destaquesArr.some((d) => d.length > MAX_DESTAQUE_LEN)) {
          return res.status(400).json({ error: `Cada destaque deve ter até ${MAX_DESTAQUE_LEN} caracteres.` });
        }
        sets.push("afiliado_destaques = ?");
        values.push(JSON.stringify(destaquesArr));
      }
    } else if (item.tipo === "cupom") {
      const { codigo, desconto_tipo, desconto_valor, validade, descricao, link } = req.body;

      const mesclado = {
        codigo: codigo !== undefined ? codigo : item.cupom_codigo,
        desconto_tipo: desconto_tipo !== undefined ? desconto_tipo : item.cupom_desconto_tipo,
        desconto_valor: desconto_valor !== undefined ? desconto_valor : item.cupom_desconto_valor,
        validade: validade !== undefined ? validade : item.cupom_validade,
        descricao: descricao !== undefined ? descricao : item.cupom_descricao,
        link: link !== undefined ? link : item.cupom_link,
      };
      const { erro, valorNum } = validarCupom(mesclado);
      if (erro) return res.status(400).json({ error: erro });

      if (codigo !== undefined) {
        sets.push("cupom_codigo = ?");
        values.push(String(codigo).trim());
      }
      if (desconto_tipo !== undefined) {
        sets.push("cupom_desconto_tipo = ?");
        values.push(desconto_tipo);
      }
      if (desconto_valor !== undefined) {
        sets.push("cupom_desconto_valor = ?");
        values.push(valorNum);
      }
      if (validade !== undefined) {
        sets.push("cupom_validade = ?");
        values.push(validade || null);
      }
      if (descricao !== undefined) {
        sets.push("cupom_descricao = ?");
        values.push(descricao ? descricao.trim() : null);
      }
      if (link !== undefined) {
        sets.push("cupom_link = ?");
        values.push(link ? link.trim() : null);
      }
    } else if (item.tipo === "pesquisa") {
      const { pergunta, formato, opcoes } = req.body;

      const mesclado = {
        pergunta: pergunta !== undefined ? pergunta : item.pesquisa_pergunta,
        formato: formato !== undefined ? formato : item.pesquisa_formato,
        opcoes: opcoes !== undefined ? opcoes : item.pesquisa_opcoes,
      };
      const { erro, opcoesArr } = validarPesquisa(mesclado);
      if (erro) return res.status(400).json({ error: erro });

      if (pergunta !== undefined) {
        sets.push("pesquisa_pergunta = ?");
        values.push(String(pergunta).trim());
      }
      if (formato !== undefined) {
        sets.push("pesquisa_formato = ?");
        values.push(formato);
      }
      if (opcoes !== undefined) {
        sets.push("pesquisa_opcoes = ?");
        values.push(mesclado.formato === "multipla_escolha" ? JSON.stringify(opcoesArr) : null);
      }
    }

    if (sets.length === 0) {
      return res.json({ success: true, data: item });
    }

    values.push(itemId);
    await db.execute(`UPDATE campanha_itens SET ${sets.join(", ")} WHERE id = ?`, values);

    const [[atualizado]] = await db.execute(
      "SELECT * FROM campanha_itens WHERE id = ?",
      [itemId]
    );
    if (atualizado.tipo === "afiliado" && typeof atualizado.afiliado_destaques === "string") {
      try { atualizado.afiliado_destaques = JSON.parse(atualizado.afiliado_destaques); }
      catch (_) { atualizado.afiliado_destaques = []; }
    }

    let walledGarden = null;
    if (atualizado.tipo === "afiliado" && (req.body.link !== undefined || req.body.imagem_url !== undefined)) {
      walledGarden = await liberarDominiosAfiliado(campanhaId, req.empresa_id, [atualizado.afiliado_link, atualizado.afiliado_imagem_url]);
    } else if (atualizado.tipo === "cupom" && req.body.link !== undefined && atualizado.cupom_link) {
      walledGarden = await liberarDominiosAfiliado(campanhaId, req.empresa_id, [atualizado.cupom_link]);
    }
    res.json({ success: true, data: atualizado, walled_garden: walledGarden });
  } catch (err) {
    console.error("Erro ao atualizar item:", err);
    res.status(500).json({ error: "Erro ao atualizar item" });
  }
};

exports.deletarItem = async (req, res) => {
  const { itemId } = req.params;
  const campanhaId = req.params.id;
  try {
    const [[item]] = await db.execute(
      `SELECT ci.*
         FROM campanha_itens ci
         JOIN campanhas c ON c.id = ci.campanha_id
       WHERE ci.id = ? AND ci.campanha_id = ? AND c.empresa_id = ?`,
      [itemId, campanhaId, req.empresa_id]
    );
    if (!item) return res.status(404).json({ error: "Item não encontrado" });

    // Remove physical file (adsense não tem arquivo; youtube guarda URL externa)
    if (item.arquivo_url && item.arquivo_url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../.." + item.arquivo_url);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {
          console.error("Erro ao remover arquivo físico:", e);
        }
      }
    }

    await db.execute("DELETE FROM campanha_itens WHERE id = ?", [itemId]);
    res.json({ success: true, message: "Item removido com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar item:", err);
    res.status(500).json({ error: "Erro ao deletar item" });
  }
};

exports.reordenar = async (req, res) => {
  const campanhaId = req.params.id;
  const { ordens } = req.body; // [{id, ordem}, ...]

  if (!Array.isArray(ordens) || ordens.length === 0) {
    return res.status(400).json({ error: "Campo ordens deve ser um array não vazio" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verify campanha belongs to this empresa
    const [[campanha]] = await conn.execute(
      "SELECT id FROM campanhas WHERE id = ? AND empresa_id = ?",
      [campanhaId, req.empresa_id]
    );
    if (!campanha) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: "Campanha não encontrada" });
    }

    for (const { id, ordem } of ordens) {
      await conn.execute(
        "UPDATE campanha_itens SET ordem = ? WHERE id = ? AND campanha_id = ?",
        [ordem, id, campanhaId]
      );
    }

    await conn.commit();
    conn.release();
    res.json({ success: true, message: "Itens reordenados com sucesso" });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error("Erro ao reordenar itens:", err);
    res.status(500).json({ error: "Erro ao reordenar itens" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Métricas (impressões, cliques, CTR)
// ─────────────────────────────────────────────────────────────────────────────

function resolverPeriodo(query) {
  const hoje = new Date();
  const ateDefault = hoje.toISOString().slice(0, 10);
  const deDefault = new Date(hoje.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const de = /^\d{4}-\d{2}-\d{2}$/.test(query.de || "") ? query.de : deDefault;
  const ate = /^\d{4}-\d{2}-\d{2}$/.test(query.ate || "") ? query.ate : ateDefault;
  return { de, ate };
}

// Usuarios conectados (distintos por MAC) e tempo medio de sessao no periodo,
// pra dar contexto ao lado de impressoes/cliques (task 011 - item de baixo
// esforco recomendado: dado ja existe em connection_logs, so precisa agregar).
// Nao e' um recorte por campanha (nao ha MAC salvo em campanha_eventos) -
// `nasIps`, quando informado, restringe aos mikrotiks vinculados ao portal da
// campanha; sem isso, e' o total da empresa no periodo.
async function buscarConexoes(empresaId, de, ate, nasIps) {
  if (nasIps && nasIps.length === 0) {
    return { usuarios_conectados: 0, tempo_medio_conectado_minutos: 0 };
  }

  const params = [empresaId];
  let filtroNas = "";
  if (nasIps) {
    filtroNas = "AND nas_ip IN (?)";
    params.push(nasIps);
  }
  params.push(de, ate);

  const [[row]] = await db.query(
    `SELECT COUNT(DISTINCT mac) AS usuarios_conectados,
            AVG(duracao_segundos) AS tempo_medio_segundos
       FROM connection_logs
      WHERE empresa_id = ? ${filtroNas}
        AND inicio_conexao >= ? AND inicio_conexao < DATE_ADD(?, INTERVAL 1 DAY)`,
    params
  );
  return {
    usuarios_conectados: row.usuarios_conectados || 0,
    tempo_medio_conectado_minutos: row.tempo_medio_segundos
      ? Number((row.tempo_medio_segundos / 60).toFixed(1))
      : 0,
  };
}

exports.metricasGerais = async (req, res) => {
  try {
    const { de, ate } = resolverPeriodo(req.query);

    const [[resumo]] = await db.execute(
      `SELECT
         COUNT(CASE WHEN tipo_evento = 'impressao' THEN 1 END) AS impressoes,
         COUNT(CASE WHEN tipo_evento = 'clique'    THEN 1 END) AS cliques
       FROM campanha_eventos
      WHERE empresa_id = ? AND criado_em >= ? AND criado_em < DATE_ADD(?, INTERVAL 1 DAY)`,
      [req.empresa_id, de, ate]
    );
    const impressoes = resumo.impressoes || 0;
    const cliques = resumo.cliques || 0;

    const [serieDiaria] = await db.execute(
      `SELECT DATE(criado_em) AS data,
              COUNT(CASE WHEN tipo_evento = 'impressao' THEN 1 END) AS impressoes,
              COUNT(CASE WHEN tipo_evento = 'clique'    THEN 1 END) AS cliques
         FROM campanha_eventos
        WHERE empresa_id = ? AND criado_em >= ? AND criado_em < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY DATE(criado_em)
        ORDER BY data ASC`,
      [req.empresa_id, de, ate]
    );

    const conexoes = await buscarConexoes(req.empresa_id, de, ate);

    res.json({
      success: true,
      data: {
        periodo: { de, ate },
        resumo: {
          impressoes,
          cliques,
          ctr: impressoes > 0 ? Number(((cliques / impressoes) * 100).toFixed(2)) : 0,
        },
        conexoes,
        serie_diaria: serieDiaria.map((d) => ({
          data: d.data instanceof Date ? d.data.toISOString().slice(0, 10) : d.data,
          impressoes: d.impressoes || 0,
          cliques: d.cliques || 0,
        })),
      },
    });
  } catch (err) {
    console.error("Erro ao obter métricas gerais:", err);
    res.status(500).json({ error: "Erro ao obter métricas" });
  }
};

exports.metricasCampanha = async (req, res) => {
  const { id } = req.params;
  try {
    const [[campanha]] = await db.execute(
      "SELECT id FROM campanhas WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );
    if (!campanha) return res.status(404).json({ error: "Campanha não encontrada" });

    const { de, ate } = resolverPeriodo(req.query);

    const [[resumo]] = await db.execute(
      `SELECT
         COUNT(CASE WHEN tipo_evento = 'impressao' THEN 1 END) AS impressoes,
         COUNT(CASE WHEN tipo_evento = 'clique'    THEN 1 END) AS cliques
       FROM campanha_eventos
      WHERE campanha_id = ? AND criado_em >= ? AND criado_em < DATE_ADD(?, INTERVAL 1 DAY)`,
      [id, de, ate]
    );
    const impressoes = resumo.impressoes || 0;
    const cliques = resumo.cliques || 0;

    const [serieDiaria] = await db.execute(
      `SELECT DATE(criado_em) AS data,
              COUNT(CASE WHEN tipo_evento = 'impressao' THEN 1 END) AS impressoes,
              COUNT(CASE WHEN tipo_evento = 'clique'    THEN 1 END) AS cliques
         FROM campanha_eventos
        WHERE campanha_id = ? AND criado_em >= ? AND criado_em < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY DATE(criado_em)
        ORDER BY data ASC`,
      [id, de, ate]
    );

    const [rankingItens] = await db.execute(
      `SELECT ci.id AS item_id, ci.titulo, ci.tipo,
              COUNT(CASE WHEN e.tipo_evento = 'impressao' THEN 1 END) AS impressoes,
              COUNT(CASE WHEN e.tipo_evento = 'clique'    THEN 1 END) AS cliques
         FROM campanha_itens ci
         LEFT JOIN campanha_eventos e
           ON e.item_id = ci.id AND e.criado_em >= ? AND e.criado_em < DATE_ADD(?, INTERVAL 1 DAY)
        WHERE ci.campanha_id = ?
        GROUP BY ci.id
        ORDER BY cliques DESC, impressoes DESC
        LIMIT 10`,
      [de, ate, id]
    );

    // Usuarios conectados/tempo medio dos hotspots vinculados ao portal desta
    // campanha (mesmo join usado em liberarDominiosAfiliado) - null quando a
    // campanha ainda nao esta vinculada a nenhum portal (nao da pra saber
    // "quais hotspots", entao nao faz sentido mostrar um numero da empresa
    // toda como se fosse desta campanha).
    const [portaisVinc] = await db.execute(
      `SELECT p.id FROM portais p
         JOIN portal_campanhas pc ON pc.portal_id = p.id
        WHERE pc.campanha_id = ? AND p.empresa_id = ?`,
      [id, req.empresa_id]
    );
    let conexoes = null;
    if (portaisVinc.length > 0) {
      const [mikrotiksVinc] = await db.query(
        "SELECT ip, vpn_ip FROM mikrotiks WHERE portal_id IN (?)",
        [portaisVinc.map((p) => p.id)]
      );
      const nasIps = [...new Set(mikrotiksVinc.flatMap((m) => [m.ip, m.vpn_ip]).filter(Boolean))];
      conexoes = await buscarConexoes(req.empresa_id, de, ate, nasIps);
    }

    const [itensPesquisa] = await db.execute(
      `SELECT id, titulo, pesquisa_pergunta, pesquisa_formato, pesquisa_opcoes
         FROM campanha_itens WHERE campanha_id = ? AND tipo = 'pesquisa'`,
      [id]
    );
    const pesquisas = [];
    for (const it of itensPesquisa) {
      const [respostas] = await db.execute(
        `SELECT resposta_opcao_index, resposta_nota, COUNT(*) AS total
           FROM campanha_pesquisa_respostas
          WHERE item_id = ?
          GROUP BY resposta_opcao_index, resposta_nota`,
        [it.id]
      );
      const totalRespostas = respostas.reduce((acc, r) => acc + r.total, 0);
      let distribuicao;
      if (it.pesquisa_formato === "multipla_escolha") {
        const opcoes = Array.isArray(it.pesquisa_opcoes) ? it.pesquisa_opcoes : [];
        distribuicao = opcoes.map((label, idx) => {
          const linha = respostas.find((r) => r.resposta_opcao_index === idx);
          const total = linha ? linha.total : 0;
          return {
            label,
            total,
            percentual: totalRespostas > 0 ? Number(((total / totalRespostas) * 100).toFixed(1)) : 0,
          };
        });
      } else {
        distribuicao = [1, 2, 3, 4, 5].map((nota) => {
          const linha = respostas.find((r) => r.resposta_nota === nota);
          const total = linha ? linha.total : 0;
          return {
            label: `${nota} estrela${nota > 1 ? "s" : ""}`,
            total,
            percentual: totalRespostas > 0 ? Number(((total / totalRespostas) * 100).toFixed(1)) : 0,
          };
        });
      }
      const mediaNotas = it.pesquisa_formato === "escala" && totalRespostas > 0
        ? Number((respostas.reduce((acc, r) => acc + (r.resposta_nota || 0) * r.total, 0) / totalRespostas).toFixed(2))
        : null;

      pesquisas.push({
        item_id: it.id,
        titulo: it.titulo,
        pergunta: it.pesquisa_pergunta,
        formato: it.pesquisa_formato,
        total_respostas: totalRespostas,
        media_nota: mediaNotas,
        distribuicao,
      });
    }

    res.json({
      success: true,
      data: {
        periodo: { de, ate },
        resumo: {
          impressoes,
          cliques,
          ctr: impressoes > 0 ? Number(((cliques / impressoes) * 100).toFixed(2)) : 0,
        },
        conexoes,
        serie_diaria: serieDiaria.map((d) => ({
          data: d.data instanceof Date ? d.data.toISOString().slice(0, 10) : d.data,
          impressoes: d.impressoes || 0,
          cliques: d.cliques || 0,
        })),
        ranking_itens: rankingItens.map((it) => ({
          item_id: it.item_id,
          titulo: it.titulo,
          tipo: it.tipo,
          impressoes: it.impressoes || 0,
          cliques: it.cliques || 0,
          ctr: it.impressoes > 0 ? Number(((it.cliques / it.impressoes) * 100).toFixed(2)) : 0,
        })),
        pesquisas,
      },
    });
  } catch (err) {
    console.error("Erro ao obter métricas da campanha:", err);
    res.status(500).json({ error: "Erro ao obter métricas" });
  }
};
