FROM node:23-alpine

WORKDIR /sirasa-service-dev

COPY package*.json ./
COPY prisma ./prisma

RUN npm config set legacy-peer-deps true
RUN npm cache clean --force
RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
