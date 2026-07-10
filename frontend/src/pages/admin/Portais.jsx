import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Eye, PenTool, Pencil, Trash2, X, LayoutGrid, FileText, AlertTriangle } from "lucide-react";
import { Button, IconButton, Input, Textarea, Select, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";
import { PORTAL_TIPOS, PORTAL_TIPO_MAP } from "../../constants/portalTipos";

const TIPOS_TEMPLATE = [
  { value: "basico", label: "Básico" },
  { value: "planos", label: "Planos" },
  { value: "lgpd", label: "LGPD" },
  { value: "completo", label: "Completo" },
  { value: "lead", label: "Lead (Com Internet)" },
  { value: "lead_passivo", label: "Lead Passivo" },
  { value: "trial_tempo", label: "Trial por Tempo" },
  { value: "login", label: "Login Direto" },
  { value: "campanha_pre_acesso", label: "Campanha + Acesso" },
  { value: "reconexao", label: "Reconexão" },
];

// Badges de template (basico/completo) não fazem parte de PORTAL_TIPOS
const TEMPLATE_BADGE = {
  basico:   { label: "Básico",   cls: "bg-gray-900/30 text-gray-300 border-gray-700/50" },
  completo: { label: "Completo", cls: "bg-indigo-900/30 text-indigo-400 border-indigo-800/50" },
};

function Badge({ tipo }) {
  const t = PORTAL_TIPO_MAP[tipo] || TEMPLATE_BADGE[tipo] || PORTAL_TIPO_MAP.custom;
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${t.cls}`}>{t.label}</span>;
}

function TipoIcon({ tipo }) {
  const cls = "w-7 h-7";
  if (tipo === "lgpd")
    return <svg className={`${cls} text-cyan-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>;
  if (tipo === "planos")
    return <svg className={`${cls} text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
  if (tipo === "lead" || tipo === "lead_passivo")
    return <svg className={`${cls} text-yellow-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
  if (tipo === "login")
    return <svg className={`${cls} text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>;
  if (tipo === "trial_tempo")
    return <svg className={`${cls} text-amber-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
  if (tipo === "campanha_pre_acesso")
    return <svg className={`${cls} text-purple-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>;
  if (tipo === "reconexao")
    return <svg className={`${cls} text-rose-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>;
  return <svg className={`${cls} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>;
}

function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[90vh] flex flex-col`}>
        <Card.Header className="flex items-center justify-between flex-shrink-0 !px-6 !py-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <IconButton icon={X} title="Fechar" onClick={onClose} />
        </Card.Header>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </Card>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Portais() {
  const { empresaSlug } = useParams();
  const { showError, confirm } = useFeedback();
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [aba, setAba] = useState("portais");

  // ── Portais ──────────────────────────────────────────────────────────────────
  const [portais, setPortais] = useState([]);
  const [planos,  setPlanos]  = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingPortais, setLoadingPortais] = useState(true);

  const [modalPortal,   setModalPortal]   = useState(false);
  const [editandoPortal, setEditandoPortal] = useState(null);
  const [savingPortal,  setSavingPortal]  = useState(false);
  const [formPortal, setFormPortal] = useState({
    nome: "", slug: "", tipo: "custom", descricao: "", url_redirect: "", template_id: "",
  });

  // ── Templates ────────────────────────────────────────────────────────────────
  const [listaTemplates,   setListaTemplates]   = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [modalTemplate,   setModalTemplate]   = useState(false);
  const [editandoTemplate, setEditandoTemplate] = useState(null);
  const [savingTemplate,  setSavingTemplate]  = useState(false);
  const [formTemplate, setFormTemplate] = useState({
    nome: "", tipo: "basico", descricao: "", html_template: "", css_template: "",
  });

  // ── Loaders ──────────────────────────────────────────────────────────────────
  const carregarPortais = useCallback(async () => {
    setLoadingPortais(true);
    try {
      const [rp, rpl, rt] = await Promise.all([
        fetch("/api/portais", { headers: h }),
        fetch("/api/planos",  { headers: h }),
        fetch("/api/portal-templates", { headers: h }),
      ]);
      if (rp.ok)  setPortais(await rp.json());
      if (rpl.ok) setPlanos(await rpl.json());
      if (rt.ok)  setTemplates(await rt.json());
    } catch {/* silencioso */}
    finally { setLoadingPortais(false); }
  }, []); // eslint-disable-line

  const carregarTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const r = await fetch("/api/portal-templates", { headers: h });
      if (r.ok) setListaTemplates(await r.json());
    } catch {/* silencioso */}
    finally { setLoadingTemplates(false); }
  }, []); // eslint-disable-line

  useEffect(() => { carregarPortais(); }, []); // eslint-disable-line
  useEffect(() => {
    if (aba === "templates") carregarTemplates();
  }, [aba]); // eslint-disable-line

  const portaisPag = usePagination(portais, 12);
  const templatesPag = usePagination(listaTemplates, 12);

  // ── Portal handlers ───────────────────────────────────────────────────────────
  const abrirNovoPortal = () => {
    setFormPortal({ nome: "", slug: "", tipo: "custom", descricao: "", url_redirect: "", template_id: "" });
    setEditandoPortal(null);
    setModalPortal(true);
  };

  const abrirEditarPortal = (p) => {
    setFormPortal({
      nome: p.nome,
      slug: p.slug,
      tipo: p.tipo || "custom",
      descricao: p.descricao || "",
      url_redirect: p.url_redirect || "",
      template_id: p.template_id || "",
    });
    setEditandoPortal(p.id);
    setModalPortal(true);
  };

  const handlePortalNomeChange = (v) => {
    setFormPortal(f => ({
      ...f,
      nome: v,
      slug: editandoPortal ? f.slug : slugify(v),
    }));
  };

  const salvarPortal = async (e) => {
    e.preventDefault();
    setSavingPortal(true);
    try {
      const url    = editandoPortal ? `/api/portais/${editandoPortal}` : "/api/portais";
      const method = editandoPortal ? "PUT" : "POST";
      const body   = editandoPortal
        ? { nome: formPortal.nome, descricao: formPortal.descricao, url_redirect: formPortal.url_redirect, template_id: formPortal.template_id || null }
        : { nome: formPortal.nome, slug: formPortal.slug, tipo: formPortal.tipo, descricao: formPortal.descricao, url_redirect: formPortal.url_redirect, template_id: formPortal.template_id || null };

      const r = await fetch(url, { method, headers: h, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) { showError(data.message || "Erro ao salvar"); return; }
      setModalPortal(false);
      carregarPortais();
    } catch { showError("Erro ao salvar portal"); }
    finally { setSavingPortal(false); }
  };

  const excluirPortal = async (id, nome) => {
    if (!(await confirm({ title: "Excluir portal", message: `Remover o portal "${nome}"?\n\nEsta ação não pode ser desfeita.`, danger: true, confirmText: "Remover" }))) return;
    try {
      const r = await fetch(`/api/portais/${id}`, { method: "DELETE", headers: h });
      const data = await r.json();
      if (!r.ok) { showError(data.message); return; }
      carregarPortais();
    } catch { showError("Erro ao remover portal"); }
  };

  // ── Template handlers ─────────────────────────────────────────────────────────
  const abrirNovoTemplate = () => {
    setFormTemplate({ nome: "", tipo: "basico", descricao: "", html_template: "", css_template: "" });
    setEditandoTemplate(null);
    setModalTemplate(true);
  };

  const abrirEditarTemplate = async (t) => {
    // Carregar html completo do template
    try {
      const r = await fetch(`/api/portal-templates/${t.id}`, { headers: h });
      const full = r.ok ? await r.json() : t;
      setFormTemplate({
        nome: full.nome,
        tipo: full.tipo || "basico",
        descricao: full.descricao || "",
        html_template: full.html_template || "",
        css_template: full.css_template || "",
      });
    } catch {
      setFormTemplate({ nome: t.nome, tipo: t.tipo || "basico", descricao: t.descricao || "", html_template: "", css_template: "" });
    }
    setEditandoTemplate(t.id);
    setModalTemplate(true);
  };

  const salvarTemplate = async (e) => {
    e.preventDefault();
    setSavingTemplate(true);
    try {
      const url    = editandoTemplate ? `/api/portal-templates/${editandoTemplate}` : "/api/portal-templates";
      const method = editandoTemplate ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: h, body: JSON.stringify(formTemplate) });
      const data = await r.json();
      if (!r.ok) { showError(data.message || "Erro ao salvar"); return; }
      setModalTemplate(false);
      carregarTemplates();
    } catch { showError("Erro ao salvar template"); }
    finally { setSavingTemplate(false); }
  };

  const excluirTemplate = async (id, nome) => {
    if (!(await confirm({ title: "Excluir template", message: `Remover o template "${nome}"?`, danger: true, confirmText: "Remover" }))) return;
    try {
      const r = await fetch(`/api/portal-templates/${id}`, { method: "DELETE", headers: h });
      const data = await r.json();
      if (!r.ok) { showError(data.message); return; }
      carregarTemplates();
    } catch { showError("Erro ao remover template"); }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
          <h1 className="text-2xl font-bold text-white">Portais Captive</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex bg-[#0d1117] border border-gray-700 rounded-lg p-1 gap-1">
            <button
              onClick={() => setAba("portais")}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                aba === "portais" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Portais
            </button>
            <button
              onClick={() => setAba("templates")}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                aba === "templates" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Templates
            </button>
          </div>

          {/* Action button */}
          {aba === "portais" ? (
            <Button icon={Plus} onClick={abrirNovoPortal}>Novo Portal</Button>
          ) : (
            <Button icon={Plus} onClick={abrirNovoTemplate}>Novo Template</Button>
          )}
        </div>
      </div>

      {/* ── ABA: PORTAIS ── */}
      {aba === "portais" && (
        <>
          {/* Avisos de planos faltando */}
          {!loadingPortais && !planos.some(p => p.nome === "LGPD") && (
            <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-semibold text-sm">Plano LGPD não encontrado</p>
                <p className="text-yellow-500 text-xs mt-1">O portal LGPD precisa de um plano com nome <strong>"LGPD"</strong>. Vá em <strong>Planos</strong> e crie um plano gratuito com esse nome.</p>
              </div>
            </div>
          )}
          {!loadingPortais && !planos.some(p => p.nome.toLowerCase() === "lead") && (
            <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-semibold text-sm">Plano Lead não encontrado</p>
                <p className="text-yellow-500 text-xs mt-1">O portal de Leads precisa de um plano com nome <strong>"Lead"</strong>. Vá em <strong>Planos</strong> e crie um plano gratuito com esse nome.</p>
              </div>
            </div>
          )}

          {loadingPortais ? (
            <div className="flex items-center justify-center h-40 text-gray-500">Carregando...</div>
          ) : portais.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-3">
              <LayoutGrid className="w-12 h-12 opacity-30" />
              <p className="text-sm">Nenhum portal cadastrado.</p>
              <Button icon={Plus} onClick={abrirNovoPortal}>Criar primeiro portal</Button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portaisPag.pageData.map((p) => (
                <Card key={p.id} className="hover:border-gray-700 transition-all flex flex-col">
                  {/* Card header */}
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-[#0d1117] rounded-lg flex-shrink-0">
                          <TipoIcon tipo={p.tipo} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold truncate">{p.nome}</h3>
                          <p className="text-xs text-gray-500 font-mono">/{p.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Badge tipo={p.tipo} />
                        {PORTAL_TIPO_MAP[p.tipo]?.usaCampanha && (
                          <span
                            className="px-1.5 py-0.5 text-[10px] font-medium rounded border bg-fuchsia-900/20 text-fuchsia-400 border-fuchsia-800/40"
                            title="Este portal pode exibir uma campanha configurada"
                          >
                            📣 Campanha
                          </span>
                        )}
                      </div>
                    </div>

                    {p.descricao && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.descricao}</p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {p.template_nome && (
                        <span className="px-2 py-0.5 text-xs rounded border bg-purple-900/30 text-purple-400 border-purple-800/50">
                          {p.template_nome}
                        </span>
                      )}
                      {p.cor_primaria && (
                        <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" style={{ backgroundColor: p.cor_primaria }} title={`Primária: ${p.cor_primaria}`} />
                      )}
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>
                      {p.mikrotiks_vinculados} MikroTik{p.mikrotiks_vinculados !== 1 ? "s" : ""} vinculado{p.mikrotiks_vinculados !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Card actions */}
                  <div className="border-t border-gray-800 px-4 py-3 flex items-center gap-1.5 flex-wrap">
                    <Button
                      size="sm" variant="secondary" icon={Eye}
                      onClick={() => window.open(`/api/portais/${p.id}/preview?token=${encodeURIComponent(token)}`, "_blank")}
                      title="Pré-visualizar"
                    >
                      Preview
                    </Button>

                    <Button
                      size="sm" variant="secondary" icon={PenTool}
                      className="!text-purple-400 !border-purple-800/50 hover:!bg-purple-900/20"
                      onClick={() => navigate(`/admin/${empresaSlug}/portais/${p.id}/editor`)}
                      title="Editor visual"
                    >
                      Editor
                    </Button>

                    <Button
                      size="sm" variant="secondary" icon={Pencil}
                      className="!text-blue-400 !border-blue-800/50 hover:!bg-blue-900/20"
                      onClick={() => abrirEditarPortal(p)}
                      title="Editar dados básicos"
                    >
                      Editar
                    </Button>

                    {p.tipo === "custom" && (
                      <Button
                        size="sm" variant="danger" icon={Trash2}
                        className="ml-auto !bg-transparent !text-red-400 !border !border-red-800/50 hover:!bg-red-900/20"
                        onClick={() => excluirPortal(p.id, p.nome)}
                        title="Remover portal"
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <Pagination page={portaisPag.page} totalPages={portaisPag.totalPages} total={portaisPag.total} onPageChange={portaisPag.setPage} itemLabel="portais" />
            </>
          )}
        </>
      )}

      {/* ── ABA: TEMPLATES ── */}
      {aba === "templates" && (
        <>
          {loadingTemplates ? (
            <div className="flex items-center justify-center h-40 text-gray-500">Carregando templates...</div>
          ) : listaTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-3">
              <FileText className="w-12 h-12 opacity-30" />
              <p className="text-sm">Nenhum template cadastrado.</p>
              <Button icon={Plus} onClick={abrirNovoTemplate}>Criar primeiro template</Button>
            </div>
          ) : (
            <>
            <Card className="overflow-hidden">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Nome</Table.HeadCell>
                  <Table.HeadCell>Tipo</Table.HeadCell>
                  <Table.HeadCell hideOn="md">Descrição</Table.HeadCell>
                  <Table.HeadCell hideOn="lg">Criado em</Table.HeadCell>
                  <Table.HeadCell>Ações</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {templatesPag.pageData.map((t) => (
                    <Table.Row key={t.id}>
                      <Table.Cell className="font-medium text-white">{t.nome}</Table.Cell>
                      <Table.Cell><Badge tipo={t.tipo} /></Table.Cell>
                      <Table.Cell hideOn="md" className="text-xs max-w-xs">
                        <span className="line-clamp-1">{t.descricao || "—"}</span>
                      </Table.Cell>
                      <Table.Cell hideOn="lg" className="text-xs">
                        {t.criado_em ? new Date(t.criado_em).toLocaleDateString("pt-BR") : "—"}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <IconButton icon={Pencil} title="Editar template" onClick={() => abrirEditarTemplate(t)} />
                          <IconButton icon={Trash2} variant="danger" title="Remover template" onClick={() => excluirTemplate(t.id, t.nome)} />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Card>
            <Pagination page={templatesPag.page} totalPages={templatesPag.totalPages} total={templatesPag.total} onPageChange={templatesPag.setPage} itemLabel="templates" />
            </>
          )}
        </>
      )}

      {/* ── MODAL: Portal ── */}
      {modalPortal && (
        <Modal
          title={editandoPortal ? "Editar Portal" : "Novo Portal"}
          onClose={() => setModalPortal(false)}
        >
          <form onSubmit={salvarPortal} className="space-y-4">
            <Input
              label="Nome *"
              value={formPortal.nome}
              onChange={e => handlePortalNomeChange(e.target.value)}
              placeholder="Ex: Portal LGPD Principal"
              required
            />

            {!editandoPortal && (
              <div>
                <Input
                  label="Slug (URL) *"
                  value={formPortal.slug}
                  onChange={e => setFormPortal(f => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="portal-principal"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">Identificador único do portal. Gerado automaticamente a partir do nome.</p>
              </div>
            )}

            {!editandoPortal && (
              <Select
                label="Tipo"
                value={formPortal.tipo}
                onChange={e => setFormPortal(f => ({ ...f, tipo: e.target.value }))}
              >
                {PORTAL_TIPOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            )}

            <Input
              label="URL de Redirect"
              value={formPortal.url_redirect}
              onChange={e => setFormPortal(f => ({ ...f, url_redirect: e.target.value }))}
              placeholder="Ex: /cadastro"
            />

            <Select
              label="Template Base"
              value={formPortal.template_id}
              onChange={e => setFormPortal(f => ({ ...f, template_id: e.target.value }))}
            >
              <option value="">Nenhum</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.nome} ({t.tipo})</option>
              ))}
            </Select>

            <Textarea
              label="Descrição"
              rows={2}
              value={formPortal.descricao}
              onChange={e => setFormPortal(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Descrição opcional do portal"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalPortal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={savingPortal}>
                {editandoPortal ? "Salvar" : "Criar Portal"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Template ── */}
      {modalTemplate && (
        <Modal
          title={editandoTemplate ? "Editar Template" : "Novo Template"}
          onClose={() => setModalTemplate(false)}
          wide
        >
          <form onSubmit={salvarTemplate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome *"
                value={formTemplate.nome}
                onChange={e => setFormTemplate(f => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Portal Moderno LGPD"
                required
              />
              <Select
                label="Tipo"
                value={formTemplate.tipo}
                onChange={e => setFormTemplate(f => ({ ...f, tipo: e.target.value }))}
              >
                {TIPOS_TEMPLATE.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>

            <Input
              label="Descrição"
              value={formTemplate.descricao}
              onChange={e => setFormTemplate(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Descrição do template"
            />

            <Textarea
              label="HTML do Template"
              className="font-mono text-xs resize-y"
              rows={14}
              value={formTemplate.html_template}
              onChange={e => setFormTemplate(f => ({ ...f, html_template: e.target.value }))}
              placeholder="<!DOCTYPE html>&#10;<html>...</html>"
              spellCheck={false}
            />

            <Textarea
              label="CSS Adicional"
              className="font-mono text-xs resize-y"
              rows={4}
              value={formTemplate.css_template}
              onChange={e => setFormTemplate(f => ({ ...f, css_template: e.target.value }))}
              placeholder="/* CSS customizado */"
              spellCheck={false}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setModalTemplate(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={savingTemplate}>
                {editandoTemplate ? "Salvar" : "Criar Template"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
