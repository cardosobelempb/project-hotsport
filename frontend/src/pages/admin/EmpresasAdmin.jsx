import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Users, Pencil, Trash2, X, Camera } from "lucide-react";
import { Button, IconButton, Input, Select, Card, Table, Badge } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";

const API = import.meta.env.VITE_API_URL || "";

export default function EmpresasAdmin() {
  const { showError, showInfo, confirm } = useFeedback();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "" });
  const [erro, setErro] = useState(null);

  // Vinculação de admins
  const [showAdminsModal, setShowAdminsModal] = useState(null); // empresa_id
  const [adminsEmpresa, setAdminsEmpresa] = useState([]);
  const [todosAdmins, setTodosAdmins] = useState([]);
  const [vinculandoAdmin, setVinculandoAdmin] = useState({ admin_id: "", role: "operator" });
  const [uploadingLogo, setUploadingLogo] = useState(null);

  const token = localStorage.getItem("admin_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const handleLogoUpload = async (empresaId, file) => {
    if (!file) return;
    setUploadingLogo(empresaId);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch(`${API}/api/empresas/${empresaId}/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) fetchEmpresas();
      else showError('Erro ao enviar logo');
    } catch (err) {
      showError('Erro de conexão');
    } finally {
      setUploadingLogo(null);
    }
  };

  const fetchEmpresas = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/empresas`, { headers });
      if (res.ok) setEmpresas(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmpresas(); }, [fetchEmpresas]);

  const { pageData, page, setPage, totalPages, total } = usePagination(empresas, 12);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    try {
      const url = editId ? `${API}/api/empresas/${editId}` : `${API}/api/empresas`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (res.ok) {
        setShowModal(false);
        setEditId(null);
        setForm({ nome: "", cnpj: "", email: "", telefone: "" });
        fetchEmpresas();
      } else {
        const data = await res.json();
        setErro(data.message || "Erro ao salvar");
      }
    } catch (err) {
      setErro("Erro de conexão");
    }
  };

  const handleEdit = (empresa) => {
    setEditId(empresa.id);
    setForm({ nome: empresa.nome, cnpj: empresa.cnpj || "", email: empresa.email, telefone: empresa.telefone || "" });
    setShowModal(true);
  };

  const handleDelete = async (id, slug) => {
    if (slug === 'default') return showInfo("Não é possível deletar a empresa padrão");
    if (!(await confirm({ title: "Excluir empresa", message: "Deseja realmente deletar esta empresa? Todos os dados serão perdidos!", danger: true, confirmText: "Excluir" }))) return;
    await fetch(`${API}/api/empresas/${id}`, { method: "DELETE", headers });
    fetchEmpresas();
  };

  // --- Admin vinculation ---
  const openAdminsModal = async (empresaId) => {
    setShowAdminsModal(empresaId);
    const [adminsRes, todosRes] = await Promise.all([
      fetch(`${API}/api/empresas/${empresaId}/admins`, { headers }),
      fetch(`${API}/api/empresas/admins/todos`, { headers }),
    ]);
    setAdminsEmpresa(await adminsRes.json());
    setTodosAdmins(await todosRes.json());
  };

  const vincularAdmin = async () => {
    if (!vinculandoAdmin.admin_id) return;
    await fetch(`${API}/api/empresas/${showAdminsModal}/vincular-admin`, {
      method: "POST", headers, body: JSON.stringify(vinculandoAdmin)
    });
    setVinculandoAdmin({ admin_id: "", role: "operator" });
    openAdminsModal(showAdminsModal);
  };

  const desvincularAdmin = async (adminId) => {
    if (!(await confirm({ title: "Remover admin", message: "Remover este admin da empresa?", danger: true, confirmText: "Remover" }))) return;
    await fetch(`${API}/api/empresas/${showAdminsModal}/desvincular-admin/${adminId}`, {
      method: "DELETE", headers
    });
    openAdminsModal(showAdminsModal);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Empresas</h1>
            <p className="text-sm text-gray-400 mt-1">{empresas.length} empresa(s) cadastrada(s)</p>
          </div>
          <Button
            icon={Plus}
            className="!bg-green-600 hover:!bg-green-500"
            onClick={() => { setEditId(null); setForm({ nome: "", cnpj: "", email: "", telefone: "" }); setErro(null); setShowModal(true); }}
          >
            Nova Empresa
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
                <Table.HeadCell>Logo</Table.HeadCell>
                <Table.HeadCell>Empresa</Table.HeadCell>
                <Table.HeadCell hideOn="md">CNPJ</Table.HeadCell>
                <Table.HeadCell hideOn="lg">Contato</Table.HeadCell>
                <Table.HeadCell hideOn="lg">Stats</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Ações</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {pageData.length === 0 ? (
                  <Table.Empty colSpan={7} />
                ) : pageData.map((e) => (
                  <Table.Row key={e.id}>
                    <Table.Cell>
                      <label className="cursor-pointer block w-10 h-10 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 hover:border-blue-500 transition-colors relative">
                        {e.logo_url ? (
                          <img src={e.logo_url} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500"><Camera className="w-4 h-4" /></div>
                        )}
                        <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo === e.id}
                          onChange={(ev) => handleLogoUpload(e.id, ev.target.files[0])} />
                        {uploadingLogo === e.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-[10px] text-white">...</span></div>}
                      </label>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="font-medium text-white">{e.nome}</p>
                      <p className="text-xs text-gray-500">/{e.slug}</p>
                    </Table.Cell>
                    <Table.Cell hideOn="md">{e.cnpj || "—"}</Table.Cell>
                    <Table.Cell hideOn="lg">
                      <p className="text-gray-300 text-xs">{e.email}</p>
                      {e.telefone && <p className="text-gray-500 text-xs">{e.telefone}</p>}
                    </Table.Cell>
                    <Table.Cell hideOn="lg">
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">{e.total_mikrotiks || 0} MKT</span>
                        <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded">{e.total_planos || 0} Planos</span>
                        <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded">{e.total_admins || 0} Admins</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={e.ativo ? "success" : "danger"}>{e.ativo ? "Ativo" : "Inativo"}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-1">
                        <IconButton icon={Users} variant="primary" title="Gerenciar Admins" onClick={() => openAdminsModal(e.id)} />
                        <IconButton icon={Pencil} title="Editar" onClick={() => handleEdit(e)} />
                        {e.slug !== 'default' && (
                          <IconButton icon={Trash2} variant="danger" title="Excluir" onClick={() => handleDelete(e.id, e.slug)} />
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="empresas" />
          </>
        )}

        {/* Modal Criar/Editar Empresa */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-white mb-4">
                {editId ? "Editar Empresa" : "Nova Empresa"}
              </h2>
              {erro && <p className="text-red-400 text-sm mb-3 bg-red-900/20 p-2 rounded">{erro}</p>}
              <div className="space-y-3">
                <Input label="Nome *" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                <Input label="Email *" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="CNPJ" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
                <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-6">
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

        {/* Modal Admins da Empresa */}
        {showAdminsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Admins Vinculados</h2>
                <IconButton icon={X} title="Fechar" onClick={() => setShowAdminsModal(null)} />
              </div>

              {/* Lista de admins vinculados */}
              <div className="space-y-2 mb-6">
                {adminsEmpresa.length === 0 && <p className="text-gray-500 text-sm">Nenhum admin vinculado</p>}
                {adminsEmpresa.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-[#0d1117] rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{a.nome || a.email}</p>
                      <p className="text-gray-500 text-xs">{a.email} · <span className="text-blue-400">{a.role_empresa}</span></p>
                    </div>
                    <IconButton icon={Trash2} variant="danger" title="Remover" onClick={() => desvincularAdmin(a.id)} />
                  </div>
                ))}
              </div>

              {/* Vincular novo admin */}
              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Vincular Admin</h3>
                <div className="flex gap-2">
                  <Select
                    containerClassName="flex-1"
                    value={vinculandoAdmin.admin_id}
                    onChange={(e) => setVinculandoAdmin({ ...vinculandoAdmin, admin_id: e.target.value })}
                  >
                    <option value="">Selecione um admin...</option>
                    {todosAdmins.filter(a => !adminsEmpresa.find(ae => ae.id === a.id)).map(a => (
                      <option key={a.id} value={a.id}>{a.nome || a.email} ({a.role})</option>
                    ))}
                  </Select>
                  <Select
                    containerClassName="w-28"
                    value={vinculandoAdmin.role}
                    onChange={(e) => setVinculandoAdmin({ ...vinculandoAdmin, role: e.target.value })}
                  >
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="operator">Operator</option>
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
