FROM node:18-slim

WORKDIR /app_frontend

COPY package*.json ./

RUN npm install & npm cache clean --force

COPY . .

ENV PORT_SOCKET=8082

EXPOSE 5173

CMD ["npm", "run", "dev"]