# ─── Base con Node ────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ─── Development — ng serve con hot reload ────────────────
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]

# ─── Build de producción ──────────────────────────────────
FROM base AS builder
RUN npm ci
COPY . .
RUN npx ng build --configuration production --output-path /dist

# ─── Production — Nginx sirviendo el build ────────────────
FROM nginx:1.27-alpine AS production
COPY --from=builder /dist/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Usuario sin privilegios
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
