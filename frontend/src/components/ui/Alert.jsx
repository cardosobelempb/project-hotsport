import React from "react";
import { XCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

// Tema claro — uso em páginas PÚBLICAS do captive portal (cliente final vê tema claro).
const LIGHT_VARIANTS = {
  error: {
    classes: "bg-red-50 border border-red-200 text-red-700",
    icon: XCircle,
  },
  success: {
    classes: "bg-green-50 border border-green-200 text-green-700",
    icon: CheckCircle2,
  },
  warning: {
    classes: "bg-yellow-50 border border-yellow-200 text-yellow-700",
    icon: AlertTriangle,
  },
  info: {
    classes: "bg-blue-50 border border-blue-200 text-blue-700",
    icon: Info,
  },
};

// Tema escuro — uso em telas do admin (dentro de modais/formulários dark).
// Mesma paleta translúcida já usada em Badge/StatusToggle (bg-*-900/40, border-*-800/50).
const DARK_VARIANTS = {
  error: {
    classes: "bg-red-900/20 border border-red-800/40 text-gray-200",
    icon: XCircle,
    iconClass: "text-red-400",
  },
  success: {
    classes: "bg-green-900/20 border border-green-800/40 text-gray-200",
    icon: CheckCircle2,
    iconClass: "text-green-400",
  },
  warning: {
    classes: "bg-yellow-900/20 border border-yellow-800/40 text-gray-200",
    icon: AlertTriangle,
    iconClass: "text-yellow-400",
  },
  info: {
    classes: "bg-blue-900/20 border border-blue-800/40 text-gray-200",
    icon: Info,
    iconClass: "text-blue-400",
  },
};

export default function Alert({ variant = "info", theme = "light", className = "", children }) {
  if (!children) return null;
  const set = theme === "dark" ? DARK_VARIANTS : LIGHT_VARIANTS;
  const { classes, icon: Icon, iconClass = "" } = set[variant] || set.info;
  return (
    <div
      className={`p-4 rounded-lg text-sm font-medium flex items-center gap-3 ${classes} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${iconClass}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
