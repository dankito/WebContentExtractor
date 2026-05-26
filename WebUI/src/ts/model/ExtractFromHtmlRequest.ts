import { ExtractRequestBase } from "./ExtractRequestBase"
import type { OutputFormat } from "./OutputFormat"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"

export class ExtractFromHtmlRequest extends ExtractRequestBase {

  constructor(
    readonly html: string,
    readonly format?: OutputFormat,
    readonly include_metadata?: boolean,
    readonly extractor_options?: WebContentExtractorOptions,
    readonly converter_options?: MarkdownConverterOptions,
  ) {
    super(format, include_metadata, extractor_options, converter_options)
  }

}