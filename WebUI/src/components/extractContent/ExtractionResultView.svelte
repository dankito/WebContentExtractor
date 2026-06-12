<script lang="ts">
  import MetadataView from "../result/MetadataView.svelte"
  import ContentView from "../result/ContentView.svelte"
  import type { MultiFormatExtractionResult } from "../../ts/model/MultiFormatExtractionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import { RequestedFormat } from "../../ts/model/RequestedFormat"
  import { untrack } from "svelte"

  let { extractionResult, requestedFormat }: { extractionResult?: MultiFormatExtractionResult, requestedFormat: OutputFormat } = $props()

  let returnedFormats = $derived<RequestedFormat[]>(getReturnedFormats(extractionResult))
  let displayedFormat = $state<RequestedFormat | undefined>(undefined)
  let content = $state<string | undefined>(undefined)

  $effect(() => {
    const result = extractionResult

    untrack(() => { // do not track changes to displayedFormat,
      setInitialDisplayedContent(result)
    })
  })

  $effect(() => {
    setContentForDisplayedFormat(displayedFormat)
  })

  function setInitialDisplayedContent(extractionResult: MultiFormatExtractionResult | undefined) {
    const contentHtml = extractionResult?.extractionResult?.content
    const contentMarkdown = extractionResult?.contentMarkdown?.content

    if (requestedFormat == OutputFormat.Html) {
      displayedFormat = contentHtml ? RequestedFormat.ContentHtml : RequestedFormat.RawHtml
    } else if (requestedFormat == OutputFormat.Markdown) {
      displayedFormat = contentMarkdown ? RequestedFormat.ContentMarkdown : (contentHtml ? RequestedFormat.ContentHtml : RequestedFormat.RawHtml)
    } else if (requestedFormat == OutputFormat.Text) {
      displayedFormat = extractionResult?.contentText?.content ? RequestedFormat.ContentText : (contentMarkdown ? RequestedFormat.ContentMarkdown : (contentHtml ? RequestedFormat.ContentHtml : RequestedFormat.RawHtml))
    }
  }

  function setContentForDisplayedFormat(displayedFormat: RequestedFormat | undefined) {
    if (displayedFormat == RequestedFormat.RawHtml) {
      content = extractionResult?.fetchResult?.html
    } else if (displayedFormat == RequestedFormat.ContentHtml) {
      content = extractionResult?.extractionResult?.content
    } else if (displayedFormat == RequestedFormat.ContentMarkdown) {
      content = extractionResult?.contentMarkdown?.content
    } else if (displayedFormat == RequestedFormat.ContentText) {
      content = extractionResult?.contentText?.content
    }

    // TODO: this is currently required for extractFromHtml() as there we don't request a
    if (!!!content && extractionResult && (extractionResult as unknown as { content: string }).content) {
      content = extractionResult.content
    }
  }

  function getReturnedFormats(extractionResult?: MultiFormatExtractionResult): RequestedFormat[] {
    const returnedFormats: RequestedFormat[] = []

    if (extractionResult) {
      if (extractionResult.fetchResult?.html) returnedFormats.push(RequestedFormat.RawHtml)
      if (extractionResult.extractionResult?.content) returnedFormats.push(RequestedFormat.ContentHtml)
      if (extractionResult.contentMarkdown?.content) returnedFormats.push(RequestedFormat.ContentMarkdown)
      if (extractionResult.contentText?.content) returnedFormats.push(RequestedFormat.ContentText)
    }

    return returnedFormats
  }
</script>


{#if extractionResult}
  {#if extractionResult.metadata}
    <MetadataView metadata={extractionResult.metadata} />
  {/if}

  {#if content}
    <ContentView content={content} format={requestedFormat} fetcher={extractionResult.fetchResult?.fetcher}
                 extractionResult={extractionResult.extractionResult}
                 converter={extractionResult.contentMarkdown?.converter ?? extractionResult?.contentText?.converter}
                 {returnedFormats} bind:displayedFormat
    />
  {/if}
{/if}