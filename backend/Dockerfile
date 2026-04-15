# ─────────────────────────────────────────────
# Stage 1: Builder — instala dependências e compila TypeScript
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copia manifests de dependências
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Instala todas as dependências (incluindo devDependencies para compilação)
RUN npm ci

# Copia código-fonte
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# Gera o Prisma Client
RUN npm run prisma:generate

# Compila TypeScript (tsconfig.build.json exclui spec files e ignora erros em código legado)
RUN npx tsc -p tsconfig.build.json

# ─────────────────────────────────────────────
# Stage 2: Production — imagem final enxuta
# ─────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copia manifests e instala apenas dependências de produção
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --omit=dev

# Gera o Prisma Client no estágio de produção
RUN npx prisma generate

# Copia código compilado
COPY --from=builder /app/dist ./dist

EXPOSE 4949

# Aplica migrações pendentes e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/core/infrastructure/http/index.js"]
