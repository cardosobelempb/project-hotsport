import React from "react";

export default function SegmentedControl({ options, value, onChange, className = "" }) {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
            value === opt.value
              ? "border-blue-600 bg-blue-600/10 text-blue-400"
              : "border-gray-800 text-gray-400 hover:bg-[#252b3b]"
          }`}
        >
          {opt.icon && <opt.icon className="w-4 h-4" />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
