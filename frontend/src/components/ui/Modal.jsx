import React, { useEffect } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  icon: Icon,
  iconClassName = "",
  size = "md",
  footer,
  closeOnBackdrop = true,
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`bg-[#1a1d27] border border-gray-800 rounded-xl w-full ${SIZES[size] || SIZES.md} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {Icon && <Icon className={`w-5 h-5 shrink-0 ${iconClassName}`} />}
            {title}
          </h3>
          <IconButton icon={X} title="Fechar" onClick={onClose} />
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 p-4 border-t border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
