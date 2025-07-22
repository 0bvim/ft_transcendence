FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache make

# First, build the observability package
COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

COPY ./blockchain/src ./src
COPY ./blockchain/contracts ./contracts
COPY ./blockchain/scripts ./scripts
COPY ./blockchain/package.json ./package.json
COPY ./blockchain/tsconfig.json ./tsconfig.json
COPY ./blockchain/hardhat.config.ts ./hardhat.config.ts
COPY ./blockchain/Makefile Makefile
COPY ./blockchain/.env .env

# Install all dependencies including Hardhat
RUN npm install
RUN npm install ./observability/ft-transcendence-observability-1.0.0.tgz

FROM build AS development

ENV NODE_ENV=development

# CMD ["tail", "-f", "/dev/null"]
CMD ["make", "dev"]

FROM build AS prod

ENV NODE_ENV=production

CMD ["make", "prod"]
