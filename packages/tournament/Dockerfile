FROM node:20-alpine AS build

RUN apk add --no-cache make

WORKDIR /app
COPY ./prisma/schema.prisma ./prisma/schema.prisma
COPY ./prisma/migrations ./prisma/migrations
COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY Makefile Makefile
COPY .env .env

FROM build AS development

# CMD ["tail", "-f", "/dev/null"]
CMD ["make", "dev"]

FROM build AS prod

CMD ["make", "prod"]