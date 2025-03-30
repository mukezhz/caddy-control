FROM node:20.14.0-alpine3.20 AS base
RUN npm install -g pnpm
WORKDIR /app

# dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# build stage
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpx prisma generate
RUN pnpm build

# production stage
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x /app/start.sh

# run the start script
CMD ["/app/start.sh"]