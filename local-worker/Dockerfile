FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates fonts-dejavu-core fonts-noto-cjk && rm -rf /var/lib/apt/lists/*
COPY local-worker/package.json local-worker/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node local-worker/worker.mjs ./worker.mjs
USER node
CMD ["node", "worker.mjs"]
