FROM node:24-alpine

WORKDIR /app_backend

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8080

EXPOSE 8080 8082

CMD ["npm", "start"]