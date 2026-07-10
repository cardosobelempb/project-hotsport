// Fonte única de verdade dos tipos de portal (labels, cor do badge, e se o
// fluxo depende de campanha_ativa_id — usado tanto pra mostrar/esconder a
// seção "Pré-Portal (Campanha)" no editor quanto o badge indicativo na lista).
export const PORTAL_TIPOS = [
  { value: "lgpd",                label: "LGPD",                cls: "bg-cyan-900/30 text-cyan-400 border-cyan-800/50",       usaCampanha: true  },
  { value: "planos",              label: "Planos",              cls: "bg-green-900/30 text-green-400 border-green-800/50",    usaCampanha: false },
  { value: "lead",                label: "Lead",                cls: "bg-yellow-900/30 text-yellow-400 border-yellow-800/50", usaCampanha: true  },
  { value: "lead_passivo",        label: "Lead (Sem Internet)", cls: "bg-orange-900/30 text-orange-400 border-orange-800/50", usaCampanha: true  },
  { value: "login",               label: "Acesso Wi-Fi",        cls: "bg-blue-900/30 text-blue-400 border-blue-800/50",       usaCampanha: false },
  { value: "trial_tempo",         label: "Trial por Tempo",     cls: "bg-amber-900/30 text-amber-400 border-amber-800/50",    usaCampanha: true  },
  { value: "campanha_pre_acesso", label: "Campanha + Acesso",   cls: "bg-purple-900/30 text-purple-400 border-purple-800/50", usaCampanha: true  },
  { value: "reconexao",           label: "Reconexão",           cls: "bg-rose-900/30 text-rose-400 border-rose-800/50",       usaCampanha: false },
  { value: "custom",              label: "Custom",              cls: "bg-gray-900/30 text-gray-400 border-gray-800/50",       usaCampanha: false },
];

export const PORTAL_TIPO_MAP = Object.fromEntries(PORTAL_TIPOS.map((t) => [t.value, t]));

export const TIPOS_COM_CAMPANHA = PORTAL_TIPOS.filter((t) => t.usaCampanha).map((t) => t.value);

export function getPortalTipoLabel(tipo) {
  return PORTAL_TIPO_MAP[tipo]?.label || PORTAL_TIPO_MAP.custom.label;
}
