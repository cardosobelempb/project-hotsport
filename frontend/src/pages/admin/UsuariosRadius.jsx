// frontend/src/pages/admin/UsuariosRadius.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, RefreshCw, Search, WifiOff, Trash2, Eye, EyeOff, Pencil } from 'lucide-react';
import { Button, IconButton, Input, Select, Card, Table, Modal } from '../../components/ui';
import Pagination from '../../components/ui/Pagination';
import { useFeedback } from '../../contexts/FeedbackContext';

const PER_PAGE = 12;

function fmtDuracao(min) {
  if (!min) return '-';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

function fmtData(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-BR');
}

// Usuarios sem plano vinculado (trial, campanha, pix) tem os valores reais nos
// atributos RADIUS — deriva download/upload/duracao/plano deles.
function resolverExibicao(u) {
  // rate_limit formato "up/down" ex: "2M/10M"
  const [rateUp, rateDown] = (u.rate_limit || '').split('/');
  const segundos = Number(u.max_daily_session || u.session_timeout || 0);
  const isTemp = /^pix(free)?_/.test(u.username || '');
  return {
    plano: u.plano || (isTemp ? 'PIX temporário' : (u.rate_limit ? 'Avulso' : '-')),
    download: u.velocidade_down ? `${u.velocidade_down}M` : (rateDown || '-'),
    upload: u.velocidade_up ? `${u.velocidade_up}M` : (rateUp || '-'),
    duracao: u.duracao_minutos ? fmtDuracao(u.duracao_minutos) : (segundos ? fmtDuracao(Math.round(segundos / 60)) : '-'),
  };
}

const UsuariosRadius = () => {
  const { showError, showSuccess, confirm } = useFeedback();
  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  // ── status FreeRADIUS ────────────────────────────────────────────────────────
  const [radiusStatus,        setRadiusStatus]        = useState(null); // null=carregando, {online, latencia_ms, erro}
  const [testando,            setTestando]            = useState(false);

  // ── diagnóstico RADIUS ───────────────────────────────────────────────────────
  const [diagOpen,     setDiagOpen]     = useState(false);
  const [diagData,     setDiagData]     = useState(null);
  const [diagLoading,  setDiagLoading]  = useState(false);

  // ── planos (usado no form) ───────────────────────────────────────────────────
  const [planos, setPlanos] = useState([]);

  // ── form criar/editar ────────────────────────────────────────────────────────
  const [formOpen,        setFormOpen]        = useState(false);
  const [formMode,        setFormMode]        = useState('create'); // 'create' | 'edit'
  const [formUsername,    setFormUsername]    = useState('');
  const [formPassword,    setFormPassword]    = useState('');
  const [formPlanoId,     setFormPlanoId]     = useState('');
  const [formErro,        setFormErro]        = useState('');
  const [formCarregando,  setFormCarregando]  = useState(false);
  const [salvando,        setSalvando]        = useState(false);

  // ── ver detalhes ─────────────────────────────────────────────────────────────
  const [detalheOpen,       setDetalheOpen]       = useState(false);
  const [detalhe,           setDetalhe]           = useState(null);
  const [detalheCarregando, setDetalheCarregando] = useState(false);
  const [senhaVisivel,      setSenhaVisivel]      = useState(false);

  // ── listagem ─────────────────────────────────────────────────────────────────
  const [usuarios,   setUsuarios]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── filtros ──────────────────────────────────────────────────────────────────
  const [filtroUsername, setFiltroUsername] = useState('');
  const [filtroPlano,    setFiltroPlano]    = useState('');

  // ── desconexão ───────────────────────────────────────────────────────────────
  const [desconectando, setDesconectando] = useState(null);

  // Verifica status do FreeRADIUS
  const testarRadius = useCallback(async () => {
    setTestando(true);
    try {
      const res = await axios.get('/api/radius/status', { headers });
      setRadiusStatus(res.data);
    } catch {
      setRadiusStatus({ online: false, erro: 'Erro ao contactar backend' });
    } finally {
      setTestando(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { testarRadius(); }, []); // eslint-disable-line

  const abrirDiagnostico = async () => {
    setDiagOpen(true);
    setDiagLoading(true);
    try {
      const res = await axios.get('/api/radius/diagnostico', { headers });
      setDiagData(res.data);
    } catch {
      setDiagData({ erro: 'Não foi possível obter diagnóstico.' });
    } finally {
      setDiagLoading(false);
    }
  };

  // Carrega planos uma vez
  useEffect(() => {
    axios.get('/api/planos', { headers })
      .then(res => setPlanos(res.data))
      .catch(() => {});
  }, []); // eslint-disable-line

  // Carrega usuários com filtros e paginação
  const carregarUsuarios = useCallback(async (p) => {
    try {
      const params = { page: p, per_page: PER_PAGE };
      if (filtroUsername) params.username = filtroUsername;
      if (filtroPlano)    params.plano    = filtroPlano;

      const res = await axios.get('/api/radius/usuarios', { headers, params });
      setUsuarios(res.data.data);
      setTotal(res.data.total);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch {
      /* silencioso — não sobrescreve lista existente em falha transitória */
    }
  }, [filtroUsername, filtroPlano]); // eslint-disable-line

  // Reinicia na pág 1 quando filtros mudam (com debounce pra não disparar 1 req/tecla)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      carregarUsuarios(1);
    }, 400);
    return () => clearTimeout(t);
  }, [filtroUsername, filtroPlano]); // eslint-disable-line

  // Carrega quando page muda (exceto quando foi reset pelo filtro acima)
  useEffect(() => {
    carregarUsuarios(page);
  }, [page]); // eslint-disable-line

  const buscarDetalhe = async (username) => {
    const res = await axios.get(`/api/radius/usuarios/${username}`, { headers });
    return res.data.data;
  };

  // ── abrir form (criar/editar) ────────────────────────────────────────────────
  const abrirCriar = () => {
    setFormMode('create');
    setFormUsername('');
    setFormPassword('');
    setFormPlanoId('');
    setFormErro('');
    setFormOpen(true);
  };

  const abrirEditar = async (u) => {
    setFormMode('edit');
    setFormUsername(u.username);
    setFormPassword('');
    setFormPlanoId('');
    setFormErro('');
    setFormOpen(true);
    setFormCarregando(true);
    try {
      const d = await buscarDetalhe(u.username);
      setFormPlanoId(d.plano_id || '');
    } catch (err) {
      setFormErro(err.response?.data?.error || 'Erro ao carregar dados do usuário.');
    } finally {
      setFormCarregando(false);
    }
  };

  // ── ver detalhes ─────────────────────────────────────────────────────────────
  const abrirDetalhe = async (u) => {
    setDetalheOpen(true);
    setDetalheCarregando(true);
    setSenhaVisivel(false);
    setDetalhe(null);
    try {
      const d = await buscarDetalhe(u.username);
      setDetalhe(d);
    } catch (err) {
      showError(err.response?.data?.error || 'Erro ao carregar detalhes do usuário.');
      setDetalheOpen(false);
    } finally {
      setDetalheCarregando(false);
    }
  };

  // ── salvar (criar ou editar) ─────────────────────────────────────────────────
  const salvarUsuario = async () => {
    if (formMode === 'create') {
      if (!formUsername || !formPassword || !formPlanoId) {
        setFormErro('Preencha usuário, senha e plano.');
        return;
      }
    } else if (!formPassword && !formPlanoId) {
      setFormErro('Altere a senha e/ou o plano.');
      return;
    }

    setSalvando(true);
    setFormErro('');
    try {
      if (formMode === 'create') {
        await axios.post('/api/radius/criar-usuario', { username: formUsername, password: formPassword }, { headers });
        await axios.post('/api/radius/vincular-plano', { username: formUsername, planoId: formPlanoId }, { headers });
        showSuccess('Usuário criado com sucesso.');
        setFormOpen(false);
        carregarUsuarios(1);
      } else {
        const body = {};
        if (formPassword) body.password = formPassword;
        if (formPlanoId)  body.plano_id = formPlanoId;
        await axios.put(`/api/radius/usuarios/${formUsername}`, body, { headers });
        showSuccess('Usuário atualizado com sucesso.');
        setFormOpen(false);
        carregarUsuarios(page);
      }
    } catch (err) {
      setFormErro(err.response?.data?.error || 'Erro ao salvar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  // ── excluir usuário ──────────────────────────────────────────────────────────
  const handleDeletar = async (uname) => {
    if (!(await confirm({ title: "Excluir usuário RADIUS", message: `Remover permanentemente o usuário ${uname} do RADIUS?`, danger: true, confirmText: "Remover" }))) return;
    try {
      await axios.delete(`/api/radius/usuarios/${uname}`, { headers });
      carregarUsuarios(page);
    } catch {
      showError('Erro ao deletar usuário');
    }
  };

  // ── desconectar sessão ativa (mantém conta RADIUS) ───────────────────────────
  const handleDesconectar = async (u) => {
    if (!(await confirm({ title: "Desconectar sessão", message: `Desconectar sessão ativa de "${u.username}" do MikroTik?\n(A conta RADIUS permanece ativa)`, danger: true, confirmText: "Desconectar" }))) return;
    setDesconectando(u.username);
    try {
      await axios.post('/api/radius/desconectar', { username: u.username, nas_ip: u.nas_ip }, { headers, timeout: 15000 });
      showSuccess(`Sessão de ${u.username} desconectada.`);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        showError('O MikroTik não respondeu em 15s. Verifique a conexão com o equipamento.');
      } else {
        showError(err.response?.data?.error || 'Erro ao desconectar sessão');
      }
    } finally {
      setDesconectando(null);
    }
  };

  const detalheExibicao = detalhe ? resolverExibicao(detalhe) : null;

  return (
    <AdminLayout>
      <div className="p-4 max-w-7xl">
        <h2 className="text-xl font-bold mb-4">Usuários RADIUS</h2>

        {/* ── status FreeRADIUS ──────────────────────────────────────────────── */}
        <div className={`flex items-center gap-3 mb-4 px-4 py-3 rounded-lg border text-sm ${
          radiusStatus === null
            ? 'bg-gray-800/50 border-gray-700 text-gray-400'
            : radiusStatus.online
              ? 'bg-green-900/30 border-green-700/50 text-green-300'
              : 'bg-red-900/30 border-red-700/50 text-red-300'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            radiusStatus === null ? 'bg-gray-500' :
            radiusStatus.online  ? 'bg-green-400 animate-pulse' : 'bg-red-500'
          }`} />

          <span className="font-medium">
            FreeRADIUS:&nbsp;
            {radiusStatus === null ? 'verificando...' :
             radiusStatus.online  ? `Online${radiusStatus.latencia_ms != null ? ` · ${radiusStatus.latencia_ms}ms` : ''}` :
             `Offline — ${radiusStatus.erro || 'Connection refused'}`}
          </span>

          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            loading={testando}
            className={radiusStatus?.online ? '!text-green-400 !border-green-600 hover:!bg-green-800/40' : '!text-red-400 !border-red-600 hover:!bg-red-800/40'}
            onClick={testarRadius}
          >
            {radiusStatus?.online ? 'Testar novamente' : 'Reconectar'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            loading={diagLoading}
            className="ml-auto !text-blue-400 !border-blue-700 hover:!bg-blue-900/30"
            onClick={abrirDiagnostico}
          >
            Diagnóstico RADIUS
          </Button>
        </div>

        <Button icon={Plus} className="mb-4 !bg-green-600 hover:!bg-green-700" onClick={abrirCriar}>
          Novo Usuário
        </Button>

        {/* ── filtros ────────────────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-4 flex-wrap items-center">
          <Input
            icon={Search}
            placeholder="Filtrar por usuário..."
            containerClassName="w-56"
            value={filtroUsername}
            onChange={e => setFiltroUsername(e.target.value)}
          />
          <Input
            icon={Search}
            placeholder="Filtrar por plano..."
            containerClassName="w-56"
            value={filtroPlano}
            onChange={e => setFiltroPlano(e.target.value)}
          />
          <span className="text-gray-400 text-sm">{total} usuário(s)</span>
        </div>

        {/* ── modal criar/editar ───────────────────────────────────────────────── */}
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={formMode === 'create' ? 'Novo Usuário RADIUS' : `Editar ${formUsername}`}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button variant="primary" loading={salvando} disabled={formCarregando} onClick={salvarUsuario}>Salvar</Button>
            </>
          )}
        >
          <Input
            placeholder="Usuário"
            containerClassName="mb-2"
            value={formUsername}
            disabled={formMode === 'edit'}
            onChange={e => setFormUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder={formMode === 'edit' ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
            containerClassName="mb-2"
            value={formPassword}
            disabled={formCarregando}
            onChange={e => setFormPassword(e.target.value)}
          />
          <Select
            containerClassName="mb-2"
            value={formPlanoId}
            disabled={formCarregando}
            onChange={e => setFormPlanoId(e.target.value)}
          >
            <option value="">{formMode === 'edit' ? 'Manter plano atual' : 'Selecione um plano *'}</option>
            {planos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Select>
          {formErro && <p className="text-sm text-red-400 mt-2">{formErro}</p>}
        </Modal>

        {/* ── modal ver detalhes ────────────────────────────────────────────────── */}
        <Modal
          open={detalheOpen}
          onClose={() => setDetalheOpen(false)}
          title={detalhe ? `Detalhes de ${detalhe.username}` : 'Detalhes do usuário'}
          footer={detalhe && (
            <Button variant="secondary" icon={Pencil} onClick={() => { setDetalheOpen(false); abrirEditar(detalhe); }}>
              Editar
            </Button>
          )}
        >
          {detalheCarregando && <p className="text-sm text-gray-400">Carregando...</p>}
          {!detalheCarregando && detalhe && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="col-span-2">
                <dt className="text-gray-500">Senha</dt>
                <dd className="flex items-center gap-2 font-mono text-gray-200">
                  {senhaVisivel ? detalhe.senha : '••••••••'}
                  <IconButton
                    icon={senhaVisivel ? EyeOff : Eye}
                    title={senhaVisivel ? 'Ocultar senha' : 'Revelar senha'}
                    onClick={() => setSenhaVisivel(v => !v)}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Plano</dt>
                <dd className="text-gray-200">{detalheExibicao.plano}</dd>
              </div>
              <div>
                <dt className="text-gray-500">NAS</dt>
                <dd className="text-gray-200">{detalhe.nas || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Download</dt>
                <dd className="text-gray-200">{detalheExibicao.download}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Upload</dt>
                <dd className="text-gray-200">{detalheExibicao.upload}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Duração</dt>
                <dd className="text-gray-200">{detalheExibicao.duracao}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Sessões simultâneas</dt>
                <dd className="text-gray-200">{detalhe.simultaneous_use || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Rate limit (RADIUS)</dt>
                <dd className="text-gray-200">{detalhe.rate_limit || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Session timeout (s)</dt>
                <dd className="text-gray-200">{detalhe.session_timeout || '-'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Criado em</dt>
                <dd className="text-gray-200">{fmtData(detalhe.criado_em)}</dd>
              </div>
            </dl>
          )}
        </Modal>

        {/* ── tabela ─────────────────────────────────────────────────────────── */}
        <Card className="overflow-hidden mt-2">
          <Table>
            <Table.Head>
              <Table.HeadCell>Usuário</Table.HeadCell>
              <Table.HeadCell>Plano</Table.HeadCell>
              <Table.HeadCell hideOn="lg">Download</Table.HeadCell>
              <Table.HeadCell hideOn="lg">Upload</Table.HeadCell>
              <Table.HeadCell hideOn="md">Duração</Table.HeadCell>
              <Table.HeadCell hideOn="lg">NAS</Table.HeadCell>
              <Table.HeadCell>Ações</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {usuarios.map((u, idx) => {
                const ex = resolverExibicao(u);
                return (
                <Table.Row key={idx}>
                  <Table.Cell className="font-mono text-xs">{u.username}</Table.Cell>
                  <Table.Cell>
                    {ex.plano}
                    {!u.plano && ex.plano !== '-' && (
                      <span className="block text-[11px] text-gray-500">sem plano vinculado</span>
                    )}
                  </Table.Cell>
                  <Table.Cell hideOn="lg">{ex.download}</Table.Cell>
                  <Table.Cell hideOn="lg">{ex.upload}</Table.Cell>
                  <Table.Cell hideOn="md">{ex.duracao}</Table.Cell>
                  <Table.Cell hideOn="lg">{u.nas || '-'}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <IconButton
                        icon={Eye}
                        variant="default"
                        title="Ver detalhes"
                        onClick={() => abrirDetalhe(u)}
                      />
                      <IconButton
                        icon={Pencil}
                        variant="default"
                        title="Editar usuário"
                        onClick={() => abrirEditar(u)}
                      />
                      <IconButton
                        icon={WifiOff}
                        variant="default"
                        loading={desconectando === u.username}
                        disabled={!u.nas_ip}
                        title={!u.nas_ip ? 'Sem NAS associado' : 'Desconectar sessão ativa (conta RADIUS mantida)'}
                        onClick={() => handleDesconectar(u)}
                      />
                      <IconButton
                        icon={Trash2}
                        variant="danger"
                        title="Excluir usuário do RADIUS"
                        onClick={() => handleDeletar(u.username)}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
                );
              })}
              {usuarios.length === 0 && (
                <Table.Empty colSpan={7}>Nenhum usuário encontrado.</Table.Empty>
              )}
            </Table.Body>
          </Table>
        </Card>

        {/* ── paginação ──────────────────────────────────────────────────────── */}
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="usuários" />
      </div>

      {/* ── modal diagnóstico RADIUS ─────────────────────────────────────────── */}
      <Modal open={diagOpen} onClose={() => setDiagOpen(false)} title="Diagnóstico RADIUS" size="lg">
        {diagLoading && <p className="text-gray-400 text-sm p-4">Carregando diagnóstico...</p>}
        {diagData && !diagLoading && (
          diagData.erro ? (
            <p className="text-red-400 p-4">{diagData.erro}</p>
          ) : (
            <div className="p-4 space-y-4 text-sm">

              {/* Alerta principal */}
              <div className={`px-4 py-3 rounded-lg border font-medium ${
                !diagData.diagnostico.freeradius_online
                  ? 'bg-red-900/30 border-red-700 text-red-300'
                  : diagData.diagnostico.postauth_vazio || diagData.diagnostico.radacct_vazio
                  ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
                  : diagData.sessoes_visiveis_empresa === 0
                  ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
                  : 'bg-green-900/30 border-green-700 text-green-300'
              }`}>
                {diagData.diagnostico.problema_provavel}
              </div>

              {/* FreeRADIUS status */}
              <div className="flex items-center gap-3">
                <p className="text-gray-400 font-semibold">FreeRADIUS:</p>
                {diagData.freeradius?.online ? (
                  <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Online ({diagData.freeradius.latencia_ms}ms)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Offline — {diagData.freeradius?.erro || 'sem resposta'}
                    <span className="text-red-300 font-normal ml-1">→ reiniciar container <code className="bg-gray-900 px-1 rounded">hotspot-freeradius</code></span>
                  </span>
                )}
              </div>

              {/* NAS */}
              <div>
                <p className="text-gray-400 font-semibold mb-1">Entradas NAS desta empresa ({diagData.nas.length})</p>
                {diagData.nas.length === 0
                  ? <p className="text-red-400">Nenhum NAS registrado — cadastre um MikroTik primeiro.</p>
                  : diagData.nas.map((n, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded px-3 py-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${n.secret_correto ? 'bg-green-400' : 'bg-red-500'}`} />
                      <span className="font-mono text-xs text-gray-200">{n.nasname}</span>
                      <span className="text-gray-400">{n.shortname}</span>
                      <span className={`ml-auto text-xs ${n.secret_correto ? 'text-green-400' : 'text-red-400'}`}>
                        {n.secret_correto ? `✓ secret = ${n.secret_esperado}` : `✗ secret errado (esperado: ${n.secret_esperado}) — rode o wizard novamente`}
                      </span>
                    </div>
                  ))
                }
              </div>

              {/* Contadores RADIUS */}
              <div>
                <p className="text-gray-400 font-semibold mb-2">Contadores RADIUS</p>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  {[
                    {
                      label: 'Auth recebidas (radpostauth)',
                      val: diagData.radpostauth?.total ?? '—',
                      ok: (diagData.radpostauth?.total ?? 0) > 0,
                      hint: (diagData.radpostauth?.total ?? 0) === 0 ? 'MikroTik não está enviando RADIUS' : null,
                    },
                    {
                      label: 'Sessões gravadas (radacct)',
                      val: diagData.radacct.total,
                      ok: diagData.radacct.total > 0,
                      hint: diagData.radacct.total === 0 && (diagData.radpostauth?.total ?? 0) > 0 ? 'Auth chegando mas accounting não grava' : null,
                    },
                    {
                      label: 'Sessões ativas (global)',
                      val: diagData.radacct.sessoes_ativas,
                      ok: true,
                      hint: null,
                    },
                    {
                      label: 'Visíveis nesta empresa',
                      val: diagData.sessoes_visiveis_empresa,
                      ok: diagData.sessoes_visiveis_empresa > 0 || diagData.radacct.total === 0,
                      hint: null,
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-800/50 rounded px-3 py-2 text-center">
                      <p className={`text-lg font-bold ${item.ok ? 'text-white' : 'text-red-400'}`}>{item.val}</p>
                      <p className="text-gray-400 text-xs">{item.label}</p>
                      {item.hint && <p className="text-yellow-400 text-xs mt-0.5">{item.hint}</p>}
                    </div>
                  ))}
                </div>

                {/* Instruções contextuais */}
                {!diagData.diagnostico.freeradius_online ? (
                  <div className="bg-red-900/20 border border-red-700/40 rounded p-3 text-red-300 text-xs space-y-1">
                    <p className="font-semibold">FreeRADIUS offline. O que fazer:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>No Coolify → reiniciar o container <code className="bg-gray-900 px-1 rounded">hotspot-freeradius</code></li>
                      <li>Se reiniciar não resolver, verificar logs do container no Coolify</li>
                      <li>Se o wg-easy foi recriado recentemente, recriar também o freeradius</li>
                    </ol>
                  </div>
                ) : (diagData.radpostauth?.total ?? 0) === 0 ? (
                  <div className="bg-yellow-900/20 border border-yellow-700/40 rounded p-3 text-yellow-300 text-xs space-y-1">
                    <p className="font-semibold">FreeRADIUS online mas o MikroTik não está enviando pacotes RADIUS. O que fazer:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li><strong>Re-executar o wizard</strong> de cada MikroTik (botão Wifi na lista de MikroTiks) — reconfigura o secret RADIUS no roteador</li>
                      <li>Após o wizard, pedir para um cliente conectar ao WiFi e passar pelo portal</li>
                      <li>Abrir diagnóstico novamente para confirmar que radpostauth aumentou</li>
                    </ol>
                  </div>
                ) : diagData.radacct.total > 0 ? (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Últimas sessões (qualquer empresa):</p>
                    <div className="bg-gray-900 rounded p-2 overflow-x-auto">
                      <table className="text-xs w-full">
                        <thead><tr className="text-gray-500">
                          <th className="text-left pr-3">Username</th>
                          <th className="text-left pr-3">MAC</th>
                          <th className="text-left pr-3">NAS IP</th>
                          <th className="text-left">Início</th>
                        </tr></thead>
                        <tbody>{diagData.radacct.ultimas.map((r, i) => (
                          <tr key={i} className="text-gray-300">
                            <td className="font-mono pr-3">{r.username}</td>
                            <td className="font-mono pr-3">{r.mac}</td>
                            <td className="font-mono pr-3">{r.nas_ip}</td>
                            <td>{r.acctstarttime ? new Date(r.acctstarttime).toLocaleString('pt-BR') : '-'}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* radius_users */}
              <div>
                <p className="text-gray-400 font-semibold mb-1">Usuários RADIUS desta empresa</p>
                <div className={`rounded px-3 py-2 ${diagData.radius_users.total_empresa > 0 ? 'bg-gray-800/50 text-white' : 'bg-red-900/20 border border-red-700/40 text-red-300'}`}>
                  {diagData.radius_users.total_empresa} usuário(s) provisionado(s)
                  {diagData.radius_users.total_empresa === 0 && ' — nenhum cliente passou pelo portal ainda.'}
                </div>
              </div>

            </div>
          )
        )}
      </Modal>
    </AdminLayout>
  );
};

export default UsuariosRadius;
