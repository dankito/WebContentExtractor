import { Hono } from "hono"
import { logger } from "hono/logger"
import { pageContentExtractionRouter } from "./routes/pageContentExtractionRouter.ts"

const app = new Hono()

app.use("*", logger())

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.route("/", pageContentExtractionRouter)

const port = parseInt(process.env.PORT ?? "3030")

console.log(`🚀 Readability API running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
