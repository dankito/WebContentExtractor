import { describe, test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { parseHTML } from "linkedom" // swap for your actual DOM lib import
import { Readability } from "@mozilla/readability"

const FIXTURE_PATH = join(import.meta.dir, "..", "fixtures", "spiegel.html")
const RUNS = 1000

describe("Readability performance", () => {
  test(`runs ${RUNS} times and reports timing stats`, () => {
    const html = readFileSync(FIXTURE_PATH, "utf-8")

    const durations: number[] = []
    const overallStart = performance.now()

    for (let i = 0; i < RUNS; i++) {
      // Parse fresh each run — Readability mutates the DOM it's given,
      // so reusing a single parsed document across runs would invalidate
      // later iterations (and isn't representative of real usage anyway).
      const { document } = parseHTML(html)

      const runStart = performance.now()
      const reader = new Readability(document as unknown as Document)
      const result = reader.parse()
      const runEnd = performance.now()

      durations.push(runEnd - runStart)

      // Sanity check so a silently-broken run doesn't skew timings unnoticed
      expect(result).not.toBeNull()
    }

    const overallEnd = performance.now()
    const overallMs = overallEnd - overallStart

    const min = Math.min(...durations)
    const max = Math.max(...durations)
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length

    console.log(`\nReadability performance over ${RUNS} runs:`)
    console.log(`  overall: ${overallMs.toFixed(2)} ms`)
    console.log(`  min:     ${min.toFixed(3)} ms`)
    console.log(`  max:     ${max.toFixed(3)} ms`)
    console.log(`  avg:     ${avg.toFixed(3)} ms`)

    expect(durations.length).toBe(RUNS)
  })
})