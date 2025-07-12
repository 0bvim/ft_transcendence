FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache make

# First, build the observability package
COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

COPY ./ms-auth/prisma/schema.prisma ./prisma/schema.prisma
COPY ./ms-auth/prisma/migrations ./prisma/migrations
COPY ./ms-auth/src ./src
COPY ./ms-auth/package.json ./package.json
COPY ./ms-auth/tsconfig.json ./tsconfig.json
COPY ./ms-auth/Makefile Makefile
COPY ./ms-auth/.env .env

RUN npm install ./observability/ft-transcendence-observability-1.0.0.tgz

FROM build AS development

# CMD ["tail", "-f", "/dev/null"]
CMD ["make", "dev"]

FROM build AS prod

CMD ["make", "prod"]
