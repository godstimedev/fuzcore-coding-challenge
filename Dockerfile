FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Dev image (used by docker-compose for local development) ---
FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

EXPOSE 5000

CMD ["npm", "run", "dev"]

# --- Production image ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

ENV PORT=8080

CMD ["node", "dist/index.cjs"]
