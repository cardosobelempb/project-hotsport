import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { MessageCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { Button, Input, Textarea, Select, Card, Table, Badge } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import { useFeedback } from "../../contexts/FeedbackContext";

const PER_PAGE = 12;

export default function WhatsApp() {
  const { showError, showSuccess, confirm } = useFeedback();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [mensagemTeste, setMensagemTeste] = useState({ telefone: "", mensagem: "" });
  const [envioResult, setEnvioResult] = useState(null);
  const [config, setConfig] = useState({ api_url: "", api_key: "", instance_name: "" });
  const [configSaved, setConfigSaved] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const token = localStorage.getItem("admin_token");
  const pollingRef = useRef(null);

  // Historico de envios
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsFilter, setLogsFilter] = useState({ status: "", telefone: "" });
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [cleanupDate, setCleanupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [showCleanup, setShowCleanup] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStatus();
    fetchConfig();
    fetchLogs();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => { fetchLogs(); /* eslint-disable-next-line */ }, [logsPage, logsFilter.status]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({ page: logsPage, per_page: PER_PAGE });
      if (logsFilter.status) params.append("status", logsFilter.status);
      if (logsFilter.telefone) params.append("telefone", logsFilter.telefone);
      const res = await fetch(`/api/whatsapp/logs?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setLogsTotal(data.total || 0);
      }
    } catch (err) { console.error("Erro ao buscar logs:", err); }
  };

  const handleLimparLogs = async () => {
    if (!(await confirm({ title: "Limpar logs", message: `Remover todos os logs anteriores a ${cleanupDate}?`, danger: true, confirmText: "Remover" }))) return;
    try {
      const res = await fetch(`/api/whatsapp/logs?antes_de=${cleanupDate}`, {
        method: "DELETE", headers,
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`${data.removidos} logs removidos.`);
        setShowCleanup(false);
        setLogsPage(1);
        fetchLogs();
      }
    } catch (err) {
      showError("Erro ao limpar logs");
    }
  };

  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const statusBadge = (s) => {
    if (s === "ok") return <Badge variant="success">OK</Badge>;
    if (s === "erro") return <Badge variant="danger">Erro</Badge>;
    if (s === "skipped") return <Badge variant="neutral">Pulado</Badge>;
    return <span className="text-xs text-gray-500">{s}</span>;
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/whatsapp/config", { headers });
      const data = await res.json();
      setConfig({ api_url: data.api_url || "", api_key: data.api_key || "", instance_name: data.instance_name || "" });
    } catch (err) { console.error("Erro ao buscar config:", err); }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigSaved(null);
    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setConfigSaved({ ok: true, msg: "Configuracao salva!" });
        fetchStatus();
      } else {
        setConfigSaved({ ok: false, msg: "Erro ao salvar." });
      }
    } catch (err) {
      setConfigSaved({ ok: false, msg: "Erro de conexao." });
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/instance/status", { headers });
      const data = await res.json();
      setStatus(data);
      // Se estava mostrando QR e agora conectou, limpar QR
      if (data.state === "open") {
        setQrCode(null);
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
      }
    } catch (err) {
      console.error("Erro ao buscar status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/whatsapp/instance/create", { method: "POST", headers });
      await res.json();
      await fetchStatus();
      // Apos criar, buscar QR automaticamente
      handleConnect();
    } catch (err) {
      console.error("Erro ao criar instancia:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/whatsapp/instance/qrcode", { headers });
      const data = await res.json();
      if (data.base64) {
        setQrCode(data.base64);
        // Polling para verificar quando conectar
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(fetchStatus, 5000);
      } else if (data.instance?.state === "open") {
        setQrCode(null);
        await fetchStatus();
      }
    } catch (err) {
      console.error("Erro ao obter QR:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestart = async () => {
    setActionLoading(true);
    try {
      await fetch("/api/whatsapp/instance/restart", { method: "POST", headers });
      setTimeout(fetchStatus, 3000);
    } catch (err) {
      console.error("Erro ao reiniciar:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!(await confirm({ title: "Desconectar WhatsApp", message: "Desconectar o WhatsApp? Voce precisara escanear o QR Code novamente.", danger: true, confirmText: "Desconectar" }))) return;
    setActionLoading(true);
    try {
      await fetch("/api/whatsapp/instance/logout", { method: "POST", headers });
      setQrCode(null);
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      console.error("Erro ao desconectar:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!(await confirm({ title: "Remover instância", message: "Remover a instancia completamente? Todos os dados serao perdidos.", danger: true, confirmText: "Remover" }))) return;
    setActionLoading(true);
    try {
      await fetch("/api/whatsapp/instance/delete", { method: "DELETE", headers });
      setQrCode(null);
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      console.error("Erro ao remover:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnviarTeste = async (e) => {
    e.preventDefault();
    setEnvioResult(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ telefone: `55${mensagemTeste.telefone}`, mensagem: mensagemTeste.mensagem }),
      });
      const data = await res.json();
      if (res.ok) {
        setEnvioResult({ ok: true, msg: "Mensagem enviada com sucesso!" });
        setMensagemTeste({ telefone: "", mensagem: "" });
      } else {
        setEnvioResult({ ok: false, msg: data.error || "Erro ao enviar." });
      }
    } catch (err) {
      setEnvioResult({ ok: false, msg: "Erro de conexao." });
    }
  };

  const stateLabel = (state) => {
    const labels = {
      open: { text: "Conectado", color: "bg-green-500" },
      close: { text: "Desconectado", color: "bg-red-500" },
      connecting: { text: "Conectando...", color: "bg-yellow-500" },
    };
    return labels[state] || { text: state || "Desconhecido", color: "bg-gray-500" };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">WhatsApp</h1>

      {/* Status Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Status da Instancia</h2>
          <Button size="sm" variant="ghost" className="!text-blue-400 hover:!text-blue-300" onClick={fetchStatus}>
            Atualizar
          </Button>
        </div>

        {!status?.exists ? (
          /* Instancia nao existe */
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 mx-auto text-gray-600 opacity-30 mb-4" />
            <p className="text-gray-400 mb-4">Nenhuma instancia WhatsApp configurada.</p>
            <Button variant="primary" className="!bg-green-600 hover:!bg-green-700" loading={actionLoading} onClick={handleCreate}>
              Criar Instancia
            </Button>
          </div>
        ) : (
          /* Instancia existe */
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Estado */}
              <div className="bg-[#0f111a] rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stateLabel(status.state).color}`}></span>
                  <span className="font-medium">{stateLabel(status.state).text}</span>
                </div>
              </div>

              {/* Numero */}
              <div className="bg-[#0f111a] rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Numero</p>
                <p className="font-medium">{status.number || status.owner_jid?.split("@")[0] || "-"}</p>
              </div>

              {/* Nome */}
              <div className="bg-[#0f111a] rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Nome do Perfil</p>
                <p className="font-medium">{status.profile_name || "-"}</p>
              </div>

              {/* Instancia */}
              <div className="bg-[#0f111a] rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Instancia</p>
                <p className="font-medium font-mono text-sm">{status.instance_name}</p>
              </div>
            </div>

            {/* Estatisticas */}
            {status.state === "open" && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0f111a] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{status.messages_count}</p>
                  <p className="text-xs text-gray-500">Mensagens</p>
                </div>
                <div className="bg-[#0f111a] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{status.contacts_count}</p>
                  <p className="text-xs text-gray-500">Contatos</p>
                </div>
                <div className="bg-[#0f111a] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">{status.chats_count}</p>
                  <p className="text-xs text-gray-500">Conversas</p>
                </div>
              </div>
            )}

            {/* QR Code */}
            {qrCode && status.state !== "open" && (
              <div className="bg-[#0f111a] rounded-lg p-6 mb-6 text-center">
                <p className="text-sm text-gray-400 mb-4">Escaneie o QR Code com seu WhatsApp:</p>
                <img src={qrCode} alt="QR Code WhatsApp" className="mx-auto w-64 h-64 rounded-lg bg-white p-2" />
                <p className="text-xs text-gray-500 mt-3">Abra o WhatsApp &gt; Aparelhos conectados &gt; Conectar um aparelho</p>
              </div>
            )}

            {/* Acoes */}
            <div className="flex flex-wrap gap-3">
              {status.state !== "open" && (
                <Button variant="primary" className="!bg-green-600 hover:!bg-green-700" loading={actionLoading} onClick={handleConnect}>
                  Conectar (QR Code)
                </Button>
              )}
              <Button variant="primary" loading={actionLoading} onClick={handleRestart}>
                Reiniciar
              </Button>
              {status.state === "open" && (
                <Button variant="primary" className="!bg-yellow-600 hover:!bg-yellow-700" loading={actionLoading} onClick={handleLogout}>
                  Desconectar
                </Button>
              )}
              <Button variant="danger" loading={actionLoading} onClick={handleDelete}>
                Remover Instancia
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Enviar mensagem de teste */}
      {/* Configuracao Evolution API */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Configuracao da API</h2>
          <Button size="sm" variant="ghost" className="!text-blue-400 hover:!text-blue-300" onClick={() => setShowConfig(!showConfig)}>
            {showConfig ? "Ocultar" : "Editar"}
          </Button>
        </div>

        {!showConfig ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f111a] rounded-lg p-3">
              <p className="text-xs text-gray-500">URL da API</p>
              <p className="text-sm font-mono truncate">{config.api_url || "-"}</p>
            </div>
            <div className="bg-[#0f111a] rounded-lg p-3">
              <p className="text-xs text-gray-500">API Key</p>
              <p className="text-sm font-mono truncate">{config.api_key ? "••••••••" + config.api_key.slice(-8) : "-"}</p>
            </div>
            <div className="bg-[#0f111a] rounded-lg p-3">
              <p className="text-xs text-gray-500">Nome da Instancia</p>
              <p className="text-sm font-mono">{config.instance_name || "-"}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <Input
              label="URL da Evolution API"
              placeholder="http://localhost:8080"
              value={config.api_url}
              onChange={(e) => setConfig(prev => ({ ...prev, api_url: e.target.value }))}
            />
            <Input
              label="API Key"
              placeholder="Chave da API"
              value={config.api_key}
              onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
            />
            <Input
              label="Nome da Instancia"
              placeholder="empresa_1"
              value={config.instance_name}
              onChange={(e) => setConfig(prev => ({ ...prev, instance_name: e.target.value }))}
            />
            {configSaved && (
              <div className={`px-4 py-2 rounded-lg text-sm ${configSaved.ok ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                {configSaved.msg}
              </div>
            )}
            <Button type="submit" variant="primary">
              Salvar Configuracao
            </Button>
          </form>
        )}
      </Card>

      {/* Enviar mensagem teste */}
      {status?.exists && status?.state === "open" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Enviar Mensagem de Teste</h2>

          <form onSubmit={handleEnviarTeste} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Telefone (DDD + numero)</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-[#252b3b] border border-r-0 border-gray-700 text-gray-400 rounded-l-lg text-sm">+55</span>
                <input
                  type="text"
                  placeholder="41999999999"
                  value={mensagemTeste.telefone}
                  onChange={(e) => setMensagemTeste(prev => ({ ...prev, telefone: e.target.value.replace(/\D/g, "") }))}
                  required
                  className="flex-1 bg-[#0f111a] border border-gray-700 text-gray-200 rounded-r-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <Textarea
              label="Mensagem"
              placeholder="Digite sua mensagem..."
              value={mensagemTeste.mensagem}
              onChange={(e) => setMensagemTeste(prev => ({ ...prev, mensagem: e.target.value }))}
              required
              rows={3}
            />

            {envioResult && (
              <div className={`px-4 py-2 rounded-lg text-sm ${envioResult.ok ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                {envioResult.msg}
              </div>
            )}

            <Button type="submit" variant="primary" className="!bg-green-600 hover:!bg-green-700">
              Enviar
            </Button>
          </form>
        </Card>
      )}

      {/* Historico de envios */}
      <Card className="p-6 mt-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold">Histórico de Envios</h2>
            <p className="text-xs text-gray-500">Mensagens disparadas automaticamente pelos portais</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={logsFilter.status}
              onChange={(e) => { setLogsFilter({ ...logsFilter, status: e.target.value }); setLogsPage(1); }}
            >
              <option value="">Todos</option>
              <option value="ok">OK</option>
              <option value="erro">Erro</option>
              <option value="skipped">Pulado</option>
            </Select>
            <Input
              value={logsFilter.telefone}
              onChange={(e) => setLogsFilter({ ...logsFilter, telefone: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") { setLogsPage(1); fetchLogs(); } }}
              placeholder="Buscar telefone..."
              containerClassName="w-40"
            />
            <Button size="sm" onClick={() => { setLogsPage(1); fetchLogs(); }}>
              Filtrar
            </Button>
            <Button
              size="sm" variant="secondary" icon={Trash2}
              className="!bg-red-900/30 hover:!bg-red-900/50 !text-red-400 !border-red-800/50"
              onClick={() => setShowCleanup(!showCleanup)}
            >
              Limpar
            </Button>
          </div>
        </div>

        {showCleanup && (
          <div className="mb-4 p-4 bg-red-900/10 border border-red-900/30 rounded-lg flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-300">Remover logs anteriores a:</span>
            <input
              type="date"
              value={cleanupDate}
              onChange={(e) => setCleanupDate(e.target.value)}
              className="bg-[#0f111a] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2"
            />
            <Button size="sm" variant="danger" onClick={handleLimparLogs}>
              Confirmar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowCleanup(false)}>
              Cancelar
            </Button>
          </div>
        )}

        <Table>
          <Table.Head>
            <Table.HeadCell>Data</Table.HeadCell>
            <Table.HeadCell>Telefone</Table.HeadCell>
            <Table.HeadCell hideOn="md">Portal</Table.HeadCell>
            <Table.HeadCell hideOn="md">Contexto</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Detalhes</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {logs.length === 0 ? (
              <Table.Empty colSpan={6} />
            ) : logs.map((log) => (
              <React.Fragment key={log.id}>
                <Table.Row>
                  <Table.Cell className="whitespace-nowrap">{formatDate(log.criado_em)}</Table.Cell>
                  <Table.Cell className="font-mono text-xs">{log.telefone || "-"}</Table.Cell>
                  <Table.Cell hideOn="md" className="text-xs">{log.portal_nome || "-"}</Table.Cell>
                  <Table.Cell hideOn="md" className="text-xs">{log.contexto_tipo || "-"}</Table.Cell>
                  <Table.Cell>
                    {statusBadge(log.status)}
                    {log.skip_motivo && <span className="ml-2 text-xs text-gray-500">({log.skip_motivo})</span>}
                  </Table.Cell>
                  <Table.Cell>
                    {(log.mensagem || log.erro_msg) && (
                      <Button
                        size="sm" variant="ghost" icon={expandedLogId === log.id ? EyeOff : Eye}
                        className="!text-blue-400 hover:!text-blue-300"
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                      >
                        {expandedLogId === log.id ? "Ocultar" : "Ver"}
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
                {expandedLogId === log.id && (
                  <tr className="bg-[#0f111a]">
                    <td colSpan="6" className="px-4 py-3">
                      {log.erro_msg && (
                        <div className="mb-2">
                          <div className="text-xs text-red-400 font-medium mb-1">Erro:</div>
                          <div className="text-xs text-red-300 font-mono">{log.erro_msg}</div>
                        </div>
                      )}
                      {log.mensagem && (
                        <div>
                          <div className="text-xs text-gray-400 font-medium mb-1">Mensagem enviada:</div>
                          <div className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-[#1a1d27] p-2 rounded">{log.mensagem}</div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </Table.Body>
        </Table>

        <Pagination
          page={logsPage}
          totalPages={Math.max(1, Math.ceil(logsTotal / PER_PAGE))}
          total={logsTotal}
          onPageChange={setLogsPage}
          itemLabel="envios"
        />
      </Card>
    </AdminLayout>
  );
}
