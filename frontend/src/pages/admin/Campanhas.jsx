import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Pencil, Trash2, Megaphone, CheckCircle2, Eye, MousePointerClick, Percent, Users, Clock } from "lucide-react";
import { Button, IconButton, Input, Textarea, Select, Card, Table, StatusToggle, Modal, EmptyState, StatCard, MiniBarChart } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";
import BannersTab from "../../components/admin/BannersTab";

const CATEGORIAS = [
  { value: "", label: "Sem categoria" },
  { value: "promocao_local", label: "Promoção Local" },
  { value: "campanha_institucional", label: "Campanha Institucional" },
  { value: "oferta_patrocinada", label: "Oferta Patrocinada" },
];
const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.value, c.label]));

export default function Campanhas() {
  const { empresaSlug } = useParams();
  const navigate = useNavigate();
  const { showError, showInfo, confirm } = useFeedback();
  const [aba, setAba] = useState("campanhas"); // campanhas | banners
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", categoria: "" });
  const [salvando, setSalvando] = useState(false);
  const [metricas, setMetricas] = useState(null);
  const [metricasLoading, setMetricasLoading] = useState(true);
  const token = localStorage.getItem("admin_token");

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campanhas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar campanhas");
      setCampanhas(data.data || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarMetricas = async () => {
    setMetricasLoading(true);
    try {
      const res = await fetch("/api/campanhas/metricas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar métricas");
      setMetricas(data.data);
    } catch (err) {
      // não bloqueia a tela — só o bloco de métricas fica vazio
      console.error(err);
    } finally {
      setMetricasLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    carregarMetricas();
  }, []);

  const { pageData, page, setPage, totalPages, total } = usePagination(campanhas, 12);

  const totalCampanhas = campanhas.length;
  const campanhasAtivas = campanhas.reduce((acc, c) => acc + (c.ativo ? 1 : 0), 0);
  const viewsTotais = campanhas.reduce((acc, c) => acc + (c.views ?? 0), 0);

  const handleCriar = async () => {
    if (!form.nome.trim()) return showInfo("Informe o nome da campanha.");
    setSalvando(true);
    try {
      const res = await fetch("/api/campanhas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: form.nome, descricao: form.descricao, categoria: form.categoria || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar campanha");
      setShowModal(false);
      setForm({ nome: "", descricao: "", categoria: "" });
      carregar();
    } catch (err) {
      showError(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async (c) => {
    try {
      const res = await fetch(`/api/campanhas/${c.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ativo: !c.ativo }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar campanha");
      carregar();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeletar = async (id) => {
    if (!(await confirm({ title: "Excluir campanha", message: "Deseja realmente excluir esta campanha?", danger: true, confirmText: "Excluir" }))) return;
    try {
      const res = await fetch(`/api/campanhas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir campanha");
      carregar();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Campanhas</h1>
        {aba === "campanhas" && (
          <Button
            icon={Plus}
            onClick={() => {
              setForm({ nome: "", descricao: "", categoria: "" });
              setShowModal(true);
            }}
          >
            Nova Campanha
          </Button>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-4 mb-6 border-b border-gray-800">
        {[
          { key: "campanhas", label: "Campanhas" },
          { key: "banners", label: "Banners" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setAba(t.key)}
            className={`pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              aba === t.key
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === "banners" ? (
        <BannersTab />
      ) : (
        <>
          {!loading && (
            <StatCard.Row>
              <StatCard icon={Megaphone} label="Total de campanhas" value={totalCampanhas} color="blue" />
              <StatCard icon={CheckCircle2} label="Campanhas ativas" value={campanhasAtivas} color="green" />
              <StatCard icon={Eye} label="Views totais" value={viewsTotais} color="purple" />
            </StatCard.Row>
          )}

          {!metricasLoading && metricas && (
            <>
              <StatCard.Row>
                <StatCard icon={Eye} label="Impressões (30 dias)" value={metricas.resumo.impressoes} color="blue" />
                <StatCard icon={MousePointerClick} label="Cliques (30 dias)" value={metricas.resumo.cliques} color="green" />
                <StatCard icon={Percent} label="CTR" value={`${metricas.resumo.ctr}%`} color="yellow" />
              </StatCard.Row>

              {metricas.conexoes && (
                <StatCard.Row>
                  <StatCard icon={Users} label="Usuários conectados (30 dias)" value={metricas.conexoes.usuarios_conectados} color="purple" />
                  <StatCard icon={Clock} label="Tempo médio conectado" value={`${metricas.conexoes.tempo_medio_conectado_minutos} min`} color="blue" />
                </StatCard.Row>
              )}

              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Impressões por dia (últimos 30 dias)</h2>
                <MiniBarChart dados={metricas.serie_diaria} chaveValor="impressoes" />
              </Card>
            </>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Campanhas Cadastradas</h2>
            <Table>
              <Table.Head>
                <Table.HeadCell>Nome</Table.HeadCell>
                <Table.HeadCell hideOn="md">Descrição</Table.HeadCell>
                <Table.HeadCell>Itens</Table.HeadCell>
                <Table.HeadCell>Views</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Ações</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {loading ? (
                  <Table.Loading colSpan={6} />
                ) : campanhas.length === 0 ? (
                  <Table.Empty colSpan={6}>
                    <EmptyState
                      icon={Megaphone}
                      title="Nenhuma campanha cadastrada"
                      description='Clique em "Nova Campanha" para criar seu primeiro conteúdo promocional.'
                      action={
                        <Button
                          icon={Plus}
                          size="sm"
                          onClick={() => {
                            setForm({ nome: "", descricao: "", categoria: "" });
                            setShowModal(true);
                          }}
                        >
                          Nova Campanha
                        </Button>
                      }
                    />
                  </Table.Empty>
                ) : (
                  pageData.map((c) => (
                    <Table.Row key={c.id}>
                      <Table.Cell>
                        <div className="font-semibold text-white">{c.nome}</div>
                        {c.categoria && (
                          <div className="text-[11px] text-gray-500">{CATEGORIA_LABEL[c.categoria]}</div>
                        )}
                      </Table.Cell>
                      <Table.Cell hideOn="md" className="text-xs max-w-xs truncate">{c.descricao || "—"}</Table.Cell>
                      <Table.Cell>{c.total_itens ?? 0}</Table.Cell>
                      <Table.Cell>{c.views ?? 0}</Table.Cell>
                      <Table.Cell>
                        <StatusToggle ativo={!!c.ativo} onToggle={() => handleToggleAtivo(c)} />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <IconButton
                            icon={Pencil}
                            title="Editar"
                            onClick={() => navigate(`/admin/${empresaSlug}/campanhas/${c.id}`)}
                          />
                          <IconButton icon={Trash2} variant="danger" title="Excluir" onClick={() => handleDeletar(c.id)} />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </Card>

          {!loading && campanhas.length > 0 && (
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="campanhas" />
          )}
        </>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Campanha"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={salvando} onClick={handleCriar}>Criar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={<>Nome <span className="text-red-400">*</span></>}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <Textarea
            label="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <Select
            label="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>
      </Modal>
    </AdminLayout>
  );
}
