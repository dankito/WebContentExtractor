import { MarkdownConversionResult } from "../MarkdownConversionResult"
import { TextConversionResult } from "../TextConversionResult"
import type { ExtractedMetadata } from "@shared/model/ExtractedMetadata.ts"

export class MultiFormatResponse {

  constructor(
    readonly webResponse?: any, // TODO
    readonly rawHtml?: string,

    readonly rawMarkdown?: MarkdownConversionResult,
    readonly rawText?: TextConversionResult,

    readonly contentExtractionResult?: any, // TODO
    readonly contentHtml?: string,

    readonly contentMarkdown?: MarkdownConversionResult,
    readonly contentText?: TextConversionResult,

    readonly metadata?: ExtractedMetadata,
  ) { }

}