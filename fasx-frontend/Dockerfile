FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Запускаем именно dev-сервер Vite
CMD ["npm", "run", "dev", "--", "--host"]