<script lang="ts">
  import type { WebFetcherResult } from "../../ts/model/WebFetcherResult"
  import ResultError from "./ResultError.svelte"
  import type { WebContentExtractionResult } from "../../ts/model/WebContentExtractionResult"
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"

  let { error, fetchResult, extractionResult, convertResult }:
    { error?: string, fetchResult?: WebFetcherResult, extractionResult?: WebContentExtractionResult, convertResult?: MarkdownConversionResult } = $props()
</script>

{#if error}
  <ResultError>
    <span>{error}</span>
  </ResultError>
{/if}

{#if fetchResult?.error}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Fetching failed:</span>
      <span>{fetchResult?.error}</span>
    </div>
  </ResultError>
{/if}

{#if extractionResult?.failures}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Extracting page content errors:</span>
      {#each Object.entries(extractionResult.failures ?? {}) as [key, value]}
        <span>{key}: {value}</span>
      {/each}
    </div>
  </ResultError>
{/if}

{#if convertResult?.failures}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Markdown conversion errors:</span>
      {#each Object.entries(convertResult.failures ?? {}) as [key, value]}
        <span>{key}: {value}</span>
      {/each}
    </div>
  </ResultError>
{/if}