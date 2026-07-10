import React, { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Download } from "lucide-react";
import { Button, Input, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";

function formatDuracao(segundos) {
  if (!segundos) return "0h 0m";
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

function formatDateTime(dt) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString("pt-BR");
}

export default function Compliance() {
  const [cpf, setCpf] = useState("");
  const [mac, setMac] = useState("");
  const [ip, setIp] = useState("");
  const [username, setUsername] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("admin_token");

  const buildParams = (extraPage) => {
    const params = new URLSearchParams();
    if (cpf.trim()) params.set("cpf", cpf.trim());
    if (mac.trim()) params.set("mac", mac.trim());
    if (ip.trim()) params.set("ip", ip.trim());
    if (username.trim()) params.set("username", username.trim());
    if (dataInicio) params.set("data_inicio", dataInicio);
    if (dataFim) params.set("data_fim", dataFim);
    params.set("page", extraPage || page);
    params.set("per_page", perPage);
    return params.toString();
  };

  const buscar = async (pg = 1) => {
    try {
      setLoading(true);
      setPage(pg);
      const res = await fetch(`/api/compliance?${buildParams(pg)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setLogs(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (cpf.trim()) params.set("cpf", cpf.trim());
      if (mac.trim()) params.set("mac", mac.trim());
      if (ip.trim()) params.set("ip", ip.trim());
      if (username.trim()) params.set("username", username.trim());
      if (dataInicio) params.set("data_inicio", dataInicio);
      if (dataFim) params.set("data_fim", dataFim);

      const res = await fetch(`/api/compliance/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compliance_logs.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar CSV:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    buscar(1);
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Marco Civil - Logs de Conexao</h1>
            <p className="text-gray-400 text-sm mt-1">
              Consulta de registros de conexao conforme Marco Civil da Internet (Lei 12.965/2014)
            </p>
          </div>
          <Button icon={Download} className="!bg-green-700 hover:!bg-green-600" onClick={exportarCSV}>
            Exportar CSV
          </Button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Input label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
              <Input label="MAC" value={mac} onChange={(e) => setMac(e.target.value)} placeholder="AA:BB:CC:DD:EE:FF" />
              <Input label="IP" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.0.1" />
              <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="usuario" />
              <Input label="Data Inicio" type="datetime-local" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              <Input label="Data Fim" type="datetime-local" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" variant="primary" loading={loading}>
                Buscar
              </Button>
            </div>
          </Card>
        </form>

        {/* Results */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {total > 0 ? `${total} registro(s) encontrado(s)` : "Nenhum registro"}
            </span>
            {totalPages > 1 && (
              <span className="text-xs text-gray-500">
                Pagina {page} de {totalPages}
              </span>
            )}
          </div>

          <Table>
            <Table.Head>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell hideOn="md">CPF</Table.HeadCell>
              <Table.HeadCell hideOn="lg">MAC</Table.HeadCell>
              <Table.HeadCell>IP</Table.HeadCell>
              <Table.HeadCell hideOn="lg">NAS IP</Table.HeadCell>
              <Table.HeadCell hideOn="md">Inicio</Table.HeadCell>
              <Table.HeadCell hideOn="lg">Fim</Table.HeadCell>
              <Table.HeadCell hideOn="lg">Duracao</Table.HeadCell>
              <Table.HeadCell hideOn="md">Entrada</Table.HeadCell>
              <Table.HeadCell hideOn="md">Saida</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {logs.length === 0 && !loading && (
                <Table.Empty colSpan={10}>Utilize os filtros acima para buscar registros de conexao.</Table.Empty>
              )}
              {loading && <Table.Loading colSpan={10} />}
              {!loading &&
                logs.map((log, i) => (
                  <Table.Row key={i}>
                    <Table.Cell className="text-white font-mono text-xs">{log.username}</Table.Cell>
                    <Table.Cell hideOn="md" className="text-xs">{log.cpf || "-"}</Table.Cell>
                    <Table.Cell hideOn="lg" className="font-mono text-xs">{log.mac}</Table.Cell>
                    <Table.Cell className="font-mono text-xs">{log.ip_atribuido}</Table.Cell>
                    <Table.Cell hideOn="lg" className="font-mono text-xs">{log.nas_ip}</Table.Cell>
                    <Table.Cell hideOn="md" className="text-xs">{formatDateTime(log.inicio_conexao)}</Table.Cell>
                    <Table.Cell hideOn="lg" className="text-xs">{formatDateTime(log.fim_conexao)}</Table.Cell>
                    <Table.Cell hideOn="lg" className="text-xs">{formatDuracao(log.duracao_segundos)}</Table.Cell>
                    <Table.Cell hideOn="md" className="text-green-400 text-xs">{formatBytes(log.bytes_entrada)}</Table.Cell>
                    <Table.Cell hideOn="md" className="text-blue-400 text-xs">{formatBytes(log.bytes_saida)}</Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>

          <div className="px-4">
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={buscar} itemLabel="registros" />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
