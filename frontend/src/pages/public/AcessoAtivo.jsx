import React, { useEffect, useState } from "react";
import { redirecionarHotspot } from "../../utils/hotspotRedirect";
import PublicBanners from "../../components/public/PublicBanners";

function fmtTempo(segundos) {
  const s = Math.max(0, Number(segundos) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  if (m > 0) return `${m} minutos`;
  return `${s} segundos`;
}

// Exibida pelo /hotspot/redirect quando o cliente reconecta ao WiFi e ainda
// tem saldo de tempo diario: mostra o tempo restante e conecta direto, sem
// passar de novo pelo portal de cadastro/planos.
export default function AcessoAtivo() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [saldo, setSaldo] = useState(null); // null=carregando, false=sem saldo, obj=ok
  const [conectando, setConectando] = useState(false);

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

  const handleConectar = () => {
    if (!saldo?.gateway || !saldo?.username) return;
    setConectando(true);
    // A propaganda (se o portal tiver) já foi exibida antes desta tela, no
    // pré-portal do /hotspot/redirect — aqui conecta direto, sem repetir o anúncio.
    redirecionarHotspot(saldo.gateway, saldo.username, saldo.password, 300);
  };

  const pctRestante = saldo?.max_diario_segundos
    ? Math.min(100, Math.round((saldo.restante_segundos / saldo.max_diario_segundos) * 100))
    : 0;

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

            {/* Card */}
            <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Tempo restante hoje</p>
                <p className="text-4xl font-bold text-green-600">{fmtTempo(saldo.restante_segundos)}</p>
                {saldo.usado_hoje_segundos > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    já utilizado: {fmtTempo(saldo.usado_hoje_segundos)} de {fmtTempo(saldo.max_diario_segundos)}
                  </p>
                )}
              </div>

              {/* Barra de progresso do saldo */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div
                  className={`h-2.5 rounded-full transition-all ${pctRestante > 30 ? "bg-green-500" : "bg-yellow-500"}`}
                  style={{ width: `${pctRestante}%` }}
                />
              </div>

              <button
                onClick={handleConectar}
                disabled={conectando}
                className="w-full text-white py-3.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {conectando ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15" />
                    </svg>
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    Conectar agora
                  </>
                )}
              </button>

              <div className="mt-5 text-center">
                <a
                  href={urlPortal()}
                  className="text-sm text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                >
                  Não é você? Acessar o portal
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  🔒 Seu acesso é identificado automaticamente por este dispositivo.
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </PublicBanners>
  );
}
