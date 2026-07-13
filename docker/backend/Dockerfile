# ============================================================
# Hotspot Backend - Dockerfile Multi-stage
# Context: raiz do projeto (onde fica a pasta backend/)
# ============================================================

# ---- BASE ----
FROM node:20-alpine AS base
WORKDIR /app
# @wppconnect-team/wppconnect depende de puppeteer, cujo postinstall tenta
# baixar um Chromium proprio - pra linux/arm64 (buildx/QEMU) essa versao do
# puppeteer nem tem build disponivel ("chromium binary is not available for
# arm64"), o que derruba o "npm install" inteiro. Alem disso o Chromium
# baixado pelo puppeteer e' linkado contra glibc e nao roda no musl do
# Alpine de qualquer forma. Fix: usa o chromium do proprio Alpine (via apk,
# tem build arm64) e manda o puppeteer pular o download e apontar pra ele -
# precisa estar em "base" (nao so em "deps") porque o binario e' usado em
# tempo de execucao pelo wppconnect, nao so na instalacao.
RUN apk add --no-cache curl chromium mysql-client
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# ---- DEPENDENCIAS ----
FROM base AS deps
# bcrypt (addon nativo) tambem pode nao ter prebuilt pra toda combinacao de
# plataforma/arquitetura - sem essas ferramentas o node-gyp falha ao compilar.
# So aqui no estagio deps: development/production partem de "base" (sem essas
# ferramentas de build) e so copiam o node_modules ja compilado.
RUN apk add --no-cache python3 make g++
COPY backend/package*.json ./
RUN npm install

# ---- DEVELOPMENT ----
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend ./
ENV NODE_ENV=development
EXPOSE 3001
# Roda as migrations pendentes automaticamente a cada boot do container antes
# de subir o servidor - ";" (nao "&&") garante que o backend sobe mesmo se o
# runner de migrations falhar por algum motivo inesperado.
CMD ["sh", "-c", "node scripts/runMigrations.js; npx nodemon server.js"]

# ---- BUILD / PRODUCAO ----
FROM base AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend ./
RUN npm prune --production
ENV NODE_ENV=production
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1
# Roda as migrations pendentes automaticamente a cada boot do container antes
# de subir o servidor - ";" (nao "&&") garante que o backend sobe mesmo se o
# runner de migrations falhar por algum motivo inesperado.
CMD ["sh", "-c", "node scripts/runMigrations.js; node server.js"]
