import React from "react";

const HIDE_ON = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

function hideOnClass(hideOn) {
  return hideOn ? HIDE_ON[hideOn] || "" : "";
}

export default function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}

Table.Head = function TableHead({ children }) {
  return (
    <thead>
      <tr className="border-b border-gray-800">{children}</tr>
    </thead>
  );
};

Table.HeadCell = function TableHeadCell({ children, hideOn, className = "", ...props }) {
  return (
    <th className={`text-left px-4 py-3 text-gray-400 font-medium ${hideOnClass(hideOn)} ${className}`} {...props}>
      {children}
    </th>
  );
};

Table.Body = function TableBody({ children }) {
  return <tbody>{children}</tbody>;
};

Table.Row = function TableRow({ children, className = "", ...props }) {
  return (
    <tr className={`border-b border-gray-800/50 hover:bg-[#252b3b]/30 ${className}`} {...props}>
      {children}
    </tr>
  );
};

Table.Cell = function TableCell({ children, hideOn, className = "", ...props }) {
  return (
    <td className={`px-4 py-3 text-gray-300 ${hideOnClass(hideOn)} ${className}`} {...props}>
      {children}
    </td>
  );
};

Table.Empty = function TableEmpty({ colSpan, children = "Nenhum registro encontrado" }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-gray-500">
        {children}
      </td>
    </tr>
  );
};

Table.Loading = function TableLoading({ colSpan, children = "Carregando..." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-gray-500">
        {children}
      </td>
    </tr>
  );
};
