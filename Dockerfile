FROM node:16-alpine AS builder

RUN apk add curl bash

RUN curl -sf https://gobinaries.com/tj/node-prune | bash -s -- -b /usr/local/bin

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

ENV NODE_OPTIONS="--max_old_space_size=4096"

RUN npm run build

# run node prune
RUN /usr/local/bin/node-prune

RUN npm prune --production

# RUN npm prune --production
# RUN yarn install --production --ignore-scripts --prefer-offline

# remove unused dependencies
RUN rm -rf node_modules/rxjs/src/
RUN rm -rf node_modules/rxjs/bundles/
RUN rm -rf node_modules/rxjs/_esm5/
RUN rm -rf node_modules/rxjs/_esm2015/
RUN rm -rf node_modules/swagger-ui-dist/*.map
RUN rm -rf node_modules/aws-sdk/dist/

FROM node:16-alpine AS deploy
RUN apk update && apk add bash

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
