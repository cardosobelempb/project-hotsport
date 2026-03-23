# 🔐 Variáveis de Ambiente

## Arquivo `.env.example`

Crie um `.env` na raiz do `backend/` baseado neste template:

```env
# ─────────────────────────────────────────
# APLICAÇÃO
# ─────────────────────────────────────────
NODE_ENV=development          # development | production | test
PORT=3001                     # Porta do servidor Fastify
PORT_WHATSAPP=3030            # Porta do servidor WhatsApp

# ─────────────────────────────────────────
# BANCO DE DADOS
# ─────────────────────────────────────────
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_banco

# ─────────────────────────────────────────
# AUTENTICAÇÃO
# ─────────────��───────────────────────────
JWT_SECRET=sua_chave_secreta_aqui_min_32_chars
JWT_EXPIRES_IN=7d

# ─────────────────────────────────────────
# CORS
# ─────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173   # URL do frontend em dev

# ─────────────────────────────────────────
# MERCADO PAGO
# ─────────────────────────────────────────
MP_ACCESS_TOKEN=APP_USR-...
MP_WEBHOOK_SECRET=seu_webhook_secret

# ─────────────────────────────────────────
# MIKROTIK
# ─────────────────────────────────────────
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=senha_mikrotik

# ─────────────────────────────────────────
# WHATSAPP
# ─────────────────────────────────────────
CHROME_PATH=/usr/bin/google-chrome-stable
# macOS: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
# Windows: C:\Program Files\Google\Chrome\Application\chrome.exe
```

---

## Carregamento (`src/lib/env.ts`)

Use Zod para validar variáveis na inicialização — falha cedo e de forma clara:

```ts
import { z } from 'zod';
import 'dotenv/config';

// Schema com validações e valores padrão
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  PORT_WHATSAPP: z.coerce.number().default(3030),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  MP_ACCESS_TOKEN: z.string().optional(),
  MP_WEBHOOK_SECRET: z.string().optional(),
  MIKROTIK_HOST: z.string().optional(),
  MIKROTIK_USER: z.string().optional(),
  MIKROTIK_PASSWORD: z.string().optional(),
  CHROME_PATH: z.string().default('/usr/bin/google-chrome-stable')
});

// Valida na inicialização — erro claro se algo estiver errado
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

---

## Regras de Segurança

| Regra                            | Motivo                                    |
| -------------------------------- | ----------------------------------------- |
| Nunca comite `.env` no Git       | Expõe credenciais e segredos              |
| `.env.example` sempre atualizado | Documenta o que é necessário              |
| `JWT_SECRET` mínimo 32 chars     | Força bruta em segredos curtos é trivial  |
| Separar `.env.test` para testes  | Evita testes rodando em banco de produção |

---

## `.gitignore` — Entradas obrigatórias

```gitignore
.env
.env.local
.env.production
.env*.local
```
