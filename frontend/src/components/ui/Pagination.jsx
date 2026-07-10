import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, total, onPageChange, itemLabel = "registros" }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1 text-sm text-gray-400">
      <span>
        {total !== undefined && <>Total: {total} {itemLabel} · </>}
        Página {page} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-800 hover:bg-[#252b3b] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-800 hover:bg-[#252b3b] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Próxima <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
