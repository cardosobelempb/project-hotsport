import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicBanners from "../../components/public/PublicBanners";
import SaldoAcessoCard from "../../components/public/SaldoAcessoCard";
import { redirecionarHotspot } from "../../utils/hotspotRedirect";

function fmtPreco(v) {
  // valor vem em centavos do banco (ex: 500 = R$ 5,00)
  return Number(v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDuracao(min) {
  if (!min) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export default function PortalReconexao() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const mac = params.get("mac") || "";
  const ip = params.get("ip") || "";
  const mikrotikId = params.get("mikrotik_id") || "";
  const empresaId = params.get("empresa_id") || "";
  const portalId = params.get("portal_id") || "";
  // tempo_esgotado = quota diaria gratuita consumida (veio do /hotspot/redirect)
  const tempoEsgotado = params.get("motivo") === "tempo_esgotado";

  const urlPortalNormal = () => {
    const qs = new URLSearchParams(window.location.search);
    qs.set("saldo_visto", "1");
    qs.delete("motivo");
    return `/hotspot/redirect/${mikrotikId}?${qs.toString()}`;
  };

  const [usuario, setUsuario] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState({});
  const [saldo, setSaldo] = useState(null); // null enquanto carrega/sem saldo, objeto quando tem_saldo
  const [conectando, setConectando] = useState(false);
  const [erroConexao, setErroConexao] = useState("");

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      try {
        // Buscar usuário cadastrado pelo MAC
        if (mac && empresaId) {
          const r = await fetch(
            `/api/reconexao/buscar-usuario?mac=${encodeURIComponent(mac)}&empresa_id=${encodeURIComponent(empresaId)}`
          );
          const u = await r.json();
          setUsuario(u);
        }

        // Checar saldo de tempo diario direto aqui — nao depende do pre-check
        // do /hotspot/redirect ter enviado o mac corretamente. Se ainda tem
        // saldo, oferece "continuar gratis" junto com os planos pagos.
        if (mac && mikrotikId) {
          fetch(
            `/api/reconexao/saldo?mac=${encodeURIComponent(mac)}&mikrotik_id=${encodeURIComponent(mikrotikId)}`
          )
            .then((r) => r.json())
            .then((data) => setSaldo(data?.tem_saldo ? data : null))
            .catch(() => setSaldo(null));
        }

        // Buscar planos pagos disponíveis — sempre priorizando o mikrotik do
        // cliente (planos de outros mikrotiks da empresa nao servem, pois o
        // gateway de liberacao final e resolvido a partir do mikrotik do plano)
        const planosUrl = mikrotikId
          ? `/api/planos-publicos?mikrotik_id=${mikrotikId}`
          : empresaId
          ? `/api/planos-publicos?empresa_id=${empresaId}`
          : null;

        if (planosUrl) {
          const rp = await fetch(planosUrl);
          const ps = await rp.json();
          setPlanos(
            Array.isArray(ps)
              ? ps.filter((p) => parseFloat(p.valor) > 0)
              : []
          );
        }

        // Config visual do portal
        if (empresaId) {
          fetch(`/api/portal-config/reconexao?empresa_id=${empresaId}`)
            .then((r) => r.json())
            .then(setCfg)
            .catch(() => {});
        }
      } catch (err) {
        console.error("[PortalReconexao]", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []); // eslint-disable-line

  const handleContinuarGratis = async () => {
    if (!saldo) return;
    setErroConexao("");
    setConectando(true);
    try {
      // Re-cria o usuario local no hotspot do MikroTik antes de redirecionar
      // (RADIUS sozinho nao basta nesse ambiente — ver reconexaoController.reconectar).
      const r = await fetch("/api/reconexao/reconectar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac, mikrotik_id: mikrotikId }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        setErroConexao(data.message || "Não foi possível reconectar. Tente novamente.");
        setConectando(false);
        return;
      }
      redirecionarHotspot(data.gateway, data.username, data.password, 300);
    } catch {
      setErroConexao("Falha de conexão. Tente novamente.");
      setConectando(false);
    }
  };

  const selecionarPlano = (plano) => {
    const cpf = usuario?.cpf || "";
    const clienteId = usuario?.cliente_id || "";
    const qs = new URLSearchParams({
      mac,
      ip,
      mikrotik_id: mikrotikId,
      portal_id: portalId,
      ...(cpf && { cpf }),
      ...(clienteId && { cliente_id: String(clienteId) }),
    }).toString();
    navigate(`/pagamento/${plano.id}?${qs}`);
  };

  const bgStyle = cfg.cor_fundo_1
    ? {
        background: `linear-gradient(135deg, ${cfg.cor_fundo_1}, ${
          cfg.cor_fundo_2 || cfg.cor_fundo_1
        })`,
      }
    : undefined;

  const nome = usuario?.nome || "";
  const primeiroNome = nome.split(" ")[0];

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center text-white ${
          !bgStyle
            ? "bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-950"
            : ""
        }`}
        style={bgStyle}
      >
        <div className="text-center">
          <svg
            className="w-10 h-10 animate-spin mx-auto mb-4 text-purple-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <p className="text-purple-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <PublicBanners
      pagina="reconexao"
      empresaId={empresaId}
      portalId={portalId}
      mikrotikId={mikrotikId}
      className={`text-white ${
        !bgStyle
          ? "bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-950"
          : ""
      }`}
      style={bgStyle}
      contentClassName="px-4 py-8"
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {cfg.logo_url ? (
            <img
              src={cfg.logo_url}
              alt="Logo"
              className="max-h-16 mx-auto mb-4"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20 mr-2">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0"
                />
              </svg>
            </div>
          )}

          {/* Ícone de tempo esgotado */}
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-4 py-1.5 text-sm text-red-300 mb-4">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {tempoEsgotado ? "Seu tempo de hoje acabou" : "Seu acesso expirou"}
          </div>

          {usuario?.encontrado ? (
            <>
              <h1 className="text-3xl font-bold mb-2">
                {cfg.titulo ||
                  `Olá${primeiroNome ? `, ${primeiroNome}` : ""}!`}
              </h1>
              <p className="text-purple-200 text-sm">
                {cfg.subtitulo ||
                  (tempoEsgotado
                    ? "Você usou todo o seu tempo gratuito de hoje. Continue navegando com um dos planos abaixo, ou volte amanhã para um novo acesso grátis."
                    : "Renove seu acesso escolhendo um dos planos abaixo.")}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">
                {cfg.titulo || "Renovar Acesso Wi-Fi"}
              </h1>
              <p className="text-purple-200 text-sm">
                {cfg.subtitulo ||
                  "Escolha um plano para continuar navegando."}
              </p>
            </>
          )}
        </div>

        {/* Saldo de tempo diario ainda disponivel: opcao de continuar gratis */}
        {saldo?.tem_saldo && (
          <div className="mb-8">
            <SaldoAcessoCard
              saldo={saldo}
              onConectar={handleContinuarGratis}
              conectando={conectando}
              erro={erroConexao}
            />
          </div>
        )}

        {planos.length > 0 && (
          <p className="text-center text-purple-300 text-sm font-medium mb-4">
            {saldo?.tem_saldo ? "ou assine um plano" : "Planos disponíveis"}
          </p>
        )}

        {/* Cards de planos */}
        {planos.length === 0 ? (
          saldo?.tem_saldo ? null : (
            <div className="text-center py-12 text-purple-300">
              <svg
                className="w-12 h-12 mx-auto mb-3 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">Nenhum plano disponível no momento.</p>
              <p className="text-xs mt-1 text-purple-400">
                Fale com o responsável pela rede.
              </p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {planos.map((plano) => (
              <button
                key={plano.id}
                onClick={() => selecionarPlano(plano)}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-purple-400 rounded-2xl p-5 text-left transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors truncate">
                      {plano.nome}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-purple-200">
                      {plano.velocidade_down && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          {plano.velocidade_down}M
                        </span>
                      )}
                      {plano.duracao_minutos && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {fmtDuracao(plano.duracao_minutos)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-white">
                      {fmtPreco(plano.valor)}
                    </p>
                    <div className="mt-2 px-4 py-1.5 bg-purple-600 group-hover:bg-purple-500 rounded-xl text-xs font-semibold text-white transition-colors inline-block">
                      Assinar →
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Link de escape: nao e a pessoa / quer usar outro cadastro */}
        {tempoEsgotado && mikrotikId && (
          <p className="text-center mt-6">
            <a
              href={urlPortalNormal()}
              className="text-sm text-purple-300 underline hover:text-white transition-colors"
            >
              Não é você? Acessar o portal
            </a>
          </p>
        )}

        {/* Rodapé */}
        <p className="text-center text-xs text-purple-400 mt-8">
          🔒 Pagamento seguro · Acesso imediato após confirmação
        </p>
      </div>
    </PublicBanners>
  );
}
