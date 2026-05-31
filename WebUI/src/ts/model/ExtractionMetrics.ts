export interface ExtractionMetrics {
  name: string,

  // Group 1 – Boilerplate / Noise
  linkDensity: number,
  boilerplatePhraseRatio: number,
  compressionRatio: number,
  avgSentenceLength: number,
  navTagLeakage: number,
  readabilityScore: number,
  repetitionRatio: number,

  // Raw counts (informational)
  extractedWordCount: number,
  pageWordCount: number,

  score: number,
}