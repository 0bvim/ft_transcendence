FROM node:20-alpine

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# First, build the observability package
COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

# Copy game service files
COPY ./ms-game/package*.json ./

# Install the packed observability package
RUN npm install ./observability/ft-transcendence-observability-1.0.0.tgz

# Install other dependencies
RUN npm install

# Copy TypeScript config, source code and game files
COPY ./ms-game/tsconfig.json ./
COPY ./ms-game/tsconfig.server.json ./
COPY ./ms-game/src ./src
COPY ./ms-game/public ./public
COPY ./ms-game/index.html ./
COPY ./ms-game/.env ./.env

# Build the game and server
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3003/health || exit 1

EXPOSE 3003

CMD ["npm", "start"]
