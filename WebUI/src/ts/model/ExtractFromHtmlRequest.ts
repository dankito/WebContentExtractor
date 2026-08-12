import { ExtractRequestBase } from "./ExtractRequestBase"
import type { OutputFormat } from "./OutputFormat"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"

export class ExtractFromHtmlRequest extends ExtractRequestBase {

  constructor(
    readonly html: string,
    format?: OutputFormat, // TODO: it does not work this way in backend
    includeMetadata?: boolean,

    // TODO: these are currently not available in backend
    extractorOptions?: WebContentExtractorOptions,
    converterOptions?: MarkdownConverterOptions,
  ) {
    super(format, includeMetadata, extractorOptions, converterOptions)
  }

}