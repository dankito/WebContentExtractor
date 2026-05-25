import type { ExtractedMetadata } from "./ExtractedMetadata"

export interface ExtractionResponse {
  url: string
  format: string
  content: string
  extractor?: string
  metadata?: ExtractedMetadata
}
