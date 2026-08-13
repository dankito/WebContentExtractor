import { join } from "node:path"
import { readFileSync } from "node:fs"
import { expect } from "bun:test"

export class PerformanceTestData {

  static readonly FixturesFolder = join(import.meta.dir, "..", "fixtures")

  static readonly SpiegelArticlePath = join(PerformanceTestData.FixturesFolder, "spiegel.html")

  static readonly SpiegelArticleHtml = readFileSync(PerformanceTestData.SpiegelArticlePath, "utf-8")


  static measureDurations<T>(countRuns: number, run: (args?: T) => any | undefined, setupRun?: () => T | undefined) {
    const durations: number[] = []
    const overallStart = performance.now()

    for (let i = 0; i < countRuns; i++) {
      try {
        const args = setupRun?.()

        const runStart = performance.now()
        const result = run(args)
        const runEnd = performance.now()

        durations.push(runEnd - runStart)

        // Sanity check so a silently-broken run doesn't skew timings unnoticed
        expect(result).not.toBeNull()
      } catch (error) {
        console.error(`Run ${i + 1} failed:`, error)
      }
    }

    const overallEnd = performance.now()
    const overallMs = overallEnd - overallStart

    const min = Math.min(...durations)
    const max = Math.max(...durations)
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length

    console.log(`\nPerformance over ${countRuns} runs:`)
    console.log(`  overall: ${overallMs.toFixed(2)} ms`)
    console.log(`  min:     ${min.toFixed(3)} ms`)
    console.log(`  max:     ${max.toFixed(3)} ms`)
    console.log(`  avg:     ${avg.toFixed(3)} ms`)

    expect(durations.length).toBe(countRuns)
  }

}