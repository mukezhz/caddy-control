FROM node:jod-bookworm-slim AS base
RUN npm install -g pnpm
WORKDIR /app

# dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# build stage
FROM base AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpx prisma@6.5.0 generate
RUN pnpm run build:content
RUN pnpm build

# production stage
FROM base AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.contentlayer ./.contentlayer
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x /app/start.sh

# run the start script
CMD ["/app/start.sh"]
