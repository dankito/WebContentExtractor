import type { Hono } from "hono"
import { serveStatic } from "hono/bun"

export class StaticFilesRouter {

  configureStaticFilesRoutes(app: Hono, basePath = ""): Hono {
    return app.use("/*", serveStatic({
      root: "./public",
      rewriteRequestPath: (path) =>
        basePath && path.startsWith(basePath)
          ? path.slice(basePath.length) || "/"
          : path
    }))
  }

}