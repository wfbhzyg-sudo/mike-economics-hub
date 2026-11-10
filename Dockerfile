FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node assets ./assets
COPY --chown=node:node homework ./homework
COPY --chown=node:node homework-server ./homework-server
COPY --chown=node:node auth ./auth
COPY --chown=node:node index.html apps.js hub.js artwork.css hub.css premium.css mobile.css courses.css floating.css motion.js server.mjs legacy-server.mjs unified-server.mjs gateway.mjs login.html login.css login.js portal-nav.js package.json ./
COPY --chown=node:node 使用说明.txt ./
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
