import React from "react";

export default function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      )}
      {title && <p className="text-gray-300 font-medium mb-1">{title}</p>}
      {description && <p className="text-gray-500 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
