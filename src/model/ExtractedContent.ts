import type { ExtractedMetadata } from "./ExtractedMetadata.ts"

export class ExtractedContent {

  constructor(
    readonly url: string | undefined,

    readonly pageContentHtml: string,
    readonly pageContentAsText?: string,

    readonly metadata?: ExtractedMetadata,
  ) { }


}