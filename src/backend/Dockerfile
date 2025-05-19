FROM node:24-alpine

WORKDIR /app_backend

COPY package*.json ./

RUN npm install --include=dev
RUN npm install -g typescript
RUN npm install -g ts-node


COPY . .
RUN npm run build && \
    ls -la dist/ && \
    [ -f dist/server.js ] || (echo "Файл server.js не найден!" && exit 1)

ENV PORT=8080

EXPOSE 8080 8082

CMD ["npm", "start"]