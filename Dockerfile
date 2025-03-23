FROM node:22.14.0-alpine3.21 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm exec prisma generate

FROM node:22.14.0-alpine3.21 AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npm install --omit=dev
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
