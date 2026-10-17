import { MarkdownConverter } from "@shared/model/MarkdownConverter"

export class MarkdownConversionOptions {

  constructor(
    readonly converters: MarkdownConverter[] | undefined = undefined,

    readonly includeLinks: boolean = true,
    readonly includeImages: boolean = false,
  ) { }

}