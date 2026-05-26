<script lang="ts">
  import MetadataView from "../result/MetadataView.svelte"
  import ContentView from "../result/ContentView.svelte"
  import type { MultiFormatExtractionResult } from "../../ts/model/MultiFormatExtractionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import { RequestedFormat } from "../../ts/model/RequestedFormat"

  let { extractionResult, requestedFormat }: { extractionResult?: MultiFormatExtractionResult, requestedFormat: OutputFormat } = $props()

  let returnedFormats = $derived<RequestedFormat[]>(getReturnedFormats(extractionResult))
  let displayedFormat = $state<RequestedFormat | undefined>(undefined)
  let content = $state<string | undefined>(undefined)

  $effect(() => {
    const _ = extractionResult // execute on each change to extractionResult

    if (requestedFormat == OutputFormat.Html) {
      content = extractionResult?.content_html ?? extractionResult?.raw_html
      displayedFormat = RequestedFormat.ContentHtml
    } else if (requestedFormat == OutputFormat.Markdown) {
      content = extractionResult?.content_markdown ?? extractionResult?.content_html ?? extractionResult?.raw_html
      displayedFormat = RequestedFormat.ContentMarkdown
    } else if (requestedFormat == OutputFormat.Text) {
      content = extractionResult?.content_text ?? extractionResult?.content_markdown ?? extractionResult?.content_html ?? extractionResult?.raw_html
      displayedFormat = RequestedFormat.ContentText
    }
  })

  $effect(() => {
    if (displayedFormat == RequestedFormat.RawHtml) {
      content = extractionResult?.raw_html
    } else if (displayedFormat == RequestedFormat.ContentHtml) {
      content = extractionResult?.content_html
    } else if (displayedFormat == RequestedFormat.ContentMarkdown) {
      content = extractionResult?.content_markdown
    } else if (displayedFormat == RequestedFormat.ContentText) {
      content = extractionResult?.content_text
    }
  })

  function getReturnedFormats(extractionResult?: MultiFormatExtractionResult): RequestedFormat[] {
    const returnedFormats: RequestedFormat[] = []

    if (extractionResult) {
      if (extractionResult.raw_html) returnedFormats.push(RequestedFormat.RawHtml)
      if (extractionResult.content_html) returnedFormats.push(RequestedFormat.ContentHtml)
      if (extractionResult.content_markdown) returnedFormats.push(RequestedFormat.ContentMarkdown)
      if (extractionResult.content_text) returnedFormats.push(RequestedFormat.ContentText)
    }

    return returnedFormats
  }
</script>


{#if extractionResult}
  {#if extractionResult.metadata}
    <MetadataView metadata={extractionResult.metadata} />
  {/if}

  {#if content}
    <ContentView content={content} format={requestedFormat} fetcher={extractionResult.fetch_result?.fetcher}
                 extractor={extractionResult.extraction_result?.extractor}
                 {returnedFormats} bind:displayedFormat
     />
  {/if}
{/if}