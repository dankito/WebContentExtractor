import { MarkdownConversionResult } from "../MarkdownConversionResult"
import { TextConversionResult } from "../TextConversionResult"
import type { ExtractedMetadata } from "@shared/model/ExtractedMetadata.ts"
import type { WebResponse } from "@shared/model/WebResponse.ts"

export class MultiFormatResponse {

  constructor(
    readonly webResponse?: WebResponse,
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