FROM node:22 AS builder
RUN npm i -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-slim
ENV NODE_ENV=production
RUN npm i -g pnpm@latest
WORKDIR /app
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --prod
COPY --chown=node:node --from=builder /app/dist ./dist
USER node
EXPOSE 3001
CMD ["node", "dist/main"]
