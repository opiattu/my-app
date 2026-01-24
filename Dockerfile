FROM node:20-alpine

WORKDIR /app

# Сначала копируем package.json
COPY package*.json ./

# Устанавливаем зависимости с флагом --force
RUN npm ci --force

# Копируем остальные файлы
COPY . .

# Указываем порт
EXPOSE 5173

# Запускаем dev сервер
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]