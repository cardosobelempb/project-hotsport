import React, { useEffect, useState } from "react";
import { redirecionarHotspot } from "../../utils/hotspotRedirect";
import PublicBanners from "../../components/public/PublicBanners";
import SaldoAcessoCard from "../../components/public/SaldoAcessoCard";

// Exibida pelo /hotspot/redirect quando o cliente reconecta ao WiFi e ainda
// tem saldo de tempo diario: mostra o tempo restante e conecta direto, sem
// passar de novo pelo portal de cadastro/planos.
export default function AcessoAtivo() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [saldo, setSaldo] = useState(null); // null=carregando, false=sem saldo, obj=ok
  const [conectando, setConectando] = useState(false);
  const [erro, setErro] = useState("");

  const urlPortal = () => {
    const mikrotikId = params.get("mikrotik_id");
    const qs = new URLSearchParams(window.location.search);
    qs.set("saldo_visto", "1");
    return `/hotspot/redirect/${mikrotikId}?${qs.toString()}`;
  };

  useEffect(() => {
    const mac = params.get("mac");
    const mikrotikId = params.get("mikrotik_id");
    if (!mac || !mikrotikId) {
      window.location.href = urlPortal();
      return;
    }
    fetch(`/api/reconexao/saldo?mac=${encodeURIComponent(mac)}&mikrotik_id=${encodeURIComponent(mikrotikId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.tem_saldo) {
          setSaldo(data);
        } else {
          // saldo acabou entre o redirect e o carregamento — segue pro portal normal
          window.location.href = urlPortal();
        }
      })
      .catch(() => { window.location.href = urlPortal(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConectar = async () => {
    if (!saldo) return;
    setErro("");
    setConectando(true);
    try {
      // Re-cria o usuario local no hotspot do MikroTik antes de redirecionar
      // (RADIUS sozinho nao basta nesse ambiente — ver reconexaoController.reconectar).
      // A propaganda (se o portal tiver) já foi exibida antes desta tela, no
      // pré-portal do /hotspot/redirect — aqui conecta direto, sem repetir o anúncio.
      const r = await fetch("/api/reconexao/reconectar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac: params.get("mac"), mikrotik_id: params.get("mikrotik_id") }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        setErro(data.message || "Não foi possível reconectar. Tente novamente.");
        setConectando(false);
        return;
      }
      redirecionarHotspot(data.gateway, data.username, data.password, 300);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setConectando(false);
    }
  };

  return (
    <PublicBanners
      pagina="acesso_ativo"
      empresaId={params.get("empresa_id") || ""}
      className="text-white bg-gradient-to-br from-gray-800 via-gray-900 to-black"
      contentClassName="flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-md">
        {saldo === null ? (
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-gray-300">Verificando seu acesso...</p>
          </div>
        ) : saldo ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              {saldo.empresa_logo ? (
                <img src={saldo.empresa_logo} alt="Logo" className="max-h-20 mx-auto mb-6" />
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-full mb-4 border border-green-400/30">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <h1 className="text-3xl font-bold mb-2">
                {saldo.nome ? `Bem-vindo de volta, ${String(saldo.nome).split(" ")[0]}!` : "Bem-vindo de volta!"}
              </h1>
              <p className="text-gray-300 text-sm">Você ainda tem tempo de acesso disponível hoje{saldo.empresa_nome ? ` na rede ${saldo.empresa_nome}` : ""}.</p>
            </div>

            <SaldoAcessoCard
              saldo={saldo}
              onConectar={handleConectar}
              conectando={conectando}
              urlEscape={urlPortal()}
              erro={erro}
            />
          </>
        ) : null}
      </div>
    </PublicBanners>
  );
}
