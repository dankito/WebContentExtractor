import type { Hono } from "hono"
import { serveStatic } from "hono/bun"

export class StaticFilesRouter {

  configureStaticFilesRoutes(app: Hono) {
    app.use("/*", serveStatic({ root: "./public" }))
  }

}