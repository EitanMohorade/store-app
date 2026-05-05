# ── Stage 1: Build ────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite lee las variables VITE_* en build time
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────
FROM nginx:stable-alpine

# Config personalizada de Nginx (SPA + proxy a la API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build generado en el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
