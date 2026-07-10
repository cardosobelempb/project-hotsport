import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { CreditCard, CheckCircle2, Clock, AlertCircle, ArrowUp, ArrowDown, Unlock } from "lucide-react";
import { Button, Badge, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";

export default function Pagamentos() {
  const { showError, showSuccess, confirm } = useFeedback();
  const [pagamentos, setPagamentos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [ordenarPor, setOrdenarPor] = useState("id");
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pagamentos/todos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      const data = await res.json();
      setPagamentos(data);
    } catch (err) {
      console.error("Erro ao buscar pagamentos:", err);
      setErro("Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  };

  const liberarManual = async (id) => {
    if (!(await confirm({ title: "Liberar cliente", message: "Deseja liberar este cliente manualmente?", confirmText: "Liberar" }))) return;
    try {
      await fetch(`/api/pagamentos/liberar/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      showSuccess("Usuário liberado com sucesso!");
      fetchPagamentos(); // Recarrega a lista
    } catch (err) {
      console.error("Erro ao liberar manualmente:", err);
      showError("Erro ao liberar.");
    }
  };

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const toggleOrdenacao = (campo) => {
    if (ordenarPor === campo) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenarPor(campo);
      setOrdemAsc(true);
    }
  };

  const pagamentosFiltrados = pagamentos.filter((p) => {
    if (filtro === "todos") return true;
    if (filtro === "aprovados") return p.status.toLowerCase() === "approved";
    if (filtro === "pendentes") return p.status.toLowerCase() === "aguardando";
    return true;
  });

  const pagamentosOrdenados = [...pagamentosFiltrados].sort((a, b) => {
    if (ordemAsc) return a[ordenarPor] > b[ordenarPor] ? 1 : -1;
    else return a[ordenarPor] < b[ordenarPor] ? 1 : -1;
  });

  const { pageData, page, setPage, totalPages, total } = usePagination(pagamentosOrdenados, 12);

  const badgeStatus = (status) => {
    const lower = status.toLowerCase();
    if (lower === "approved") {
      return (
        <Badge variant="success" className="rounded-full gap-1">
          <CheckCircle2 className="w-3 h-3" /> Aprovado
        </Badge>
      );
    }
    if (lower === "aguardando") {
      return (
        <Badge variant="warning" className="rounded-full gap-1">
          <Clock className="w-3 h-3" /> Aguardando
        </Badge>
      );
    }
    return <Badge variant="neutral" className="rounded-full">{status}</Badge>;
  };

  const stats = {
    total: pagamentos.length,
    aprovados: pagamentos.filter((p) => p.status.toLowerCase() === "approved").length,
    pendentes: pagamentos.filter((p) => p.status.toLowerCase() === "aguardando").length,
    totalValor: pagamentos
      .filter((p) => p.status.toLowerCase() === "approved")
      .reduce((acc, p) => acc + (p.valor || 0), 0) / 100
  };

  const SortIcon = ({ campo }) => {
    if (ordenarPor !== campo) return null;
    return ordemAsc ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pagamentos</h1>
              <p className="text-sm text-gray-400">Gerenciamento de transações e cobranças</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="!border-blue-800/30 p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Total de Pagamentos</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </Card>
          <Card className="!border-green-800/30 p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Aprovados</div>
            <div className="text-2xl font-bold text-green-400">{stats.aprovados}</div>
          </Card>
          <Card className="!border-yellow-800/30 p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Pendentes</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.pendentes}</div>
          </Card>
          <Card className="!border-emerald-800/30 p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Valor Aprovado</div>
            <div className="text-2xl font-bold text-emerald-400">
              R$ {stats.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button variant={filtro === "todos" ? "primary" : "secondary"} onClick={() => setFiltro("todos")}>
              Todos
            </Button>
            <Button
              variant={filtro === "aprovados" ? "primary" : "secondary"}
              icon={CheckCircle2}
              className={filtro === "aprovados" ? "!bg-green-600 hover:!bg-green-700" : ""}
              onClick={() => setFiltro("aprovados")}
            >
              Aprovados
            </Button>
            <Button
              variant={filtro === "pendentes" ? "primary" : "secondary"}
              icon={Clock}
              className={filtro === "pendentes" ? "!bg-yellow-500 hover:!bg-yellow-600" : ""}
              onClick={() => setFiltro("pendentes")}
            >
              Pendentes
            </Button>
          </div>
        </Card>

        {/* Error Alert */}
        {erro && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-300 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-400 mt-4">Carregando pagamentos...</p>
            </div>
          ) : pageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-sm text-gray-400">
                {filtro !== "todos" ? "Tente outro filtro" : "Ainda não há pagamentos registrados"}
              </p>
            </div>
          ) : (
            <Table>
              <Table.Head>
                <Table.HeadCell className="cursor-pointer" onClick={() => toggleOrdenacao("id")}>
                  <div className="flex items-center gap-2">ID <SortIcon campo="id" /></div>
                </Table.HeadCell>
                <Table.HeadCell className="cursor-pointer" onClick={() => toggleOrdenacao("nome_plano")}>
                  <div className="flex items-center gap-2">Plano <SortIcon campo="nome_plano" /></div>
                </Table.HeadCell>
                <Table.HeadCell hideOn="md">MAC</Table.HeadCell>
                <Table.HeadCell hideOn="lg">IP</Table.HeadCell>
                <Table.HeadCell hideOn="lg">ID MP</Table.HeadCell>
                <Table.HeadCell className="cursor-pointer" onClick={() => toggleOrdenacao("valor")}>
                  <div className="flex items-center gap-2">Valor <SortIcon campo="valor" /></div>
                </Table.HeadCell>
                <Table.HeadCell className="cursor-pointer" onClick={() => toggleOrdenacao("status")}>
                  <div className="flex items-center gap-2">Status <SortIcon campo="status" /></div>
                </Table.HeadCell>
                <Table.HeadCell hideOn="md" className="cursor-pointer" onClick={() => toggleOrdenacao("criado_em")}>
                  <div className="flex items-center gap-2">Data <SortIcon campo="criado_em" /></div>
                </Table.HeadCell>
                <Table.HeadCell>Ação</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {pageData.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell className="font-medium text-white">#{p.id}</Table.Cell>
                    <Table.Cell className="text-white font-medium">{p.nome_plano}</Table.Cell>
                    <Table.Cell hideOn="md" className="font-mono text-xs">{p.mac || "-"}</Table.Cell>
                    <Table.Cell hideOn="lg" className="font-mono text-xs">{p.ip || "-"}</Table.Cell>
                    <Table.Cell hideOn="lg" className="font-mono text-xs">{p.mp_pagamento_id ?? "-"}</Table.Cell>
                    <Table.Cell className="font-semibold text-white">
                      {Number(p.valor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </Table.Cell>
                    <Table.Cell>{badgeStatus(p.status)}</Table.Cell>
                    <Table.Cell hideOn="md" className="text-xs">
                      {new Date(p.criado_em).toLocaleString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </Table.Cell>
                    <Table.Cell>
                      <Button size="sm" variant="primary" icon={Unlock} className="!bg-green-600 hover:!bg-green-700" onClick={() => liberarManual(p.id)}>
                        Liberar
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>

        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="pagamentos" />
      </div>
    </AdminLayout>
  );
}
