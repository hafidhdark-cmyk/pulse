# Stage 1: Build Frontend SPA (supports Vite/React or static HTML fallback)
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN if [ -f package.json ]; then \
      npm install && npm run build; \
    else \
      mkdir -p dist && \
      if [ -f index.html ]; then cp -r ./* dist/ 2>/dev/null || true; else \
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pulse — Social Fintech MVP</title></head><body style="font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h1>Pulse Social Fintech MVP</h1><p>Backend API &amp; Socket.io active at <code>/api/health</code></p></div></body></html>' > dist/index.html; \
      fi; \
    fi

# Stage 2: Serve SPA with Nginx and proxy /api & /socket.io to backend:4000
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
