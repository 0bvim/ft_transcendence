FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

COPY ./ms-game/package*.json ./

RUN npm install ./observability/ft-transcendence-observability-1.0.0.tgz

RUN npm install

COPY ./ms-game/tsconfig.json ./
COPY ./ms-game/tsconfig.server.json ./
COPY ./ms-game/src ./src
COPY ./ms-game/public ./public
COPY ./ms-game/index.html ./
COPY ./ms-game/.env ./.env
COPY ./ms-game/certs ./certs

RUN npm run build

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

EXPOSE 3002

CMD ["npm", "start"]
