FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3001

CMD ["node", "src/app.js"]