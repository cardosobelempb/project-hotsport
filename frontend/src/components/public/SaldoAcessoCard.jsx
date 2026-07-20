import React from "react";

function fmtTempo(segundos) {
  const s = Math.max(0, Number(segundos) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  if (m > 0) return `${m} minutos`;
  return `${s} segundos`;
}

/**
 * Card "tempo restante hoje" + botao de reconectar usando o saldo diario
 * ja provisionado no RADIUS (sem cobrar/reprovisionar nada). Usado em
 * AcessoAtivo.jsx (fluxo saldo-only) e PortalReconexao.jsx (saldo + planos
 * pagos na mesma tela).
 */
export default function SaldoAcessoCard({ saldo, onConectar, conectando, urlEscape, erro }) {
  if (!saldo) return null;

  const pctRestante = saldo.max_diario_segundos
    ? Math.min(100, Math.round((saldo.restante_segundos / saldo.max_diario_segundos) * 100))
    : 0;

  return (
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

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className={`h-2.5 rounded-full transition-all ${pctRestante > 30 ? "bg-green-500" : "bg-yellow-500"}`}
          style={{ width: `${pctRestante}%` }}
        />
      </div>

      <button
        onClick={onConectar}
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

      {erro && (
        <p className="mt-3 text-sm text-red-600 text-center">{erro}</p>
      )}

      {urlEscape && (
        <div className="mt-5 text-center">
          <a
            href={urlEscape}
            className="text-sm text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
          >
            Não é você? Acessar o portal
          </a>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          🔒 Seu acesso é identificado automaticamente por este dispositivo.
        </p>
      </div>
    </div>
  );
}
