import { z } from "zod"

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

export const WebFetcherOptionsSchema = z.object({
  timeout: numberSchema,
  userAgent: z.string().optional(),
  followRedirects: booleanSchema.optional(),
})

export const ExtractFromUrlSchema = z.object({
  url: z.preprocess(
    (val) => (val === undefined || val === null ? "" : val),
    z.string().min(1, "Missing required parameter: url")
  ).superRefine((url, ctx) => {
    if (!url) return // Handled by min(1)
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Only http and https URLs are supported, ${url} is invalid`,
        })
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Only http and https URLs are supported, ${url} is invalid`,
      })
    }
  }),
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

export const ExtractResponseSchema = z.object({
  url: z.string().optional(),
  pageContentHtml: z.string(),
  metadata: ExtractedMetadataSchema.optional(),
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
})
