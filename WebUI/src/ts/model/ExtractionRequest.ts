import type { OutputFormat } from "./OutputFormat"
import type { WebFetcherOptions } from "./WebFetcherOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import { ExtractRequestBase } from "./ExtractRequestBase"

export class ExtractionRequest extends ExtractRequestBase {

  constructor(
    readonly url: string,
    format?: OutputFormat, // TODO: it does not work this way in backend
    includeMetadata?: boolean,

    // TODO: these are currently not available in backend
    readonly webFetcherOptions?: WebFetcherOptions,
    extractorOptions?: WebContentExtractorOptions,
    converterOptions?: MarkdownConverterOptions,
  ) {
    super(format, includeMetadata, extractorOptions, converterOptions)
  }
  
}
