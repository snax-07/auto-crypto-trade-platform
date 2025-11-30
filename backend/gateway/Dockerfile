
FROM node:20-slim AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --production



FROM node:20-slim AS app

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src
EXPOSE 8000

CMD ["node", "src/index.js"]
