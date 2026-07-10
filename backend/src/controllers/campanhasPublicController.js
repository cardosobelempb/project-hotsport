const db = require("../../db");

const ITENS_COLUNAS = `id, tipo, modo_exibicao, ordem, arquivo_url, duracao_segundos, titulo, link_destino,
              ad_client, ad_slot, ad_format, ad_full_width, ad_width, ad_height,
              afiliado_link, afiliado_imagem_url, afiliado_descricao,
              afiliado_preco, afiliado_preco_original, afiliado_destaques,
              cupom_codigo, cupom_desconto_tipo, cupom_desconto_valor,
              cupom_validade, cupom_descricao, cupom_link,
              pesquisa_pergunta, pesquisa_formato, pesquisa_opcoes`;

function parseDestaques(itens) {
  itens.forEach((it) => {
    if (it.tipo === "afiliado" && typeof it.afiliado_destaques === "string") {
      try { it.afiliado_destaques = JSON.parse(it.afiliado_destaques); }
      catch (_) { it.afiliado_destaques = []; }
    }
  });
  return itens;
}

/**
 * Busca todas as campanhas elegíveis de um portal (vínculo em
 * `portal_campanhas`, N:N — task 012), validando empresa, ativo=1 e regras de
 * agendamento/segmentação. Retorna `{ portal, campanhas }` ordenado por id
 * (ordem estável, usada como base do round-robin).
 *
 * `mac`, quando informado, é usado só pra avaliar `regra_acesso`
 * (primeiro_acesso/recorrente) — checa se esse MAC já apareceu antes em
 * `leads` desta empresa (indice idx_leads_empresa_mac, migration 029).
 * Não verifica radacct (sem índice em callingstationid — full table scan
 * nesse endpoint público seria arriscado). Sem `mac`, campanhas com
 * regra_acesso != 'qualquer' simplesmente não aparecem (mesmo padrão de
 * dispositivo/sistema_operacional ausentes).
 */
async function buscarCampanhasElegiveisDoPortal(portalId, { mikrotik_id, dispositivo, sistema_operacional, mac } = {}) {
  const [[portal]] = await db.execute(
    "SELECT id, empresa_id FROM portais WHERE id = ?",
    [portalId]
  );
  if (!portal) return { portal: null, campanhas: [] };

  let macJaVisto = false;
  if (mac) {
    const [[row]] = await db.execute(
      "SELECT 1 FROM leads WHERE empresa_id = ? AND mac = ? LIMIT 1",
      [portal.empresa_id, mac]
    );
    macJaVisto = !!row;
  }
  const macInformado = mac ? 1 : 0;

  const [campanhas] = await db.execute(
    `SELECT c.* FROM campanhas c
       JOIN portal_campanhas pc ON pc.campanha_id = c.id
      WHERE pc.portal_id = ? AND c.empresa_id = ? AND c.ativo = 1
        AND (c.data_inicio IS NULL OR c.data_inicio <= CURDATE())
        AND (c.data_fim   IS NULL OR c.data_fim   >= CURDATE())
        AND (
          c.horario_inicio IS NULL OR c.horario_fim IS NULL OR
          CASE WHEN c.horario_inicio <= c.horario_fim
               THEN CURTIME() BETWEEN c.horario_inicio AND c.horario_fim
               ELSE CURTIME() >= c.horario_inicio OR CURTIME() <= c.horario_fim
          END
        )
        AND (c.dias_semana IS NULL OR JSON_CONTAINS(c.dias_semana, CAST(DAYOFWEEK(CURDATE()) - 1 AS JSON)))
        AND (c.dispositivos IS NULL OR (? IS NOT NULL AND JSON_CONTAINS(c.dispositivos, JSON_QUOTE(?))))
        AND (c.sistemas_operacionais IS NULL OR (? IS NOT NULL AND JSON_CONTAINS(c.sistemas_operacionais, JSON_QUOTE(?))))
        AND (c.mikrotiks_permitidos IS NULL OR (? IS NOT NULL AND JSON_CONTAINS(c.mikrotiks_permitidos, CAST(? AS JSON))))
        AND (
          c.regra_acesso = 'qualquer'
          OR (c.regra_acesso = 'primeiro_acesso' AND ? = 1 AND ? = 0)
          OR (c.regra_acesso = 'recorrente'      AND ? = 1 AND ? = 1)
        )
      ORDER BY c.id ASC`,
    [
      portalId, portal.empresa_id,
      dispositivo || null, dispositivo || null,
      sistema_operacional || null, sistema_operacional || null,
      mikrotik_id || null, mikrotik_id || null,
      macInformado, macJaVisto ? 1 : 0,
      macInformado, macJaVisto ? 1 : 0,
    ]
  );
  return { portal, campanhas };
}

/**
 * Escolhe 1 campanha entre as elegíveis de um portal (task 012 — rotação
 * round-robin entre campanhas concorrentes, decisão do usuário: sem peso,
 * sem orçamento/leilão). Cicla pela lista ordenada por id, avançando um
 * ponteiro persistido em `portais.campanha_rotacao_ultima_id`: pega a
 * primeira campanha elegível com id maior que a última servida, e volta pro
 * início da lista se não achar (wraparound). Isso se auto-corrige mesmo
 * quando o conjunto de elegíveis muda entre chamadas (campanha
 * pausada/expirada não trava a rotação).
 */
async function buscarCampanhaAtivaDoPortal(portalId, ctx = {}) {
  const { portal, campanhas } = await buscarCampanhasElegiveisDoPortal(portalId, ctx);
  if (!portal || campanhas.length === 0) return null;
  if (campanhas.length === 1) return campanhas[0];

  const [[rot]] = await db.execute(
    "SELECT campanha_rotacao_ultima_id FROM portais WHERE id = ?",
    [portalId]
  );
  const ultimaId = rot?.campanha_rotacao_ultima_id;
  const proxima = campanhas.find((c) => ultimaId != null && c.id > ultimaId) || campanhas[0];

  await db.execute(
    "UPDATE portais SET campanha_rotacao_ultima_id = ? WHERE id = ?",
    [proxima.id, portalId]
  );
  return proxima;
}

/**
 * Retorna a campanha ativa de um portal, incluindo seus itens de sequência
 * normal (exclui itens marcados como pop-up — ver `obterPopupPorPortal`).
 * Rota pública — sem autenticação.
 *
 * Query params opcionais usados para avaliar as regras de agendamento/segmentação
 * da campanha (todas as regras são "sem restrição" quando NULL no banco):
 *   - dispositivo: 'mobile' | 'desktop' | 'tablet'
 *   - sistema_operacional: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'outro'
 *   - mikrotik_id: id do MikroTik de onde o cliente está acessando
 *   - mac: MAC do cliente, usado pra avaliar regra_acesso (primeiro_acesso/recorrente)
 */
exports.obterPorPortal = async (req, res) => {
  const { portalId } = req.params;
  const { mikrotik_id, dispositivo, sistema_operacional, mac } = req.query;
  try {
    const campanha = await buscarCampanhaAtivaDoPortal(portalId, { mikrotik_id, dispositivo, sistema_operacional, mac });
    if (!campanha) {
      return res.status(404).json({ error: "Sem campanha ativa" });
    }

    const [itens] = await db.execute(
      `SELECT ${ITENS_COLUNAS}
         FROM campanha_itens
        WHERE campanha_id = ? AND modo_exibicao = 'sequencia'
        ORDER BY ordem ASC, id ASC`,
      [campanha.id]
    );
    if (itens.length === 0) {
      return res.status(404).json({ error: "Sem campanha ativa" });
    }

    return res.json({
      success: true,
      data: {
        id:    campanha.id,
        nome:  campanha.nome,
        itens: parseDestaques(itens),
      },
    });
  } catch (err) {
    console.error("Erro ao obter campanha por portal:", err);
    res.status(500).json({ error: "Erro ao obter campanha" });
  }
};

async function buscarPopupDaCampanha(campanha) {
  if (!campanha) return null;
  const [[item]] = await db.execute(
    `SELECT ${ITENS_COLUNAS}
       FROM campanha_itens
      WHERE campanha_id = ? AND modo_exibicao = 'popup'
      ORDER BY ordem ASC, id ASC
      LIMIT 1`,
    [campanha.id]
  );
  if (!item) return null;
  return { campanha_id: campanha.id, item: parseDestaques([item])[0] };
}

/**
 * Retorna o item pop-up (se houver) da campanha ativa de um portal.
 * Rota pública — sem autenticação. Usada pelo overlay pré-login (mounted
 * via PublicBanners), que já tem o portalId disponível na URL.
 */
exports.obterPopupPorPortal = async (req, res) => {
  const { portalId } = req.params;
  const { mikrotik_id, dispositivo, sistema_operacional, mac } = req.query;
  try {
    const campanha = await buscarCampanhaAtivaDoPortal(portalId, { mikrotik_id, dispositivo, sistema_operacional, mac });
    const popup = await buscarPopupDaCampanha(campanha);
    if (!popup) return res.status(404).json({ error: "Sem pop-up ativo" });
    return res.json({ success: true, data: popup });
  } catch (err) {
    console.error("Erro ao obter pop-up por portal:", err);
    res.status(500).json({ error: "Erro ao obter pop-up" });
  }
};

/**
 * Mesma coisa, mas resolvendo o portal a partir do MikroTik — usada pela
 * página pós-login `/campanha-popup`, que só recebe `mikrotik_id` (o
 * advertise-url do RouterOS não tem acesso ao portal_id diretamente).
 * `mikrotiks.portal_id` é sempre o portal de ENTRADA do hotspot, que é
 * exatamente o que queremos aqui (o Advertise é configurado por hotspot,
 * não por portal individual dentro de um redirect entre portais).
 */
exports.obterPopupPorMikrotik = async (req, res) => {
  const { mikrotikId } = req.params;
  try {
    const [[mikrotik]] = await db.execute(
      "SELECT portal_id FROM mikrotiks WHERE id = ?",
      [mikrotikId]
    );
    if (!mikrotik || !mikrotik.portal_id) {
      return res.status(404).json({ error: "Sem pop-up ativo" });
    }

    const campanha = await buscarCampanhaAtivaDoPortal(mikrotik.portal_id, { mikrotik_id: mikrotikId });
    const popup = await buscarPopupDaCampanha(campanha);
    if (!popup) return res.status(404).json({ error: "Sem pop-up ativo" });
    return res.json({ success: true, data: popup });
  } catch (err) {
    console.error("Erro ao obter pop-up por mikrotik:", err);
    res.status(500).json({ error: "Erro ao obter pop-up" });
  }
};

/**
 * Registra uma visualização de campanha. Rota pública — sem autenticação.
 *
 * Com múltiplas campanhas concorrentes por portal (task 012), o cliente
 * precisa informar qual `campanha_id` foi de fato exibida (retornado pelo
 * GET `/api/public/campanha/:portalId`) — não dá mais pra assumir "a
 * campanha do portal", já que o portal pode ter várias. Valida que a
 * campanha ainda está vinculada a este portal via `portal_campanhas` antes
 * de incrementar.
 */
exports.registrarView = async (req, res) => {
  const { portalId } = req.params;
  const { campanha_id } = req.body;
  try {
    if (!campanha_id) {
      return res.json({ success: true, skipped: true });
    }

    const [[vinculo]] = await db.execute(
      `SELECT c.id, c.empresa_id FROM campanhas c
         JOIN portal_campanhas pc ON pc.campanha_id = c.id
        WHERE pc.portal_id = ? AND c.id = ?`,
      [portalId, campanha_id]
    );
    if (!vinculo) {
      // Campanha trocou/desvinculou entre a exibição e o view — ignora silenciosamente
      return res.json({ success: true, skipped: true });
    }

    await db.execute(
      "UPDATE campanhas SET views = views + 1 WHERE id = ? AND empresa_id = ?",
      [vinculo.id, vinculo.empresa_id]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro ao registrar view da campanha:", err);
    res.status(500).json({ error: "Erro ao registrar view" });
  }
};

const TIPOS_EVENTO_VALIDOS = ["impressao", "clique"];

/**
 * Registra um evento granular (impressão ou clique) de um item da campanha.
 * Rota pública — sem autenticação. Best-effort: nunca deve travar a navegação do cliente.
 */
exports.registrarEvento = async (req, res) => {
  const { portalId } = req.params;
  const { campanha_id, item_id, tipo_evento, dispositivo, sistema_operacional, mikrotik_id } = req.body;

  if (!TIPOS_EVENTO_VALIDOS.includes(tipo_evento)) {
    return res.status(400).json({ error: "tipo_evento inválido" });
  }

  try {
    const [[vinculo]] = await db.execute(
      `SELECT c.empresa_id FROM campanhas c
         JOIN portal_campanhas pc ON pc.campanha_id = c.id
        WHERE pc.portal_id = ? AND c.id = ?`,
      [portalId, campanha_id]
    );
    if (!vinculo) {
      // Campanha trocou/expirou/desvinculou entre a exibição e o evento — ignora silenciosamente
      return res.json({ success: true, skipped: true });
    }

    await db.execute(
      `INSERT INTO campanha_eventos
         (empresa_id, campanha_id, item_id, portal_id, mikrotik_id, tipo_evento, dispositivo, sistema_operacional)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vinculo.empresa_id, campanha_id, item_id || null, portalId, mikrotik_id || null,
        tipo_evento, dispositivo || null, sistema_operacional || null,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao registrar evento de campanha:", err);
    res.status(500).json({ error: "Erro ao registrar evento" });
  }
};

/**
 * Registra a resposta de um item de pesquisa. Rota pública — sem autenticação.
 * Dedup por (item_id, mac): mesmo dispositivo respondendo de novo é ignorado
 * silenciosamente (não é erro pro cliente, só não conta 2x na agregação).
 */
exports.responderPesquisa = async (req, res) => {
  const { portalId } = req.params;
  const { campanha_id, item_id, mac, opcao_index, nota } = req.body;

  try {
    const [[vinculo]] = await db.execute(
      `SELECT c.empresa_id FROM campanhas c
         JOIN portal_campanhas pc ON pc.campanha_id = c.id
        WHERE pc.portal_id = ? AND c.id = ?`,
      [portalId, campanha_id]
    );
    if (!vinculo) {
      return res.json({ success: true, skipped: true });
    }

    const [[item]] = await db.execute(
      "SELECT * FROM campanha_itens WHERE id = ? AND campanha_id = ? AND tipo = 'pesquisa'",
      [item_id, campanha_id]
    );
    if (!item) {
      return res.status(404).json({ error: "Item de pesquisa não encontrado" });
    }

    let opcaoIndexNum = null;
    let notaNum = null;
    if (item.pesquisa_formato === "multipla_escolha") {
      const opcoes = Array.isArray(item.pesquisa_opcoes) ? item.pesquisa_opcoes : [];
      opcaoIndexNum = parseInt(opcao_index, 10);
      if (isNaN(opcaoIndexNum) || opcaoIndexNum < 0 || opcaoIndexNum >= opcoes.length) {
        return res.status(400).json({ error: "Opção de resposta inválida" });
      }
    } else if (item.pesquisa_formato === "escala") {
      notaNum = parseInt(nota, 10);
      if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
        return res.status(400).json({ error: "Nota inválida (use de 1 a 5)" });
      }
    }

    await db.execute(
      `INSERT INTO campanha_pesquisa_respostas
         (empresa_id, campanha_id, item_id, mac, resposta_opcao_index, resposta_nota)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vinculo.empresa_id, campanha_id, item_id, mac || null, opcaoIndexNum, notaNum]
    );
    res.json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      // Mesmo MAC ja respondeu esse item — ignora, nao eh erro pro cliente
      return res.json({ success: true, jaRespondeu: true });
    }
    console.error("Erro ao registrar resposta de pesquisa:", err);
    res.status(500).json({ error: "Erro ao registrar resposta" });
  }
};

// Reaproveitado por campanhaPreacessoController — mesma regra de seleção/rotação.
exports._buscarCampanhaAtivaDoPortal = buscarCampanhaAtivaDoPortal;
