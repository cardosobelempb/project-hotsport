import React from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const iconButton = cva(
  "inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "text-gray-400 hover:text-gray-200 hover:bg-[#252b3b]",
        danger: "text-red-400 hover:text-red-300 hover:bg-red-900/20",
        primary: "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20",
      },
      size: {
        sm: "p-1.5",
        md: "p-2",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  }
);

export default function IconButton({ icon: Icon, variant, size, title, loading = false, disabled, className = "", ...props }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled || loading}
      className={`${iconButton({ variant, size })} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
    </button>
  );
}
