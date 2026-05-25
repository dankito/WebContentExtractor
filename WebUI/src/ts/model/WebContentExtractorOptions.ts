import type { WebContentExtractor } from "./WebContentExtractor"

export class WebContentExtractorOptions {

  constructor(
    readonly extractors?: WebContentExtractor[],
  ) { }

}