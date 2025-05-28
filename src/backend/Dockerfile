FROM node:24-alpine AS builder

WORKDIR /app_backend

# 1. Устанавливаем все зависимости для сборки
COPY package*.json ./
RUN npm install --include=dev

RUN mkdir -p /app_backend/public/images
VOLUME /app_backend/public/images

# 2. Копируем и компилируем проект
COPY . .
RUN npm run build
RUN ls -la .

# 3. Финальный образ
FROM node:24-alpine
WORKDIR /app_backend
RUN ls -la .

# Копируем только необходимое
COPY --from=builder /app_backend/dist ./dist
COPY --from=builder /app_backend/node_modules ./node_modules
COPY package*.json ./
RUN ls -la .
RUN ls -la ..
RUN ls -la /app_backend

ENV PORT=8080
EXPOSE 8080 8082
RUN ls -la /app_backend/dist
CMD ["npm", "run", "start"]