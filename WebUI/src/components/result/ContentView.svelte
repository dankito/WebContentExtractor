<script lang="ts">
  import { marked } from "marked"
  import { Code, Eye } from "@lucide/svelte"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import { WebContentExtractor } from "../../ts/model/WebContentExtractor"
  import Card from "../common/form/Card.svelte"
  import { MarkdownConverter } from "../../ts/model/MarkdownConverter"
  import { WebFetcher } from "../../ts/model/WebFetcher"
  import { RequestedFormat } from "../../ts/model/RequestedFormat"
  import ComboBox from "../common/form/ComboBox.svelte"
  import type { WebContentExtractionResult } from "../../ts/model/WebContentExtractionResult"
  import type { ExtractionMetrics } from "../../ts/model/ExtractionMetrics"
  import { Option } from "../../ts/ui/Option"
  import HtmlContent from "../common/controls/HtmlContent.svelte"

  let { content, format, fetcher = undefined, extractionResult = undefined, converter = undefined, returnedFormats = [], displayedFormat = $bindable() }:
    { content: string, format: OutputFormat, fetcher?: WebFetcher, extractionResult?: WebContentExtractionResult, converter?: MarkdownConverter,
      returnedFormats?: RequestedFormat[], displayedFormat?: RequestedFormat } = $props()

  let viewMode = $state<"source" | "rendered">("rendered")

  let returnedFormatsOptions = $derived(returnedFormats.map(format => new Option(format, getRequestedFormatDisplayName(format))))

  const renderedMarkdown = $derived(
    format === OutputFormat.Markdown
      ? (marked(content) as string)
      : undefined
  )

  const supportsRendered = $derived(format === OutputFormat.Html || format === OutputFormat.Markdown)

  $effect(() => {
    // each time when content changes, set viewMode to "rendered"
    const _ = content
    viewMode = "rendered"
  })


  async function copyToClipboard() {
    if (!navigator.clipboard) {
      console.warn("Aborting, clipboard is not supported")
      return
    }

    /**
     * A few caveats worth knowing:
     *
     * - **`text/markdown` is not a registered MIME type** the browser clipboard will accept. The workaround is to put your markdown in `text/plain` (most markdown-aware apps like Notion, Linear, and Bear detect it anyway), or use a custom `web text/markdown` type with the new [Web Custom Formats](https://docs.google.com/document/d/1XDOtTv8DtwTi4GaszwRFIJCOuzAEA4g9Tk0HrasQAdE) spec (Chrome 104+ only).
     * - **`clipboard.write()`** (as opposed to `writeText`) requires user gesture and a secure context, same as `writeText`.
     * - **Firefox** has partial support — `text/plain` and `text/html` work, but it may block custom types.
     * - **Safari** supports it but requires all `Blob` promises to be resolved *synchronously* at construction time — don't `await` anything before building the `ClipboardItem`.
     */
    const items: Record<string, string | Blob> = {}
    if (displayedFormat) {
      if (displayedFormat == RequestedFormat.RawHtml || displayedFormat == RequestedFormat.ContentHtml) {
        items["text/html"] = new Blob([content], { type: "text/html" })
        items["text/plain"] = new Blob([content], { type: "text/plain" }) // without it copying html to clipboard will not work
      } else if (displayedFormat === RequestedFormat.ContentMarkdown) {
        items["text/plain"] = content
      } else if (displayedFormat == RequestedFormat.ContentText) {
        items["text/plain"] = new Blob([content], { type: "text/plain" })
      }
    } else {
      if (format == OutputFormat.Html) {
        items["text/html"] = new Blob([content], { type: "text/html" })
        items["text/plain"] = new Blob([content], { type: "text/plain" }) // without it copying html to clipboard will not work
      } else if (format === OutputFormat.Markdown) {
        items["text/plain"] = content
      } else if (format == OutputFormat.Text) {
        items["text/plain"] = new Blob([content], { type: "text/plain" })
      }
    }

    const clipboardItem = new ClipboardItem(items)
    await navigator.clipboard.write([ clipboardItem ])
  }


  function formatExtractionMetrics(): string {
    if (!extractionResult?.allMetrics && !extractionResult?.metrics) {
      return ""
    }

    const extractorMetrics: Record<WebContentExtractor, ExtractionMetrics> = { }
    extractorMetrics[extractionResult.extractor!] = extractionResult.metrics!
    const metrics = extractionResult.allMetrics ?? extractorMetrics
    const extractors = Object.keys(metrics) as WebContentExtractor[]
    const col_w = 16
    const metric_name_w = 30

    return [
      "\n".padEnd(metric_name_w) + extractors.map(e => e.padEnd(col_w)).join(" "),
      "Link density:".padEnd(metric_name_w) + extractors.map(e => metrics[e].linkDensity.toFixed(2).padEnd(col_w)).join(" "),
      "Avg. sentence length:".padEnd(metric_name_w) + extractors.map(e => metrics[e].avgSentenceLength.toFixed(2).padEnd(col_w)).join(" "),
      "Compression ratio:".padEnd(metric_name_w) + extractors.map(e => metrics[e].compressionRatio.toFixed(2).padEnd(col_w)).join(" "),
      "Readability score:".padEnd(metric_name_w) + extractors.map(e => metrics[e].readabilityScore.toFixed(2).padEnd(col_w)).join(" "),
      "Total score:".padEnd(metric_name_w) + extractors.map(e => metrics[e].score.toFixed(2).padEnd(col_w)).join(" "),
    ].join("\n")
  }

  function formatToolsAndChars(): string {
    const tools = [
      fetcher ? getShortFetcherName(fetcher) : "",
      extractionResult ? getShortExtractorInfo(extractionResult) : "",
      converter ? getShortConverterName(converter) : "",
    ].filter(it => it !== "")

    const countChars = content.length.toLocaleString() + " chars"

    if (tools.length) {
      return tools.join(" · ") + " · " + countChars
    } else {
      return countChars
    }
  }

  function getShortFetcherName(fetcher: WebFetcher): string {
    if (fetcher === WebFetcher.CurlCffi) {
      return "curl"
    } else if (fetcher === WebFetcher.Camoufox) {
      return "Camoufox"
    } else if (fetcher === WebFetcher.Zendriver) {
      return "Zendriver"
    } else if (fetcher === WebFetcher.PythonHttpx) {
      return "httpx"
    } else {
      return fetcher
    }
  }

  function getShortExtractorInfo(result: WebContentExtractionResult): string {
    const name = result.extractor ? getShortExtractorName(result.extractor) : ""
    const score = result.metrics ? `(${result.metrics.score.toFixed(2)})` : ""
    return [name + score].filter(it => it != "").join("  ")
  }

  function getShortExtractorName(extractor: WebContentExtractor): string {
    if (extractor === WebContentExtractor.Trafilatura) {
      return "Trafilatura"
    } else if (extractor === WebContentExtractor.ReadabilityLxml) {
      return "Readability"
    } else {
      return extractor
    }
  }

  function getShortConverterName(converter: MarkdownConverter): string {
    if (converter === MarkdownConverter.Markdownify) {
      return "Markdownify"
    } else if (converter === MarkdownConverter.Html2Text) {
      return "html2text"
    } else if (converter === MarkdownConverter.Kreuzberg) {
      return "Kreuzberg"
    } else {
      return converter
    }
  }

  function getRequestedFormatDisplayName(format: RequestedFormat): string {
    if (format == RequestedFormat.RawHtml) {
      return "Raw HTML"
    } else if (format == RequestedFormat.ContentHtml) {
      return "HTML"
    } else if (format == RequestedFormat.ContentMarkdown) {
      return "Markdown"
    } else if (format == RequestedFormat.ContentText) {
      return "Text"
    } else {
      return format // should never come to here as we don't request other formats
    }
  }
</script>

<Card classes="h-full min-h-0 flex-1 flex flex-col overflow-hidden p-0">
  <!-- Tab bar -->
  <div class="flex items-center gap-1 border-b border-zinc-200 px-3 py-2 bg-zinc-50">
    {#if supportsRendered}
      <button
          onclick={() => (viewMode = "rendered")}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
               {viewMode === 'rendered'
                 ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200'
                 : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/60'}"
      >
        <Eye class="w-3.5 h-3.5" />
        Rendered
      </button>
    {/if}
    <button
        onclick={() => (viewMode = "source")}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
             {viewMode === 'source'
               ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200'
               : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/60'}"
    >
      <Code class="w-3.5 h-3.5" />
      Source
    </button>

    {#if returnedFormats.length}
      <div class="ml-1">
        <ComboBox options={returnedFormatsOptions} bind:selectedOption={displayedFormat} />
      </div>
    {/if}

    <div class="ml-auto flex items-center gap-1.5">
      <span class="text-xs text-zinc-400" title={formatToolsAndChars() + formatExtractionMetrics()}>
        {formatToolsAndChars()}
      </span>

      <button onclick={copyToClipboard} aria-label="Copy displayed content to clipboard">
        <span class="ml-0.5 lg:ml-1.5 icon-[mdi--content-copy] text-zinc-500 size-4.5 cursor-pointer"></span>
      </button>
    </div>
  </div>

  <!-- Content -->
  <div class="h-full min-h-0 overflow-auto">
    {#if viewMode === "source"}
      <pre class="p-4 text-xs text-zinc-700 font-mono whitespace-pre-wrap wrap-break-word leading-relaxed">{content}
      </pre>
    {:else}
      {#if displayedFormat === RequestedFormat.RawHtml || displayedFormat === RequestedFormat.ContentHtml}
        <HtmlContent html={content} />
      {:else if displayedFormat === RequestedFormat.RawMarkdown || displayedFormat === RequestedFormat.ContentMarkdown}
        <div class="markdown-body p-4 py-2.5 text-sm text-zinc-700">
          {@html renderedMarkdown}
        </div>
      {:else if displayedFormat === RequestedFormat.RawText || displayedFormat === RequestedFormat.ContentText}
      <pre class="p-4 text-xs text-zinc-700 whitespace-pre-wrap wrap-break-word leading-relaxed">{content}
      </pre>
      {/if}
    {/if}
  </div>
</Card>