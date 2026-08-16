import { z } from "zod"
import { MarkdownConverter } from "@shared/model/MarkdownConverter.ts"
import { TextConverter } from "@shared/model/TextConverter.ts"
import { WebFetcher } from "@shared/model/WebFetcher.ts"

const booleanSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    return val.trim().toLowerCase() === "true"
  }
  if (typeof val === "boolean") {
    return val
  }
  return false
}, z.boolean())

const numberSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const parsed = Number.parseInt(val.trim())
    return isNaN(parsed) ? undefined : parsed
  }
  if (typeof val === "number") {
    return val
  }
  return undefined
}, z.number().optional())

export const ConvertToPlainTextOptionsSchema = z.object({
  preserveLinkUrlsInPlainText: booleanSchema.optional(),
  preserveImageUrlsInPlainText: booleanSchema.optional(),
})

export const WebRequestOptionsSchema = z.object({
  timeout: numberSchema,
  userAgent: z.string().optional(),
  followRedirects: booleanSchema.optional(),
})

export const MarkdownConversionOptionsSchema = z.object({
  includeImages: booleanSchema.optional(),
})

export const TextConversionOptionsSchema = z.object({
  preserveLinkUrls: booleanSchema.optional(),
  preserveImageUrls: booleanSchema.optional(),
})

const UrlSchema = z.preprocess(
  (val) => (val === undefined || val === null ? "" : val),
  z.string().min(1, "Missing required parameter: url")
).superRefine((url, ctx) => {
  if (!url) return // Handled by min(1)
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        message: `Only http and https URLs are supported, ${url} is invalid`,
      })
    }
  } catch {
    ctx.addIssue({
      code: "custom",
      message: `Only http and https URLs are supported, ${url} is invalid`,
    })
  }
})

export const ExtractFromUrlSchema = z.object({
  url: UrlSchema,
  includeMetadata: booleanSchema.optional(),
  // Flattened structure as it comes from request params/body
  // web fetcher options
  timeout: numberSchema,
  userAgent: z.string().optional(),
  followRedirects: booleanSchema.optional(),
  // convert to markdown options
  includeImages: booleanSchema.optional(),
  // convert to text options
  preserveLinkUrlsInPlainText: booleanSchema.optional(),
  preserveImageUrlsInPlainText: booleanSchema.optional(),
})

export const ExtractFromHtmlSchema = z.object({
  html: z.preprocess(
    (val) => (val === undefined || val === null ? "" : val),
    z.string().min(1, "Missing required parameter: html")
  ),
  url: z.string().optional(),
  includeMetadata: booleanSchema.optional(),
  // convert to markdown options
  includeImages: booleanSchema.optional(),
  // convert to text options
  preserveLinkUrlsInPlainText: booleanSchema.optional(),
  preserveImageUrlsInPlainText: booleanSchema.optional(),
})

export const OutputSelectionSchema = z.object({
  rawHtml: booleanSchema.optional(),
  rawMarkdown: booleanSchema.optional(),
  rawText: booleanSchema.optional(),

  contentHtml: booleanSchema.optional(),
  contentMarkdown: booleanSchema.optional(),
  contentText: booleanSchema.optional(),

  metadata: booleanSchema.optional(),
})

export const MultiFormatFromUrlRequestSchema = z.object({
  url: UrlSchema,

  include: OutputSelectionSchema,

  webRequestOptions: WebRequestOptionsSchema.optional(),

  markdownConversionOptions: MarkdownConversionOptionsSchema.optional(),
  textConversionOptions: TextConversionOptionsSchema.optional()
})

export const MultiFormatFromHtmlRequestSchema = z.object({
  html: z.string(),

  include: OutputSelectionSchema,

  markdownConversionOptions: MarkdownConversionOptionsSchema.optional(),
  textConversionOptions: TextConversionOptionsSchema.optional()
})

export const ConvertHtmlRequestSchema = z.object({
  html: z.string(),

  markdownConversionOptions: MarkdownConversionOptionsSchema.optional(),
  textConversionOptions: TextConversionOptionsSchema.optional()
})

export const WebResponseSchema = z.object({
  fetcher: z.enum(WebFetcher),

  error: z.string().optional(),

  statusCode: z.number().optional(),
  finalUrl: z.string().optional(),

  headers: z.record(z.string(), z.string()).optional(),
  cookies: z.array(z.string()).optional(),

  durationMs: z.int32().optional(),
})

export const MarkdownConversionResultSchema = z.object({
  converter: z.enum(MarkdownConverter),
  success: z.boolean(),

  markdown: z.string().optional(),
  error: z.string().optional(),

  durationMs: z.int32().optional(),
})

export const TextConversionResultSchema = z.object({
  converter: z.enum(TextConverter),
  success: z.boolean(),

  text: z.string().optional(),
  error: z.string().optional(),

  durationMs: z.int32().optional(),
})

export const ExtractedMetadataSchema = z.object({
  title: z.string().optional(),
  length: z.number().optional(),
  excerpt: z.string().optional(),
  byline: z.string().optional(),
  contentDirection: z.string().optional(),
  siteName: z.string().optional(),
  contentLanguage: z.string().optional(),
  publishedTime: z.string().optional(),
})

export const MultiFormatResponseSchema = z.object({
  webResponse: WebResponseSchema,

  rawHtml: z.string().optional(),
  rawMarkdown: MarkdownConversionResultSchema.optional(),
  rawText: TextConversionResultSchema.optional(),

  contentExtractionError: z.string().optional(),
  contentHtml: z.string().optional(),

  contentMarkdown: MarkdownConversionResultSchema.optional(),
  contentText: TextConversionResultSchema.optional(),

  metadata: ExtractedMetadataSchema.optional(),
})

export const ExtractResponseSchema = z.object({
  url: z.string().optional(),
  pageContentHtml: z.string(),
  metadata: ExtractedMetadataSchema.optional(),
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
})
