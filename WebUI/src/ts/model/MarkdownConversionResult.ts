import type { MarkdownConverter } from "./MarkdownConverter"

export interface MarkdownConversionResult {
  converter?: MarkdownConverter
  content?: string
  failures?: Record<MarkdownConverter, string>
}