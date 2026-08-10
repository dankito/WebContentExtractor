import type { ExtractedMetadata } from "../ExtractedMetadata.ts"

export class ExtractResponse {

  constructor(
    readonly url: string | undefined = undefined,
    readonly pageContentHtml: string,

    readonly metadata?: ExtractedMetadata,
  ) { }

}