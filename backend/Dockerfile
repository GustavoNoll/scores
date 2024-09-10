FROM node:16.14-alpine

WORKDIR /app-backend

# Copiar package.json e package-lock.json
COPY package* .

# Instalar as dependências
RUN npm install

# Copiar o restante dos arquivos
COPY . .

# Definir o comando de entrada para rodar as migrações e depois iniciar o app
ENTRYPOINT [ "sh", "-c", "npx sequelize db:migrate && npm run dev" ]