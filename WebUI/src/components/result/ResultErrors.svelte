<script lang="ts">
  import ResultError from "./ResultError.svelte"
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"
  import type { MultiFormatExtractionResult } from "../../ts/model/MultiFormatExtractionResult"
  import type { WebContentExtractionResult } from "../../ts/model/WebContentExtractionResult"

  let { error, extractionResults = [], convertResult } =
    $props<{ error?: string, extractionResults: MultiFormatExtractionResult[], convertResult?: MarkdownConversionResult }>()

  let fetchResultErrors = $derived(extractionResults.map((result: MultiFormatExtractionResult) => result.fetchResult?.error).filter(error => !!error))
  let contentExtractionResults = $derived(extractionResults.map((result: MultiFormatExtractionResult) => result.extractionResult))
  // actually we would need to merge the failures of extractionResult.content_markdown and extractionResult.content_text
  let convertMarkdownResult = $derived(convertResult?.markdown_conversion_result ?? extractionResults?.content_markdown ?? extractionResults?.content_text)

  let extractContentErrors = $derived(contentExtractionResults.flatMap((result: WebContentExtractionResult) => result?.failures).filter(failure => !!failure && Object.keys(failure).length > 0))
  let markdownConversionErrors = $derived(Object.entries(convertMarkdownResult?.failures ?? {}))
</script>

{#if error}
  <ResultError>
    <span>{error}</span>
  </ResultError>
{/if}

{#each fetchResultErrors as error}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Fetching failed:</span>
      <span>{error}</span>
    </div>
  </ResultError>
{/each}

{#if extractContentErrors.length}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Extracting page content errors:</span>
      {#each extractContentErrors as [key, value]}
        <span>{key}: {value}</span>
      {/each}
    </div>
  </ResultError>
{/if}

{#if markdownConversionErrors.length}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Markdown conversion errors:</span>
      {#each markdownConversionErrors as [key, value]}
        <span>{key}: {value}</span>
      {/each}
    </div>
  </ResultError>
{/if}