// frontend/src/pages/admin/Sessoes.jsx
import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { RefreshCw, WifiOff, Search } from "lucide-react";
import { Button, Input, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";

const AUTO_REFRESH_INTERVAL = 30_000;

function tempoAtivo(acctstarttime) {
  if (!acctstarttime) return '-';
  const total = Math.floor((Date.now() - new Date(acctstarttime).getTime()) / 1000);
  if (total < 0) return '-';
  const h  = Math.floor(total / 3600);
  const m  = Math.floor((total % 3600) / 60);
  const s  = total % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m || h) parts.push(`${m}min`);
  parts.push(`${String(s).padStart(2, '0')}s`);
  return parts.join(' ');
}

export default function Sessoes() {
  const { showError, showSuccess, confirm } = useFeedback();
  const token   = localStorage.getItem("admin_token");
  const headers = { Authorization: `Bearer ${token}` };

  const [sessoes,           setSessoes]           = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [autoRefresh,       setAutoRefresh]       = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [desconectando,     setDesconectando]     = useState(null);

  // filtros (aplicados no cliente sobre a lista já carregada)
  const [filtroUsername, setFiltroUsername] = useState('');
  const [filtroMac,      setFiltroMac]      = useState('');
  const [filtroIp,       setFiltroIp]       = useState('');

  // contador para forçar re-render do tempo ativo a cada segundo
  const [tick, setTick] = useState(0);

  const intervalRefresh = useRef(null);
  const intervalTick    = useRef(null);

  const carregarSessoes = async () => {
    try {
      const res = await fetch("/api/radius/sessoes", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar sessões");
      setSessoes(data);
      setUltimaAtualizacao(new Date());
    } catch (err) {
      console.error("Erro ao carregar sessões:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => { carregarSessoes(); }, []); // eslint-disable-line

  // Auto-refresh das sessões
  useEffect(() => {
    clearInterval(intervalRefresh.current);
    if (autoRefresh) {
      intervalRefresh.current = setInterval(carregarSessoes, AUTO_REFRESH_INTERVAL);
    }
    return () => clearInterval(intervalRefresh.current);
  }, [autoRefresh]); // eslint-disable-line

  // Tick a cada 1s para atualizar coluna "Tempo Ativo" no cliente
  useEffect(() => {
    intervalTick.current = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(intervalTick.current);
  }, []);

  const handleDesconectar = async (s) => {
    const identificador = s.username || s.mac;
    if (!(await confirm({ title: "Desconectar sessão", message: `Desconectar sessão de "${identificador}" do MikroTik?\n(A conta RADIUS permanece ativa)`, danger: true, confirmText: "Desconectar" }))) return;
    setDesconectando(s.mac);
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 15000);
    try {
      const res = await fetch("/api/radius/desconectar", {
        method:  "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body:    JSON.stringify({ username: s.username, mac: s.mac, nas_ip: s.gateway }),
        signal:  abort.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showSuccess(data.message);
      await carregarSessoes();
    } catch (err) {
      if (err.name === "AbortError") {
        showError("O MikroTik não respondeu em 15s. Verifique a conexão com o equipamento.");
      } else {
        showError(err.message || "Erro ao desconectar sessão");
      }
    } finally {
      clearTimeout(timer);
      setDesconectando(null);
    }
  };

  // Filtro client-side
  const sessoesFiltradas = sessoes.filter(s => {
    const okUser = !filtroUsername || (s.username || '').toLowerCase().includes(filtroUsername.toLowerCase());
    const okMac  = !filtroMac      || (s.mac      || '').toLowerCase().includes(filtroMac.toLowerCase());
    const okIp   = !filtroIp       || (s.ip       || '').includes(filtroIp);
    return okUser && okMac && okIp;
  });

  const { pageData, page, setPage, totalPages, total } = usePagination(sessoesFiltradas, 12);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* ── cabeçalho ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Sessões RADIUS Ativas</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {ultimaAtualizacao && (
              <span className="text-xs text-gray-500">
                Atualizado: {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
              </span>
            )}
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={carregarSessoes}>
              Atualizar
            </Button>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
                className="accent-blue-500"
              />
              Auto-refresh 30s
            </label>
          </div>
        </div>

        {/* ── filtros ──────────────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-4 flex-wrap items-center">
          <Input
            icon={Search}
            placeholder="Filtrar por usuário..."
            containerClassName="w-48"
            value={filtroUsername}
            onChange={e => setFiltroUsername(e.target.value)}
          />
          <Input
            icon={Search}
            placeholder="Filtrar por MAC..."
            containerClassName="w-48"
            value={filtroMac}
            onChange={e => setFiltroMac(e.target.value)}
          />
          <Input
            icon={Search}
            placeholder="Filtrar por IP..."
            containerClassName="w-40"
            value={filtroIp}
            onChange={e => setFiltroIp(e.target.value)}
          />
          <span className="text-gray-500 text-sm self-center">
            {sessoesFiltradas.length}/{sessoes.length} sessão(ões)
          </span>
        </div>

        {/* ── tabela ───────────────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <Table>
            <Table.Head>
              <Table.HeadCell>Usuário</Table.HeadCell>
              <Table.HeadCell hideOn="md">CPF</Table.HeadCell>
              <Table.HeadCell hideOn="md">MAC</Table.HeadCell>
              <Table.HeadCell>IP</Table.HeadCell>
              <Table.HeadCell hideOn="lg">NAS (Mikrotik)</Table.HeadCell>
              <Table.HeadCell hideOn="lg">Início</Table.HeadCell>
              <Table.HeadCell>Tempo Ativo</Table.HeadCell>
              <Table.HeadCell>Ações</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {pageData.map((s, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell className="font-mono text-xs">{s.username}</Table.Cell>
                  <Table.Cell hideOn="md">{s.cpf || "-"}</Table.Cell>
                  <Table.Cell hideOn="md" className="font-mono text-xs">{s.mac || "-"}</Table.Cell>
                  <Table.Cell>{s.ip || "-"}</Table.Cell>
                  <Table.Cell hideOn="lg">{s.gateway || "-"}</Table.Cell>
                  <Table.Cell hideOn="lg">
                    {s.acctstarttime ? new Date(s.acctstarttime).toLocaleString("pt-BR") : "-"}
                  </Table.Cell>
                  <Table.Cell className="tabular-nums text-green-400">
                    {/* tick não é usado diretamente mas força re-render a cada 1s */}
                    {tick >= 0 && tempoAtivo(s.acctstarttime)}
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      size="sm" variant="secondary" icon={WifiOff}
                      className="!text-yellow-400 !border-yellow-800/50 hover:!bg-yellow-900/20"
                      disabled={desconectando === s.mac}
                      onClick={() => handleDesconectar(s)}
                    >
                      {desconectando === s.mac ? "Desconectando..." : "Desconectar"}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
              {!loading && pageData.length === 0 && (
                <Table.Empty colSpan={8}>Nenhuma sessão ativa no momento.</Table.Empty>
              )}
            </Table.Body>
          </Table>
          {loading && (
            <div className="text-center p-4 text-gray-500">Carregando sessões...</div>
          )}
        </Card>

        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="sessões" />
      </div>
    </AdminLayout>
  );
}
