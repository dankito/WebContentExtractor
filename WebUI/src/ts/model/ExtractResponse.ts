import type { ExtractedMetadata } from "@shared/model/ExtractedMetadata"

export interface ExtractResponse {
  readonly pageContentHtml: string
  readonly url?: string

  readonly metadata?: ExtractedMetadata
}
