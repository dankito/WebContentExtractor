import { Hono } from "hono"
import { logger } from "hono/logger"
import { pageContentExtractionRouter } from "./routes/pageContentExtractionRouter.ts"
import * as process from "bun"
import { OpenApiRouter } from "./routes/OpenApiRouter.ts"
import { CorsRouter } from "./routes/CorsRouter.ts"
import { StaticFilesRouter } from "./routes/StaticFilesRouter.ts"

export const app = new Hono()

app.use("*", logger())

new CorsRouter().configureCors(app)

new StaticFilesRouter().configureStaticFilesRoutes(app)

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.route("/extract", pageContentExtractionRouter)

app.route("/", new OpenApiRouter().createOpenApiAndSwaggerUiEndpoints(app))


const host = process.env.HOST ?? "localhost"
const port = parseInt(process.env.PORT ?? "3030")

export default {
  hostname: host,
  port: port,
  fetch: app.fetch,
}
