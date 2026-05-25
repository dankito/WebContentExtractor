import type { WebContentExtractor } from "./WebContentExtractor"

export interface WebContentExtractionResult {
  extractor?: WebContentExtractor,
  content?: string
  failures?: Record<WebContentExtractor, string>
}