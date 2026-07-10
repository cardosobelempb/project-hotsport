import React from "react";
import { Check } from "lucide-react";

export default function Checkbox({ checked, onChange, label, className = "", ...props }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none text-sm text-gray-300 ${className}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" {...props} />
      <span
        className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
          checked ? "bg-blue-600 border-blue-600" : "bg-[#0f111a] border-gray-700"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}
