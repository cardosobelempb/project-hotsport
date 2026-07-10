import {
  AlertTriangle,
  Building2,
  ChevronDown,
  ClipboardList,
  Crown,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Network,
  PanelsTopLeft,
  Router,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { empresaSlug } = useParams();
  const { user, logout, isSuperAdmin, empresas, switchEmpresa, hasPermission } = useAuth();
  const { showError } = useFeedback();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switchingEmpresa, setSwitchingEmpresa] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [openMenus, setOpenMenus] = useState({});
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [whatsappAvisoFechado, setWhatsappAvisoFechado] = useState(false);

  const toggleMenu = (key) => setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));

  const slug = empresaSlug || user?.empresa_slug || 'default';
  const basePath = `/admin/${slug}`;

  // Buscar dados da empresa ativa (logo, nome, descrição)
  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/api/empresas/by-slug/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmpresa(data);
        }
      } catch (e) { /* silencioso */ }
    };
    if (slug) fetchEmpresa();
  }, [slug]);

  // Atualizar em tempo real quando alterado em Configurações (PerfilEmpresa)
  useEffect(() => {
    const onLogoAtualizada = (e) => setEmpresa(prev => ({ ...prev, logo_url: e.detail || null }));
    const onPerfilAtualizado = (e) => setEmpresa(prev => ({ ...prev, ...e.detail }));
    window.addEventListener('empresa-logo-atualizada', onLogoAtualizada);
    window.addEventListener('empresa-perfil-atualizado', onPerfilAtualizado);
    return () => {
      window.removeEventListener('empresa-logo-atualizada', onLogoAtualizada);
      window.removeEventListener('empresa-perfil-atualizado', onPerfilAtualizado);
    };
  }, []);

  // Fechar o drawer mobile ao navegar
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Verificar status do WhatsApp para exibir aviso se desconectado
  useEffect(() => {
    const fetchWhatsappStatus = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/whatsapp/instance/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWhatsappStatus(data);
        }
      } catch (e) { /* silencioso */ }
    };
    // Reset do aviso ao trocar de empresa
    setWhatsappAvisoFechado(sessionStorage.getItem(`wa_aviso_fechado_${slug}`) === '1');
    if (slug) fetchWhatsappStatus();
  }, [slug]);

  const fecharAvisoWhatsapp = () => {
    setWhatsappAvisoFechado(true);
    sessionStorage.setItem(`wa_aviso_fechado_${slug}`, '1');
  };

  const whatsappDesconectado = whatsappStatus && (!whatsappStatus.exists || whatsappStatus.state !== 'open');
  const mostrarAvisoWhatsapp = whatsappDesconectado && !whatsappAvisoFechado && !location.pathname.includes('/whatsapp');

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { key: "dashboard", title: "Dashboard", path: basePath, icon: LayoutDashboard },
    ...(isSuperAdmin ? [{ key: "empresas", title: "Empresas", path: `${basePath}/empresas`, icon: Building2 }] : []),
    {
      key: "mikrotik_group",
      title: "Mikrotik",
      icon: Router,
      children: [
        { key: "mikrotiks", title: "Cadastro mikrotik", path: `${basePath}/mikrotiks` },
        { key: "vpn", title: "VPN Wireguard", path: `${basePath}/vpn` },
      ]
    },
    { key: "portais", title: "Portais", path: `${basePath}/portais`, icon: PanelsTopLeft },
    { key: "campanhas", title: "Campanhas", path: `${basePath}/campanhas`, icon: Megaphone },
    { key: "planos", title: "Planos", path: `${basePath}/planos`, icon: ClipboardList },
    {
      key: "clientes_group",
      title: "Clientes",
      icon: Users,
      children: [
        { key: "clientes", title: "Cadastro LGPD", path: `${basePath}/lgpd` },
        { key: "leads", title: "Leads", path: `${basePath}/leads` },
      ]
    },
    {
      key: "radius_group",
      title: "Radius",
      icon: Network,
      children: [
        { key: "radius", title: "Usuários Radius", path: `${basePath}/radius` },
        { key: "sessoes", title: "Sessões Ativas", path: `${basePath}/sessoes` },
        { key: "sessoeslog", title: "Log Radius", path: `${basePath}/sessoeslog` },
        { key: "compliance", title: "Marco Civil", path: `${basePath}/compliance` },
      ]
    },
    { key: "whatsapp", title: "WhatsApp", path: `${basePath}/whatsapp`, icon: MessageCircle },
    {
      key: "configuracoes_group",
      title: "Configurações",
      icon: Settings,
      children: [
        { key: "configuracoes", title: "Configurações", path: `${basePath}/configuracoes` },
        { key: "usuarios", title: "Usuários", path: `${basePath}/usuarios` },
        ...(isSuperAdmin ? [{ key: "grupos-permissao", title: "Permissões", path: `${basePath}/grupos-permissao` }] : []),
      ]
    }
  ];

  // Filtrar menu por permissões
  const filteredMenuItems = menuItems.map(item => {
    if (item.children) {
      const filteredChildren = item.children.filter(child => {
        if (!child.key || child.key === 'dashboard') return true;
        if (isSuperAdmin) return true;
        if (child.key === 'empresas' || child.key === 'grupos-permissao') return false;
        return hasPermission(child.key, 'ver');
      });
      return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
    }

    if (!item.key || item.key === 'dashboard') return item;
    if (isSuperAdmin) return item;
    if (item.key === 'empresas' || item.key === 'grupos-permissao') return null;
    return hasPermission(item.key, 'ver') ? item : null;
  }).filter(Boolean);

  const isActive = (path) => {
    if (path === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(path);
  };

  // Abrir automaticamente o grupo que contém a rota ativa
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children && item.children.some(child => isActive(child.path))) {
        setOpenMenus(prev => (prev[item.key] ? prev : { ...prev, [item.key]: true }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, basePath]);

  return (
    <div className="min-h-screen flex bg-[#0f111a]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 lg:sticky lg:top-0 lg:h-screen
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
          w-72 max-w-[85vw] bg-[#1a1d27] border-r border-gray-800 flex flex-col
          shadow-2xl lg:shadow-none
        `}
      >
        {/* Logo Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={empresa?.logo_url || '/logo-forum.jpg'}
              alt="Logo da empresa"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700 bg-[#0d1117] flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-semibold truncate">{empresa?.nome || user?.empresa_nome || 'Empresa'}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.nome || user?.email}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 flex-shrink-0"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Empresa switcher */}
          <div className="mt-3">
            {empresas.length > 1 ? (
              <select
                value={user?.empresa_id || ''}
                disabled={switchingEmpresa}
                onChange={async (e) => {
                  const newId = parseInt(e.target.value);
                  if (newId === user?.empresa_id) return;
                  setSwitchingEmpresa(true);
                  try {
                    const emp = await switchEmpresa(newId);
                    window.location.href = `/admin/${emp.slug}`;
                  } catch (err) {
                    showError('Erro ao trocar empresa');
                  } finally {
                    setSwitchingEmpresa(false);
                  }
                }}
                className="w-full bg-[#0d1117] border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {empresas.map(e => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            ) : null}
            {user?.role && (
              <span className="mt-1 inline-block px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-[10px] uppercase">
                {user.role}
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {/* Super Admin link */}
            {isSuperAdmin && (
              <Link
                to="/super"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-yellow-400 hover:bg-yellow-900/20 transition-all duration-200 mb-2 border border-yellow-800/30"
              >
                <Crown className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Painel Super Admin</span>
              </Link>
            )}

            {filteredMenuItems.map((item) => {
              const Icon = item.icon;

              if (item.children) {
                const isOpen = openMenus[item.key] || false;
                const isChildActive = item.children.some(child => isActive(child.path));

                return (
                  <div key={item.key} className="mb-1">
                    <button
                      onClick={() => toggleMenu(item.key)}
                      aria-expanded={isOpen}
                      className={`
                        w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer
                        ${isChildActive
                          ? 'bg-blue-900/10 text-blue-400'
                          : 'text-gray-400 hover:bg-[#252b3b] hover:text-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isChildActive ? 'text-blue-400' : 'text-gray-500'}`} />
                        <span className="text-sm">{item.title}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="flex flex-col gap-1 pl-11 pr-2 mt-1">
                        {item.children.map(child => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`
                              block px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer
                              ${isActive(child.path)
                                ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                                : 'text-gray-400 hover:bg-[#252b3b] hover:text-gray-200'
                              }
                            `}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer mb-1
                    ${isActive(item.path)
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                      : 'text-gray-400 hover:bg-[#252b3b] hover:text-gray-200'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-blue-400' : 'text-gray-500'}`} />
                  <span className="text-sm">{item.title}</span>
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200 mt-2 cursor-pointer"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </nav>

        {/* Footer — dados dinâmicos da empresa ativa */}
        <div className="p-4 border-t border-gray-800 text-center text-xs">
          <p className="text-gray-400 font-medium truncate">{empresa?.nome || user?.empresa_nome || 'Hotspot'}</p>
          {empresa?.descricao && (
            <p className="text-gray-600 truncate" title={empresa.descricao}>{empresa.descricao}</p>
          )}
          <p className="mt-1 text-gray-600">
            © {new Date().getFullYear()} · Desenvolvido por{" "}
            <span className="font-semibold text-gray-500">Surb Tech</span>
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden bg-[#1a1d27] border-b border-gray-800 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={empresa?.logo_url || '/logo-forum.jpg'}
                alt="Logo da empresa"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-700 bg-[#0d1117] flex-shrink-0"
              />
              <span className="text-sm text-white font-medium truncate max-w-[150px]">
                {empresa?.nome || user?.empresa_nome || ''}
              </span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 text-gray-300">
          {mostrarAvisoWhatsapp && (
            <div className="mb-4 bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-400" />
              <div className="flex-1 text-sm">
                <strong className="font-semibold">WhatsApp desconectado.</strong>{" "}
                {whatsappStatus?.exists
                  ? "A instância não está conectada. Mensagens automáticas não serão enviadas."
                  : "Nenhuma instância configurada para esta empresa."}{" "}
                <Link to={`${basePath}/whatsapp`} className="underline font-medium hover:text-yellow-100">
                  Configurar agora
                </Link>
              </div>
              <button
                onClick={fecharAvisoWhatsapp}
                className="text-yellow-400 hover:text-yellow-200 flex-shrink-0"
                aria-label="Fechar aviso"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
