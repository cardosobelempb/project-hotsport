import React from "react";
import Badge from "./Badge";

// Padrão de status Ativo/Inativo clicável para tabelas admin.
// Regra do kit: toda coluna "Status" com liga/desliga usa este componente —
// Badge verde-azul (info) quando ativo, cinza (neutral) quando inativo,
// clique alterna direto sem abrir modal.
export default function StatusToggle({ ativo, onToggle, labelAtivo = "Ativo", labelInativo = "Inativo", title = "Clique para alternar" }) {
  return (
    <button type="button" onClick={onToggle} title={title}>
      <Badge variant={ativo ? "info" : "neutral"} className="rounded-full cursor-pointer">
        {ativo ? labelAtivo : labelInativo}
      </Badge>
    </button>
  );
}
