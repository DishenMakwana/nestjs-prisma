FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --production

FROM node:16-alpine
RUN apk update && apk add \
    bash

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public


COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

ARG ARG_PORT
ENV PORT=$ARG_PORT

ARG RUN_MIGRATION
ENV RUN_MIGRATION=$RUN_MIGRATION

ARG ARG_RUN_SEED
ENV RUN_SEED=$ARG_RUN_SEED

EXPOSE $PORT

ENTRYPOINT [ "/entrypoint.sh" ]
