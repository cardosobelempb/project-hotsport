// frontend/src/pages/admin/UsuariosRadius.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, RefreshCw, Search, WifiOff, Trash2, Loader2 } from 'lucide-react';
import { Button, IconButton, Input, Select, Card, Table } from '../../components/ui';
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

  // ── criação ─────────────────────────────────────────────────────────────────
  const [novoUsername,      setNovoUsername]      = useState('');
  const [novoPassword,      setNovoPassword]      = useState('');
  const [planos,            setPlanos]            = useState([]);
  const [planoSelecionado,  setPlanoSelecionado]  = useState('');
  const [statusModal,       setStatusModal]       = useState('');
  const [mostrarModal,      setMostrarModal]      = useState(false);

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

  // Reinicia na pág 1 quando filtros mudam
  useEffect(() => {
    setPage(1);
    carregarUsuarios(1);
  }, [filtroUsername, filtroPlano]); // eslint-disable-line

  // Carrega quando page muda (exceto quando foi reset pelo filtro acima)
  useEffect(() => {
    carregarUsuarios(page);
  }, [page]); // eslint-disable-line

  // ── criar usuário ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!novoUsername || !novoPassword || !planoSelecionado) {
      setStatusModal('Preencha usuário, senha e plano.');
      return;
    }
    try {
      await axios.post('/api/radius/criar-usuario', { username: novoUsername, password: novoPassword }, { headers });
      await axios.post('/api/radius/vincular-plano', { username: novoUsername, planoId: planoSelecionado }, { headers });
      setStatusModal('Usuário criado com sucesso!');
      setNovoUsername(''); setNovoPassword(''); setPlanoSelecionado('');
      setTimeout(() => { setMostrarModal(false); setStatusModal(''); }, 800);
      carregarUsuarios(1);
    } catch (err) {
      setStatusModal(err.response?.data?.error || 'Erro ao criar usuário.');
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
        </div>

        <Button icon={Plus} className="mb-4 !bg-green-600 hover:!bg-green-700" onClick={() => setMostrarModal(true)}>
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

        {/* ── modal criação ───────────────────────────────────────────────────── */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Novo Usuário RADIUS</h3>
              <Input
                placeholder="Usuário"
                containerClassName="mb-2"
                value={novoUsername} onChange={e => setNovoUsername(e.target.value)}
              />
              <Input
                type="password" placeholder="Senha"
                containerClassName="mb-2"
                value={novoPassword} onChange={e => setNovoPassword(e.target.value)}
              />
              <Select
                containerClassName="mb-4"
                value={planoSelecionado} onChange={e => setPlanoSelecionado(e.target.value)}
              >
                <option value="">Selecione um plano *</option>
                {planos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => { setMostrarModal(false); setStatusModal(''); }}>Cancelar</Button>
                <Button variant="primary" onClick={handleSubmit}>Salvar</Button>
              </div>
              {statusModal && <p className="text-sm text-gray-400 mt-2">{statusModal}</p>}
            </Card>
          </div>
        )}

        {/* ── tabela ─────────────────────────────────────────────────────────── */}
        <Card className="overflow-hidden mt-2">
          <Table>
            <Table.Head>
              <Table.HeadCell>Usuário</Table.HeadCell>
              <Table.HeadCell hideOn="md">Senha</Table.HeadCell>
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
                  <Table.Cell hideOn="md">{u.senha}</Table.Cell>
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
                        icon={desconectando === u.username ? Loader2 : WifiOff}
                        variant="default"
                        className={desconectando === u.username ? 'animate-spin' : ''}
                        disabled={desconectando === u.username || !u.nas_ip}
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
                <Table.Empty colSpan={8}>Nenhum usuário encontrado.</Table.Empty>
              )}
            </Table.Body>
          </Table>
        </Card>

        {/* ── paginação ──────────────────────────────────────────────────────── */}
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="usuários" />
      </div>
    </AdminLayout>
  );
};

export default UsuariosRadius;
