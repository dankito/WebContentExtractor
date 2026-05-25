import type { MarkdownConverter } from "./MarkdownConverter"

export class MarkdownConverterOptions {

  constructor(
    readonly converters?: MarkdownConverter[],
  ) { }

}