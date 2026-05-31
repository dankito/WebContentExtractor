import type { WebContentExtractor } from "./WebContentExtractor"
import type { ExtractionMetrics } from "./ExtractionMetrics"

export interface WebContentExtractionResult {
  extractor?: WebContentExtractor,
  content?: string
  failures?: Record<WebContentExtractor, string>

  metrics?: ExtractionMetrics
  allMetrics?: Record<WebContentExtractor, ExtractionMetrics>
}