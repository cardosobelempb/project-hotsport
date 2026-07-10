import React from "react";

export default function Select({
  label,
  error,
  className = "",
  containerClassName = "",
  children,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && <label className="block text-sm text-gray-400 mb-1">{label}</label>}
      <select
        className={`w-full px-3 py-2 bg-[#0f111a] border ${
          error ? "border-red-800" : "border-gray-800"
        } rounded-lg text-gray-200 focus:outline-none focus:border-blue-800 text-sm cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
