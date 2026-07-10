import React from "react";

// Barra vertical simples por dia, sem dependencia de lib de graficos —
// usada pra serie diaria de impressoes/cliques no dashboard de campanhas.
export default function MiniBarChart({ dados = [], chaveValor = "impressoes", altura = 120 }) {
  if (dados.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-500" style={{ height: altura }}>
        Sem dados no período selecionado.
      </div>
    );
  }

  const max = Math.max(1, ...dados.map((d) => d[chaveValor] || 0));

  return (
    <div className="flex items-end gap-1" style={{ height: altura }}>
      {dados.map((d) => {
        const valor = d[chaveValor] || 0;
        return (
          <div
            key={d.data}
            className="flex-1 flex flex-col items-center justify-end h-full"
            title={`${d.data}: ${valor}`}
          >
            <div
              className="w-full bg-blue-500/70 rounded-t min-h-[2px]"
              style={{ height: `${(valor / max) * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
