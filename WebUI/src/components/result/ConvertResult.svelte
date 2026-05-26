<script lang="ts">
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import ContentView from "./ContentView.svelte"

  let { convertResult }: { convertResult?: MarkdownConversionResult } = $props()
</script>

{#if convertResult && convertResult.content}
  <ContentView content={convertResult.content} converter={convertResult.converter} format={OutputFormat.Markdown} />
{/if}