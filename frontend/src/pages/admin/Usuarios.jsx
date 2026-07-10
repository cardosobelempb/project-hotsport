import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, IconButton, Input, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";

export default function Usuarios() {
  const { showError, confirm } = useFeedback();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ email: "", senha: "" });
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("admin_token");

  const carregarUsuarios = async () => {
    try {
      const res = await fetch("/api/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Erro ao carregar admins:", err);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const { pageData, page, setPage, totalPages, total } = usePagination(usuarios, 12);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editando ? `/api/admins/${editando}` : "/api/admins";
      const method = editando ? "PUT" : "POST";

      const payload = { email: form.email };
      if (!editando || form.senha) payload.senha = form.senha;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar usuário");

      setShowModal(false);
      setEditando(null);
      setForm({ email: "", senha: "" });
      carregarUsuarios();
    } catch (err) {
      showError("Erro ao salvar usuário");
    }
  };

  const handleEditar = (admin) => {
    setEditando(admin.id);
    setForm({ email: admin.email, senha: "" });
    setShowModal(true);
  };

  const handleRemover = async (id) => {
    if (!(await confirm({ title: "Remover administrador", message: "Deseja remover este administrador?", danger: true, confirmText: "Remover" }))) return;
    try {
      await fetch(`/api/admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      carregarUsuarios();
    } catch (err) {
      showError("Erro ao remover usuário");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <Button
          icon={Plus}
          onClick={() => {
            setEditando(null);
            setForm({ email: "", senha: "" });
            setShowModal(true);
          }}
        >
          Novo Admin
        </Button>
      </div>

      <Card className="p-4">
        <Table>
          <Table.Head>
            <Table.HeadCell>ID</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell hideOn="md">Criado</Table.HeadCell>
            <Table.HeadCell>Ações</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {pageData.length === 0 ? (
              <Table.Empty colSpan={4} />
            ) : pageData.map((a) => (
              <Table.Row key={a.id}>
                <Table.Cell>{a.id}</Table.Cell>
                <Table.Cell>{a.email}</Table.Cell>
                <Table.Cell hideOn="md">{new Date(a.created_at).toLocaleString()}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <IconButton icon={Pencil} title="Editar" onClick={() => handleEditar(a)} />
                    <IconButton icon={Trash2} variant="danger" title="Remover" onClick={() => handleRemover(a.id)} />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="administradores" />

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editando ? "Editar Admin" : "Criar Admin"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label={<>Senha {editando && <span className="text-gray-400">(deixe em branco para manter)</span>}</>}
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
