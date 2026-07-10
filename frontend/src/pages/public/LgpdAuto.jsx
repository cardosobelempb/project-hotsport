// src/pages/LgpdAuto.jsx
import React, { useEffect, useState } from "react";
import { conectarComPropaganda } from "../../utils/hotspotRedirect";
import { Alert } from "../../components/ui";

export default function LgpdAuto() {
  const [dados, setDados] = useState({ cpf: "", mac: "", ip: "", email: "", nome: "", telefone: "" });
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cpf = params.get("cpf");
    const mac = params.get("mac");
    const ip = params.get("ip");
    const aceite = params.get("aceite");
    const email = params.get("email");
    const nome = params.get("nome");
    const telefone = params.get("telefone");
    const mikrotik_id = params.get("mikrotik_id");
    const portal_id = params.get("portal_id");
    const empresa_id = params.get("empresa_id");

    setDados({ cpf, mac, ip, email, nome, telefone });

    const autenticar = async () => {
      try {
        const res = await fetch("/api/lgpd/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpf, mac, ip, aceite, email, nome, telefone, mikrotik_id })
        });

        const data = await res.json();
        if (res.ok && data.gateway && data.username) {
          // Ordem do portal grátis: cadastro → propaganda → status
          conectarComPropaganda({
            portalId: portal_id,
            gateway: data.gateway,
            username: data.username,
            password: data.password,
            mac,
            ip,
            mikrotikId: mikrotik_id,
            empresaId: empresa_id,
          });
        } else {
          setErro(data.message || "Erro ao autenticar.");
        }
      } catch {
        setErro("Erro de conexão. Verifique sua rede e tente novamente.");
      }
    };

    setTimeout(autenticar, 3000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Autenticando seu acesso...</h1>
        <p className="text-gray-600 mb-4">Aguarde um momento enquanto processamos seu login.</p>
        {erro && (
          <Alert variant="error" className="mb-4 text-left">
            {erro}
          </Alert>
        )}
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Nome:</strong> {dados.nome}</p>
          <p><strong>Telefone:</strong> {dados.telefone}</p>
          <p><strong>CPF:</strong> {dados.cpf}</p>
          <p><strong>Email:</strong> {dados.email}</p>
          <p><strong>MAC:</strong> {dados.mac}</p>
          <p><strong>IP:</strong> {dados.ip}</p>
        </div>
        {!erro && (
          <div className="loader mt-6 mx-auto border-4 border-gray-300 border-t-blue-500 rounded-full w-8 h-8 animate-spin" />
        )}
      </div>
    </div>
  );
}
