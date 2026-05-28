import type { OutputFormat } from "./OutputFormat"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"

export class ExtractRequestBase {

  constructor(
    readonly format?: OutputFormat,
    readonly includeMetadata?: boolean,
    readonly extractorOptions?: WebContentExtractorOptions,
    readonly converterOptions?: MarkdownConverterOptions,
  ) { }

}