require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

// Segue a linguagem visual das migrations 004/007: gradiente #0f111a -> #1a1d2e,
// icone em badge azul/roxo, card translucido, botao gradiente #3B82F6 -> #2563EB.
// Variaveis $(mac)/$(ip)/$(mikrotik_id)/$(empresa_id) sao substituidas pelo MikroTik.

const CARD_STYLE = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f111a 0%, #1a1d2e 50%, #0f111a 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e2e8f0;
      padding: 20px;
    }
    .container { max-width: 420px; width: 100%; }
    .card {
      background: rgba(26, 29, 39, 0.95);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .header { text-align: center; margin-bottom: 24px; }
    .header .icon {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 16px;
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    .subtitle { color: #94a3b8; font-size: 14px; }
    label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px; font-weight: 500; }
    input[type="text"], input[type="email"], input[type="tel"], input[type="password"] {
      width: 100%;
      padding: 12px 14px;
      background: #0d1117;
      border: 1px solid rgba(100,116,139,0.3);
      border-radius: 10px;
      color: white;
      font-size: 14px;
      margin-bottom: 16px;
      outline: none;
      transition: border-color 0.3s;
    }
    input:focus { border-color: #3B82F6; }
    .checkbox-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; }
    .checkbox-row input[type="checkbox"] { margin-top: 2px; accent-color: #3B82F6; }
    .checkbox-row span { font-size: 13px; color: #94a3b8; }
    .btn {
      display: block; width: 100%; padding: 14px;
      background: linear-gradient(135deg, #3B82F6, #2563EB);
      color: white; border: none; border-radius: 12px;
      font-size: 15px; font-weight: 600; cursor: pointer;
      transition: all 0.3s; text-decoration: none; text-align: center;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.4); }
    .btn-secondary {
      background: transparent; border: 1px solid rgba(100,116,139,0.3); color: #94a3b8; margin-top: 10px;
    }
    .btn-secondary:hover { background: rgba(100,116,139,0.1); box-shadow: none; }
    .badge-tempo {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3);
      color: #93c5fd; font-size: 13px; font-weight: 600;
      border-radius: 20px; padding: 6px 14px; margin-bottom: 20px;
    }
    .info { text-align: center; margin-top: 16px; font-size: 12px; color: #475569; }
`;

function pagina(titulo, icone, corpo) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
  <style>${CARD_STYLE}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${corpo}
      <p class="info">MAC: $(mac) | IP: $(ip)</p>
    </div>
  </div>
</body>
</html>`;
}

const htmlLgpd = pagina('WiFi - Cadastro LGPD', '&#x1F4F6;', `
      <div class="header">
        <div class="icon">&#x1F512;</div>
        <h1>Cadastro Protegido (LGPD)</h1>
        <p class="subtitle">Seus dados sao usados so pra liberar o Wi-Fi</p>
      </div>
      <label>Nome completo</label>
      <input type="text" placeholder="Seu nome">
      <label>CPF</label>
      <input type="text" placeholder="000.000.000-00">
      <label>Telefone</label>
      <input type="tel" placeholder="(00) 00000-0000">
      <div class="checkbox-row">
        <input type="checkbox" id="lgpd-consent" onchange="document.getElementById('btn-cadastro').style.pointerEvents = this.checked ? 'auto' : 'none'; document.getElementById('btn-cadastro').style.opacity = this.checked ? '1' : '0.5';">
        <span>Li e concordo com os termos da Lei Geral de Protecao de Dados (LGPD)</span>
      </div>
      <a href="/cadastro?mac=$(mac)&ip=$(ip)&mikrotik_id=$(mikrotik_id)&empresa_id=$(empresa_id)" id="btn-cadastro" class="btn" style="opacity:0.5;pointer-events:none;">Cadastrar e Conectar</a>
`);

const htmlLead = pagina('WiFi - Deixe seu Contato', '&#x1F4F6;', `
      <div class="header">
        <div class="icon">&#x1F4F1;</div>
        <h1>WiFi Gratuito</h1>
        <p class="subtitle">Deixe seu contato e conecte-se na hora</p>
      </div>
      <label>Nome</label>
      <input type="text" placeholder="Seu nome">
      <label>Telefone ou e-mail</label>
      <input type="text" placeholder="(00) 00000-0000 ou seu@email.com">
      <a href="/lead?mac=$(mac)&ip=$(ip)&mikrotik_id=$(mikrotik_id)&empresa_id=$(empresa_id)" class="btn">Conectar Agora</a>
`);

const htmlTrialTempo = pagina('WiFi - Teste Gratis', '&#x23F1;', `
      <div class="header">
        <div class="icon">&#x23F1;</div>
        <h1>WiFi Gratis por Tempo</h1>
        <p class="subtitle">Cadastre-se e navegue gratis por tempo limitado</p>
      </div>
      <div style="text-align:center;"><span class="badge-tempo">&#x26A1; Minutos gratis ao se cadastrar</span></div>
      <label>Nome</label>
      <input type="text" placeholder="Seu nome">
      <label>Telefone</label>
      <input type="tel" placeholder="(00) 00000-0000">
      <a href="/trial-tempo?mac=$(mac)&ip=$(ip)&mikrotik_id=$(mikrotik_id)&empresa_id=$(empresa_id)" class="btn">Quero meus minutos gratis</a>
`);

const htmlLogin = pagina('WiFi - Login', '&#x1F510;', `
      <div class="header">
        <div class="icon">&#x1F510;</div>
        <h1>Acesso Wi-Fi</h1>
        <p class="subtitle">Entre com seu usuario e senha</p>
      </div>
      <label>Usuario</label>
      <input type="text" placeholder="Seu usuario">
      <label>Senha</label>
      <input type="password" placeholder="Sua senha">
      <a href="/login-hotspot?mac=$(mac)&ip=$(ip)&mikrotik_id=$(mikrotik_id)&empresa_id=$(empresa_id)" class="btn">Conectar</a>
`);

const htmlCampanhaPreAcesso = pagina('WiFi - Assista e Conecte-se', '&#x1F3AC;', `
      <div class="header">
        <div class="icon">&#x1F3AC;</div>
        <h1>Assista e Conecte-se</h1>
        <p class="subtitle">Cadastre-se, veja um conteudo rapido e navegue gratis</p>
      </div>
      <label>Nome</label>
      <input type="text" placeholder="Seu nome">
      <label>Telefone</label>
      <input type="tel" placeholder="(00) 00000-0000">
      <a href="/campanha-pre-acesso?mac=$(mac)&ip=$(ip)&mikrotik_id=$(mikrotik_id)&empresa_id=$(empresa_id)" class="btn">Continuar</a>
`);

const htmlReconexao = pagina('WiFi - Renovar Plano', '&#x1F504;', `
      <div class="header">
        <div class="icon">&#x1F504;</div>
        <h1>Seu plano expirou</h1>
        <p class="subtitle">Renove agora para continuar navegando</p>
      </div>
      <a href="/reconectar?mac=$(mac)&ip=$(ip)&mikrotik_id=$(mikrotik_id)&empresa_id=$(empresa_id)" class="btn">Ver planos e renovar</a>
`);

const NOVOS = [
  {
    tipo: 'lgpd',
    nome: 'Cadastro LGPD',
    descricao: 'Formulario de cadastro (nome, CPF, telefone) com consentimento explicito da LGPD antes de liberar o Wi-Fi gratuito.',
    html: htmlLgpd,
  },
  {
    tipo: 'lead',
    nome: 'Captura de Lead (Com Internet)',
    descricao: 'Formulario simples (nome + telefone/e-mail) que libera Wi-Fi gratuito na hora. Sem CPF, sem texto legal.',
    html: htmlLead,
  },
  {
    tipo: 'trial_tempo',
    nome: 'Trial por Tempo',
    descricao: 'Cadastro simples com destaque para o tempo gratuito de teste antes de oferecer um plano pago.',
    html: htmlTrialTempo,
  },
  {
    tipo: 'login',
    nome: 'Login Direto',
    descricao: 'Tela de usuario e senha para quem ja tem conta (funcionarios, hospedes, moradores) — sem formulario de cadastro.',
    html: htmlLogin,
  },
  {
    tipo: 'campanha_pre_acesso',
    nome: 'Campanha + Acesso',
    descricao: 'Cadastro simples seguido da campanha em tela cheia (imagem/video/anuncio) antes de liberar o acesso.',
    html: htmlCampanhaPreAcesso,
  },
  {
    tipo: 'reconexao',
    nome: 'Renovacao de Plano',
    descricao: 'Tela exibida quando o plano pago de um cliente ja conhecido expira, oferecendo renovar.',
    html: htmlReconexao,
  },
];

async function migrate() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    console.log('=== Migration 021: Templates para cada tipo de portal ===\n');

    for (const t of NOVOS) {
      const [[{ cnt }]] = await conn.query(
        'SELECT COUNT(*) as cnt FROM portal_templates WHERE tipo = ?',
        [t.tipo]
      );
      if (cnt > 0) {
        console.log(`   -> Ja existe template para tipo '${t.tipo}', pulando.`);
        continue;
      }
      await conn.execute(
        'INSERT INTO portal_templates (nome, descricao, html_template, css_template, tipo) VALUES (?, ?, ?, ?, ?)',
        [t.nome, t.descricao, t.html, null, t.tipo]
      );
      console.log(`   -> Template '${t.nome}' (${t.tipo}) inserido.`);
    }

    await conn.commit();
    console.log('\n=== Migration 021 concluida com sucesso! ===');
  } catch (err) {
    await conn.rollback();
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
