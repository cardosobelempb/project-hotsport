import React from "react";

export default function Input({
  label,
  error,
  icon: Icon,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && <label className="block text-sm text-gray-400 mb-1">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
        )}
        <input
          className={`w-full px-3 py-2 ${Icon ? "pl-10" : ""} bg-[#0f111a] border ${
            error ? "border-red-800" : "border-gray-800"
          } rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-800 text-sm ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
