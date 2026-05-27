# ─── Base ─────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# Copiar manifiestos e instalar dependencias
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Development ──────────────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app

COPY package*.json ./
# En dev instalamos también devDependencies (jest, eslint…)
RUN npm ci && npm cache clean --force

COPY src ./src
COPY scripts ./scripts

EXPOSE 3000
CMD ["node", "--watch", "src/server.js"]

# ─── Production ───────────────────────────────────────────
FROM base AS production
WORKDIR /app

COPY src ./src

# Usuario sin privilegios
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "src/server.js"]
