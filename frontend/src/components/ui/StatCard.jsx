import React from "react";

const COLOR_MAP = {
  blue:   { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  green:  { text: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
  purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  yellow: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  gray:   { text: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20" },
};

export default function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className={`bg-[#1a1d27] rounded-xl p-5 border ${c.border} hover:border-gray-700 transition-all duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className={`${c.bg} ${c.text} p-2 rounded-lg`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

StatCard.Row = function StatCardRow({ children, className = "" }) {
  return <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 ${className}`}>{children}</div>;
};
