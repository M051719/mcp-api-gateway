FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install  --omit=dev

COPY index.js ./
COPY config/ ./config/
COPY scripts/ ./scripts/
COPY migrations/ ./migrations/
COPY models/ ./models/
COPY seeds/ ./seeds/

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.js ./index.js
COPY --from=builder /app/config/ ./config/
COPY --from=builder /app/scripts/ ./scripts/
COPY --from=builder /app/migrations/ ./migrations/
COPY --from=builder /app/models/ ./models/
COPY --from=builder /app/seeds/ ./seeds/

RUN addgroup -S mcpuser && adduser -S mcpuser -G mcpuser
RUN chmod +x /app/scripts/start.sh || true
USER mcpuser

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "/app/scripts/start.sh"]
