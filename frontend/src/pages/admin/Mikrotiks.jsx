import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Wifi, Send, Monitor, Activity, Plug, Info as InfoIcon, Pencil, Trash2, X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button, IconButton, Input, Select, Card, Table } from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";
import { getPortalTipoLabel } from "../../constants/portalTipos";

export default function Mikrotiks() {
  const { showError, showSuccess, confirm } = useFeedback();
  const [mikrotiks, setMikrotiks] = useState([]);
  const [portais, setPortais] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [hotspotLog, setHotspotLog] = useState([]);
  const [enviandoHotspot, setEnviandoHotspot] = useState(null);
  const [enviandoLogin, setEnviandoLogin] = useState(null);
  const [enviandoStatus, setEnviandoStatus] = useState(null);
  const [mikrotikInfo, setMikrotikInfo] = useState(null);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [diagData, setDiagData] = useState(null);
  const [diagLoading, setDiagLoading] = useState(null);
  const [form, setForm] = useState({ nome: "", ip: "", usuario: "", senha: "", porta: 8728, end_hotspot: "", portal_id: "", vpn_ip: "" });
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [loginAutoMsg, setLoginAutoMsg] = useState(null);

  const token = localStorage.getItem("admin_token");

  const enviarLoginSilencioso = async (id) => {
    setLoginAutoMsg({ tipo: "info", texto: "Enviando configuração do portal ao MikroTik..." });
    try {
      const res = await fetch(`/api/mikrotiks/${id}/enviar-login`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLoginAutoMsg({ tipo: "ok", texto: "Portal configurado! login.html enviado ao MikroTik com sucesso." });
      } else {
        setLoginAutoMsg({ tipo: "aviso", texto: "Portal salvo no sistema. Para ativar no equipamento, clique no botão 'Login'." });
      }
    } catch {
      setLoginAutoMsg({ tipo: "aviso", texto: "Portal salvo no sistema. Para ativar no equipamento, clique no botão 'Login'." });
    }
    setTimeout(() => setLoginAutoMsg(null), 8000);
  };

  const carregarPortais = async () => {
    try {
      const res = await fetch("/api/portais", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPortais(data);
    } catch (err) { console.error(err); }
  };

  // Wizard states
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardMikrotikId, setWizardMikrotikId] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [wizardConfig, setWizardConfig] = useState({
    interface: "", localAddress: "10.5.50.1/24", poolName: "hs-pool", poolRange: "10.5.50.10-10.5.50.254", dnsName: "", radiusServerIp: "10.8.0.1"
  });

  const abrirWizard = async (id) => {
    setWizardMikrotikId(id);
    setScanning(true);
    setScanData(null);
    setShowWizard(true);
    setWizardStep(0);
    setWizardConfig({ interface: "", localAddress: "10.5.50.1/24", poolName: "hs-pool", poolRange: "10.5.50.10-10.5.50.254", dnsName: "", radiusServerIp: "10.8.0.1" });

    try {
      const res = await fetch(`/api/mikrotiks/${id}/scan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { showError(data.message); setShowWizard(false); return; }
      setScanData(data);
      if (data.interfaces?.length > 0) {
        setWizardConfig(c => ({ ...c, interface: data.interfaces[0]?.name || "ether2" }));
      }
      if (data.pools?.length > 0) {
        setWizardConfig(c => ({ ...c, poolName: data.pools[0].name, poolRange: data.pools[0].ranges }));
      }
    } catch (err) {
      showError("Erro ao escanear Mikrotik");
      setShowWizard(false);
    } finally {
      setScanning(false);
    }
  };

  const executarWizard = async () => {
    setEnviandoHotspot(wizardMikrotikId);
    setShowWizard(false);
    setHotspotLog([]);
    setShowLogModal(true);

    try {
      const res = await fetch(`/api/mikrotiks/${wizardMikrotikId}/enviar-hotspot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(wizardConfig),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "step") {
              setHotspotLog(prev => [...prev, `[${event.status}] ${event.message}`]);
            } else if (event.type === "error") {
              setHotspotLog(prev => [...prev, `[erro] ${event.message}`]);
            } else if (event.type === "done") {
              if (event.success) {
                setHotspotLog(prev => [...prev, "--- Configuracao finalizada com sucesso! ---"]);
              }
              carregarMikrotiks();
            }
          } catch (e) { /* parse error, ignora */ }
        }
      }
    } catch (err) {
      setHotspotLog(prev => [...prev, `[erro] Falha de conexao: ${err.message}`]);
    } finally {
      setEnviandoHotspot(null);
    }
  };

const carregarMikrotiks = async () => {
  try {
    const res = await fetch("/api/mikrotiks", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    // Inicia todos com status "loading"
    const mikrotiksComStatus = data.map(m => ({ ...m, status: "loading", status_erro: "" }));
    setMikrotiks(mikrotiksComStatus);

    // Testa conexão de cada Mikrotik
    for (const m of data) {
      try {
        const res = await fetch(`/api/mikrotiks/${m.id}/testar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        setMikrotiks(prev => prev.map(item =>
          item.id === m.id
            ? {
                ...item,
                status: res.ok ? "online" : "offline",
                status_erro: res.ok ? "" : (result?.message || "Falha ao conectar"),
              }
            : item
        ));
      } catch (err) {
        setMikrotiks(prev => prev.map(item =>
          item.id === m.id
            ? { ...item, status: "offline", status_erro: err?.message || "Erro de rede" }
            : item
        ));
      }
    }
  } catch (err) {
    setErro("Erro ao buscar Mikrotiks");
  }
};
  const salvarMikrotik = async (e) => {
    e.preventDefault();
    setErro("");

    const method = editandoId ? "PUT" : "POST";
    const url = editandoId ? `/api/mikrotiks/${editandoId}` : "/api/mikrotiks";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || "Erro ao salvar");
      } else {
        const savedId = editandoId || data.id;
        const portalSelecionado = form.portal_id;
        setShowModal(false);
        setForm({ nome: "", ip: "", usuario: "", senha: "", porta: 8728, end_hotspot: "", portal_id: "", vpn_ip: "" });
        setEditandoId(null);
        carregarMikrotiks();
        if (portalSelecionado && savedId) {
          enviarLoginSilencioso(savedId);
        }
      }
    } catch {
      setErro("Erro de conexão");
    }
  };

const editar = (mikrotik) => {
  // Recarrega a lista de portais pra refletir portais criados/renomeados
  // depois que esta página foi aberta (o fetch inicial só roda uma vez no mount).
  carregarPortais();
  setForm({ ...mikrotik, end_hotspot: mikrotik.end_hotspot || "", portal_id: mikrotik.portal_id || "" });
  setEditandoId(mikrotik.id);
  setShowModal(true);
};

  const remover = async (id) => {
    if (!(await confirm({ title: "Excluir Mikrotik", message: "Deseja realmente remover este Mikrotik?", danger: true, confirmText: "Remover" }))) return;
    try {
      await fetch(`/api/mikrotiks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarMikrotiks();
    } catch {
      showError("Erro ao deletar Mikrotik");
    }
  };

  const testarConexao = async (id) => {
    try {
      const res = await fetch(`/api/mikrotiks/${id}/testar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        showSuccess("Conexão bem-sucedida com o Mikrotik.", { title: "Teste de conexão" });
      } else {
        showError(`Falha: ${data.message}`, { title: "Teste de conexão" });
      }
    } catch {
      showError("Erro ao testar conexão");
    }
  };

  const abrirInfo = async (id) => {
    try {
      const res = await fetch(`/api/mikrotiks/${id}/info`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMikrotikInfo(data);
        setShowInfoModal(true);
      } else {
        showError(`Erro ao obter informações: ${data.message}`);
      }
    } catch {
      showError("Erro ao conectar ao Mikrotik");
    }
  };

  const enviarLogin = async (id) => {
    setEnviandoLogin(id);
    try {
      const res = await fetch(`/api/mikrotiks/${id}/enviar-login`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const lines = (data.message || '').split(' | ');
      if (data.success) showSuccess(lines, { title: 'Enviar Login Page' });
      else showError(lines, { title: 'Enviar Login Page' });
    } catch {
      showError('Erro de conexão ao enviar login.html', { title: 'Enviar Login Page' });
    } finally {
      setEnviandoLogin(null);
    }
  };

  const enviarStatus = async (id) => {
    setEnviandoStatus(id);
    try {
      const res = await fetch(`/api/mikrotiks/${id}/enviar-status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const lines = (data.message || '').split(' | ');
      if (data.success) showSuccess(lines, { title: 'Enviar Status Page' });
      else showError(lines, { title: 'Enviar Status Page' });
    } catch {
      showError('Erro de conexão ao enviar status.html', { title: 'Enviar Status Page' });
    } finally {
      setEnviandoStatus(null);
    }
  };

  const verificarDiagnostico = async (id) => {
    setDiagLoading(id);
    try {
      const res = await fetch(`/api/mikrotiks/${id}/diagnostico-hotspot`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDiagData(res.ok ? data : { erro: data.message });
      setShowDiagModal(true);
    } catch (err) {
      setDiagData({ erro: 'Erro de rede: ' + err.message });
      setShowDiagModal(true);
    } finally {
      setDiagLoading(null);
    }
  };

  useEffect(() => {
    carregarMikrotiks();
    carregarPortais();
  }, []);

  const { pageData, page, setPage, totalPages, total } = usePagination(mikrotiks, 12);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Mikrotiks</h1>
        <Button
          icon={Plus}
          onClick={() => { carregarPortais(); setShowModal(true); setForm({ nome: "", ip: "", usuario: "", senha: "", porta: 8728, end_hotspot: "", portal_id: "", vpn_ip: "" }); setEditandoId(null); }}
        >
          Adicionar Mikrotik
        </Button>
      </div>

      {loginAutoMsg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
          loginAutoMsg.tipo === 'ok' ? 'bg-green-900/30 border border-green-800/50 text-green-300' :
          loginAutoMsg.tipo === 'aviso' ? 'bg-yellow-900/30 border border-yellow-800/50 text-yellow-300' :
          'bg-blue-900/30 border border-blue-800/50 text-blue-300'
        }`}>
          {loginAutoMsg.tipo === 'info' && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
          {loginAutoMsg.tipo === 'ok' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          {loginAutoMsg.tipo === 'aviso' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          {loginAutoMsg.texto}
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Wifi className="w-5 h-5 text-gray-300" /> Equipamentos Cadastrados
        </h2>
        {erro && <p className="text-red-600 mb-4">{erro}</p>}
        <Table>
          <Table.Head>
            <Table.HeadCell>Nome</Table.HeadCell>
            <Table.HeadCell>IP</Table.HeadCell>
            <Table.HeadCell hideOn="md">Portal</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell hideOn="lg">Usuários Ativos</Table.HeadCell>
            <Table.HeadCell>Ações</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {pageData.length === 0 ? (
              <Table.Empty colSpan={6} />
            ) : pageData.map((m) => (
              <Table.Row key={m.id}>
                <Table.Cell className="font-medium text-white">{m.nome}</Table.Cell>
                <Table.Cell>{m.ip}</Table.Cell>
                <Table.Cell hideOn="md">
                  {m.portal_nome ? (
                    <span className="text-xs px-2 py-0.5 rounded border border-blue-800/50 bg-blue-900/20 text-blue-400">{m.portal_nome}</span>
                  ) : (
                    <span className="text-xs text-gray-600">Nenhum</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {m.status === "loading" ? (
                    <span className="text-gray-500 text-xs">Verificando...</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs px-3 py-1 rounded-full text-white w-fit ${m.status === "online" ? "bg-green-600" : "bg-red-600"}`}
                        title={m.status === "offline" ? (m.status_erro || "Sem detalhes") : ""}
                      >
                        {m.status === "online" ? "Online" : "Offline"}
                      </span>
                      {m.status === "offline" && m.status_erro ? (
                        <span className="text-[11px] text-red-300 max-w-[280px] truncate" title={m.status_erro}>
                          {m.status_erro}
                        </span>
                      ) : null}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell hideOn="lg">{m.usuarios_ativos}</Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    <IconButton icon={Wifi} variant="primary" loading={enviandoHotspot === m.id} title="Configurar Hotspot (wizard)" onClick={() => abrirWizard(m.id)} />
                    <IconButton icon={Send} className="!text-green-400 hover:!bg-green-900/20" loading={enviandoLogin === m.id} title="Enviar login.html" onClick={() => enviarLogin(m.id)} />
                    <IconButton icon={Monitor} className="!text-teal-400 hover:!bg-teal-900/20" loading={enviandoStatus === m.id} title="Enviar status.html" onClick={() => enviarStatus(m.id)} />
                    <IconButton icon={Activity} className="!text-purple-400 hover:!bg-purple-900/20" loading={diagLoading === m.id} title="Diagnóstico do Hotspot" onClick={() => verificarDiagnostico(m.id)} />
                    <IconButton icon={Plug} title="Testar conexão" onClick={() => testarConexao(m.id)} />
                    <IconButton icon={InfoIcon} title="Informações" onClick={() => abrirInfo(m.id)} />
                    <IconButton icon={Pencil} title="Editar" onClick={() => editar(m)} />
                    <IconButton icon={Trash2} variant="danger" title="Remover" onClick={() => remover(m.id)} />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="mikrotiks" />

      {showInfoModal && mikrotikInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1d27] rounded-xl border border-gray-700 w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Informações do Mikrotik</h3>
              <button onClick={() => setShowInfoModal(false)} className="text-gray-500 hover:text-gray-300">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-500">Modelo</p>
                <p className="font-medium">{mikrotikInfo.modelo}</p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-500">Versão</p>
                <p className="font-medium">{mikrotikInfo.versao}</p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-500">Uptime</p>
                <p className="font-medium">{mikrotikInfo.uptime}</p>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-500">CPU</p>
                <p className="font-medium">{mikrotikInfo.cpu}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editandoId ? "Editar Mikrotik" : "Adicionar Mikrotik"}</h3>
              <IconButton icon={X} title="Fechar" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={salvarMikrotik} className="space-y-4">
              <Input
                label="Nome"
                placeholder="Ex: Mikrotik Principal"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
              <Input
                label="Endereço IP"
                placeholder="192.168.1.1"
                value={form.ip}
                onChange={(e) => setForm({ ...form, ip: e.target.value })}
                required
              />
              <Input
                label={<>IP VPN (WireGuard) <span className="text-gray-600 font-normal">— opcional, para MikroTik atrás de NAT</span></>}
                placeholder="10.8.0.2"
                value={form.vpn_ip || ""}
                onChange={(e) => setForm({ ...form, vpn_ip: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  label="Usuário"
                  containerClassName="flex-1"
                  value={form.usuario}
                  onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                  required
                />
                <Input
                  label="Porta API"
                  type="number"
                  containerClassName="w-32"
                  value={form.porta}
                  onChange={(e) => setForm({ ...form, porta: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Input
                label="Senha"
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                required
              />
              <Input
                label="Endereço Hotspot"
                placeholder="http://192.168.1.1/login"
                value={form.end_hotspot}
                onChange={(e) => setForm({ ...form, end_hotspot: e.target.value })}
              />
              <Select
                label="Portal Captive"
                value={form.portal_id}
                onChange={(e) => setForm({ ...form, portal_id: e.target.value })}
              >
                <option value="">Nenhum</option>
                {portais.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} ({getPortalTipoLabel(p.tipo)})</option>
                ))}
              </Select>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editandoId ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Hotspot Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] rounded-xl border border-gray-700 w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Hotspot Setup
              </h3>
              <button onClick={() => setShowWizard(false)} className="text-gray-400 hover:text-white cursor-pointer">×</button>
            </div>

            {scanning ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-3 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4" style={{borderWidth: '3px'}}></div>
                <p className="text-gray-400">Escaneando Mikrotik...</p>
              </div>
            ) : scanData && (
              <div className="space-y-4">
                {/* Status */}
                <div className="bg-[#0d1117] rounded-lg p-3 border border-gray-800">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Interfaces</span>
                      <p className="text-white font-medium">{scanData.interfaces?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pools</span>
                      <p className="text-white font-medium">{scanData.pools?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hotspot Ativo</span>
                      <p className="text-white font-medium">{scanData.hotspots?.length ? "Sim" : "Não"}</p>
                    </div>
                  </div>
                </div>

                {/* Interface Selection */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Interface do Hotspot</label>
                  <select
                    className="w-full bg-[#0d1117] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                    value={wizardConfig.interface}
                    onChange={(e) => setWizardConfig({ ...wizardConfig, interface: e.target.value })}
                  >
                    {scanData.interfaces?.map(i => (
                      <option key={i.name} value={i.name}>
                        {i.name} ({i.type}){i.disabled === "true" ? " [desabilitada]" : ""}
                      </option>
                    ))}
                  </select>
                  {scanData.addresses?.filter(a => a.interface === wizardConfig.interface).map(a => (
                    <p key={a.address} className="text-xs text-green-500 mt-1">IP atual: {a.address}</p>
                  ))}
                </div>

                {/* Local Address */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Endereço IP do Hotspot (gateway)</label>
                  <input
                    className="w-full bg-[#0d1117] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    value={wizardConfig.localAddress}
                    onChange={(e) => setWizardConfig({ ...wizardConfig, localAddress: e.target.value })}
                    placeholder="10.5.50.1/24"
                  />
                  <p className="text-xs text-gray-600 mt-1">Será atribuído à interface se ainda não tiver IP</p>
                </div>

                {/* Pool */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nome do Pool</label>
                    <input
                      className="w-full bg-[#0d1117] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      value={wizardConfig.poolName}
                      onChange={(e) => setWizardConfig({ ...wizardConfig, poolName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Range do Pool</label>
                    <input
                      className="w-full bg-[#0d1117] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      value={wizardConfig.poolRange}
                      onChange={(e) => setWizardConfig({ ...wizardConfig, poolRange: e.target.value })}
                      placeholder="10.5.50.10-10.5.50.254"
                    />
                  </div>
                </div>
                {scanData.pools?.length > 0 && (
                  <div className="text-xs text-gray-600">
                    Pools existentes: {scanData.pools.map(p => `${p.name} (${p.ranges})`).join(", ")}
                  </div>
                )}

                {/* DNS Name */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">DNS Name (opcional)</label>
                  <input
                    className="w-full bg-[#0d1117] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    value={wizardConfig.dnsName}
                    onChange={(e) => setWizardConfig({ ...wizardConfig, dnsName: e.target.value })}
                    placeholder="hotspot.minharede.com"
                  />
                </div>

                {/* RADIUS Server IP */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">IP do Servidor RADIUS</label>
                  <input
                    className="w-full bg-[#0d1117] border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    value={wizardConfig.radiusServerIp}
                    onChange={(e) => setWizardConfig({ ...wizardConfig, radiusServerIp: e.target.value })}
                    placeholder="10.8.0.1"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    IP que o MikroTik usa para enviar pacotes RADIUS. Se usa WireGuard, deve ser o IP VPN do servidor (ex: 10.8.0.1).
                    {scanData.radius?.length > 0 && (
                      <span className="text-yellow-500 ml-1">RADIUS existente: {scanData.radius[0].address}</span>
                    )}
                  </p>
                </div>

                {/* Info */}
                <div className="bg-[#0d1117] rounded-lg p-3 border border-gray-800 text-xs text-gray-400 space-y-1">
                  <p className="text-gray-500 font-medium mb-1">Será configurado automaticamente:</p>
                  <p>• RADIUS Client → {wizardConfig.radiusServerIp || "10.8.0.1"}:1812/1813</p>
                  <p>• Walled Garden → domínio do sistema liberado</p>
                  <p>• Login URL → redirect para o portal vinculado</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                  <button
                    onClick={() => setShowWizard(false)}
                    className="px-4 py-2 text-sm text-gray-300 border border-gray-700 rounded hover:bg-[#252b3b] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executarWizard}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer font-medium"
                  >
                    Configurar Hotspot
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hotspot Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] rounded-xl border border-gray-700 w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Log de Configuracao
                {enviandoHotspot && (
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
                )}
              </h3>
              <button onClick={() => { if (!enviandoHotspot) setShowLogModal(false); }} className={`text-gray-400 hover:text-white cursor-pointer ${enviandoHotspot ? 'opacity-30 cursor-not-allowed' : ''}`}>×</button>
            </div>
            <div className="bg-[#0d1117] rounded-lg p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-1" ref={el => { if (el) el.scrollTop = el.scrollHeight; }}>
              {hotspotLog.length === 0 && enviandoHotspot && (
                <div className="text-gray-500 animate-pulse">Conectando ao Mikrotik...</div>
              )}
              {hotspotLog.map((line, i) => (
                <div key={i} className={`flex items-start gap-2 ${
                  line.includes('[erro]') ? 'text-red-400' :
                  line.includes('[aviso]') ? 'text-yellow-400' :
                  line.startsWith('---') ? 'text-blue-400 font-semibold mt-2' :
                  'text-green-400'
                }`}>
                  <span className="text-gray-600 select-none shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLogModal(false)}
                disabled={!!enviandoHotspot}
                className={`px-4 py-2 rounded cursor-pointer text-sm ${enviandoHotspot ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
              >
                {enviandoHotspot ? "Aguarde..." : "Fechar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Modal */}
      {showDiagModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] rounded-xl border border-gray-700 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Diagnóstico do Hotspot</h3>
              <button onClick={() => setShowDiagModal(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl leading-none">×</button>
            </div>
            {diagData?.erro ? (
              <div className="bg-red-900/20 text-red-300 rounded p-3 text-sm">{diagData.erro}</div>
            ) : diagData ? (
              <>
                {/* Status cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'login.html', ok: diagData.diagnostico?.login_html_ok, detail: diagData.diagnostico?.login_html_size ? `${diagData.diagnostico.login_html_size} bytes` : null },
                    { label: 'status.html', ok: diagData.diagnostico?.status_html_ok, detail: diagData.diagnostico?.status_html_size ? `${diagData.diagnostico.status_html_size} bytes` : null },
                    { label: 'html-directory', ok: diagData.diagnostico?.html_directory_ok, detail: diagData.diagnostico?.html_directory_ok ? (diagData.perfis?.[0]?.['html-directory'] || 'hotspot') : (diagData.perfis?.[0]?.['html-directory'] ? `inválido: ${diagData.perfis[0]['html-directory']}` : 'não configurado') },
                    { label: 'Hotspot Server', ok: diagData.diagnostico?.hotspot_ativo, detail: diagData.diagnostico?.hotspot_ativo ? 'ativo' : 'inativo/ausente' },
                  ].map(({ label, ok, detail }) => (
                    <div key={label} className={`rounded-lg p-3 border ${ok ? 'border-green-700 bg-green-900/10' : 'border-red-700 bg-red-900/10'}`}>
                      <div className="flex items-center gap-2">
                        <span className={ok ? 'text-green-400 text-lg' : 'text-red-400 text-lg'}>{ok ? '✓' : '✗'}</span>
                        <span className="text-white text-sm font-medium">{label}</span>
                      </div>
                      {detail && <div className={`text-xs mt-1 ${ok ? 'text-green-400' : 'text-red-400'}`}>{detail}</div>}
                    </div>
                  ))}
                </div>

                {/* Alertas */}
                {diagData.diagnostico?.alertas?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-yellow-400 mb-2">⚠ Alertas</div>
                    <div className="space-y-1">
                      {diagData.diagnostico.alertas.map((a, i) => (
                        <div key={i} className="text-xs bg-yellow-900/20 text-yellow-300 rounded px-3 py-2">{a}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Arquivos */}
                {diagData.arquivos?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-300 mb-2">Arquivos na pasta hotspot</div>
                    <div className="bg-[#0d1117] rounded p-3 font-mono text-xs space-y-1">
                      {diagData.arquivos.map((f, i) => (
                        <div key={i} className="text-gray-300">{f.name} <span className="text-gray-500">({f.size || f['file-size'] || '?'} bytes)</span></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Perfis */}
                {diagData.perfis?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-300 mb-2">Perfis Hotspot</div>
                    <div className="bg-[#0d1117] rounded p-3 font-mono text-xs space-y-1">
                      {diagData.perfis.map((p, i) => (
                        <div key={i} className="text-gray-300">
                          {p.name} — html-directory: <span className={['hotspot', 'flash/hotspot'].includes(p['html-directory']) ? 'text-green-400' : 'text-red-400'}>{p['html-directory'] || '(não definido)'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500 text-sm">Carregando...</div>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowDiagModal(false)} className="px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-500 cursor-pointer">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

