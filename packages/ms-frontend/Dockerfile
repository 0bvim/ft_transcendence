FROM node:20-alpine AS build

RUN apk add --no-cache make

WORKDIR /app
COPY ./prisma ./prisma
COPY ./src ./src
COPY ./public ./public
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./vite.config.ts ./vite.config.ts
COPY ./tailwind.config.js ./tailwind.config.js
COPY ./postcss.config.js ./postcss.config.js
COPY ./index.html ./index.html
COPY Makefile Makefile

FROM build AS development

# CMD ["tail", "-f", "/dev/null"]
CMD ["make", "dev"]

FROM build AS prod

CMD ["make", "build"]
