# ─── Base ─────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# ─── Development ──────────────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install && npm cache clean --force
COPY src ./src
COPY scripts ./scripts
EXPOSE 3000
CMD ["node", "--watch", "src/server.js"]

# ─── Production ───────────────────────────────────────────
FROM base AS production
WORKDIR /app
COPY src ./src
COPY scripts ./scripts

# Crear directorios de uploads y asignar permisos ANTES de cambiar usuario
RUN mkdir -p uploads/icons uploads/activities \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app

USER appuser
EXPOSE 3000
CMD ["node", "src/server.js"]