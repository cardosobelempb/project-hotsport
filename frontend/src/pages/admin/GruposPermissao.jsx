import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Users, Pencil, Trash2, X, Check, Minus } from "lucide-react";
import { Button, IconButton, Input, Select, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";

const API = import.meta.env.VITE_API_URL || "";

const MODULOS_LABELS = {
  dashboard: "Dashboard",
  mikrotiks: "Mikrotiks",
  vpn: "VPN WireGuard",
  portais: "Portais",
  planos: "Planos",
  clientes: "Clientes (LGPD)",
  leads: "Leads",
  radius: "Usuários RADIUS",
  pagamentos: "Pagamentos",
  sessoes: "Sessões Ativas",
  sessoeslog: "Log Radius",
  compliance: "Marco Civil",
  configuracoes: "Configurações",
  usuarios: "Usuários",
};

const ACOES = ["ver", "criar", "editar", "excluir"];
const ACOES_LABELS = { ver: "Ver", criar: "Criar", editar: "Editar", excluir: "Excluir" };

function emptyPermissoes() {
  return Object.keys(MODULOS_LABELS).map((m) => ({
    modulo: m,
    ver: false,
    criar: false,
    editar: false,
    excluir: false,
  }));
}

export default function GruposPermissao() {
  const { showError, confirm } = useFeedback();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "", permissoes: emptyPermissoes() });
  const [erro, setErro] = useState(null);

  // Admins modal
  const [showAdminsModal, setShowAdminsModal] = useState(null);
  const [adminsGrupo, setAdminsGrupo] = useState([]);
  const [todosAdmins, setTodosAdmins] = useState([]);
  const [adminSelecionado, setAdminSelecionado] = useState("");

  const token = localStorage.getItem("admin_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchGrupos = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/grupos-permissao`, { headers });
      if (res.ok) setGrupos(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGrupos(); }, [fetchGrupos]);

  const { pageData, page, setPage, totalPages, total } = usePagination(grupos, 12);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    try {
      const url = editId ? `${API}/api/grupos-permissao/${editId}` : `${API}/api/grupos-permissao`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (res.ok) {
        setShowModal(false);
        setEditId(null);
        setForm({ nome: "", descricao: "", permissoes: emptyPermissoes() });
        fetchGrupos();
      } else {
        const data = await res.json();
        setErro(data.message || "Erro ao salvar");
      }
    } catch (err) {
      setErro("Erro de conexão");
    }
  };

  const handleEdit = async (grupo) => {
    try {
      const res = await fetch(`${API}/api/grupos-permissao/${grupo.id}`, { headers });
      const data = await res.json();
      const perms = emptyPermissoes().map((p) => {
        const found = data.permissoes?.find((dp) => dp.modulo === p.modulo);
        return found ? { ...p, ver: !!found.ver, criar: !!found.criar, editar: !!found.editar, excluir: !!found.excluir } : p;
      });
      setEditId(grupo.id);
      setForm({ nome: data.nome, descricao: data.descricao || "", permissoes: perms });
      setShowModal(true);
    } catch (err) {
      showError("Erro ao carregar grupo");
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Excluir grupo", message: "Deletar este grupo de permissão?", danger: true, confirmText: "Excluir" }))) return;
    await fetch(`${API}/api/grupos-permissao/${id}`, { method: "DELETE", headers });
    fetchGrupos();
  };

  const togglePerm = (modulo, acao) => {
    setForm((prev) => ({
      ...prev,
      permissoes: prev.permissoes.map((p) =>
        p.modulo === modulo ? { ...p, [acao]: !p[acao] } : p
      ),
    }));
  };

  const toggleAllModulo = (modulo) => {
    const perm = form.permissoes.find((p) => p.modulo === modulo);
    const allChecked = ACOES.every((a) => perm[a]);
    setForm((prev) => ({
      ...prev,
      permissoes: prev.permissoes.map((p) =>
        p.modulo === modulo ? { ...p, ver: !allChecked, criar: !allChecked, editar: !allChecked, excluir: !allChecked } : p
      ),
    }));
  };

  const toggleAllAcao = (acao) => {
    const allChecked = form.permissoes.every((p) => p[acao]);
    setForm((prev) => ({
      ...prev,
      permissoes: prev.permissoes.map((p) => ({ ...p, [acao]: !allChecked })),
    }));
  };

  // Admins
  const openAdminsModal = async (grupoId) => {
    setShowAdminsModal(grupoId);
    const [admRes, todosRes] = await Promise.all([
      fetch(`${API}/api/grupos-permissao/${grupoId}/admins`, { headers }),
      fetch(`${API}/api/grupos-permissao/admins/todos`, { headers }),
    ]);
    setAdminsGrupo(await admRes.json());
    setTodosAdmins(await todosRes.json());
  };

  const vincularAdmin = async () => {
    if (!adminSelecionado) return;
    await fetch(`${API}/api/grupos-permissao/${showAdminsModal}/vincular-admin`, {
      method: "POST", headers, body: JSON.stringify({ admin_id: adminSelecionado })
    });
    setAdminSelecionado("");
    openAdminsModal(showAdminsModal);
  };

  const desvincularAdmin = async (adminId) => {
    if (!(await confirm({ title: "Remover admin", message: "Remover este admin do grupo?", danger: true, confirmText: "Remover" }))) return;
    await fetch(`${API}/api/grupos-permissao/${showAdminsModal}/desvincular-admin/${adminId}`, { method: "DELETE", headers });
    openAdminsModal(showAdminsModal);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Grupos de Permissão</h1>
            <p className="text-sm text-gray-400 mt-1">{grupos.length} grupo(s) cadastrado(s)</p>
          </div>
          <Button
            icon={Plus}
            className="!bg-green-600 hover:!bg-green-500"
            onClick={() => { setEditId(null); setForm({ nome: "", descricao: "", permissoes: emptyPermissoes() }); setErro(null); setShowModal(true); }}
          >
            Novo Grupo
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : (
          <>
          <Card className="overflow-hidden">
            <Table>
              <Table.Head>
                <Table.HeadCell>Nome</Table.HeadCell>
                <Table.HeadCell hideOn="md">Descrição</Table.HeadCell>
                <Table.HeadCell>Admins</Table.HeadCell>
                <Table.HeadCell>Ações</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {pageData.length === 0 ? (
                  <Table.Empty colSpan={4} />
                ) : pageData.map((g) => (
                  <Table.Row key={g.id}>
                    <Table.Cell className="font-medium text-white">{g.nome}</Table.Cell>
                    <Table.Cell hideOn="md" className="text-xs">{g.descricao || "—"}</Table.Cell>
                    <Table.Cell>
                      <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs">{g.total_admins || 0}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-1">
                        <IconButton icon={Users} variant="primary" title="Admins do grupo" onClick={() => openAdminsModal(g.id)} />
                        <IconButton icon={Pencil} title="Editar" onClick={() => handleEdit(g)} />
                        <IconButton icon={Trash2} variant="danger" title="Excluir" onClick={() => handleDelete(g.id)} />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="grupos" />
          </>
        )}

        {/* Modal Criar/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-4">
                {editId ? "Editar Grupo" : "Novo Grupo de Permissão"}
              </h2>
              {erro && <p className="text-red-400 text-sm mb-3 bg-red-900/20 p-2 rounded">{erro}</p>}

              <div className="space-y-3 mb-4">
                <Input label="Nome *" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                <Input label="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>

              {/* Grid de Permissões */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Permissões por Módulo</h3>
                <div className="bg-[#0d1117] border border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400">
                        <th className="text-left px-3 py-2 font-medium">Módulo</th>
                        {ACOES.map((a) => (
                          <th key={a} className="text-center px-2 py-2 font-medium cursor-pointer hover:text-white" onClick={() => toggleAllAcao(a)}>
                            {ACOES_LABELS[a]}
                          </th>
                        ))}
                        <th className="text-center px-2 py-2 font-medium text-gray-500">Todos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.permissoes.map((p) => (
                        <tr key={p.modulo} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                          <td className="px-3 py-2 text-gray-300 font-medium">{MODULOS_LABELS[p.modulo]}</td>
                          {ACOES.map((a) => (
                            <td key={a} className="text-center px-2 py-2">
                              <input
                                type="checkbox"
                                checked={p[a]}
                                onChange={() => togglePerm(p.modulo, a)}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                          ))}
                          <td className="text-center px-2 py-2">
                            <button type="button" onClick={() => toggleAllModulo(p.modulo)}
                              className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] transition-colors ${
                                ACOES.every((a) => p[a])
                                  ? "bg-green-600/30 text-green-400 hover:bg-green-600/50"
                                  : "bg-gray-700/50 text-gray-500 hover:bg-gray-700"
                              }`}>
                              {ACOES.every((a) => p[a]) ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  {editId ? "Salvar" : "Criar"}
                </Button>
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Admins do Grupo */}
        {showAdminsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Admins do Grupo</h2>
                <IconButton icon={X} title="Fechar" onClick={() => setShowAdminsModal(null)} />
              </div>

              <div className="space-y-2 mb-6">
                {adminsGrupo.length === 0 && <p className="text-gray-500 text-sm">Nenhum admin vinculado</p>}
                {adminsGrupo.map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-[#0d1117] rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{a.nome || a.email}</p>
                      <p className="text-gray-500 text-xs">{a.email} · <span className="text-blue-400">{a.role}</span></p>
                    </div>
                    <IconButton icon={Trash2} variant="danger" title="Remover" onClick={() => desvincularAdmin(a.id)} />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Vincular Admin</h3>
                <div className="flex gap-2">
                  <Select
                    containerClassName="flex-1"
                    value={adminSelecionado}
                    onChange={(e) => setAdminSelecionado(e.target.value)}
                  >
                    <option value="">Selecione um admin...</option>
                    {todosAdmins.filter((a) => !adminsGrupo.find((ag) => ag.id === a.id)).map((a) => (
                      <option key={a.id} value={a.id}>{a.nome || a.email} ({a.role})</option>
                    ))}
                  </Select>
                  <Button icon={Plus} className="!bg-green-600 hover:!bg-green-500" onClick={vincularAdmin} />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
