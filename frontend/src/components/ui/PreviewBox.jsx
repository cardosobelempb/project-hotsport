import React from "react";

export default function PreviewBox({ children, className = "" }) {
  return (
    <div className={`bg-[#0d1117] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 ${className}`}>
      {children}
    </div>
  );
}
