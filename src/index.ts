import { Hono } from "hono"
import { logger } from "hono/logger"
import { pageContentExtractionRouter } from "./routes/pageContentExtractionRouter.ts"
import * as process from "bun"
import { OpenApiRouter } from "./routes/OpenApiRouter.ts"
import { CorsRouter } from "./routes/CorsRouter.ts"
import { StaticFilesRouter } from "./routes/StaticFilesRouter.ts"
import { contentConverterRouter } from "./routes/contentConverterRouter.ts"
import { McpRouter } from "./routes/McpRouter.ts"

export const app = new Hono()

const basePath = process.env.BASE_PATH
const router = basePath ? app.basePath(basePath) : app


app.use("*", logger()) // request logger always registers for the root, not for basePath

new CorsRouter().configureCors(router)

new StaticFilesRouter().configureStaticFilesRoutes(router, basePath)

new McpRouter().addMcpServerRoutes(router)

router.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})


router.route("/extract", pageContentExtractionRouter)

router.route("/", contentConverterRouter)

router.route("/", new OpenApiRouter().createOpenApiAndSwaggerUiEndpoints(router, "/openapi.json", "/swagger-ui"))


const host = process.env.HOST ?? "localhost"
const port = parseInt(process.env.PORT ?? "3030")

export default {
  hostname: host,
  port: port,
  fetch: app.fetch,
}
