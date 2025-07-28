FROM node:20-alpine AS observability-builder
WORKDIR /app
COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache make

# First, build the observability package
COPY --from=observability-builder /app/observability/ft-transcendence-observability-1.0.0.tgz .

COPY ./ms-auth/prisma/schema.prisma ./prisma/schema.prisma
COPY ./ms-auth/prisma/migrations ./prisma/migrations
COPY ./ms-auth/src ./src
COPY ./ms-auth/package.json ./package.json
COPY ./ms-auth/tsconfig.json ./tsconfig.json
COPY ./ms-auth/Makefile Makefile
COPY ./ms-auth/.env .env
COPY ./ms-auth/certs ./certs

RUN npm install ./ft-transcendence-observability-1.0.0.tgz

FROM build AS development

CMD ["make", "dev"]

FROM build AS prod

CMD ["make", "prod"]
