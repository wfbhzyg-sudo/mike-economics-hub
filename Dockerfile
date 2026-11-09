FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node assets ./assets
COPY --chown=node:node index.html apps.js hub.js artwork.css hub.css premium.css mobile.css courses.css floating.css motion.js server.mjs package.json ./
COPY --chown=node:node 使用说明.txt ./
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
