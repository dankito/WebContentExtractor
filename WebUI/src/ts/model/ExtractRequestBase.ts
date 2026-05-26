import type { OutputFormat } from "./OutputFormat"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"

export class ExtractRequestBase {

  constructor(
    readonly format?: OutputFormat,
    readonly include_metadata?: boolean,
    readonly extractor_options?: WebContentExtractorOptions,
    readonly converter_options?: MarkdownConverterOptions,
  ) { }

}