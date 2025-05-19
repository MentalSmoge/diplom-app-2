FROM node:24-alpine

WORKDIR /app_backend

COPY package*.json ./

RUN npm install --include=dev
RUN npm install -g typescript
RUN npm install -g ts-node


COPY . .
RUN npm run build
# 3. Финальный образ
FROM node:24-alpine
WORKDIR /app_backend

# Копируем только необходимое
COPY --from=builder /app_backend/dist ./dist
COPY --from=builder /app_backend/node_modules ./node_modules
COPY package*.json ./

ENV PORT=8080
EXPOSE 8080 8082
CMD ["node", "dist/server.js"]