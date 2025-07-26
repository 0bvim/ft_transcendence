FROM node:18-slim AS build

WORKDIR /app

RUN apt-get update && apt-get install -y make openssl && rm -rf /var/lib/apt/lists/*

# First, build the observability package
COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

COPY ./ms-tournament/prisma/schema.prisma ./prisma/schema.prisma
COPY ./ms-tournament/prisma/migrations ./prisma/migrations
COPY ./ms-tournament/src ./src
COPY ./ms-tournament/package.json ./package.json
COPY ./ms-tournament/tsconfig.json ./tsconfig.json
COPY ./ms-tournament/Makefile Makefile
COPY ./ms-tournament/.env ./.env

RUN npm install ./observability/ft-transcendence-observability-1.0.0.tgz

FROM build AS development

ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# CMD ["tail", "-f", "/dev/null"]
CMD ["make", "dev"]

FROM build AS prod

ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

CMD ["make", "prod"]