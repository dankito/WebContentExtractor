<script lang="ts">
  import { marked } from "marked"
  import { Code, Eye } from "@lucide/svelte"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import type { WebContentExtractor } from "../../ts/model/WebContentExtractor"
  import Card from "../common/form/Card.svelte"
  import type { MarkdownConverter } from "../../ts/model/MarkdownConverter"

  let { content, format, extractor = undefined, converter = undefined }:
    { content: string, format: OutputFormat, extractor?: WebContentExtractor, converter?: MarkdownConverter } = $props()

  let viewMode = $state<"source" | "rendered">("rendered")

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

  function formatTools(): string {
    const tools = [
      extractor ? extractor : "",
      converter ? converter : "",
    ]

    return tools.filter(it => it !== "").join(" · ")
  }
</script>

<Card classes="h-full min-h-0 flex flex-col overflow-hidden p-0">
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
    <span class="ml-auto text-xs text-zinc-400">
      {formatTools()} · {content.length.toLocaleString()} chars
    </span>
  </div>

  <!-- Content -->
  <div class="h-full min-h-0 overflow-auto">
    {#if viewMode === "source"}
            <pre class="p-4 text-xs text-zinc-700 font-mono whitespace-pre-wrap wrap-break-word leading-relaxed">
              {content}
            </pre>
    {:else if format === OutputFormat.Html}
      <iframe srcdoc={content} sandbox="allow-same-origin" title="Rendered HTML"
              class="w-full h-full min-h-96 border-0 bg-white" >

      </iframe>
    {:else if format === OutputFormat.Markdown && renderedMarkdown}
      <div class="markdown-body p-4 py-2.5 text-sm text-zinc-700">
        {@html renderedMarkdown}
      </div>
    {:else}
            <pre class="p-4 text-xs text-zinc-700 whitespace-pre-wrap wrap-break-word leading-relaxed">
              {content}
            </pre>
    {/if}
  </div>
</Card>