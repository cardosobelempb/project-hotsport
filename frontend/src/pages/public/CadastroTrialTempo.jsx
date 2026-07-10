import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validarCPF, mascaraCPF } from "../../utils/cpfUtils";
import { redirecionarHotspot } from "../../utils/hotspotRedirect";
import { Alert } from "../../components/ui";
import PublicBanners from "../../components/public/PublicBanners";

export default function CadastroTrialTempo() {
  const navigate = useNavigate();
  const empresaId = new URLSearchParams(window.location.search).get("empresa_id") || "";
  const [form, setForm] = useState({ nome: "", telefone: "", cpf: "", email: "", mac: "", ip: "" });
  const [mikrotikId, setMikrotikId] = useState("");
  const [portalId, setPortalId] = useState("");
  const [cfg, setCfg] = useState({});
  const [cpfErro, setCpfErro] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(null); // { gateway, username, password, trial_duracao_minutos }
  const [expirado, setExpirado] = useState(null); // { destino_url }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setForm(prev => ({ ...prev, mac: params.get("mac") || "", ip: params.get("ip") || "" }));
    setMikrotikId(params.get("mikrotik_id") || "");
    setPortalId(params.get("portal_id") || "");
    const empId = params.get("empresa_id");
    if (empId) {
      fetch(`/api/portal-config/trial_tempo?empresa_id=${empId}`)
        .then(r => r.json()).then(setCfg).catch(() => {});
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
      const res = await fetch("/api/trial-tempo/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, mikrotik_id: mikrotikId, portal_id: portalId }),
      });
      const data = await res.json();

      if (data.trial_expirado) {
        setExpirado(data);
        return;
      }
      if (!res.ok) throw new Error(data.message || "Erro ao cadastrar");
      if (data.gateway && data.username) {
        const params = new URLSearchParams(window.location.search);
        const empId = params.get("empresa_id") || "";
        if (data.oferece_planos) {
          const qs = new URLSearchParams({
            gateway: data.gateway,
            username: data.username,
            password: data.password || "",
            cliente_id: data.cliente_id || "",
            portal_id: portalId || "",
            mac: form.mac,
            ip: form.ip,
            mikrotik_id: mikrotikId,
            empresa_id: empId,
          });
          navigate(`/escolha-acesso?${qs.toString()}`);
        } else {
          setSucesso(data);
          // Propaganda (se houver) já foi exibida antes do cadastro — conecta direto
          redirecionarHotspot(data.gateway, data.username, data.password, 1800);
        }
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const irParaDestino = () => {
    const params = new URLSearchParams(window.location.search);
    const url = expirado?.destino_url || "/planos-cliente";
    const sep = url.includes("?") ? "&" : "?";
    window.location.href = `${url}${sep}${params.toString()}`;
  };

  const bgStyle = cfg.cor_fundo_1
    ? { background: `linear-gradient(135deg, ${cfg.cor_fundo_1}, ${cfg.cor_fundo_2 || cfg.cor_fundo_1})` }
    : undefined;
  const btnStyle = cfg.cor_botao ? { backgroundColor: cfg.cor_botao } : undefined;
  const duracao = cfg.trial_duracao_minutos || 3;

  // Tela: trial expirado
  if (expirado) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-white px-4 ${!bgStyle ? "bg-gradient-to-br from-orange-800 via-rose-900 to-purple-950" : ""}`} style={bgStyle}>
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6 border border-white/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Período de Teste Encerrado</h1>
          <p className="text-white/70 text-base mb-8">Seu acesso gratuito expirou. Escolha um plano para continuar navegando.</p>
          <button
            onClick={irParaDestino}
            className="w-full max-w-xs mx-auto py-4 rounded-xl font-semibold text-white text-lg shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={btnStyle || { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Ver Planos Disponíveis
          </button>
        </div>
      </div>
    );
  }

  // Tela: acesso liberado com sucesso
  if (sucesso) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-white px-4 ${!bgStyle ? "bg-gradient-to-br from-green-700 via-emerald-800 to-teal-900" : ""}`} style={bgStyle}>
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6 border border-white/20 animate-pulse">
            <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Conectando...</h1>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-6 py-3 mb-6 border border-white/20">
            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg font-semibold text-yellow-200">
              {sucesso.trial_duracao_minutos} minutos grátis!
            </span>
          </div>
          <p className="text-white/60 text-sm">Redirecionando para a internet...</p>
        </div>
      </div>
    );
  }

  return (
    <PublicBanners
      pagina="trial_tempo"
      empresaId={empresaId}
      portalId={portalId}
      mikrotikId={mikrotikId}
      className={`text-white ${!bgStyle ? "bg-gradient-to-br from-orange-800 via-rose-900 to-purple-950" : ""}`}
      style={bgStyle}
      contentClassName="flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {cfg.logo_url ? (
            <img src={cfg.logo_url} alt="Logo" className="max-h-16 mx-auto mb-4" />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">{cfg.titulo || "WiFi Grátis por Tempo"}</h1>
          <p className="text-white/70 text-sm">{cfg.subtitulo || "Cadastre-se e acesse a internet gratuitamente"}</p>

          {/* Badge de duração */}
          <div className="inline-flex items-center gap-2 mt-4 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-5 py-2">
            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-yellow-200 font-semibold text-base">{duracao} minutos grátis</span>
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

            {/* CPF (opcional, controlado pelo cfg.exibir_cpf) */}
            {cfg.exibir_cpf !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                  </span>
                  <input
                    type="text" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00"
                    className={`w-full border rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:border-transparent transition-all text-sm ${cpfErro ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-purple-400"}`}
                  />
                </div>
                {cpfErro && <p className="text-red-500 text-xs mt-1">{cpfErro}</p>}
              </div>
            )}

            {/* MAC/IP read-only */}
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
              style={btnStyle || { background: "linear-gradient(135deg, #f97316, #9333ea)" }}
            >
              {enviando ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {cfg.texto_botao || `Quero ${duracao} minutos grátis`}
                </>
              )}
            </button>
          </form>

          <p className="mt-5 pt-5 border-t border-gray-100 text-xs text-gray-400 text-center leading-relaxed">
            {cfg.texto_rodape || "Acesso gratuito por tempo limitado. Ao continuar você concorda com os termos de uso."}
          </p>
        </div>
      </div>
    </PublicBanners>
  );
}
