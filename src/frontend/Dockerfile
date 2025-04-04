FROM node:18-slim

WORKDIR /app_frontend

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT_SOCKET=8082

EXPOSE 3000

CMD ["npm", "run dev"]