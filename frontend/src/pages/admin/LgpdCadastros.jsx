import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { ShieldCheck, User, Mail, Phone, Wifi, Globe, CheckCircle2, XCircle, AlertCircle, Search } from "lucide-react";
import { Input, Card, Table, Badge } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";

export default function LgpdCadastros() {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/lgpd", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);
        setRegistros(data);
        setFilteredRegistros(data);
      } catch (err) {
        setErro("Erro ao buscar registros LGPD");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const filtered = registros.filter((r) => {
      const searchTerm = busca.toLowerCase();
      return (
        r.nome?.toLowerCase().includes(searchTerm) ||
        r.email?.toLowerCase().includes(searchTerm) ||
        r.cpf?.includes(searchTerm) ||
        r.telefone?.includes(searchTerm)
      );
    });
    setFilteredRegistros(filtered);
  }, [busca, registros]);

  const { pageData, page, setPage, totalPages, total } = usePagination(filteredRegistros, 12);

  const maskCPF = (cpf) => {
    if (!cpf) return "---";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$2");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const stats = {
    total: registros.length,
    aceitos: registros.filter((r) => r.aceite).length,
    recusados: registros.filter((r) => !r.aceite).length
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Cadastros LGPD</h1>
              <p className="text-sm text-gray-400">Gerenciamento de consentimentos e dados pessoais</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="!border-blue-800/30 p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Total de Registros</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </Card>
          <Card className="!border-green-800/30 p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Aceites</div>
            <div className="text-2xl font-bold text-green-400">{stats.aceitos}</div>
          </Card>
          <Card className="!border-red-800/30 p-6">
            <div className="text-sm font-medium text-gray-400 mb-2">Recusados</div>
            <div className="text-2xl font-bold text-red-400">{stats.recusados}</div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-6">
          <Input
            icon={Search}
            placeholder="Buscar por nome, email, CPF ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
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
              <p className="text-gray-400 mt-4">Carregando registros...</p>
            </div>
          ) : pageData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum registro encontrado</h3>
              <p className="text-sm text-gray-400">
                {busca ? "Tente ajustar sua busca" : "Ainda não há cadastros LGPD"}
              </p>
            </div>
          ) : (
            <Table>
              <Table.Head>
                <Table.HeadCell><div className="flex items-center gap-2"><User className="w-4 h-4" /> Nome</div></Table.HeadCell>
                <Table.HeadCell hideOn="md"><div className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</div></Table.HeadCell>
                <Table.HeadCell hideOn="md"><div className="flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone</div></Table.HeadCell>
                <Table.HeadCell>CPF</Table.HeadCell>
                <Table.HeadCell hideOn="lg"><div className="flex items-center gap-2"><Wifi className="w-4 h-4" /> MAC</div></Table.HeadCell>
                <Table.HeadCell hideOn="lg"><div className="flex items-center gap-2"><Globe className="w-4 h-4" /> IP</div></Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell hideOn="md">Data</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {pageData.map((r) => (
                  <Table.Row key={r.id}>
                    <Table.Cell className="font-medium text-white">{r.nome || "---"}</Table.Cell>
                    <Table.Cell hideOn="md">{r.email || "---"}</Table.Cell>
                    <Table.Cell hideOn="md">{r.telefone || "---"}</Table.Cell>
                    <Table.Cell className="font-mono text-sm text-white">{maskCPF(r.cpf)}</Table.Cell>
                    <Table.Cell hideOn="lg" className="font-mono text-xs">{r.mac || "---"}</Table.Cell>
                    <Table.Cell hideOn="lg" className="font-mono text-sm">{r.ip || "---"}</Table.Cell>
                    <Table.Cell>
                      {r.aceite ? (
                        <Badge variant="success" className="rounded-full gap-1"><CheckCircle2 className="w-3 h-3" /> Aceito</Badge>
                      ) : (
                        <Badge variant="danger" className="rounded-full gap-1"><XCircle className="w-3 h-3" /> Recusado</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell hideOn="md" className="text-sm">{formatDate(r.criado_em)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>

        {!loading && filteredRegistros.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="registros" />
        )}
      </div>
    </AdminLayout>
  );
}
