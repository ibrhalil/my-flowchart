FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

# Hizmet portu (runtime'da -e PORT=<port> ile değiştirilebilir).
# Varsayılan 8765: 8080/3000 gibi yaygın portlardan kaçınır.
ENV PORT=8765

# Resmi nginx imajı açılışta şablonu envsubst ile işler: ${PORT} doldurulur, $uri korunur.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8765

# Sağlık kontrolü (shell form — ${PORT} açılıma uğrar)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT}/" || exit 1

CMD ["nginx", "-g", "daemon off;"]
