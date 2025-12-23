FROM node:18.20.0-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y openssl

COPY package*.json .
RUN npm install

COPY src/ src/
COPY tsconfig.json tsconfig.json

RUN npm run build




FROM node:18.20.0-slim AS runner

WORKDIR /app/notification

RUN apt-get update && apt-get install -y openssl

COPY --from=builder build/package*.json .
COPY --from=builder build/node_modules node_modules/
COPY --from=builder build/dist dist/

EXPOSE 8000

CMD [ "npm", "start" ]