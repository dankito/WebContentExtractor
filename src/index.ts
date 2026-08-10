import { Hono } from "hono"
import { logger } from "hono/logger"
import { pageContentExtractionRouter } from "./routes/pageContentExtractionRouter.ts"
import * as process from "bun"

const app = new Hono()

app.use("*", logger())

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.route("/", pageContentExtractionRouter)

const host = process.env.HOST ?? "localhost"
const port = parseInt(process.env.PORT ?? "3030")

console.log(`🚀 Readability API running on http://${host}:${port}`)

export default {
  hostname: host,
  port: port,
  fetch: app.fetch,
}
