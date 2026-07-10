import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Download, Trash2, Search, X } from "lucide-react";
import { Button, IconButton, Input, Textarea, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";

const API = "";

const statusColors = {
  novo: "bg-blue-900/40 text-blue-400 border-blue-800/50",
  contactado: "bg-yellow-900/40 text-yellow-400 border-yellow-800/50",
  convertido: "bg-green-900/40 text-green-400 border-green-800/50",
  descartado: "bg-red-900/40 text-red-400 border-red-800/50",
};

const statusLabels = {
  novo: "Novo",
  contactado: "Contactado",
  convertido: "Convertido",
  descartado: "Descartado",
};

const tabs = [
  { key: "todos", label: "Todos" },
  { key: "novo", label: "Novo" },
  { key: "contactado", label: "Contactado" },
  { key: "convertido", label: "Convertido" },
  { key: "descartado", label: "Descartado" },
];

export default function Leads() {
  const { confirm } = useFeedback();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", cpf: "", observacoes: "" });

  const token = localStorage.getItem("admin_token");

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "todos") params.append("status", statusFilter);
      if (search) params.append("q", search);

      const res = await fetch(`${API}/api/leads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar leads:", err);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const { pageData, page, setPage, totalPages, total } = usePagination(leads, 12);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API}/api/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLeads();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Excluir lead", message: "Tem certeza que deseja excluir este lead?", danger: true, confirmText: "Excluir" }))) return;
    try {
      await fetch(`${API}/api/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads();
    } catch (err) {
      console.error("Erro ao deletar lead:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, origem: "manual" }),
      });
      setShowModal(false);
      setForm({ nome: "", email: "", telefone: "", cpf: "", observacoes: "" });
      fetchLeads();
    } catch (err) {
      console.error("Erro ao criar lead:", err);
    }
  };

  const handleExport = () => {
    window.open(`${API}/api/leads/export?token=${token}`, "_blank");
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Leads</h1>
            <p className="text-gray-400 text-sm mt-1">Gerencie seus leads e contatos</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Exportar CSV
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-blue-900/30 text-blue-400 border border-blue-800/50"
                  : "bg-[#1a1d27] text-gray-400 border border-gray-800 hover:bg-[#252b3b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <Input
          icon={Search}
          placeholder="Buscar por nome, email ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="w-full sm:w-96"
        />

        {/* Table */}
        <Card className="overflow-hidden">
          <Table>
            <Table.Head>
              <Table.HeadCell>Nome</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell hideOn="md">Telefone</Table.HeadCell>
              <Table.HeadCell hideOn="lg">CPF</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell hideOn="md">Origem</Table.HeadCell>
              <Table.HeadCell hideOn="lg">Data</Table.HeadCell>
              <Table.HeadCell>Ações</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {loading ? (
                <Table.Loading colSpan={8} />
              ) : pageData.length === 0 ? (
                <Table.Empty colSpan={8}>Nenhum lead encontrado</Table.Empty>
              ) : (
                pageData.map((lead) => (
                  <Table.Row key={lead.id}>
                    <Table.Cell className="text-gray-200">{lead.nome || "-"}</Table.Cell>
                    <Table.Cell>{lead.email || "-"}</Table.Cell>
                    <Table.Cell hideOn="md">{lead.telefone || "-"}</Table.Cell>
                    <Table.Cell hideOn="lg">{lead.cpf || "-"}</Table.Cell>
                    <Table.Cell>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-xs font-medium border cursor-pointer bg-transparent ${statusColors[lead.status]}`}
                      >
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <option key={val} value={val} className="bg-[#1a1d27] text-gray-300">
                            {label}
                          </option>
                        ))}
                      </select>
                    </Table.Cell>
                    <Table.Cell hideOn="md" className="capitalize">{lead.origem}</Table.Cell>
                    <Table.Cell hideOn="lg" className="text-gray-500 text-xs">{formatDate(lead.criado_em)}</Table.Cell>
                    <Table.Cell>
                      <IconButton icon={Trash2} variant="danger" title="Excluir lead" onClick={() => handleDelete(lead.id)} />
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card>

        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="leads" />
      </div>

      {/* Modal Novo Lead */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <Card.Header className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Novo Lead</h2>
              <IconButton icon={X} title="Fechar" onClick={() => setShowModal(false)} />
            </Card.Header>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <Input
                label="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Telefone"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
              <Input
                label="CPF"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              />
              <Textarea
                label="Observações"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Criar Lead
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
