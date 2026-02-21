# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/server.js ./
EXPOSE 8080
CMD ["node", "server.js"]
