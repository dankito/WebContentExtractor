import { writeFile } from "node:fs/promises"
import { generateSpecs } from "hono-openapi"
import pkg from "../package.json" with { type: "json" }
import { app } from "../src"

async function main() {
  const spec = await generateSpecs(app, {
    documentation: {
      info: {
        title: "Readability Server",
        version: pkg.version,
        description: "A high-performance, Hono-based web service wrapper for Mozilla's Readability.js, which powers Firefox's Reader View. " +
          "Extract clean, readable content from any webpage with lightning speed.",
      },
    },
  })

  await writeFile("openapi.json", JSON.stringify(spec, null, 2) + "\n")
  console.log("openapi.json generated")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})