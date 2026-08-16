<script lang="ts">
  import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import ContentView from "./ContentView.svelte"
  import { MarkdownConverter } from "@shared/model/MarkdownConverter"
  import { RequestedFormat } from "../../ts/model/RequestedFormat"

  let { convertResults }: { convertResults?: Record<MarkdownConverter, MarkdownConversionResult> } = $props()

  let singleResults = $derived(Object.entries(convertResults ?? {}))
</script>

<div class="flex flex-row justify-evenly gap-2 min-h-0">
  {#each singleResults as [converter, result]}
    {#if convertResults && result.markdown}
      <ContentView content={result.markdown} converter={result.converter} format={OutputFormat.Markdown} displayedFormat={RequestedFormat.ContentMarkdown} />
    {/if}
  {/each}
</div>