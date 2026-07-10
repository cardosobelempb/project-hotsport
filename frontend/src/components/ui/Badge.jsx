import React from "react";
import { cva } from "class-variance-authority";

const badge = cva("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border", {
  variants: {
    variant: {
      info: "bg-blue-900/40 text-blue-400 border-blue-800/50",
      warning: "bg-yellow-900/40 text-yellow-400 border-yellow-800/50",
      success: "bg-green-900/40 text-green-400 border-green-800/50",
      danger: "bg-red-900/40 text-red-400 border-red-800/50",
      neutral: "bg-gray-800/60 text-gray-400 border-gray-700/50",
      purple: "bg-purple-900/40 text-purple-400 border-purple-800/50",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export default function Badge({ variant, className = "", children }) {
  return <span className={`${badge({ variant })} ${className}`}>{children}</span>;
}
