import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Pencil, Trash2, Copy, X, AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";
import { Button, IconButton, Input, Textarea, Select, Card, Table, StatusToggle } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";

// Máscara de moeda estilo "centavos primeiro": os dígitos digitados são
// tratados como centavos (da direita pra esquerda), igual ao padrão de apps
// bancários — evita ambiguidade entre "0,05" e "5,00".
function formatarValorInput(raw) {
  const digitos = raw.replace(/\D/g, "");
  const centavos = parseInt(digitos || "0", 10);
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export default function Planos() {
  const { showError, showSuccess, confirm } = useFeedback();
  const [planos, setPlanos] = useState([]);
  const [mikrotiks, setMikrotiks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroMikrotik, setFiltroMikrotik] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    duracao: 1,
    valor: "0,00",
    velocidade_download: 0,
    velocidade_upload: 0,
    mikrotik_id: "",
    address_pool: "default-dhcp",
    shared_users: 10,
    ativo: true,
  });
  const token = localStorage.getItem("admin_token");

  const carregarPlanos = async () => {
    try {
      const res = await fetch("/api/planos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Erro ao carregar planos");
      setPlanos(data);
    } catch (err) {
      showError("Erro ao carregar planos.");
    } finally {
      setLoading(false);
    }
  };

  const carregarMikrotiks = async () => {
    try {
      const res = await fetch("/api/mikrotiks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMikrotiks(data);
    } catch (err) {
      showError("Erro ao carregar Mikrotiks");
    }
  };

  useEffect(() => {
    carregarPlanos();
    carregarMikrotiks();
  }, []);

  const mikrotikNomePorId = useMemo(
    () => Object.fromEntries(mikrotiks.map((m) => [String(m.id), m.nome])),
    [mikrotiks]
  );

  const planosFiltrados = useMemo(
    () =>
      filtroMikrotik
        ? planos.filter((p) => String(p.mikrotik_id) === filtroMikrotik)
        : planos,
    [planos, filtroMikrotik]
  );

  const { pageData, page, setPage, totalPages, total } = usePagination(planosFiltrados, 12);

  const handleFiltroMikrotikChange = (e) => {
    setFiltroMikrotik(e.target.value);
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editando ? `/api/planos/${editando}` : "/api/planos";
      const method = editando ? "PUT" : "POST";
      const valorEmCentavos = Math.round(
        parseFloat(form.valor.replace(",", ".") || "0") * 100
      );

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao,
          valor: valorEmCentavos,
          duracao_minutos: parseInt(form.duracao),
          velocidade_down: parseInt(form.velocidade_download),
          velocidade_up: parseInt(form.velocidade_upload),
          mikrotik_id: parseInt(form.mikrotik_id),
          address_pool: form.address_pool,
          shared_users: parseInt(form.shared_users),
          ativo: form.ativo,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar plano");
      setShowModal(false);
      setEditando(null);
      carregarPlanos();
    } catch (err) {
      showError("Erro ao salvar plano.");
    }
  };

  const handleEditar = (plano) => {
    setForm({
      nome: plano.nome,
      descricao: plano.descricao,
      valor: (plano.valor / 100).toFixed(2).replace(".", ","),
      duracao: plano.duracao_minutos,
      velocidade_download: plano.velocidade_down,
      velocidade_upload: plano.velocidade_up,
      mikrotik_id: plano.mikrotik_id,
      address_pool: plano.address_pool || "default-dhcp",
      shared_users: plano.shared_users || 10,
      ativo: plano.ativo,
    });
    setEditando(plano.id);
    setShowModal(true);
  };

  const handleToggleAtivo = async (p) => {
    try {
      const res = await fetch(`/api/planos/${p.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: p.nome,
          descricao: p.descricao,
          valor: p.valor,
          duracao_minutos: p.duracao_minutos,
          velocidade_down: p.velocidade_down,
          velocidade_up: p.velocidade_up,
          mikrotik_id: p.mikrotik_id,
          address_pool: p.address_pool || "default-dhcp",
          shared_users: p.shared_users || 10,
          ativo: !p.ativo,
        }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar plano");
      carregarPlanos();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRemover = async (id) => {
    if (!(await confirm({ title: "Excluir plano", message: "Deseja remover este plano?", danger: true, confirmText: "Remover" }))) return;
    try {
      await fetch(`/api/planos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      carregarPlanos();
    } catch (err) {
      showError("Erro ao remover plano.");
    }
  };

  const handleCopiar = (plano) => {
    setForm({
      nome: plano.nome + " (cópia)",
      descricao: plano.descricao,
      valor: (plano.valor / 100).toFixed(2).replace(".", ","),
      duracao: plano.duracao_minutos,
      velocidade_download: plano.velocidade_down,
      velocidade_upload: plano.velocidade_up,
      mikrotik_id: plano.mikrotik_id,
      address_pool: plano.address_pool || "default-dhcp",
      shared_users: plano.shared_users || 10,
      ativo: plano.ativo,
    });
    setEditando(null); // Não estamos editando, é um novo
    setShowModal(true);
  };

  const enviarParaMikrotik = async (id) => {
    if (!(await confirm({ title: "Enviar plano", message: "Deseja realmente enviar esse plano para o Mikrotik?", confirmText: "Enviar" }))) return;
    try {
      const res = await fetch(`/api/planos/${id}/enviar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSuccess("Plano enviado com sucesso para o Mikrotik!");
    } catch (err) {
      showError("Erro ao enviar plano: " + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Planos</h1>
        <Button
          icon={Plus}
          onClick={() => {
            setForm({
              nome: "",
              descricao: "",
              duracao: 1,
              valor: "0,00",
              velocidade_download: 0,
              velocidade_upload: 0,
              mikrotik_id: "",
              address_pool: "default-dhcp",
              shared_users: 10,
              ativo: true,
            });
            setEditando(null);
            setShowModal(true);
          }}
        >
          Novo Plano
        </Button>
      </div>

      {!loading && !planos.some(p => p.nome === 'LGPD') && (
        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Plano LGPD não encontrado</p>
            <p className="text-yellow-500 text-xs mt-1">O portal LGPD precisa de um plano com o nome exato <strong>"LGPD"</strong> para funcionar. Crie um plano gratuito com esse nome e vincule a um Mikrotik.</p>
          </div>
        </div>
      )}
      {!loading && !planos.some(p => p.nome.toLowerCase() === 'lead') && (
        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Plano Lead não encontrado</p>
            <p className="text-yellow-500 text-xs mt-1">O portal de Leads precisa de um plano com o nome exato <strong>"Lead"</strong> para funcionar. Crie um plano gratuito com esse nome e vincule a um Mikrotik.</p>
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Planos Cadastrados</h2>
          <Select
            value={filtroMikrotik}
            onChange={handleFiltroMikrotikChange}
            containerClassName="w-full sm:w-64"
          >
            <option value="">Todos os Mikrotiks</option>
            {mikrotiks.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.nome}</option>
            ))}
          </Select>
        </div>
        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : (
          <Table>
            <Table.Head>
              <Table.HeadCell>Nome</Table.HeadCell>
              <Table.HeadCell>Duração</Table.HeadCell>
              <Table.HeadCell hideOn="md">Velocidade</Table.HeadCell>
              <Table.HeadCell>Preço</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Ações</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {pageData.length === 0 ? (
                <Table.Empty colSpan={6} />
              ) : pageData.map((p) => (
                <Table.Row key={p.id}>
                  <Table.Cell>
                    <div className="font-semibold text-white">{p.nome}</div>
                    <div className="text-[11px] text-gray-500">
                      {mikrotikNomePorId[String(p.mikrotik_id)] || "Sem Mikrotik"}
                      {p.descricao ? ` · ${p.descricao}` : ""}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{p.duracao_minutos} min</Table.Cell>
                  <Table.Cell hideOn="md">
                    <div className="flex items-center gap-1"><ArrowDown className="w-3 h-3" /> {p.velocidade_down} Mbps</div>
                    <div className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /> {p.velocidade_up} Mbps</div>
                  </Table.Cell>
                  <Table.Cell className="font-medium text-white">
                    {Number(p.valor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusToggle ativo={!!p.ativo} onToggle={() => handleToggleAtivo(p)} />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1">
                      <IconButton icon={Pencil} title="Editar" onClick={() => handleEditar(p)} />
                      <IconButton icon={Copy} title="Copiar" onClick={() => handleCopiar(p)} />
                      <IconButton icon={Trash2} variant="danger" title="Remover" onClick={() => handleRemover(p.id)} />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {!loading && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="planos" />}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editando ? "Editar Plano" : "Criar Plano"}</h3>
              <IconButton icon={X} title="Fechar" onClick={() => setShowModal(false)} />
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Nome do Plano"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
              <Textarea
                label="Descrição"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Duração (minutos)"
                  type="number"
                  value={form.duracao}
                  onChange={(e) => setForm({ ...form, duracao: e.target.value })}
                />
                <div>
                  <Input
                    label="Valor (R$)"
                    inputMode="numeric"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: formatarValorInput(e.target.value) })}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Digite só os números — os 2 últimos viram centavos. Ex: 500 = R$ 5,00
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Download (Mbps)"
                  type="number"
                  value={form.velocidade_download}
                  onChange={(e) => setForm({ ...form, velocidade_download: e.target.value })}
                />
                <Input
                  label="Upload (Mbps)"
                  type="number"
                  value={form.velocidade_upload}
                  onChange={(e) => setForm({ ...form, velocidade_upload: e.target.value })}
                />
              </div>
              <Select
                label="Mikrotik"
                value={form.mikrotik_id}
                onChange={(e) => setForm({ ...form, mikrotik_id: e.target.value })}
              >
                <option value="">Selecione o Mikrotik</option>
                {mikrotiks.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </Select>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
                Plano ativo
              </label>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary">{editando ? "Salvar" : "Criar"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
