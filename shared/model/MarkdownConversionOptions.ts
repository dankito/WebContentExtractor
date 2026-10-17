import { MarkdownConverter } from "@shared/model/MarkdownConverter"

export class MarkdownConversionOptions {

  constructor(
    readonly converters: MarkdownConverter[] | undefined = undefined,

    readonly includeImages: boolean = false,
  ) { }

}