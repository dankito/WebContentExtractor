<script lang="ts">
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import ContentView from "./ContentView.svelte"
  import { MarkdownConverter } from "../../ts/model/MarkdownConverter"

  let { convertResults }: { convertResults?: Record<MarkdownConverter, MarkdownConversionResult> } = $props()

  let singleResults = $derived(Object.entries(convertResults ?? {}))
</script>

<div class="flex flex-row justify-evenly gap-2 min-h-0">
  {#each singleResults as [converter, result]}
    {#if convertResults && result.content}
      <ContentView content={result.content} converter={result.converter} format={OutputFormat.Markdown} />
    {/if}
  {/each}
</div>