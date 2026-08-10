FROM oven/bun:1-slim AS base
WORKDIR /app


# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production


# Final image
FROM oven/bun:1-distroless AS runner

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

ENV HOST=0.0.0.0
ENV PORT=3030
ENV NODE_ENV=production

EXPOSE 3030

CMD ["src/index.ts"]