FROM node:16

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY src ./src
COPY scripts ./scripts

EXPOSE 3001

CMD ["npm", "start"]