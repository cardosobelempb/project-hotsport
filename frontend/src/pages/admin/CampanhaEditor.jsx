import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image, Youtube, Megaphone, ShoppingBag, Ticket, BarChart3, ChevronUp, ChevronDown, Trash2, Pencil, Upload, ImagePlus, Eye, MousePointerClick, Percent, Users, Clock } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useFeedback } from "../../contexts/FeedbackContext";
import {
  Modal, Textarea, Input, Select, Button, IconButton, Alert, Card, Badge, StatusToggle,
  SegmentedControl, EmptyState, PreviewBox, Checkbox, StatCard, MiniBarChart, Table,
} from "../../components/ui";
import { parseAdsenseCode } from "../../utils/adsense";

const DIAS_SEMANA = [
  { valor: 0, label: "Dom" }, { valor: 1, label: "Seg" }, { valor: 2, label: "Ter" },
  { valor: 3, label: "Qua" }, { valor: 4, label: "Qui" }, { valor: 5, label: "Sex" },
  { valor: 6, label: "Sáb" },
];
const DISPOSITIVOS = [
  { valor: "mobile", label: "Celular" }, { valor: "desktop", label: "Computador" }, { valor: "tablet", label: "Tablet" },
];
const SISTEMAS = [
  { valor: "android", label: "Android" }, { valor: "ios", label: "iOS" }, { valor: "windows", label: "Windows" },
  { valor: "macos", label: "macOS" }, { valor: "linux", label: "Linux" }, { valor: "outro", label: "Outro" },
];
const PERIODOS = [
  { value: "7", label: "7 dias" }, { value: "30", label: "30 dias" }, { value: "90", label: "90 dias" },
];
const CATEGORIAS = [
  { value: "", label: "Sem categoria" },
  { value: "promocao_local", label: "Promoção Local" },
  { value: "campanha_institucional", label: "Campanha Institucional" },
  { value: "oferta_patrocinada", label: "Oferta Patrocinada" },
];

function toggleEmLista(lista, valor) {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

// Borda temática por tipo de item + variante de Badge correspondente
const TIPO_TEMA = {
  imagem:   { border: "border-blue-500/30",   badge: "info" },
  video:    { border: "border-purple-500/40", badge: "purple" },
  youtube:  { border: "border-red-500/30",    badge: "danger" },
  adsense:  { border: "border-yellow-500/30", badge: "warning" },
  afiliado: { border: "border-green-500/30",  badge: "success" },
  cupom:    { border: "border-pink-500/30",   badge: "purple" },
  pesquisa: { border: "border-cyan-500/30",   badge: "info" },
};

// Extrai o ID de 11 caracteres de links do YouTube (watch, youtu.be, shorts, embed, live)
function parseYoutubeUrl(url) {
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(url || "");
  return m ? m[1] : null;
}

// Reconstrói um trecho de código a partir dos campos já salvos, pra reaproveitar
// o parser de colagem do AdSense também na edição de um item existente.
function buildAdsensePreviewCode(item) {
  const style = item.ad_width && item.ad_height
    ? `width:${item.ad_width}px;height:${item.ad_height}px`
    : "display:block";
  const fmt = item.ad_format ? ` data-ad-format="${item.ad_format}"` : "";
  const fw = item.ad_full_width ? ` data-full-width-responsive="true"` : "";
  return `<ins class="adsbygoogle" style="${style}" data-ad-client="${item.ad_client}" data-ad-slot="${item.ad_slot}"${fmt}${fw}></ins>`;
}

export default function CampanhaEditor() {
  const { empresaSlug, id } = useParams();
  const navigate = useNavigate();
  const { showError, showInfo, showSuccess, confirm } = useFeedback();
  const [campanha, setCampanha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("arquivo"); // arquivo | youtube | adsense | afiliado
  const [itemEditando, setItemEditando] = useState(null); // item sendo editado, null = criando novo
  const [arquivoSel, setArquivoSel] = useState(null);
  const [ytUrl, setYtUrl] = useState("");
  const [adCodigo, setAdCodigo] = useState("");
  const [duracao, setDuracao] = useState(10);
  const [modoExibicao, setModoExibicao] = useState("sequencia");
  const [salvando, setSalvando] = useState(false);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("admin_token");

  // Link de afiliado
  const [afTitulo, setAfTitulo] = useState("");
  const [afLink, setAfLink] = useState("");
  const [afImagemUrl, setAfImagemUrl] = useState("");
  const [afDescricao, setAfDescricao] = useState("");
  const [afPreco, setAfPreco] = useState("");
  const [afPrecoOriginal, setAfPrecoOriginal] = useState("");
  const [afDestaquesText, setAfDestaquesText] = useState(""); // um destaque por linha

  // Cupom
  const [cpTitulo, setCpTitulo] = useState("");
  const [cpCodigo, setCpCodigo] = useState("");
  const [cpDescontoTipo, setCpDescontoTipo] = useState("percentual");
  const [cpDescontoValor, setCpDescontoValor] = useState("");
  const [cpValidade, setCpValidade] = useState("");
  const [cpDescricao, setCpDescricao] = useState("");
  const [cpLink, setCpLink] = useState("");

  // Pesquisa
  const [psPergunta, setPsPergunta] = useState("");
  const [psFormato, setPsFormato] = useState("multipla_escolha");
  const [psOpcoesText, setPsOpcoesText] = useState(""); // uma opção por linha

  // Agendamento e segmentação
  const [regraDataInicio, setRegraDataInicio] = useState("");
  const [regraDataFim, setRegraDataFim] = useState("");
  const [regraHorarioInicio, setRegraHorarioInicio] = useState("");
  const [regraHorarioFim, setRegraHorarioFim] = useState("");
  const [regraDiasSemana, setRegraDiasSemana] = useState([]);
  const [regraDispositivos, setRegraDispositivos] = useState([]);
  const [regraSistemas, setRegraSistemas] = useState([]);
  const [regraMikrotiks, setRegraMikrotiks] = useState([]);
  const [regraAcesso, setRegraAcesso] = useState("qualquer");
  const [mikrotiksDisponiveis, setMikrotiksDisponiveis] = useState([]);
  const [salvandoRegras, setSalvandoRegras] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);

  // Métricas
  const [metricas, setMetricas] = useState(null);
  const [metricasLoading, setMetricasLoading] = useState(true);
  const [periodoDias, setPeriodoDias] = useState("30");

  const adParsed = parseAdsenseCode(adCodigo);
  const ytVideoId = parseYoutubeUrl(ytUrl);
  const arquivoEhVideo = (arquivoSel && arquivoSel.type.startsWith("video/")) ||
    (itemEditando && itemEditando.tipo === "video");

  const afPrecoNum = parseFloat(String(afPreco).replace(",", "."));
  const afPrecoOriginalNum = afPrecoOriginal.trim()
    ? parseFloat(String(afPrecoOriginal).replace(",", ".")) : null;
  const afDescontoPct = (afPrecoOriginalNum && afPrecoNum && afPrecoOriginalNum > afPrecoNum)
    ? Math.round((1 - afPrecoNum / afPrecoOriginalNum) * 100) : null;
  const afLinkValido = /^https?:\/\/.+/i.test(afLink.trim());
  const afImagemValida = /^https?:\/\/.+/i.test(afImagemUrl.trim());
  const afDestaquesArr = afDestaquesText.split("\n").map((s) => s.trim()).filter(Boolean);

  const cpDescontoValorNum = parseFloat(String(cpDescontoValor).replace(",", "."));
  const cpDescontoValorValido = !isNaN(cpDescontoValorNum) && cpDescontoValorNum > 0 &&
    (cpDescontoTipo !== "percentual" || cpDescontoValorNum <= 100);
  const cpLinkValido = !cpLink.trim() || /^https?:\/\/.+/i.test(cpLink.trim());

  const psOpcoesArr = psOpcoesText.split("\n").map((s) => s.trim()).filter(Boolean);
  const psValido = !!psPergunta.trim() &&
    (psFormato !== "multipla_escolha" || (psOpcoesArr.length >= 2 && psOpcoesArr.length <= 6));

  const abrirModal = () => {
    setItemEditando(null);
    setModalTab("arquivo");
    setArquivoSel(null);
    setYtUrl("");
    setAdCodigo("");
    setDuracao(10);
    setModoExibicao("sequencia");
    setAfTitulo("");
    setAfLink("");
    setAfImagemUrl("");
    setAfDescricao("");
    setAfPreco("");
    setAfPrecoOriginal("");
    setAfDestaquesText("");
    setCpTitulo("");
    setCpCodigo("");
    setCpDescontoTipo("percentual");
    setCpDescontoValor("");
    setCpValidade("");
    setCpDescricao("");
    setCpLink("");
    setPsPergunta("");
    setPsFormato("multipla_escolha");
    setPsOpcoesText("");
    setModalOpen(true);
  };

  const abrirModalEdicao = (item) => {
    setItemEditando(item);
    setArquivoSel(null);
    setDuracao(item.duracao_segundos || 10);
    setModoExibicao(item.modo_exibicao || "sequencia");
    setAfTitulo("");
    setAfLink("");
    setAfImagemUrl("");
    setAfDescricao("");
    setAfPreco("");
    setAfPrecoOriginal("");
    setAfDestaquesText("");
    setYtUrl("");
    setAdCodigo("");
    setCpTitulo("");
    setCpCodigo("");
    setCpDescontoTipo("percentual");
    setCpDescontoValor("");
    setCpValidade("");
    setCpDescricao("");
    setCpLink("");
    setPsPergunta("");
    setPsFormato("multipla_escolha");
    setPsOpcoesText("");

    if (item.tipo === "youtube") {
      setModalTab("youtube");
      setYtUrl(item.arquivo_url || "");
    } else if (item.tipo === "adsense") {
      setModalTab("adsense");
      setAdCodigo(buildAdsensePreviewCode(item));
    } else if (item.tipo === "afiliado") {
      setModalTab("afiliado");
      setAfTitulo(item.titulo || "");
      setAfLink(item.afiliado_link || "");
      setAfImagemUrl(item.afiliado_imagem_url || "");
      setAfDescricao(item.afiliado_descricao || "");
      setAfPreco(item.afiliado_preco != null ? String(item.afiliado_preco) : "");
      setAfPrecoOriginal(item.afiliado_preco_original != null ? String(item.afiliado_preco_original) : "");
      setAfDestaquesText(Array.isArray(item.afiliado_destaques) ? item.afiliado_destaques.join("\n") : "");
    } else if (item.tipo === "cupom") {
      setModalTab("cupom");
      setCpTitulo(item.titulo || "");
      setCpCodigo(item.cupom_codigo || "");
      setCpDescontoTipo(item.cupom_desconto_tipo || "percentual");
      setCpDescontoValor(item.cupom_desconto_valor != null ? String(item.cupom_desconto_valor) : "");
      setCpValidade(item.cupom_validade ? String(item.cupom_validade).slice(0, 10) : "");
      setCpDescricao(item.cupom_descricao || "");
      setCpLink(item.cupom_link || "");
    } else if (item.tipo === "pesquisa") {
      setModalTab("pesquisa");
      setPsPergunta(item.pesquisa_pergunta || "");
      setPsFormato(item.pesquisa_formato || "multipla_escolha");
      setPsOpcoesText(Array.isArray(item.pesquisa_opcoes) ? item.pesquisa_opcoes.join("\n") : "");
    } else {
      setModalTab("arquivo");
    }
    setModalOpen(true);
  };

  const podeAdicionar =
    modalTab === "arquivo" ? (itemEditando ? true : !!arquivoSel) :
    modalTab === "youtube" ? !!ytVideoId :
    modalTab === "adsense" ? !!(adParsed && !adParsed.error) :
    modalTab === "afiliado" ? (afLinkValido && afImagemValida && !!afPrecoNum && afPrecoNum > 0) :
    modalTab === "cupom" ? (!!cpCodigo.trim() && cpDescontoValorValido && cpLinkValido) :
    psValido;

  const handleSalvarItem = async () => {
    if (!podeAdicionar) return;
    setSalvando(true);
    try {
      const isEdit = !!itemEditando;
      let url;
      let options;

      if (modalTab === "arquivo") {
        if (isEdit) {
          url = `/api/campanhas/${id}/itens/${itemEditando.id}`;
          options = {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ duracao_segundos: duracao, modo_exibicao: modoExibicao }),
          };
        } else {
          const formData = new FormData();
          formData.append("arquivo", arquivoSel);
          formData.append("duracao_segundos", duracao);
          formData.append("modo_exibicao", modoExibicao);
          url = `/api/campanhas/${id}/itens`;
          options = {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          };
        }
      } else if (modalTab === "youtube" || modalTab === "adsense") {
        const body = modalTab === "youtube"
          ? { youtube_url: ytUrl, duracao_segundos: duracao, modo_exibicao: modoExibicao }
          : { ...adParsed, duracao_segundos: duracao, modo_exibicao: modoExibicao };
        url = isEdit
          ? `/api/campanhas/${id}/itens/${itemEditando.id}`
          : `/api/campanhas/${id}/itens/${modalTab}`;
        options = {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        };
      } else if (modalTab === "afiliado") {
        const body = {
          titulo: afTitulo.trim() || null,
          link: afLink.trim(),
          imagem_url: afImagemUrl.trim(),
          descricao: afDescricao.trim() || null,
          preco: afPrecoNum,
          preco_original: afPrecoOriginalNum,
          destaques: afDestaquesArr,
          duracao_segundos: duracao,
          modo_exibicao: modoExibicao,
        };
        url = isEdit
          ? `/api/campanhas/${id}/itens/${itemEditando.id}`
          : `/api/campanhas/${id}/itens/afiliado`;
        options = {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        };
      } else if (modalTab === "cupom") {
        const body = {
          titulo: cpTitulo.trim() || null,
          codigo: cpCodigo.trim(),
          desconto_tipo: cpDescontoTipo,
          desconto_valor: cpDescontoValorNum,
          validade: cpValidade || null,
          descricao: cpDescricao.trim() || null,
          link: cpLink.trim() || null,
          duracao_segundos: duracao,
          modo_exibicao: modoExibicao,
        };
        url = isEdit
          ? `/api/campanhas/${id}/itens/${itemEditando.id}`
          : `/api/campanhas/${id}/itens/cupom`;
        options = {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        };
      } else {
        const body = {
          pergunta: psPergunta.trim(),
          formato: psFormato,
          opcoes: psFormato === "multipla_escolha" ? psOpcoesArr : undefined,
          duracao_segundos: duracao,
          modo_exibicao: modoExibicao,
        };
        url = isEdit
          ? `/api/campanhas/${id}/itens/${itemEditando.id}`
          : `/api/campanhas/${id}/itens/pesquisa`;
        options = {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        };
      }

      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar item");
      setModalOpen(false);
      carregar();
      if (data.walled_garden && data.walled_garden.ok === false) {
        showInfo(
          `Item salvo, mas não foi possível liberar o domínio no MikroTik: ${data.walled_garden.mensagem}`,
          { title: "Atenção: link pode não abrir pro cliente" }
        );
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campanhas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar campanha");
      setCampanha(data.data);

      setRegraDataInicio(data.data.data_inicio ? String(data.data.data_inicio).slice(0, 10) : "");
      setRegraDataFim(data.data.data_fim ? String(data.data.data_fim).slice(0, 10) : "");
      setRegraHorarioInicio(data.data.horario_inicio ? String(data.data.horario_inicio).slice(0, 5) : "");
      setRegraHorarioFim(data.data.horario_fim ? String(data.data.horario_fim).slice(0, 5) : "");
      setRegraDiasSemana(Array.isArray(data.data.dias_semana) ? data.data.dias_semana : []);
      setRegraDispositivos(Array.isArray(data.data.dispositivos) ? data.data.dispositivos : []);
      setRegraSistemas(Array.isArray(data.data.sistemas_operacionais) ? data.data.sistemas_operacionais : []);
      setRegraMikrotiks(Array.isArray(data.data.mikrotiks_permitidos) ? data.data.mikrotiks_permitidos : []);
      setRegraAcesso(data.data.regra_acesso || "qualquer");
      setCategoria(data.data.categoria || "");

      const portaisIds = (data.data.portais_vinculados || []).map((p) => p.id);
      if (portaisIds.length > 0) {
        const resMk = await fetch("/api/mikrotiks", { headers: { Authorization: `Bearer ${token}` } });
        const lista = await resMk.json(); // este endpoint retorna o array direto, sem envelope {data:...}
        setMikrotiksDisponiveis((Array.isArray(lista) ? lista : []).filter((m) => portaisIds.includes(m.portal_id)));
      } else {
        setMikrotiksDisponiveis([]);
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarMetricas = async () => {
    setMetricasLoading(true);
    try {
      const hoje = new Date();
      const ate = hoje.toISOString().slice(0, 10);
      const de = new Date(hoje.getTime() - (Number(periodoDias) - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const res = await fetch(`/api/campanhas/${id}/metricas?de=${de}&ate=${ate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar métricas");
      setMetricas(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMetricasLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [id]);

  useEffect(() => {
    carregarMetricas();
  }, [id, periodoDias]);

  const handleSalvarCategoria = async () => {
    setSalvandoCategoria(true);
    try {
      const res = await fetch(`/api/campanhas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categoria: categoria || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar categoria");
      showSuccess("Categoria salva.");
      carregar();
    } catch (err) {
      showError(err.message);
    } finally {
      setSalvandoCategoria(false);
    }
  };

  const handleSalvarRegras = async () => {
    setSalvandoRegras(true);
    try {
      const res = await fetch(`/api/campanhas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          data_inicio: regraDataInicio || null,
          data_fim: regraDataFim || null,
          horario_inicio: regraHorarioInicio || null,
          horario_fim: regraHorarioFim || null,
          dias_semana: regraDiasSemana,
          dispositivos: regraDispositivos,
          sistemas_operacionais: regraSistemas,
          mikrotiks_permitidos: regraMikrotiks,
          regra_acesso: regraAcesso,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar regras");
      showSuccess("Regras de agendamento e segmentação salvas.");
      carregar();
    } catch (err) {
      showError(err.message);
    } finally {
      setSalvandoRegras(false);
    }
  };

  const handleToggleAtivo = async () => {
    if (!campanha) return;
    try {
      const res = await fetch(`/api/campanhas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ativo: !campanha.ativo }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar campanha");
      carregar();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeletarItem = async (itemId) => {
    if (!(await confirm({ title: "Remover item", message: "Deseja remover este item?", danger: true, confirmText: "Remover" }))) return;
    try {
      const res = await fetch(`/api/campanhas/${id}/itens/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao remover item");
      carregar();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleReordenar = async (itens) => {
    const ordens = itens.map((item, idx) => ({ id: item.id, ordem: idx + 1 }));
    try {
      const res = await fetch(`/api/campanhas/${id}/itens/reordenar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ordens }),
      });
      if (!res.ok) throw new Error("Erro ao reordenar itens");
      carregar();
    } catch (err) {
      showError(err.message);
    }
  };

  const moverItem = (index, direcao) => {
    if (!campanha) return;
    const itens = [...campanha.itens];
    const novoIndex = index + direcao;
    if (novoIndex < 0 || novoIndex >= itens.length) return;
    // Swap
    [itens[index], itens[novoIndex]] = [itens[novoIndex], itens[index]];
    handleReordenar(itens);
  };

  const formatarDuracao = (segundos) => {
    if (!segundos) return "—";
    if (segundos < 60) return `${segundos}s`;
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-400">Carregando...</p>
      </AdminLayout>
    );
  }

  if (!campanha) {
    return (
      <AdminLayout>
        <p className="text-red-400">Campanha não encontrada.</p>
      </AdminLayout>
    );
  }

  const itens = campanha.itens || [];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(`/admin/${empresaSlug}/campanhas`)}
        >
          Voltar
        </Button>
        <h1 className="text-3xl font-bold text-white flex-1">{campanha.nome}</h1>
        <span className="text-gray-400 text-sm">{campanha.views ?? 0} views</span>
        <StatusToggle ativo={!!campanha.ativo} onToggle={handleToggleAtivo} />
      </div>

      {campanha.descricao && (
        <p className="text-gray-400 text-sm mb-6">{campanha.descricao}</p>
      )}

      {/* Categoria de negócio */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Categoria</h2>
        <p className="text-gray-500 text-xs mb-4">
          Rótulo opcional para classificar e filtrar campanhas em relatórios. Não altera como a campanha é exibida no portal.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            containerClassName="min-w-[240px]"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <Button onClick={handleSalvarCategoria} loading={salvandoCategoria}>
            Salvar categoria
          </Button>
        </div>
      </Card>

      {/* Agendamento e Segmentação */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Agendamento e Segmentação</h2>
        <p className="text-gray-500 text-xs mb-4">
          Deixe tudo em branco/desmarcado para exibir a campanha sempre, sem restrição.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="Data inicial"
            type="date"
            value={regraDataInicio}
            onChange={(e) => setRegraDataInicio(e.target.value)}
          />
          <Input
            label="Data final"
            type="date"
            value={regraDataFim}
            onChange={(e) => setRegraDataFim(e.target.value)}
          />
          <Input
            label="Horário inicial"
            type="time"
            value={regraHorarioInicio}
            onChange={(e) => setRegraHorarioInicio(e.target.value)}
          />
          <Input
            label="Horário final"
            type="time"
            value={regraHorarioFim}
            onChange={(e) => setRegraHorarioFim(e.target.value)}
          />
        </div>
        <p className="text-gray-500 text-xs mb-4 -mt-2">
          Horário final menor que o inicial é tratado como janela noturna (ex: 22:00 até 06:00).
        </p>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Dias da semana</p>
          <div className="flex flex-wrap gap-3">
            {DIAS_SEMANA.map((d) => (
              <Checkbox
                key={d.valor}
                label={d.label}
                checked={regraDiasSemana.includes(d.valor)}
                onChange={() => setRegraDiasSemana(toggleEmLista(regraDiasSemana, d.valor))}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Dispositivos</p>
          <div className="flex flex-wrap gap-3">
            {DISPOSITIVOS.map((d) => (
              <Checkbox
                key={d.valor}
                label={d.label}
                checked={regraDispositivos.includes(d.valor)}
                onChange={() => setRegraDispositivos(toggleEmLista(regraDispositivos, d.valor))}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Sistemas operacionais</p>
          <div className="flex flex-wrap gap-3">
            {SISTEMAS.map((s) => (
              <Checkbox
                key={s.valor}
                label={s.label}
                checked={regraSistemas.includes(s.valor)}
                onChange={() => setRegraSistemas(toggleEmLista(regraSistemas, s.valor))}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Hotspots específicos</p>
          {mikrotiksDisponiveis.length === 0 ? (
            <p className="text-xs text-gray-500">
              Vincule esta campanha a um portal em Portais para poder restringir por hotspot.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {mikrotiksDisponiveis.map((m) => (
                <Checkbox
                  key={m.id}
                  label={`${m.nome} (${m.ip})`}
                  checked={regraMikrotiks.includes(m.id)}
                  onChange={() => setRegraMikrotiks(toggleEmLista(regraMikrotiks, m.id))}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Histórico de acesso</p>
          <SegmentedControl
            options={[
              { value: "qualquer", label: "Qualquer" },
              { value: "primeiro_acesso", label: "Só 1º acesso" },
              { value: "recorrente", label: "Só recorrente" },
            ]}
            value={regraAcesso}
            onChange={setRegraAcesso}
          />
          <p className="text-gray-500 text-xs mt-1">
            Baseado em o MAC do cliente já ter aparecido antes em cadastros desta empresa (LGPD/Lead/Planos).
            Sem o MAC do cliente disponível, a campanha não aparece pra ninguém quando essa regra não é "Qualquer".
          </p>
        </div>

        <Button onClick={handleSalvarRegras} loading={salvandoRegras}>
          Salvar regras
        </Button>
      </Card>

      {/* Métricas */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Métricas</h2>
          <SegmentedControl options={PERIODOS} value={periodoDias} onChange={setPeriodoDias} />
        </div>

        {!metricasLoading && metricas && (
          <>
            <StatCard.Row>
              <StatCard icon={Eye} label="Impressões" value={metricas.resumo.impressoes} color="blue" />
              <StatCard icon={MousePointerClick} label="Cliques" value={metricas.resumo.cliques} color="green" />
              <StatCard icon={Percent} label="CTR" value={`${metricas.resumo.ctr}%`} color="yellow" />
            </StatCard.Row>

            {metricas.conexoes && (
              <StatCard.Row>
                <StatCard icon={Users} label="Usuários conectados" value={metricas.conexoes.usuarios_conectados} color="purple" />
                <StatCard icon={Clock} label="Tempo médio conectado" value={`${metricas.conexoes.tempo_medio_conectado_minutos} min`} color="blue" />
              </StatCard.Row>
            )}
            {metricas.conexoes === null && (
              <p className="text-xs text-gray-500 mb-6">
                Vincule esta campanha a um portal em Portais pra ver usuários conectados/tempo médio dos hotspots que exibem ela.
              </p>
            )}

            <div className="mb-6">
              <MiniBarChart dados={metricas.serie_diaria} chaveValor="impressoes" />
            </div>

            <h3 className="text-sm font-semibold text-gray-300 mb-2">Itens mais clicados</h3>
            {metricas.ranking_itens.length === 0 ? (
              <p className="text-xs text-gray-500">Sem eventos registrados no período.</p>
            ) : (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Item</Table.HeadCell>
                  <Table.HeadCell>Tipo</Table.HeadCell>
                  <Table.HeadCell>Impressões</Table.HeadCell>
                  <Table.HeadCell>Cliques</Table.HeadCell>
                  <Table.HeadCell>CTR</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {metricas.ranking_itens.map((it) => (
                    <Table.Row key={it.item_id}>
                      <Table.Cell className="text-white">{it.titulo || `Item #${it.item_id}`}</Table.Cell>
                      <Table.Cell className="capitalize">{it.tipo}</Table.Cell>
                      <Table.Cell>{it.impressoes}</Table.Cell>
                      <Table.Cell>{it.cliques}</Table.Cell>
                      <Table.Cell>{it.ctr}%</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}

            {metricas.pesquisas && metricas.pesquisas.length > 0 && (
              <div className="mt-6 space-y-6">
                <h3 className="text-sm font-semibold text-gray-300">Resultados de pesquisas</h3>
                {metricas.pesquisas.map((ps) => (
                  <div key={ps.item_id} className="bg-[#0d1117] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-white font-medium">{ps.pergunta}</p>
                      <span className="text-xs text-gray-500 shrink-0 ml-3">
                        {ps.total_respostas} resposta{ps.total_respostas !== 1 ? "s" : ""}
                        {ps.media_nota !== null ? ` · média ${ps.media_nota}` : ""}
                      </span>
                    </div>
                    {ps.total_respostas === 0 ? (
                      <p className="text-xs text-gray-500">Sem respostas no período.</p>
                    ) : (
                      <div className="space-y-2">
                        {ps.distribuicao.map((d) => (
                          <div key={d.label} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-24 shrink-0 truncate">{d.label}</span>
                            <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                              <div className="h-full bg-cyan-500/70" style={{ width: `${d.percentual}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-16 text-right shrink-0">
                              {d.total} ({d.percentual}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Itens da campanha */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Itens da Campanha</h2>
          <Button onClick={abrirModal}>+ Adicionar item</Button>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Imagens: JPG, PNG, WEBP até 10MB. Vídeos: MP4, WEBM até 50MB. Também é possível adicionar vídeos do YouTube e blocos de anúncio Google AdSense.
        </p>

        {itens.length === 0 ? (
          <EmptyState
            icon={ImagePlus}
            title="Nenhum item adicionado"
            description='Clique em "+ Adicionar item" para começar a montar a campanha.'
            action={<Button size="sm" onClick={abrirModal}>+ Adicionar item</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((item, index) => {
              const tema = TIPO_TEMA[item.tipo] || { border: "border-gray-700", badge: "neutral" };
              return (
                <div
                  key={item.id}
                  className={`bg-[#0d1117] border ${tema.border} rounded-lg overflow-hidden transition-colors`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-40 bg-gray-900 flex items-center justify-center overflow-hidden">
                    <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    {item.tipo === "adsense" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <span className="text-2xl font-bold border-2 border-gray-500 rounded px-2">Ad</span>
                        <span className="text-xs mt-2">Google AdSense</span>
                      </div>
                    ) : item.tipo === "youtube" ? (
                      <img
                        src={`https://i.ytimg.com/vi/${parseYoutubeUrl(item.arquivo_url)}/hqdefault.jpg`}
                        alt={item.titulo || `Item ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : item.tipo === "video" ? (
                      <video
                        src={item.arquivo_url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    ) : item.tipo === "afiliado" ? (
                      <img
                        src={item.afiliado_imagem_url}
                        alt={item.titulo || `Item ${index + 1}`}
                        className="w-full h-full object-contain bg-white"
                      />
                    ) : item.tipo === "cupom" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-pink-300">
                        <Ticket className="w-8 h-8 mb-2" />
                        <span className="text-lg font-bold tracking-wider">{item.cupom_codigo}</span>
                      </div>
                    ) : item.tipo === "pesquisa" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-cyan-300 px-4 text-center">
                        <BarChart3 className="w-8 h-8 mb-2" />
                        <span className="text-sm line-clamp-3">{item.pesquisa_pergunta}</span>
                      </div>
                    ) : (
                      <img
                        src={item.arquivo_url}
                        alt={item.titulo || `Item ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Badge variant={tema.badge}>
                          {item.tipo === "adsense"
                            ? `AdSense · ${item.ad_width ? `${item.ad_width}x${item.ad_height}` : "auto"}`
                            : item.tipo === "youtube"
                            ? "YouTube"
                            : item.tipo === "video"
                            ? "Vídeo"
                            : item.tipo === "afiliado"
                            ? "Link de Afiliado"
                            : item.tipo === "cupom"
                            ? "Cupom"
                            : item.tipo === "pesquisa"
                            ? "Pesquisa"
                            : "Imagem"}
                        </Badge>
                        {item.modo_exibicao === "popup" && (
                          <Badge variant="warning">Pop-up</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatarDuracao(item.duracao_segundos)}</span>
                    </div>
                    {item.titulo && (
                      <p className="text-sm text-gray-300 truncate mb-1">{item.titulo}</p>
                    )}
                    {item.tipo === "afiliado" && (
                      <p className="text-sm font-semibold mb-1">
                        <span className="text-green-400">
                          {Number(item.afiliado_preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                        {item.afiliado_preco_original > item.afiliado_preco && (
                          <span className="text-gray-500 line-through ml-2 text-xs font-normal">
                            {Number(item.afiliado_preco_original).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        )}
                      </p>
                    )}
                    {item.tipo === "cupom" && (
                      <p className="text-sm font-semibold mb-1 text-pink-400">
                        {item.cupom_desconto_tipo === "percentual"
                          ? `${Number(item.cupom_desconto_valor)}% OFF`
                          : Number(item.cupom_desconto_valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) + " OFF"}
                      </p>
                    )}
                    {item.tipo === "pesquisa" && (
                      <p className="text-xs text-cyan-400 mb-1">
                        {item.pesquisa_formato === "escala" ? "Escala de 1 a 5" : `${(item.pesquisa_opcoes || []).length} opções`}
                      </p>
                    )}
                    {item.link_destino && (
                      <p className="text-xs text-blue-400 truncate mb-2">{item.link_destino}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1 mt-2">
                      <IconButton
                        icon={ChevronUp}
                        title="Mover para cima"
                        onClick={() => moverItem(index, -1)}
                        disabled={index === 0}
                      />
                      <IconButton
                        icon={ChevronDown}
                        title="Mover para baixo"
                        onClick={() => moverItem(index, 1)}
                        disabled={index === itens.length - 1}
                      />
                      <div className="flex-1" />
                      <IconButton
                        icon={Pencil}
                        title="Editar item"
                        onClick={() => abrirModalEdicao(item)}
                      />
                      <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Remover item"
                        onClick={() => handleDeletarItem(item.id)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal Adicionar Item */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={itemEditando ? "Editar item da campanha" : "Adicionar item à campanha"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarItem} loading={salvando} disabled={!podeAdicionar}>
              {itemEditando ? "Salvar" : "Adicionar"}
            </Button>
          </>
        }
      >
        {/* Abas de tipo — na edição o tipo do item é fixo */}
        {itemEditando ? (
          <div className="mb-4">
            <Badge variant={(TIPO_TEMA[itemEditando.tipo] || {}).badge || "neutral"}>
              {itemEditando.tipo === "adsense" ? "AdSense"
                : itemEditando.tipo === "youtube" ? "YouTube"
                : itemEditando.tipo === "video" ? "Vídeo"
                : itemEditando.tipo === "afiliado" ? "Link de Afiliado"
                : itemEditando.tipo === "cupom" ? "Cupom"
                : itemEditando.tipo === "pesquisa" ? "Pesquisa"
                : "Imagem"}
            </Badge>
          </div>
        ) : (
          <SegmentedControl
            className="mb-4"
            options={[
              { value: "arquivo", label: "Imagem / Vídeo", icon: Image },
              { value: "youtube", label: "YouTube", icon: Youtube },
              { value: "adsense", label: "AdSense", icon: Megaphone },
              { value: "afiliado", label: "Link de Afiliado", icon: ShoppingBag },
              { value: "cupom", label: "Cupom", icon: Ticket },
              { value: "pesquisa", label: "Pesquisa", icon: BarChart3 },
            ]}
            value={modalTab}
            onChange={setModalTab}
          />
        )}

        {/* Conteúdo por aba */}
        {modalTab === "arquivo" && (
          <div>
            {itemEditando ? (
              <PreviewBox className="flex items-center gap-3">
                {itemEditando.tipo === "video" ? (
                  <video src={itemEditando.arquivo_url} className="w-24 h-14 object-cover rounded" muted preload="metadata" />
                ) : (
                  <img src={itemEditando.arquivo_url} alt="Prévia" className="w-24 h-14 object-cover rounded" />
                )}
                <span>O arquivo não pode ser trocado — remova o item e adicione um novo para isso. Apenas o tempo de espera pode ser ajustado abaixo.</span>
              </PreviewBox>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    setArquivoSel(e.target.files[0] || null);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-700 rounded-lg p-6 text-center text-gray-400 hover:border-blue-700 hover:text-gray-300 transition-colors"
                >
                  {arquivoSel ? (
                    <span className="text-gray-200">{arquivoSel.name}</span>
                  ) : (
                    <span className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-600" />
                      <span>Clique para escolher uma imagem ou vídeo</span>
                    </span>
                  )}
                </button>
                <p className="text-gray-500 text-xs mt-2">
                  Imagens: JPG, PNG, WEBP até 10MB. Vídeos: MP4, WEBM até 50MB.
                </p>
              </>
            )}
          </div>
        )}

        {modalTab === "youtube" && (
          <div>
            <Input
              label="Link do vídeo no YouTube"
              placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
            />
            {ytUrl.trim() && !ytVideoId && (
              <div className="mt-3">
                <Alert variant="error" theme="dark">
                  Link do YouTube inválido. Cole um link como https://www.youtube.com/watch?v=... ou https://youtu.be/...
                </Alert>
              </div>
            )}
            {ytVideoId && (
              <PreviewBox className="mt-3 flex items-center gap-3">
                <img
                  src={`https://i.ytimg.com/vi/${ytVideoId}/mqdefault.jpg`}
                  alt="Prévia do vídeo"
                  className="w-24 h-14 object-cover rounded"
                />
                <div>
                  <p>Vídeo detectado</p>
                  <p className="text-xs text-gray-500">ID: {ytVideoId}</p>
                </div>
              </PreviewBox>
            )}
            <p className="text-gray-500 text-xs mt-2">
              O vídeo é exibido sem som pelo tempo de espera configurado abaixo.
            </p>
          </div>
        )}

        {modalTab === "adsense" && (
          <div>
            <Textarea
              label="Cole o código do bloco de anúncio (painel do AdSense)"
              rows={6}
              placeholder={'<script async src="https://pagead2.googlesyndication.com/..."></script>\n<ins class="adsbygoogle" data-ad-client="ca-pub-..." data-ad-slot="..." ...></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'}
              value={adCodigo}
              onChange={(e) => setAdCodigo(e.target.value)}
              className="font-mono text-xs"
            />
            {adParsed && adParsed.error && (
              <div className="mt-3">
                <Alert variant="error" theme="dark">{adParsed.error}</Alert>
              </div>
            )}
            {adParsed && !adParsed.error && (
              <PreviewBox className="mt-3 space-y-1">
                <p>Cliente: <span className="text-gray-200">{adParsed.ad_client}</span></p>
                <p>Slot: <span className="text-gray-200">{adParsed.ad_slot}</span></p>
                <p>
                  Formato:{" "}
                  <span className="text-gray-200">
                    {adParsed.ad_width
                      ? `${adParsed.ad_width}x${adParsed.ad_height} (fixo)`
                      : `${adParsed.ad_format || "auto"} (responsivo)`}
                  </span>
                </p>
              </PreviewBox>
            )}
            <p className="text-gray-500 text-xs mt-2">
              Em hotspots já configurados, execute novamente o assistente de configuração do MikroTik para liberar os domínios do Google.
            </p>
          </div>
        )}

        {modalTab === "afiliado" && (
          <div className="space-y-3">
            <Input
              label="Nome do produto (opcional)"
              value={afTitulo}
              onChange={(e) => setAfTitulo(e.target.value)}
            />
            <Input
              label="Link de afiliado"
              placeholder="https://www.amazon.com.br/dp/... ou link curto de afiliado"
              value={afLink}
              onChange={(e) => setAfLink(e.target.value)}
            />
            {afLink.trim() && !afLinkValido && (
              <Alert variant="error" theme="dark">Link inválido. Use uma URL http(s) completa.</Alert>
            )}

            <Input
              label="URL da imagem do produto"
              placeholder="https://.../imagem-do-produto.jpg"
              value={afImagemUrl}
              onChange={(e) => setAfImagemUrl(e.target.value)}
            />
            {afImagemUrl.trim() && !afImagemValida && (
              <Alert variant="error" theme="dark">URL de imagem inválida.</Alert>
            )}
            {afImagemValida && (
              <PreviewBox className="flex items-center gap-3">
                <img src={afImagemUrl} alt="Prévia do produto" className="w-16 h-16 object-contain bg-white rounded" />
                <span>Prévia da imagem</span>
              </PreviewBox>
            )}

            <Textarea
              label="Descrição (opcional)"
              rows={3}
              value={afDescricao}
              onChange={(e) => setAfDescricao(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Preço atual (R$)"
                type="number"
                step="0.01"
                value={afPreco}
                onChange={(e) => setAfPreco(e.target.value)}
              />
              <Input
                label="Preço original (opcional)"
                type="number"
                step="0.01"
                value={afPrecoOriginal}
                onChange={(e) => setAfPrecoOriginal(e.target.value)}
              />
            </div>
            {afDescontoPct !== null && (
              <PreviewBox>
                Desconto calculado: <span className="text-green-400 font-semibold">{afDescontoPct}% OFF</span>
              </PreviewBox>
            )}

            <Textarea
              label="Destaques (um por linha, até 5, 60 caracteres cada)"
              rows={4}
              placeholder={"Frete grátis\nGarantia 1 ano\nEntrega em 24h"}
              value={afDestaquesText}
              onChange={(e) => setAfDestaquesText(e.target.value)}
            />
          </div>
        )}

        {modalTab === "cupom" && (
          <div className="space-y-3">
            <Input
              label="Título (opcional)"
              value={cpTitulo}
              onChange={(e) => setCpTitulo(e.target.value)}
            />
            <Input
              label="Código do cupom"
              placeholder="ex: BEMVINDO10"
              value={cpCodigo}
              onChange={(e) => setCpCodigo(e.target.value.toUpperCase())}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Tipo de desconto"
                value={cpDescontoTipo}
                onChange={(e) => setCpDescontoTipo(e.target.value)}
              >
                <option value="percentual">Percentual (%)</option>
                <option value="valor_fixo">Valor fixo (R$)</option>
              </Select>
              <Input
                label={cpDescontoTipo === "percentual" ? "Desconto (%)" : "Desconto (R$)"}
                type="number"
                step="0.01"
                value={cpDescontoValor}
                onChange={(e) => setCpDescontoValor(e.target.value)}
              />
            </div>
            {String(cpDescontoValor).trim() && !cpDescontoValorValido && (
              <Alert variant="error" theme="dark">
                {cpDescontoTipo === "percentual"
                  ? "Desconto percentual deve ser maior que 0 e até 100."
                  : "Valor do desconto deve ser maior que 0."}
              </Alert>
            )}

            <Input
              label="Validade (opcional)"
              type="date"
              value={cpValidade}
              onChange={(e) => setCpValidade(e.target.value)}
            />

            <Textarea
              label="Descrição / regras (opcional)"
              rows={3}
              placeholder="Válido para primeira compra. Não cumulativo com outras promoções."
              value={cpDescricao}
              onChange={(e) => setCpDescricao(e.target.value)}
            />

            <Input
              label="Link do cupom (opcional)"
              placeholder="https://... (loja, WhatsApp, etc.)"
              value={cpLink}
              onChange={(e) => setCpLink(e.target.value)}
            />
            {cpLink.trim() && !cpLinkValido && (
              <Alert variant="error" theme="dark">Link inválido. Use uma URL http(s) completa.</Alert>
            )}
            <p className="text-gray-500 text-xs">
              Se preenchido, o cliente verá um botão "Usar cupom" além de "Copiar código".
            </p>
          </div>
        )}

        {modalTab === "pesquisa" && (
          <div className="space-y-3">
            <Textarea
              label="Pergunta"
              rows={2}
              placeholder="Como você avalia nosso wifi?"
              value={psPergunta}
              onChange={(e) => setPsPergunta(e.target.value)}
            />

            <Select
              label="Formato de resposta"
              value={psFormato}
              onChange={(e) => setPsFormato(e.target.value)}
            >
              <option value="multipla_escolha">Múltipla escolha</option>
              <option value="escala">Escala de 1 a 5 (satisfação)</option>
            </Select>

            {psFormato === "multipla_escolha" && (
              <>
                <Textarea
                  label="Opções de resposta (uma por linha, de 2 a 6)"
                  rows={4}
                  placeholder={"Ótimo\nBom\nRegular\nRuim"}
                  value={psOpcoesText}
                  onChange={(e) => setPsOpcoesText(e.target.value)}
                />
                {psOpcoesText.trim() && (psOpcoesArr.length < 2 || psOpcoesArr.length > 6) && (
                  <Alert variant="error" theme="dark">Informe entre 2 e 6 opções de resposta.</Alert>
                )}
              </>
            )}
            {psFormato === "escala" && (
              <p className="text-gray-500 text-xs">
                O cliente responde tocando de 1 a 5 estrelas. Nenhuma opção extra é necessária.
              </p>
            )}

            <p className="text-gray-500 text-xs">
              A pesquisa pausa a campanha até o cliente responder (ou pular) — não usa o tempo de espera abaixo. Cada dispositivo só pode responder uma vez.
            </p>
          </div>
        )}

        {/* Modo de exibição — comum a todos os tipos */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Modo de exibição</p>
          <SegmentedControl
            options={[
              { value: "sequencia", label: "Sequência" },
              { value: "popup", label: "Pop-up" },
            ]}
            value={modoExibicao}
            onChange={setModoExibicao}
          />
          <p className="text-gray-500 text-xs mt-1">
            {modoExibicao === "popup"
              ? "Não entra na sequência normal da campanha — aparece como um pop-up dispensável (1x por sessão), antes e depois do login."
              : "Entra na sequência de slides tocada em ordem antes do login (comportamento atual)."}
          </p>
        </div>

        {/* Tempo de espera — comum a todos os tipos, exceto pesquisa (que espera resposta, não timer) */}
        {modalTab !== "pesquisa" && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <Input
              label="Tempo de espera (segundos)"
              type="number"
              min={3}
              max={60}
              value={duracao}
              onChange={(e) => setDuracao(parseInt(e.target.value, 10) || 10)}
              containerClassName="max-w-[200px]"
            />
            <p className="text-gray-500 text-xs mt-1">
              {modalTab === "arquivo" && arquivoEhVideo
                ? "Vídeos enviados usam a duração do próprio arquivo — este tempo é ignorado."
                : "Tempo que o item fica na tela antes de avançar para o próximo."}
            </p>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
