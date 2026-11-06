# Imagen de producción: compila el sitio de React y lo sirve junto con la API y el panel de Express.

FROM node:24-alpine AS sitio
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm --prefix frontend ci --no-audit --no-fund
COPY shared ./shared
COPY frontend ./frontend
RUN npm --prefix frontend run build

FROM node:24-alpine
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm --prefix backend ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY shared ./shared
COPY backend ./backend
COPY --from=sitio /app/frontend/build ./frontend/build
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/salud').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "backend/bin/www"]
