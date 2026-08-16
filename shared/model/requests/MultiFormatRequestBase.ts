import { OutputSelection } from "./OutputSelection"
import { MarkdownConversionOptions } from "../MarkdownConversionOptions"
import { TextConversionOptions } from "../TextConversionOptions"

export class MultiFormatRequestBase {

  constructor(
    readonly include: OutputSelection,

    readonly markdownConversionOptions?: MarkdownConversionOptions,
    readonly textConversionOptions?: TextConversionOptions,
  ) { }

}