# if using native modules like sqlite, sharp, bcrypt, prefere oven/bun:1-slim (glics) over -alpine
FROM oven/bun:1-alpine AS base
WORKDIR /app


# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production


# Final image
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

ENV HOST=0.0.0.0
ENV PORT=3030
ENV NODE_ENV=production

EXPOSE 3030

CMD ["bun", "run", "src/index.ts"]