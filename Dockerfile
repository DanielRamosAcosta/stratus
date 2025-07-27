FROM node:24-alpine AS base
WORKDIR /app

RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json package-lock.json* ./

RUN npm ci --only=production && npm cache clean --force

FROM base AS builder
COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

FROM base AS runner

RUN addgroup --system --gid 1001 remix
RUN adduser --system --uid 1001 remix

RUN chown -R remix:remix /app
USER remix

COPY --from=builder --chown=remix:remix /app/build ./build
COPY --from=builder --chown=remix:remix /app/public ./public

COPY --from=deps --chown=remix:remix /app/node_modules ./node_modules

COPY --from=builder --chown=remix:remix /app/package.json ./package.json

EXPOSE 5173

ENV NODE_ENV=production
ENV PORT=5173

CMD ["npm", "start"]
