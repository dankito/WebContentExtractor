FROM oven/bun:1-slim AS base
WORKDIR /app


# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production


# Final image
# we cannot use bun:1-distroless as kreuzberg/html-to-markdown uses a native Rust/C++ addon compiled against glibc
FROM oven/bun:1-slim AS runner

ARG VERSION
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.base.name=docker.io/oven/bun:1-slim

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json package.json ./
COPY src ./src
COPY shared ./shared
COPY public ./public

ENV HOST=0.0.0.0
ENV PORT=3030
ENV NODE_ENV=production

EXPOSE 3030

CMD ["src/index.ts"]