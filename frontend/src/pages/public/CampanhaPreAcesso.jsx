import { useCallback, useEffect, useRef, useState } from "react";
import { mascaraCPF, validarCPF } from "../../utils/cpfUtils";
import { redirecionarHotspot } from "../../utils/hotspotRedirect";
import { Alert } from "../../components/ui";

// Etapas: "form" | "campanha" | "pronto" | "liberando" | "concluido"
const ETAPA = { FORM: "form", CAMPANHA: "campanha", PRONTO: "pronto", LIBERANDO: "liberando", CONCLUIDO: "concluido" };

function fmtDuracao(min) {
  if (!min || min <= 0) return "60 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return h === 1 ? "1 hora" : `${h} horas`;
  return `${h}h ${m}min`;
}

export default function CampanhaPreAcesso() {
  const [form, setForm] = useState({ nome: "", telefone: "", cpf: "", email: "", mac: "", ip: "" });
  const [mikrotikId, setMikrotikId] = useState("");
  const [portalId, setPortalId] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [cfg, setCfg] = useState({});
  const [cpfErro, setCpfErro] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [etapa, setEtapa] = useState(ETAPA.FORM);

  // dados pós-cadastro
  const [tokenAcesso, setTokenAcesso] = useState(null);
  const [acessoDuracaoMin, setAcessoDuracaoMin] = useState(60);
  const [campanhaItens, setCampanhaItens] = useState([]);
  const [campanhaDuracaoSeg, setCampanhaDuracaoSeg] = useState(30);
  const [campanhaModoContagem, setCampanhaModoContagem] = useState(false);

  // controle da campanha
  const [campanhaIdx, setCampanhaIdx] = useState(0);
  const [campanhaProgress, setCampanhaProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const videoRef = useRef(null);

  // dados após liberar
  const [acessoDados, setAcessoDados] = useState(null); // {gateway, username, password}

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setForm(prev => ({ ...prev, mac: params.get("mac") || "", ip: params.get("ip") || "" }));
    setMikrotikId(params.get("mikrotik_id") || "");
    setPortalId(params.get("portal_id") || "");
    const empId = params.get("empresa_id");
    setEmpresaId(empId || "");
    if (empId) {
      fetch(`/api/portal-config/campanha_pre_acesso?empresa_id=${empId}`)
        .then(r => r.json())
        .then(data => {
          setCfg(data);
          if (data.acesso_duracao_minutos) setAcessoDuracaoMin(data.acesso_duracao_minutos);
        })
        .catch(() => {});
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "telefone") {
      val = val.replace(/\D/g, "").slice(0, 11);
      val = val.replace(/(\d{2})(\d)/, "($1) $2");
      val = val.replace(/(\d{5})(\d)/, "$1-$2");
    }
    if (name === "cpf") {
      val = mascaraCPF(val);
      const nums = val.replace(/\D/g, "");
      if (nums.length === 11) setCpfErro(validarCPF(val) ? "" : "CPF inválido");
      else setCpfErro("");
    }
    setForm({ ...form, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    if (!form.nome.trim()) { setErro("Informe seu nome"); return; }
    if (form.cpf && !validarCPF(form.cpf)) { setCpfErro("CPF inválido"); return; }
    setCpfErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/campanha-pre-acesso/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, mikrotik_id: mikrotikId, portal_id: portalId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao cadastrar");

      setTokenAcesso(data.token);
      setAcessoDuracaoMin(data.acesso_duracao_minutos || 60);
      setCampanhaItens(data.campanha_itens || []);
      setCampanhaDuracaoSeg(data.campanha_duracao_segundos || 30);
      setCampanhaModoContagem(data.campanha_modo_contagem || false);
      setEtapa(ETAPA.CAMPANHA);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const liberarAcesso = useCallback(async () => {
    if (etapa === ETAPA.LIBERANDO || etapa === ETAPA.CONCLUIDO) return;
    setEtapa(ETAPA.LIBERANDO);
    try {
      const res = await fetch("/api/campanha-pre-acesso/liberar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenAcesso }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao liberar acesso");
      setAcessoDados(data);
      setEtapa(ETAPA.CONCLUIDO);
      if (data.gateway && data.username) {
        setTimeout(() => redirecionarHotspot(data.gateway, data.username, data.password), 2000);
      }
    } catch (err) {
      setErro(err.message);
      setEtapa(ETAPA.PRONTO);
    }
  }, [etapa, tokenAcesso]);

  // "Contratar um plano": ainda não chamamos /liberar (sem gateway/username
  // ainda), então navega direto pro cadastro do fluxo pago em vez de passar
  // pela EscolhaAcesso (que espera credenciais já liberadas).
  const handleContratarPlano = useCallback(() => {
    const params = new URLSearchParams({
      mac: form.mac || "",
      ip: form.ip || "",
      mikrotik_id: mikrotikId || "",
      empresa_id: empresaId || "",
    });
    if (portalId) params.set("portal_id", portalId);
    window.location.href = `/cadastro-cliente?${params.toString()}`;
  }, [form.mac, form.ip, mikrotikId, empresaId, portalId]);

  // ---- Lógica de campanha (similar ao CampanhaPlayer) ----
  const avançarCampanha = useCallback((nextIdx) => {
    setCampanhaProgress(0);
    startRef.current = null;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const idx = nextIdx !== undefined ? nextIdx : campanhaIdx + 1;
    if (idx >= campanhaItens.length) {
      setEtapa(ETAPA.PRONTO);
    } else {
      setCampanhaIdx(idx);
    }
  }, [campanhaIdx, campanhaItens.length]);

  const startImageTimer = useCallback((ms) => {
    startRef.current = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startRef.current) / ms, 1);
      setCampanhaProgress(p);
      if (p < 1) { rafRef.current = requestAnimationFrame(tick); }
      else { rafRef.current = null; avançarCampanha(); }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [avançarCampanha]);

  // Timer para modo contagem simples (sem itens de campanha)
  const [contagemRegressiva, setContagemRegressiva] = useState(null);
  useEffect(() => {
    if (etapa !== ETAPA.CAMPANHA) return;
    if (!campanhaModoContagem) return;
    setContagemRegressiva(campanhaDuracaoSeg);
    const interval = setInterval(() => {
      setContagemRegressiva(prev => {
        if (prev <= 1) { clearInterval(interval); setEtapa(ETAPA.PRONTO); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [etapa, campanhaModoContagem, campanhaDuracaoSeg]);

  // Inicia timer ao mudar de item (com itens de campanha)
  useEffect(() => {
    if (etapa !== ETAPA.CAMPANHA || campanhaModoContagem) return;
    if (campanhaItens.length === 0) { setEtapa(ETAPA.PRONTO); return; }
    if (campanhaIdx >= campanhaItens.length) return;
    const item = campanhaItens[campanhaIdx];
    setCampanhaProgress(0);
    startRef.current = null;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (item.tipo === "imagem") {
      startImageTimer((item.duracao_segundos || 5) * 1000);
    }
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [campanhaIdx, campanhaItens, etapa, campanhaModoContagem, startImageTimer, liberarAcesso]);

  const bgStyle = cfg.cor_fundo_1
    ? { background: `linear-gradient(135deg, ${cfg.cor_fundo_1}, ${cfg.cor_fundo_2 || cfg.cor_fundo_1})` }
    : undefined;
  const btnStyle = cfg.cor_botao ? { backgroundColor: cfg.cor_botao } : undefined;

  // ---- ETAPA: CAMPANHA com itens ----
  if (etapa === ETAPA.CAMPANHA && !campanhaModoContagem && campanhaItens.length > 0) {
    const item = campanhaItens[campanhaIdx] || campanhaItens[0];
    return (
      <div
        className="fixed inset-0 bg-black select-none"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          if (e.clientX - rect.left < rect.width / 2) {
            if (campanhaIdx > 0) avançarCampanha(campanhaIdx - 1);
          } else {
            avançarCampanha();
          }
        }}
        style={{ touchAction: "manipulation" }}
      >
        {/* Barra de progresso */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-2 pt-2">
          {campanhaItens.map((_, idx) => {
            const fill = idx < campanhaIdx ? 1 : idx === campanhaIdx ? campanhaProgress : 0;
            return (
              <div key={idx} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${fill * 100}%`, transition: "none" }} />
              </div>
            );
          })}
        </div>

        {/* Label topo */}
        <div className="absolute top-6 left-0 right-0 z-10 flex justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-white text-xs font-medium">Assista para liberar o acesso</span>
          </div>
        </div>

        {/* Mídia */}
        <div className="absolute inset-0 flex items-center justify-center">
          {item.tipo === "imagem" ? (
            <img key={item.id} src={item.arquivo_url} alt={item.titulo || ""} onError={avançarCampanha} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <video
              key={item.id} ref={videoRef} src={item.arquivo_url} autoPlay muted playsInline
              onTimeUpdate={() => { const v = videoRef.current; if (v?.duration) setCampanhaProgress(v.currentTime / v.duration); }}
              onEnded={avançarCampanha} onError={avançarCampanha}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Rodapé */}
        {(item.titulo || item.link_destino) && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-4 pb-8 pt-12">
            {item.titulo && <p className="text-white text-base font-semibold mb-2 drop-shadow">{item.titulo}</p>}
            {item.link_destino && (
              <a href={item.link_destino} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                className="inline-block bg-white text-black text-sm font-semibold px-4 py-2 rounded-full shadow">
                Saiba mais
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---- ETAPA: CAMPANHA modo contagem simples ----
  if (etapa === ETAPA.CAMPANHA && campanhaModoContagem) {
    const progressPct = contagemRegressiva != null ? ((campanhaDuracaoSeg - contagemRegressiva) / campanhaDuracaoSeg) * 100 : 0;
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center text-white px-6 ${!bgStyle ? "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" : ""}`} style={bgStyle}>
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border border-white/20 mb-6">
            <svg className="w-10 h-10 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Aguarde um momento</h2>
          <p className="text-white/60 text-sm mb-8">Seu acesso será liberado em instantes</p>

          {/* Barra de progresso */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-4xl font-bold text-yellow-300 mb-2">
            {contagemRegressiva != null ? contagemRegressiva : campanhaDuracaoSeg}
          </p>
          <p className="text-white/50 text-sm">segundos restantes</p>
        </div>
      </div>
    );
  }

  // ---- ETAPA: PRONTO (campanha/contagem terminou — aguarda clique) ----
  if (etapa === ETAPA.PRONTO) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center text-white px-4 ${!bgStyle ? "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" : ""}`} style={bgStyle}>
        <div className="w-full max-w-sm bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-bold mb-2">Tudo pronto!</p>
          <p className="text-gray-400 text-sm mb-6">
            Conecte agora com anúncios, ou contrate um plano pago sem interrupções.
          </p>
          <button
            onClick={liberarAcesso}
            className="w-full bg-green-500 text-black font-semibold py-3 rounded-full shadow hover:bg-green-400 active:bg-green-600 transition-colors mb-3"
          >
            Conectar agora
          </button>
          <button
            onClick={handleContratarPlano}
            className="w-full bg-white/10 border border-white/15 text-white font-semibold py-3 rounded-full hover:bg-white/15 active:bg-white/20 transition-colors"
          >
            Contratar um plano
          </button>
        </div>
      </div>
    );
  }

  // ---- ETAPA: LIBERANDO ----
  if (etapa === ETAPA.LIBERANDO) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center text-white ${!bgStyle ? "bg-gradient-to-br from-green-800 via-emerald-900 to-teal-900" : ""}`} style={bgStyle}>
        <div className="text-center px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border border-white/20 mb-6 animate-pulse">
            <svg className="w-10 h-10 text-green-300 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Liberando acesso...</h2>
          {erro && <p className="mt-4 text-red-300 text-sm">{erro}</p>}
        </div>
      </div>
    );
  }

  // ---- ETAPA: CONCLUÍDO ----
  if (etapa === ETAPA.CONCLUIDO) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center text-white ${!bgStyle ? "bg-gradient-to-br from-green-700 via-emerald-800 to-teal-900" : ""}`} style={bgStyle}>
        <div className="text-center px-6 max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border border-white/20 mb-6">
            <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Acesso Liberado!</h2>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 mb-4 border border-white/20">
            <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-yellow-200 font-semibold">{fmtDuracao(acessoDuracaoMin)} de internet</span>
          </div>
          <p className="text-white/60 text-sm">Conectando automaticamente...</p>
        </div>
      </div>
    );
  }

  // ---- ETAPA: FORMULÁRIO ----
  return (
    <div
      className={`min-h-screen flex items-center justify-center text-white px-4 py-8 ${!bgStyle ? "bg-gradient-to-br from-indigo-800 via-purple-900 to-pink-950" : ""}`}
      style={bgStyle}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {cfg.logo_url ? (
            <img src={cfg.logo_url} alt="Logo" className="max-h-16 mx-auto mb-4" />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">{cfg.titulo || "WiFi Grátis"}</h1>
          <p className="text-white/70 text-sm">{cfg.subtitulo || "Cadastre-se para acessar a internet"}</p>

          {/* Badge de acesso */}
          <div className="inline-flex items-center gap-2 mt-4 bg-green-400/20 border border-green-400/30 rounded-full px-5 py-2">
            <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
            </svg>
            <span className="text-green-200 font-medium text-sm">{fmtDuracao(acessoDuracaoMin)} de acesso após cadastro</span>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl">
          {erro && (
            <Alert variant="error" className="mb-5">
              {erro}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <input type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" required className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm" />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </span>
                <input type="text" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm" />
              </div>
            </div>

            {/* CPF (opcional) */}
            {cfg.exibir_cpf !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                  </span>
                  <input type="text" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00"
                    className={`w-full border rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:border-transparent transition-all text-sm ${cpfErro ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-purple-400"}`}
                  />
                </div>
                {cpfErro && <p className="text-red-500 text-xs mt-1">{cpfErro}</p>}
              </div>
            )}

            {/* MAC/IP */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">MAC (Automático)</label>
                <input type="text" value={form.mac} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-400 text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">IP (Automático)</label>
                <input type="text" value={form.ip} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-400 text-xs" />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={btnStyle || { background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              {enviando ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Aguarde...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {cfg.texto_botao || "Cadastrar e Acessar"}
                </>
              )}
            </button>
          </form>

          <p className="mt-5 pt-5 border-t border-gray-100 text-xs text-gray-400 text-center leading-relaxed">
            {cfg.texto_rodape || "Ao continuar você concorda com os termos de uso da rede."}
          </p>
        </div>
      </div>
    </div>
  );
}
