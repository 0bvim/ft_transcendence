FROM node:20-alpine AS observability-builder
WORKDIR /app
COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

# First, build the observability package
COPY --from=observability-builder /app/observability/ft-transcendence-observability-1.0.0.tgz .

COPY ./ms-game/package*.json ./

# Install the packed observability package
RUN npm install ./ft-transcendence-observability-1.0.0.tgz

RUN npm install

COPY ./ms-game/tsconfig.json ./
COPY ./ms-game/tsconfig.server.json ./
COPY ./ms-game/src ./src
COPY ./ms-game/.env ./.env
COPY ./ms-game/certs ./certs

RUN npm run build

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f -k https://localhost:3002/api/health || exit 1

EXPOSE 3002

CMD ["npm", "start"]
