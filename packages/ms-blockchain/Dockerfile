FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache make

# First, build the observability package
COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

COPY ./ms-blockchain/src ./src
COPY ./ms-blockchain/contracts ./contracts
COPY ./ms-blockchain/scripts ./scripts
COPY ./ms-blockchain/package.json ./package.json
COPY ./ms-blockchain/tsconfig.json ./tsconfig.json
COPY ./ms-blockchain/hardhat.config.ts ./hardhat.config.ts
COPY ./ms-blockchain/Makefile Makefile
COPY ./ms-blockchain/.env .env

# Install all dependencies including Hardhat
RUN npm install
RUN npm install ./observability/ft-transcendence-observability-1.0.0.tgz
RUN npm run build
RUN mkdir -p /app/deployments

FROM build AS development

ENV NODE_ENV=development

# CMD ["tail", "-f", "/dev/null"]
CMD ["make", "dev"]

FROM node:20-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production

# Install curl for health checks and entrypoint script
RUN apk add --no-cache curl

# Copy built artifacts from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/deployments ./deployments
COPY --from=build /app/typechain-types ./typechain-types
COPY --from=build /app/contracts ./contracts

# Copy the entrypoint script
COPY ./ms-blockchain/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Use custom entrypoint for contract deployment
ENTRYPOINT ["/app/docker-entrypoint.sh"]
