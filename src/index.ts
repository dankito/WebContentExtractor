import { Hono } from "hono"
import { logger } from "hono/logger"
import { openAPIRouteHandler } from "hono-openapi"
import { pageContentExtractionRouter } from "./routes/pageContentExtractionRouter.ts"
import * as process from "bun"

const app = new Hono()

app.use("*", logger())

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.route("/extract", pageContentExtractionRouter)

app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Readability Server",
        version: "1.0.0",
        description: "A high-performance, Hono-based web service wrapper for Mozilla's Readability.js, which powers Firefox's Reader View. " +
          "Extract clean, readable content from any webpage with lightning speed.",
      },
    },
  }),
)


const host = process.env.HOST ?? "localhost"
const port = parseInt(process.env.PORT ?? "3030")

export default {
  hostname: host,
  port: port,
  fetch: app.fetch,
}
