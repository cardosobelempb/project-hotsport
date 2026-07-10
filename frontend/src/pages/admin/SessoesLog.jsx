import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Download, Search } from "lucide-react";
import { Button, Input, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || bytes === 0) return "0 B";
  const num = Number(bytes);
  if (isNaN(num)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let val = num;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return "-";
  const s = Number(seconds);
  if (isNaN(s) || s < 0) return "-";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return parts.join(" ");
}

function fmtDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function SessoesLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);

  // Filter state
  const [username, setUsername] = useState("");
  const [mac, setMac] = useState("");
  const [ip, setIp] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const token = localStorage.getItem("admin_token");

  const buildParams = (extraPage) => {
    const params = new URLSearchParams();
    if (username.trim()) params.set("username", username.trim());
    if (mac.trim()) params.set("mac", mac.trim());
    if (ip.trim()) params.set("ip", ip.trim());
    if (dataInicio) params.set("data_inicio", dataInicio);
    if (dataFim) params.set("data_fim", dataFim);
    if (extraPage !== undefined) {
      params.set("page", extraPage);
      params.set("per_page", perPage);
    }
    return params;
  };

  const fetchLogs = async (p = page) => {
    try {
      setLoading(true);
      const params = buildParams(p);
      const res = await fetch(`/api/radius-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setLogs(Array.isArray(json.data) ? json.data : []);
      setTotal(json.total || 0);
      setPage(json.page || 1);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const handleClear = () => {
    setUsername("");
    setMac("");
    setIp("");
    setDataInicio("");
    setDataFim("");
    setPage(1);
    setTimeout(() => fetchLogs(1), 0);
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const goPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    fetchLogs(p);
  };

  const exportCSV = () => {
    const params = buildParams();
    const url = `/api/radius-logs/export?${params.toString()}`;
    const a = document.createElement("a");
    // Use fetch to include auth header, then trigger download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = "radius-logs.csv";
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error("Erro ao exportar CSV:", err));
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-[#0f111a] min-h-screen text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Sessoes RADIUS</h1>
          <Button icon={Download} onClick={exportCSV} title="Exportar CSV">
            Exportar CSV
          </Button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleFilter}>
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex: 54545454545" />
              <Input label="MAC" value={mac} onChange={(e) => setMac(e.target.value)} placeholder="Ex: AA:BB:CC:DD:EE:FF" />
              <Input label="IP" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Ex: 10.0.0.1" />
              <Input label="Data Inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              <Input label="Data Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              <div className="flex items-end gap-2">
                <Button type="submit" icon={Search}>
                  Filtrar
                </Button>
                <Button type="button" variant="secondary" onClick={handleClear}>
                  Limpar
                </Button>
              </div>
            </div>
          </Card>
        </form>

        {/* Results Table — colunas agrupadas para caber sem scroll horizontal */}
        <Card className="overflow-hidden">
          <Table>
            <Table.Head>
              <Table.HeadCell>Usuário / MAC</Table.HeadCell>
              <Table.HeadCell hideOn="md">IP / NAS</Table.HeadCell>
              <Table.HeadCell>Conexão</Table.HeadCell>
              <Table.HeadCell>Duração</Table.HeadCell>
              <Table.HeadCell hideOn="lg">Tráfego</Table.HeadCell>
              <Table.HeadCell hideOn="lg">Motivo</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {loading ? (
                <Table.Loading colSpan={6} />
              ) : logs.length === 0 ? (
                <Table.Empty colSpan={6} />
              ) : (
                logs.map((r, i) => (
                  <Table.Row key={`${r.username}-${r.conectado_em}-${i}`}>
                    <Table.Cell>
                      <div className="font-medium text-white">{r.username || "-"}</div>
                      <div className="font-mono text-[11px] text-gray-500">{r.mac || "-"}</div>
                    </Table.Cell>
                    <Table.Cell hideOn="md">
                      <div className="font-mono text-xs">{r.ip || "-"}</div>
                      <div className="text-[11px] text-gray-500" title={r.nas_ip || ""}>{r.nas_nome || r.nas_ip || "-"}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-xs" title="Conectado em">{fmtDateTime(r.conectado_em)}</div>
                      <div className="text-[11px] text-gray-500" title="Desconectado em">
                        {r.desconectado_em ? fmtDateTime(r.desconectado_em) : <span className="text-green-400">ativa</span>}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{formatDuration(r.segundos_conectado)}</Table.Cell>
                    <Table.Cell hideOn="lg">
                      <div className="text-green-400 text-xs">↓ {formatBytes(r.bytes_entrada)}</div>
                      <div className="text-blue-400 text-xs">↑ {formatBytes(r.bytes_saida)}</div>
                    </Table.Cell>
                    <Table.Cell hideOn="lg" className="text-xs max-w-[140px] truncate" title={r.motivo_desconexao || ""}>
                      {r.motivo_desconexao || "-"}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={goPage} itemLabel="registros" />
      </div>
    </AdminLayout>
  );
}
