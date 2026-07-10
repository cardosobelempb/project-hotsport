# ============================================================
# Hotspot Frontend - Dockerfile Multi-stage
# Context: raiz do projeto (onde fica a pasta frontend/)
# ============================================================

# ---- BASE NODE ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

# ---- DEPENDENCIAS ----
FROM base AS deps
COPY frontend/package*.json ./
RUN npm install

# ---- DEVELOPMENT (Vite dev server) ----
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend ./
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- BUILD ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend ./
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

# ---- PRODUCAO (Nginx serve o dist) ----
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/frontend/nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
