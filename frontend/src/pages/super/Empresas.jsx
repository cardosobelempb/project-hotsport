import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";
import { Plus, LogIn, Pencil, Trash2 } from "lucide-react";
import { Button, Input, Card } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";

export default function Empresas() {
  const { isSuperAdmin } = useAuth();
  const { confirm } = useFeedback();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "" });

  const token = localStorage.getItem("admin_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/admin");
      return;
    }
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const res = await fetch("/api/empresas", { headers });
      if (res.ok) setEmpresas(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { pageData, page, setPage, totalPages, total } = usePagination(empresas, 12);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/empresas/${editId}` : "/api/empresas";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (res.ok) {
        setShowModal(false);
        setEditId(null);
        setForm({ nome: "", cnpj: "", email: "", telefone: "" });
        fetchEmpresas();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (empresa) => {
    setEditId(empresa.id);
    setForm({ nome: empresa.nome, cnpj: empresa.cnpj || "", email: empresa.email, telefone: empresa.telefone || "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Excluir empresa", message: "Deseja realmente deletar esta empresa?", danger: true, confirmText: "Excluir" }))) return;
    try {
      await fetch(`/api/empresas/${id}`, { method: "DELETE", headers });
      fetchEmpresas();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-300 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/super" className="text-gray-500 hover:text-gray-300 text-sm mb-2 inline-block">
              &larr; Voltar ao Super Admin
            </Link>
            <h1 className="text-2xl font-bold text-white">Gerenciar Empresas</h1>
          </div>
          <Button
            icon={Plus}
            className="!bg-green-600 hover:!bg-green-500"
            onClick={() => { setEditId(null); setForm({ nome: "", cnpj: "", email: "", telefone: "" }); setShowModal(true); }}
          >
            Nova Empresa
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : (
          <>
          <div className="space-y-3">
            {pageData.map((e) => (
              <Card key={e.id} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{e.nome}</p>
                  <p className="text-sm text-gray-500">{e.email} | slug: {e.slug} {e.cnpj && `| CNPJ: ${e.cnpj}`}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {e.total_mikrotiks || 0} mikrotiks | {e.total_planos || 0} planos | {e.total_admins || 0} admins
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/admin/${e.slug}`}>
                    <Button size="sm" variant="secondary" icon={LogIn} className="!text-blue-400 !border-blue-800/50 hover:!bg-blue-900/20">
                      Acessar
                    </Button>
                  </Link>
                  <Button size="sm" variant="secondary" icon={Pencil} className="!text-yellow-400 !border-yellow-800/50 hover:!bg-yellow-900/20" onClick={() => handleEdit(e)}>
                    Editar
                  </Button>
                  {e.slug !== 'default' && (
                    <Button size="sm" variant="danger" icon={Trash2} className="!bg-transparent !text-red-400 !border !border-red-800/50 hover:!bg-red-900/20" onClick={() => handleDelete(e.id)}>
                      Deletar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="empresas" />
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-white mb-4">
                {editId ? "Editar Empresa" : "Nova Empresa"}
              </h2>

              <div className="space-y-3">
                <Input label="Nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
      </div>
    </div>
  );
}
