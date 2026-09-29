FROM node:20-alpine

WORKDIR /app

# copy package files dulu supaya layer cache npm install efisien
COPY package*.json ./
RUN npm install --production

# baru copy sisa source code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]