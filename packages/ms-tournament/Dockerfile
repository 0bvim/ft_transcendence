FROM node:20-alpine AS observability-builder
WORKDIR /app
COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache make

# First, build the observability package
COPY --from=observability-builder /app/observability/ft-transcendence-observability-1.0.0.tgz .

COPY ./ms-tournament/prisma/schema.prisma ./prisma/schema.prisma
COPY ./ms-tournament/prisma/migrations ./prisma/migrations
COPY ./ms-tournament/src ./src
COPY ./ms-tournament/package.json ./package.json
COPY ./ms-tournament/tsconfig.json ./tsconfig.json
COPY ./ms-tournament/Makefile Makefile
COPY ./ms-tournament/.env .env
COPY ./ms-tournament/certs ./certs

RUN npm install ./ft-transcendence-observability-1.0.0.tgz

FROM build AS development

CMD ["make", "dev"]

FROM build AS prod

CMD ["make", "prod"]
