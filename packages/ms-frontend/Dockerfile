FROM node:20-alpine AS build

WORKDIR /app

COPY ./observability ./observability
RUN cd observability && npm install && npm run build && npm pack

RUN apk add --no-cache make

# Install dependencies first for better caching
RUN npm install ./observability/ft-transcendence-observability-1.0.0.tgz

# Copy project files
COPY ./ms-frontend/src ./src
COPY ./ms-frontend/assets ./assets
COPY ./ms-frontend/package.json ./package.json
COPY ./ms-frontend/tsconfig.json ./tsconfig.json
COPY ./ms-frontend/vite.config.ts ./vite.config.ts
COPY ./ms-frontend/tailwind.config.js ./tailwind.config.js
COPY ./ms-frontend/postcss.config.js ./postcss.config.js
COPY ./ms-frontend/index.html ./index.html
COPY ./ms-frontend/Makefile Makefile
COPY ./ms-frontend/certs/ ./certs

FROM build AS development

CMD ["make", "dev"]

FROM build AS prod

CMD ["make", "build"]
