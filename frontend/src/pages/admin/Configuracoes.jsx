import React, { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ConfiguracaoMercadoPago from "../../components/admin/ConfiguracaoMercadoPago";
import PerfilEmpresa from "../../components/admin/PerfilEmpresa";
import { Button, Card } from "../../components/ui";
import { useFeedback } from "../../contexts/FeedbackContext";

const acoes = [
  { chave: "radius", titulo: "Limpar Usuários RADIUS", endpoint: "/api/limpeza/radius" },
  { chave: "pagamentos", titulo: "Limpar Pagamentos", endpoint: "/api/limpeza/pagamentos" },
  { chave: "lgpd", titulo: "Limpar Logins LGPD", endpoint: "/api/limpeza/lgpd" },
];

const abas = [
  { chave: "perfil", titulo: "Perfil da Empresa" },
  { chave: "limpeza", titulo: "Limpeza Avançada" },
  { chave: "mercado", titulo: "Mercado Pago" },
];

export default function Configuracoes() {
  const { showError, showSuccess } = useFeedback();
  const [aba, setAba] = useState("perfil");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("admin_token");

  const executarAcao = async (acao) => {
    setLoading(true);
    try {
      const res = await fetch(acao.endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        const erroTexto = contentType?.includes("application/json")
          ? (await res.json()).message
          : await res.text();
        throw new Error(erroTexto || "Erro desconhecido.");
      }

      const data = await res.json();
      showSuccess(data.message);
    } catch (err) {
      showError("Erro ao executar ação: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setModal(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-6">Configurações</h1>

      <div className="flex border-b border-gray-800 mb-4">
        {abas.map((a) => (
          <button
            key={a.chave}
            onClick={() => setAba(a.chave)}
            className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors cursor-pointer ${
              aba === a.chave ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {a.titulo}
          </button>
        ))}
      </div>

      {aba === "perfil" && <PerfilEmpresa />}

      {aba === "limpeza" && (
        <div className="space-y-4">
          {acoes.map((acao) => (
            <Card key={acao.chave} className="p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{acao.titulo}</h2>
                <p className="text-sm text-gray-500">Esta ação é irreversível. Use com cautela.</p>
              </div>
              <Button variant="danger" onClick={() => setModal(acao)}>
                Executar
              </Button>
            </Card>
          ))}
        </div>
      )}

      {aba === "mercado" && <ConfiguracaoMercadoPago />}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirmar Ação</h2>
            <p className="mb-6">Tem certeza que deseja <strong>{modal.titulo}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button variant="danger" loading={loading} onClick={() => executarAcao(modal)}>
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
