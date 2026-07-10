require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Prevenir crash do processo por erros não tratados do node-routeros
// (!empty, timeout tardio de socket, conexão derrubada fora da promise)
const ROUTEROS_ERRNOS = [
  'UNKNOWNREPLY',
  'SOCKTMOUT',
  'CONNERROR',
  'SOCKETCLOSED'
];
process.on('uncaughtException', err => {
  if (
    ROUTEROS_ERRNOS.includes(err.errno) ||
    (err.message && err.message.includes('!empty'))
  ) {
    console.warn(
      `RouterOS error tratado (non-fatal): ${err.errno || err.message}`
    );
    return;
  }
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Middlewares
const auth = require('./src/middleware/auth');
const tenant = require('./src/middleware/tenant');

// Rotas
const authRoutes = require('./src/routes/authRoutes');
const planRoutes = require('./src/routes/planRoutes');
const adminRoutes = require('./routes/admin');
const mikrotikRoutes = require('./src/routes/mikrotikRoutes');
const efiRoutes = require('./src/routes/efiRoutes');
const mercadoPagoRoutes = require('./src/routes/mercadoPagoRoutes');
const planPublicRoutes = require('./src/routes/planPublicRoutes');
const pagamentoRoutes = require('./src/routes/pagamentoRoutes');
const radiusRoutes = require('./src/routes/radiusRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const lgpdRoutes = require('./src/routes/lgpdRoutes');
const whatsappRoutes = require('./src/routes/whatsappRoutes');
const authTempRoutes = require('./src/routes/authTempRoutes');
const limpezaRoutes = require('./src/routes/limpezaRoutes');
const radiusLogsRoutes = require('./src/routes/radiusLogsRoutes');
const adminUserRoutes = require('./src/routes/adminUserRoutes');
const wireguardRoutes = require('./src/routes/wireguardRoutes');
const portalRoutes = require('./src/routes/portalRoutes');
const portalTemplateRoutes = require('./src/routes/portalTemplateRoutes');
const campanhasRoutes = require('./src/routes/campanhasRoutes');
const campanhasPublicRoutes = require('./src/routes/campanhasPublicRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
const complianceRoutes = require('./src/routes/complianceRoutes');
const empresaRoutes = require('./src/routes/empresaRoutes');
const empresaConfigRoutes = require('./src/routes/empresaConfigRoutes');
const registroRoutes = require('./src/routes/registroRoutes');
const grupoPermissaoRoutes = require('./src/routes/grupoPermissaoRoutes');
const loginPortalRoutes = require('./src/routes/loginPortalRoutes');
const trialTempoRoutes = require('./src/routes/trialTempoRoutes');
const campanhaPreacessoRoutes = require('./src/routes/campanhaPreacessoRoutes');
const reconexaoRoutes = require('./src/routes/reconexaoRoutes');
const systemBackupRoutes = require('./src/routes/systemBackupRoutes');
const systemUpdateRoutes = require('./src/routes/systemUpdateRoutes');
const db = require('./db');
const radiusService = require('./src/services/radiusService');

// Rotas exclusivas do servidor principal (OTA updates) - não existem nos servidores de alunos
const fs = require('fs');
const updatePublishRoutes = fs.existsSync(
  __dirname + '/src/routes/updatePublishRoutes.js'
)
  ? require('./src/routes/updatePublishRoutes')
  : null;
const updateCheckRoutes = fs.existsSync(
  __dirname + '/src/routes/updateCheckRoutes.js'
)
  ? require('./src/routes/updateCheckRoutes')
  : null;

app.use(cors());
app.use(express.json());

// Healthcheck (usado pelo HEALTHCHECK do Dockerfile / Coolify)
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Servir arquivos de campanhas (publicos, com cache de 1 dia)
app.use(
  '/uploads/campanhas',
  express.static(path.join(__dirname, 'uploads', 'campanhas'), {
    maxAge: '1d',
    fallthrough: false
  })
);

// Servir imagens de banners (publicos, com cache de 1 dia)
app.use(
  '/uploads/banners',
  express.static(path.join(__dirname, 'uploads', 'banners'), {
    maxAge: '1d',
    fallthrough: false
  })
);

// Servir logos de empresa/portal (publicos). Primario: backend/uploads/logos.
// Fallbacks: diretorios do frontend (logos antigas do deploy legado sem Docker).
const {
  uploadsDir: logosDir,
  legacyDirs: logosLegacyDirs
} = require('./src/utils/logoUpload');
app.use('/uploads/logos', express.static(logosDir, { maxAge: '1d' }));
logosLegacyDirs.forEach(dir => {
  app.use('/uploads/logos', express.static(dir, { maxAge: '1d' }));
});

// --- Rotas públicas (sem auth) ---
app.use('/api/admin', adminRoutes); // Login
app.use('/api/auth', authRoutes); // Auth
app.use('/api/auth', authTempRoutes); // Acesso temporário
app.use('/api/planos-publicos', planPublicRoutes);
app.use('/api/pagamentos', pagamentoRoutes); // Inclui webhook público
app.use('/api/lgpd', lgpdRoutes); // LGPD login/cadastro são públicos
app.use('/api/registro', registroRoutes); // Registro público de empresas

app.use('/api/public/campanha', campanhasPublicRoutes);

// Rota pública: banners das páginas do portal (imagem/AdSense por posição)
const bannersCtrl = require('./src/controllers/bannersController');
app.get('/api/public/banners', bannersCtrl.listarPublico);

// Rota pública para login do portal Lead (sem auth)
const {
  leadLogin,
  capturaPassiva,
  cadastroCliente
} = require('./src/controllers/leadController');
app.post('/api/lead-portal/login', leadLogin);
app.post('/api/lead-portal/passivo', capturaPassiva);
app.post('/api/clientes/cadastro', cadastroCliente);

// Rota pública para login do portal Wifi/Radius
app.use('/api/login-portal', loginPortalRoutes);

// Portais: Trial por Tempo, Campanha Pré-Acesso e Reconexão (públicos)
app.use('/api/trial-tempo', trialTempoRoutes);
app.use('/api/campanha-pre-acesso', campanhaPreacessoRoutes);
app.use('/api/reconexao', reconexaoRoutes);

// --- Rotas protegidas (auth + tenant + permissão) ---
const checkPermissao = require('./src/middleware/checkPermissao');
app.use('/api/planos', auth, tenant, checkPermissao('planos'), planRoutes);
app.use(
  '/api/mikrotiks',
  auth,
  tenant,
  checkPermissao('mikrotiks'),
  mikrotikRoutes
);
app.use('/api/efi', auth, tenant, checkPermissao('configuracoes'), efiRoutes);
app.use(
  '/api/config-mercadopago',
  auth,
  tenant,
  checkPermissao('configuracoes'),
  mercadoPagoRoutes
);
app.use('/api/radius', auth, tenant, radiusRoutes);
app.use(
  '/api/dashboard',
  auth,
  tenant,
  checkPermissao('dashboard'),
  dashboardRoutes
);
app.use(
  '/api/whatsapp',
  auth,
  tenant,
  checkPermissao('configuracoes'),
  whatsappRoutes
);
app.use(
  '/api/limpeza',
  auth,
  tenant,
  checkPermissao('configuracoes'),
  limpezaRoutes
);
app.use(
  '/api/radius-logs',
  auth,
  tenant,
  checkPermissao('sessoeslog'),
  radiusLogsRoutes
);
app.use(
  '/api/admins',
  auth,
  tenant,
  checkPermissao('usuarios'),
  adminUserRoutes
);
app.use('/api/wireguard', auth, tenant, checkPermissao('vpn'), wireguardRoutes);
app.use('/api/portais', auth, tenant, checkPermissao('portais'), portalRoutes);
app.use(
  '/api/campanhas',
  auth,
  tenant,
  checkPermissao('portais'),
  campanhasRoutes
);
app.use(
  '/api/banners',
  auth,
  tenant,
  checkPermissao('portais'),
  require('./src/routes/bannersRoutes')
);
app.use(
  '/api/portal-templates',
  auth,
  tenant,
  checkPermissao('portais'),
  portalTemplateRoutes
);
app.use('/api/leads', auth, tenant, checkPermissao('leads'), leadRoutes);
app.use(
  '/api/compliance',
  auth,
  tenant,
  checkPermissao('compliance'),
  complianceRoutes
);
app.use(
  '/api/empresa-config',
  auth,
  tenant,
  checkPermissao('configuracoes'),
  empresaConfigRoutes
);

// Rota pública: config visual do portal (sem auth)
const portalCtrl = require('./src/controllers/portalController');
app.get('/api/portal-config/:tipo', portalCtrl.getPortalConfig);

// --- Rotas super admin ---
app.use('/api/empresas', empresaRoutes); // Auth + authorize interno
app.use('/api/grupos-permissao', grupoPermissaoRoutes); // Auth + authorize interno
app.use('/api/system-backup', systemBackupRoutes);
app.use('/api/system-update', systemUpdateRoutes);
if (updatePublishRoutes) app.use('/api/update-publish', updatePublishRoutes);
if (updateCheckRoutes) app.use('/api/updates', updateCheckRoutes);

// Endpoint público: serve login.html para MikroTik baixar via /tool/fetch
// Este HTML é salvo como hotspot/login.html no MikroTik
// O RouterOS substitui $(mac), $(ip), $(username) etc antes de servir ao cliente
app.get('/api/hotspot-login/:mikrotikId', async (req, res) => {
  const { mikrotikId } = req.params;
  try {
    const [[mikrotik]] = await db.execute(
      `SELECT m.empresa_id, m.portal_id, e.slug AS empresa_slug FROM mikrotiks m
       LEFT JOIN empresas e ON m.empresa_id = e.id WHERE m.id = ?`,
      [mikrotikId]
    );
    const empresaId = mikrotik?.empresa_id || '';
    const empresaSlug = mikrotik?.empresa_slug || 'default';
    const systemDomain = process.env.SYSTEM_DOMAIN || req.hostname;
    const systemProto = process.env.SYSTEM_PROTO || 'https';
    const systemPort = process.env.SYSTEM_PORT
      ? `:${process.env.SYSTEM_PORT}`
      : '';
    const fullUrl = `${systemProto}://${systemDomain}${systemPort}/hotspot/redirect/${mikrotikId}?mac=$(mac)&ip=$(ip)&mikrotik_id=${mikrotikId}&empresa_id=${empresaId}&empresa=${empresaSlug}`;

    let portal = null;
    if (mikrotik?.portal_id) {
      const [[p]] = await db.execute('SELECT * FROM portais WHERE id = ?', [
        mikrotik.portal_id
      ]);
      portal = p || null;
    }

    const { gerarLoginHtml } = require('./src/utils/hotspotSetup');
    const html = gerarLoginHtml(fullUrl, portal, systemDomain);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.send(html);
  } catch (err) {
    res.status(500).send('<h1>Erro</h1>');
  }
});

// Endpoint público: serve status.html para MikroTik baixar via /tool/fetch
// O RouterOS substitui $(username), $(ip), $(uptime), $(bytes-in-nice), etc
app.get('/api/hotspot-status/:mikrotikId', async (req, res) => {
  const { mikrotikId } = req.params;
  try {
    const [[mikrotik]] = await db.execute(
      'SELECT portal_id FROM mikrotiks WHERE id = ?',
      [mikrotikId]
    );
    let portal = null;
    if (mikrotik?.portal_id) {
      const [[p]] = await db.execute('SELECT * FROM portais WHERE id = ?', [
        mikrotik.portal_id
      ]);
      portal = p || null;
    }
    const systemDomain = process.env.SYSTEM_DOMAIN || req.hostname;
    const { gerarStatusHtml } = require('./src/utils/hotspotSetup');
    const html = gerarStatusHtml(portal, systemDomain);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    return res.send(html);
  } catch (err) {
    res.status(500).send('<h1>Erro</h1>');
  }
});

// Endpoint público: redirect dinâmico do captive portal
app.get('/hotspot/redirect/:mikrotikId', async (req, res) => {
  const { mikrotikId } = req.params;
  const { mac, ip } = req.query;

  try {
    // Busca MikroTik com dados da empresa
    const [[mikrotik]] = await db.execute(
      `SELECT m.*, e.slug AS empresa_slug, e.id AS eid
       FROM mikrotiks m
       LEFT JOIN empresas e ON m.empresa_id = e.id
       WHERE m.id = ?`,
      [mikrotikId]
    );
    if (!mikrotik || !mikrotik.portal_id) {
      return res
        .status(404)
        .send('<h1>Portal não configurado para este hotspot</h1>');
    }

    const [[portal]] = await db.execute('SELECT * FROM portais WHERE id = ?', [
      mikrotik.portal_id
    ]);
    if (!portal) {
      return res.status(404).send('<h1>Portal não encontrado</h1>');
    }

    const empresaId = mikrotik.empresa_id;
    const empresaSlug = mikrotik.empresa_slug || 'default';

    // Propaganda ANTES de qualquer identificacao/cadastro, so nos portais gratis
    // (lgpd, lead, lead_passivo, trial_tempo). Toca uma vez por tentativa de
    // conexao — o proprio CampanhaPlayer.jsx (modo nao-login) volta pra ca com
    // campanha_vista=1 apos o ultimo item, e ai sim seguimos pra checagem de MAC
    // conhecido e o dispatch normal. Portal "planos" (100% pago) fica sem anuncio.
    const TIPOS_COM_PROPAGANDA_PREVIA = [
      'lgpd',
      'lead',
      'lead_passivo',
      'trial_tempo'
    ];
    const [[campanhaVinculada]] = await db.execute(
      'SELECT 1 FROM portal_campanhas WHERE portal_id = ? LIMIT 1',
      [portal.id]
    );
    if (
      TIPOS_COM_PROPAGANDA_PREVIA.includes(portal.tipo) &&
      campanhaVinculada &&
      req.query.campanha_vista !== '1'
    ) {
      const qsCampanha = new URLSearchParams({
        mac: mac || '',
        ip: ip || '',
        mikrotik_id: mikrotikId,
        empresa_id: empresaId,
        empresa: empresaSlug
      });
      return res.redirect(
        302,
        `/campanha/${portal.id}?${qsCampanha.toString()}`
      );
    }

    // Cliente ja conhecido NAO ve o portal de cadastro de novo:
    //  - com saldo diario  -> /acesso-ativo (tempo restante + botao conectar)
    //  - saldo esgotado    -> /reconectar (renovar comprando um plano)
    //  - desconhecido      -> portal normal
    // saldo_visto=1 pula a checagem (links "voltar ao portal" das proprias paginas).
    if (mac && req.query.saldo_visto !== '1') {
      try {
        const acesso = await radiusService.getAccessStatusByMac({
          mac,
          empresaId
        });
        if (acesso.status !== 'desconhecido') {
          const qsSaldo = new URLSearchParams({
            mac: mac || '',
            ip: ip || '',
            mikrotik_id: mikrotikId,
            empresa_id: empresaId,
            empresa: empresaSlug,
            portal_id: mikrotik.portal_id
          });
          if (acesso.status === 'com_saldo') {
            return res.redirect(302, `/acesso-ativo?${qsSaldo.toString()}`);
          }
          // esgotado: portal de renovacao com motivo explicito
          qsSaldo.set('motivo', 'tempo_esgotado');
          return res.redirect(302, `/reconectar?${qsSaldo.toString()}`);
        }
      } catch (e) {
        console.warn(
          '[hotspot/redirect] verificacao de saldo falhou (segue pro portal):',
          e.message
        );
      }
    }

    // Ordem dos portais: gratis = propaganda (pre-portal acima) → cadastro → status;
    // pago (planos) = cadastro → planos → pagamento → status (sem propaganda).

    // portal_id explicito garante que Pagamento.jsx e CadastroCliente usem
    // a config do portal correto (PIX/Cartao toggles, trial, WhatsApp template).
    // Sem isso, fallback via mikrotik.portal_id pode apontar pro portal errado
    // no cenário Login → Planos (portal de entrada ≠ portal de destino).
    const params = `mac=${encodeURIComponent(mac || '')}&ip=${encodeURIComponent(ip || '')}&mikrotik_id=${mikrotikId}&empresa_id=${empresaId}&empresa=${empresaSlug}&portal_id=${mikrotik.portal_id}`;

    // Portal tipo trial_tempo: primeiro acesso vai pro formulário de trial;
    // após trial expirar (MAC já tem lead trial mas sem sessão ativa), vai pro destino
    if (portal.tipo === 'trial_tempo') {
      const [[leadTrial]] = await db.execute(
        "SELECT id FROM leads WHERE mac = ? AND empresa_id = ? AND origem = 'trial_tempo' LIMIT 1",
        [mac || '', empresaId]
      );
      if (leadTrial) {
        const [[sessaoAtiva]] = await db.execute(
          'SELECT radacctid FROM radacct WHERE callingstationid = ? AND acctstoptime IS NULL LIMIT 1',
          [mac || '']
        );
        if (!sessaoAtiva) {
          // Trial expirou — redirecionar para portal configurado como destino
          let cfgTrial = {};
          try {
            cfgTrial = JSON.parse(portal.configuracoes || '{}');
          } catch (e) {}
          const destPortalId = cfgTrial.trial_destino_portal_id;
          if (destPortalId) {
            const [[portalDest]] = await db.execute(
              'SELECT url_redirect FROM portais WHERE id = ?',
              [destPortalId]
            );
            if (portalDest?.url_redirect) {
              const sep = portalDest.url_redirect.includes('?') ? '&' : '?';
              return res.redirect(`${portalDest.url_redirect}${sep}${params}`);
            }
          }
          // Fallback: portal planos da empresa
          const [[portalPlanos]] = await db.execute(
            "SELECT url_redirect FROM portais WHERE empresa_id = ? AND tipo = 'planos' LIMIT 1",
            [empresaId]
          );
          if (portalPlanos?.url_redirect) {
            const sep = portalPlanos.url_redirect.includes('?') ? '&' : '?';
            return res.redirect(`${portalPlanos.url_redirect}${sep}${params}`);
          }
        }
      }
      return res.redirect(`/trial-tempo?${params}`);
    }

    // Portal tipo campanha_pre_acesso: vai direto para o formulário + campanha
    if (portal.tipo === 'campanha_pre_acesso') {
      return res.redirect(`/campanha-pre-acesso?${params}`);
    }

    // Portal pago (planos): cadastro primeiro, depois planos, pagamento e status.
    // CadastroCliente ja navega pra /planos-cliente com cliente_id apos cadastrar
    // (e faz auto-login se o cliente ja tem plano ativo).
    if (portal.tipo === 'planos') {
      return res.redirect(`/cadastro-cliente?${params}`);
    }

    if (portal.tipo === 'custom' && portal.html_content) {
      let html = portal.html_content
        .replace(/\$\(mac\)/g, mac || '')
        .replace(/\$\(ip\)/g, ip || '')
        .replace(/\$\(mikrotik_id\)/g, mikrotikId)
        .replace(/\$\(empresa_id\)/g, empresaId)
        .replace(/\$\(empresa\)/g, empresaSlug);

      // Injetar CSS customizado se existir
      if (portal.custom_css) {
        html = html.replace(
          '</head>',
          `<style>${portal.custom_css}</style></head>`
        );
      }

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    if (portal.url_redirect) {
      const separator = portal.url_redirect.includes('?') ? '&' : '?';
      return res.redirect(`${portal.url_redirect}${separator}${params}`);
    }

    res.status(400).send('<h1>Portal sem configuração de redirect</h1>');
  } catch (err) {
    console.error('Erro no redirect do captive portal:', err);
    res.status(500).send('<h1>Erro interno</h1>');
  }
});

const cron = require('node-cron');
const syncConnectionLogs = require('./src/jobs/syncConnectionLogs');

// Sincronizar logs de conexão do RADIUS (Marco Civil) a cada 5 minutos
cron.schedule('*/5 * * * *', () => {
  console.log('[CRON] Iniciando syncConnectionLogs...');
  syncConnectionLogs().catch(err => console.error('[CRON] Erro:', err));
});

// --- Tela de emergencia (SEM auth) ---
app.get('/emergency', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/emergency.html'));
});
const systemBackupCtrl = require('./src/controllers/systemBackupController');
app.get('/api/emergency/backups', systemBackupCtrl.listarBackups);
app.post('/api/emergency/backup', systemBackupCtrl.criarBackup);
app.post('/api/emergency/restore/:id', systemBackupCtrl.restaurarBackup);

// Error handler global — precisa ser o ultimo app.use, depois de todas as rotas
app.use(require('./src/middleware/errorHandler'));

app.listen(process.env.PORT || 3001, '0.0.0.0', () => {
  console.log(`localhost:3001/api`);
  console.log(`API rodando na porta ${process.env.PORT || 3001}`);
});
