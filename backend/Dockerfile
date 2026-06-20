FROM node:22 AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev && npm rebuild bcrypt
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3001
CMD ["node", "dist/main"]
