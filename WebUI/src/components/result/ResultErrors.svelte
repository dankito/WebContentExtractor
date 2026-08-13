<script lang="ts">
  import ResultError from "./ResultError.svelte"
  import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult"
  import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
  import type { WebResponse } from "@shared/model/WebResponse"
  import type { TextConversionResult } from "@shared/model/TextConversionResult"

  let { error, extractionResults = [], convertResult }:
    { error?: string, extractionResults: MultiFormatResponse[], convertResult?: MarkdownConversionResult | TextConversionResult } = $props()

  //@ts-ignore
  let fetchResultErrors: WebResponse[] = $derived(extractionResults.map(result => result.webResponse).filter(response => !!(response?.error)))
  //@ts-ignore
  let extractContentErrors: string[] = $derived(extractionResults.map(result => result.contentExtractionError).filter(error => !!error))

  // actually we would need to merge the failures of extractionResult.content_markdown and extractionResult.content_text
  let convertResults: (MarkdownConversionResult | TextConversionResult)[] =
    $derived([ convertResult, ...extractionResults.flatMap(result => [ result.contentMarkdown, result.contentText ]) ].filter(result => !!result))

  let conversionErrors = $derived(convertResults.filter(result => !!result.error))
</script>

{#if error}
  <ResultError>
    <span>{error}</span>
  </ResultError>
{/if}

{#each fetchResultErrors as response}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Fetching failed:</span>
      <span>{response.fetcher}: {response.error}</span>
    </div>
  </ResultError>
{/each}

{#if extractContentErrors.length}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Extracting page content errors:</span>
      {#each extractContentErrors as error}
        <span>{error}</span>
      {/each}
    </div>
  </ResultError>
{/if}

{#if conversionErrors.length}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Markdown conversion errors:</span>
      {#each conversionErrors as result}
        <span>{result.converter}: {result.error}</span>
      {/each}
    </div>
  </ResultError>
{/if}