import React from "react";

export default function Textarea({
  label,
  error,
  className = "",
  containerClassName = "",
  rows = 3,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && <label className="block text-sm text-gray-400 mb-1">{label}</label>}
      <textarea
        rows={rows}
        className={`w-full px-3 py-2 bg-[#0f111a] border ${
          error ? "border-red-800" : "border-gray-800"
        } rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-800 text-sm resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
