FROM node:18-alpine

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

# First, build the observability package
COPY packages/observability ./packages/observability
RUN cd packages/observability && npm install && npm run build && npm pack

# Copy frontend service files
COPY packages/frontend/package*.json ./

# Install the packed observability package
RUN npm install ./packages/observability/ft-transcendence-observability-1.0.0.tgz

# Install other dependencies
RUN npm install

# Copy TypeScript config and source code
COPY packages/frontend/tsconfig.json ./
COPY packages/frontend/tsconfig.client.json ./
COPY packages/frontend/src ./src
COPY packages/frontend/static ./static
COPY packages/frontend/.env ./.env

# Build the application
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

EXPOSE 3005

CMD ["npm", "start"]
