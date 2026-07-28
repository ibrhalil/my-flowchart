# --- 1. Aşama: Derleme ---
# Vite ile statik üretim derlemesi üretir.
FROM node:22-alpine AS build

WORKDIR /app

# Bağımlılıkları önce kur (katman önbelleği için)
COPY package.json package-lock.json ./
RUN npm ci

# Kaynağı kopyala ve derle
COPY . .
RUN npm run build

# --- 2. Aşama: Sunma ---
# Statik dosyaları nginx ile hizmet et (hafif).
FROM nginx:alpine

# Hizmet portu (runtime'da -e PORT=<port> ile değiştirilebilir).
# Varsayılan 8765: 8080/3000 gibi yaygın portlardan kaçınır.
ENV PORT=8765

# nginx yapılandırma şablonu. Resmi nginx imajının entrypoint'i açılışta
# envsubst çalıştırır: /etc/nginx/templates/nginx.conf.template
#   -> /etc/nginx/conf.d/nginx.conf  (${PORT} yerine konur, $uri korunur).
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Derlenen statik dosyaları nginx köküne kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# Varsayılan portu bilgi amaçlı belirt (gerçek port PORT env'sine bağlıdır).
EXPOSE 8765

# Sağlık kontrolü (shell form — ${PORT} açılıma uğrar)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT}/" || exit 1

CMD ["nginx", "-g", "daemon off;"]
