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
RUN npm install ./ft-transcendence-observability-1.0.0.tgz --legacy-peer-deps

RUN npm install --legacy-peer-deps
RUN npm install --save-dev @types/ws @types/jsonwebtoken @types/uuid @types/node --legacy-peer-deps

COPY ./ms-game/tsconfig.json ./
COPY ./ms-game/src ./src
COPY ./ms-game/.env ./.env
COPY ./ms-game/certs ./certs

RUN npm run build

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f -k https://localhost:3002/api/health || exit 1

CMD ["npm", "start"]
