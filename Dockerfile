FROM node:23-alpine

WORKDIR /sirasa-service-dev

COPY package*.json ./

COPY ./prisma ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]