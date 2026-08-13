<script lang="ts">
  import MetadataView from "../result/MetadataView.svelte"
  import ContentView from "../result/ContentView.svelte"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import { RequestedFormat } from "../../ts/model/RequestedFormat"
  import { untrack } from "svelte"
  import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
  import type { Duration } from "@shared/service/utils/Duration"

  let { extractionResult, requestedFormat, requestDuration }:
    { extractionResult?: MultiFormatResponse, requestedFormat: OutputFormat, requestDuration?: Duration } = $props()

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

  function setInitialDisplayedContent(extractionResult: MultiFormatResponse | undefined) {
    const contentHtml = extractionResult?.contentHtml
    const contentMarkdown = extractionResult?.contentMarkdown?.markdown

    if (requestedFormat == OutputFormat.Html) {
      displayedFormat = contentHtml ? RequestedFormat.ContentHtml : RequestedFormat.RawHtml
    } else if (requestedFormat == OutputFormat.Markdown) {
      displayedFormat = contentMarkdown ? RequestedFormat.ContentMarkdown : (contentHtml ? RequestedFormat.ContentHtml : RequestedFormat.RawHtml)
    } else if (requestedFormat == OutputFormat.Text) {
      displayedFormat = extractionResult?.contentText?.text ? RequestedFormat.ContentText : (contentMarkdown ? RequestedFormat.ContentMarkdown : (contentHtml ? RequestedFormat.ContentHtml : RequestedFormat.RawHtml))
    }
  }

  function setContentForDisplayedFormat(displayedFormat: RequestedFormat | undefined) {
    if (displayedFormat == RequestedFormat.RawHtml) {
      content = extractionResult?.rawHtml
    } else if (displayedFormat == RequestedFormat.ContentHtml) {
      content = extractionResult?.contentHtml
    } else if (displayedFormat == RequestedFormat.ContentMarkdown) {
      content = extractionResult?.contentMarkdown?.markdown
    } else if (displayedFormat == RequestedFormat.ContentText) {
      content = extractionResult?.contentText?.text
    }

    // TODO: this is currently required for extractFromHtml() as there we don't request a
    if (!!!content && extractionResult && (extractionResult as unknown as { content: string }).content) {
      content = extractionResult.contentMarkdown?.markdown
    }
  }

  function getReturnedFormats(extractionResult?: MultiFormatResponse): RequestedFormat[] {
    const returnedFormats: RequestedFormat[] = []

    if (extractionResult) {
      if (extractionResult.rawHtml) returnedFormats.push(RequestedFormat.RawHtml)
      if (extractionResult.contentHtml) returnedFormats.push(RequestedFormat.ContentHtml)
      if (extractionResult.contentMarkdown?.markdown) returnedFormats.push(RequestedFormat.ContentMarkdown)
      if (extractionResult.contentText?.text) returnedFormats.push(RequestedFormat.ContentText)
    }

    return returnedFormats
  }
</script>


{#if extractionResult}
  {#if extractionResult.metadata}
    <MetadataView metadata={extractionResult.metadata} />
  {/if}

  {#if content}
    <ContentView content={content} format={requestedFormat} fetcher={extractionResult.webResponse?.fetcher}
                 converter={extractionResult.contentMarkdown?.converter ?? extractionResult?.contentText?.converter}
                 {returnedFormats} bind:displayedFormat {requestDuration}
    />
  {/if}
{/if}