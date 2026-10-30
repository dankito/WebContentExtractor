import type { Hono } from "hono"
import { serveStatic } from "@hono/bun"

export class StaticFilesRouter {

  configureStaticFilesRoutes(app: Hono, basePath = ""): Hono {
    if (basePath) {
      app.get(basePath, context => context.redirect(`${basePath}/`))
    }

    return app.use("/*", serveStatic({
      root: "./public",
      rewriteRequestPath: path =>
        basePath && (path === basePath || path.startsWith(`${basePath}/`))
          ? path.slice(basePath.length) || "/"
          : path
    }))
  }

}