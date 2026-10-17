FROM oven/bun:1-slim AS base
WORKDIR /app


# 1. Install all dependencies for building the frontend
FROM base AS deps-build
COPY package.json bun.lock* ./
COPY WebUI/package.json ./WebUI/package.json
RUN bun install --frozen-lockfile \
    && cd WebUI && bun install --frozen-lockfile


# 2. Build the frontend (outputs to /app/public)
FROM base AS build-frontend
COPY --from=deps-build /app/node_modules ./node_modules
COPY --from=deps-build /app/WebUI/node_modules ./WebUI/node_modules
COPY package.json tsconfig.json ./
COPY shared ./shared
COPY WebUI ./WebUI
RUN cd WebUI && bun run buildDist


# 3. Install production-only dependencies for the backend
FROM base AS deps-prod
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production


# 4. Final runtime image
# we cannot use bun:1-distroless as kreuzberg/html-to-markdown uses a native Rust/C++ addon compiled against glibc
FROM oven/bun:1-slim AS runner

ARG VERSION
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.base.name=docker.io/oven/bun:1-slim

WORKDIR /app

# Production node_modules and built frontend
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build-frontend /app/public ./public

# Backend source code and configuration
COPY tsconfig.json package.json ./
COPY src ./src
COPY shared ./shared

ENV HOST=0.0.0.0
ENV PORT=3030
ENV NODE_ENV=production

EXPOSE 3030

CMD ["src/index.ts"]