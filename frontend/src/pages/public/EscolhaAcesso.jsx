import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { redirecionarHotspot } from "../../utils/hotspotRedirect";
import PublicBanners from "../../components/public/PublicBanners";

// Exibida apos o cadastro (LGPD/Lead/Trial) quando o portal tem a opcao
// "oferecer planos pagos" ativada: o visitante escolhe entre continuar
// de graca (com anuncio, ja exibido antes do cadastro) ou comprar um
// plano pago sem anuncios.
export default function EscolhaAcesso() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gateway = searchParams.get("gateway");
  const username = searchParams.get("username");
  const password = searchParams.get("password");
  const clienteId = searchParams.get("cliente_id");
  const portalId = searchParams.get("portal_id");
  const mac = searchParams.get("mac") || "";
  const ip = searchParams.get("ip") || "";
  const mikrotikId = searchParams.get("mikrotik_id") || "";
  const empresaId = searchParams.get("empresa_id") || "";

  const [planos, setPlanos] = useState([]);
  const [conectando, setConectando] = useState(false);

  useEffect(() => {
    const carregarPlanos = async () => {
      try {
        const params = new URLSearchParams();
        if (mikrotikId) params.set("mikrotik_id", mikrotikId);
        else if (empresaId) params.set("empresa_id", empresaId);

        const res = await fetch(`/api/planos-publicos?${params.toString()}`);
        const data = await res.json();
        const pagos = data.filter((p) => p.ativo === 1 && Number(p.valor) > 0);
        setPlanos(pagos);
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
      }
    };
    carregarPlanos();
  }, [mikrotikId, empresaId]);

  const handleContinuarGratis = () => {
    setConectando(true);
    redirecionarHotspot(gateway, username, password);
  };

  const handleEscolherPlano = (planoId) => {
    const params = new URLSearchParams({
      mac, ip, mikrotik_id: mikrotikId, empresa_id: empresaId,
      cliente_id: clienteId || "",
    });
    if (portalId) params.set("portal_id", portalId);
    navigate(`/pagamento/${planoId}?${params.toString()}`);
  };

  return (
    <PublicBanners
      pagina="escolha_acesso"
      empresaId={empresaId}
      portalId={portalId}
      mikrotikId={mikrotikId}
      className="text-white bg-gradient-to-br from-gray-800 via-gray-900 to-black"
      contentClassName="flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Como você quer navegar?</h1>
          <p className="text-gray-300 text-sm">
            Continue de graça assistindo aos nossos anúncios, ou escolha um plano pago sem interrupções.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opção grátis */}
          <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Continuar Grátis</h2>
              <p className="text-sm text-gray-500 mb-6">
                Acesso liberado agora mesmo, com anúncios exibidos periodicamente.
              </p>
            </div>
            <button
              onClick={handleContinuarGratis}
              disabled={conectando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all disabled:opacity-60"
            >
              {conectando ? "Conectando..." : "Continuar Grátis"}
            </button>
          </div>

          {/* Opção planos pagos */}
          <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-xl mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Ver Planos Pagos</h2>
              <p className="text-sm text-gray-500 mb-4">
                Navegue sem anúncios, com mais velocidade e tempo de conexão.
              </p>

              {planos.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum plano pago disponível no momento.</p>
              ) : (
                <div className="space-y-3">
                  {planos.map((plano) => (
                    <button
                      key={plano.id}
                      onClick={() => handleEscolherPlano(plano.id)}
                      className="w-full text-left border border-gray-200 hover:border-green-400 hover:bg-green-50 rounded-xl p-4 transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{plano.nome}</p>
                        <p className="text-xs text-gray-500">{plano.duracao_minutos} min · {plano.velocidade_down} Mbps</p>
                      </div>
                      <p className="font-bold text-green-600 whitespace-nowrap">
                        {Number(parseFloat(plano.valor) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicBanners>
  );
}
