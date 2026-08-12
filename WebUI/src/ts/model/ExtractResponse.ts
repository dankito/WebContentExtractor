import type { ExtractedMetadata } from "../../../../src/model/ExtractedMetadata"

export interface ExtractResponse {
  readonly pageContentHtml: string
  readonly url?: string

  readonly metadata?: ExtractedMetadata
}
