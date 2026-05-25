<script lang="ts">
  import { marked } from "marked"
  import { Globe, Code, Eye, ChevronDown, Loader2, AlertCircle, Info } from "@lucide/svelte"
  import SwitchInput from "../common/form/SwitchInput.svelte"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import type { ExtractionResult } from "../../ts/model/ExtractionResult"
  import { DI } from "../../ts/service/DI"
  import { ExtractionRequest } from "../../ts/model/ExtractionRequest"
  import Card from "../common/form/Card.svelte"
  import { WebFetcherOptions } from "../../ts/model/WebFetcherOptions"
  import { MarkdownConverterOptions } from "../../ts/model/MarkdownConverterOptions"
  import { WebContentExtractorOptions } from "../../ts/model/WebContentExtractorOptions"
  import { WebContentExtractor } from "../../ts/model/WebContentExtractor"
  import { Option } from "../../ts/ui/Option"
  import ComboBox from "../common/form/ComboBox.svelte"
  import { WebFetcher } from "../../ts/model/WebFetcher"
  import { MarkdownConverter } from "../../ts/model/MarkdownConverter"

  let url = $state("")
  let format = $state<OutputFormat>(OutputFormat.Markdown)
  let includeMetadata = $state<boolean | undefined>(false)
  let fetcher = $state<WebFetcher | undefined>(undefined)
  let extractor = $state<WebContentExtractor>(WebContentExtractor.Trafilatura)
  let converter = $state<MarkdownConverter | undefined>(undefined)
  let loading = $state(false)
  let error = $state<string | undefined>(undefined)
  let result = $state<ExtractionResult | undefined>(undefined)
  let viewMode = $state<"source" | "rendered">("rendered")
  let metaOpen = $state(true)

  const formatOptions: { value: OutputFormat; label: string }[] = [
    { value: OutputFormat.Html, label: "HTML" },
    { value: OutputFormat.Markdown, label: "Markdown" },
    { value: OutputFormat.Text, label: "Text" },
  ]

  const fetcherOptions = [
    new Option(WebFetcher.CurlCffi, "curl-cffi"),
    new Option(WebFetcher.Camoufox, "Camoufox"),
    new Option(WebFetcher.Zendriver, "Zendriver"),
    new Option(WebFetcher.PythonHttpx, "Python httpx"),
  ]

  const extractorOptions = [
    new Option(WebContentExtractor.Trafilatura, "Trafilatura"),
    new Option(WebContentExtractor.ReadabilityLxml, "Readability Lxml"),
  ]

  const converterOptions = [
    new Option(MarkdownConverter.Markdownify, "Markdownify"),
    new Option(MarkdownConverter.Html2Text, "html2text"),
    new Option(MarkdownConverter.Kreuzberg, "Kreuzberg"),
  ]

  const service = DI.service


  async function extract() {
    if (!url.trim()) {
      return
    }

    loading = true
    error = undefined
    result = undefined
    viewMode = "rendered"

    const request = new ExtractionRequest(url.trim(), format, includeMetadata ?? false,
      new WebFetcherOptions(fetcher ? [ fetcher ] : undefined),
      new WebContentExtractorOptions(extractor ? [ extractor ] : undefined),
      new MarkdownConverterOptions(converter ? [ converter ] : undefined,),
    )

    try {
      result = await service.extract(request)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      loading = false
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      extract()
    }
  }

  const renderedMarkdown = $derived(
    result?.format === "markdown"
      ? (marked(result.content) as string)
      : undefined
  )

  const supportsRendered = $derived(
    result?.format === "html" || result?.format === "markdown"
  )
</script>


<div class="h-full min-h-0">
  <div class="flex flex-col gap-6 w-full h-full min-h-0 max-w-100 lg:max-w-[800px] mx-auto">

    <!-- URL + controls row -->
    <Card>
      <div class="flex flex-col gap-2.5 m-2">
        <div class="flex gap-2 items-center">
          <div class="relative flex-1">
            <Globe class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
            <input type="url" bind:value={url} placeholder="https://example.com"
                   onkeydown={onKeydown} disabled={loading}
                class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-zinc-300
                       text-zinc-800 placeholder-zinc-400 text-sm
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed transition"
            />
          </div>
          <button onclick={extract} disabled={loading || !url.trim()}
                  class="flex items-center justify-center px-4 py-2.5 text-sm bg-zinc-300 border-zinc-400 rounded-lg whitespace-nowrap hover:bg-zinc-400 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
          >
            {#if loading}
              <Loader2 class="w-4 h-4 animate-spin" />
              Extracting…
            {:else}
              Extract
            {/if}
          </button>
        </div>

        <!-- Options row -->
        <div class="flex flex-wrap items-center gap-3.5 px-1">
          <div class="flex items-center gap-2">
            <label for="format-select" class="text-xs text-zinc-400 whitespace-nowrap">Output</label>
            <select id="format-select" bind:value={format} disabled={loading}
                class="text-sm rounded-lg bg-white border border-zinc-300 text-zinc-700 px-2.5 py-1.5
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                     disabled:opacity-50 transition"
            >
              {#each formatOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>

          <SwitchInput label="Include metadata" bind:value={includeMetadata} disabled={loading} />

          <ComboBox label="Fetcher" options={fetcherOptions} selectedOption={fetcher} selectionChanged={value => fetcher = value} />

          <ComboBox label="Extractor" options={extractorOptions} selectedOption={extractor} selectionChanged={value => extractor = value} />

          <ComboBox label="Converter" options={converterOptions} selectedOption={converter} selectionChanged={value => converter = value} />
        </div>
      </div>
    </Card>

    <!-- Extraction response -->
    <!-- Error -->
    {#if error}
      <div class="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
        <AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    {/if}

    <!-- Result -->
    {#if result}
      <!-- Metadata -->
      {#if result.metadata}
        {@const meta = result.metadata}
        {@const entries = Object.entries(meta).filter(([, v]) => v != null)}
        {#if entries.length > 0 || result.extractor}
          <Card>
            <div class="p-2">
              <button
                  onclick={() => (metaOpen = !metaOpen)}
                  class="flex items-center gap-1.5 w-full text-left text-xs font-medium text-zinc-600 hover:text-zinc-800 transition"
              >
                <Info class="w-3.5 h-3.5 text-primary" />
                Metadata
                <ChevronDown class="w-3.5 h-3.5 ml-auto transition-transform {metaOpen ? 'rotate-180' : ''}" />
              </button>
              {#if metaOpen}
                <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
                  {#each entries as [key, val]}
                    <dt class="text-zinc-400 font-medium">{key}</dt>
                    <dd class="text-zinc-700 break-words">{val}</dd>
                  {/each}
                </dl>
              {/if}
            </div>
          </Card>
        {/if}
      {/if}

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
            Extractor: {result.extractor} · {result.content.length.toLocaleString()} chars
          </span>
        </div>

        <!-- Content -->
        <div class="h-full min-h-0 overflow-auto">
          {#if viewMode === "source"}
            <pre class="p-4 text-xs text-zinc-700 font-mono whitespace-pre-wrap wrap-break-word leading-relaxed">
              {result.content}
            </pre>
          {:else if result.format === "html"}
            <iframe srcdoc={result.content} sandbox="allow-same-origin" title="Rendered HTML"
                    class="w-full h-full min-h-96 border-0 bg-white" >

            </iframe>
          {:else if result.format === "markdown" && renderedMarkdown}
            <div class="markdown-body p-4 py-2.5 text-sm text-zinc-700">
              {@html renderedMarkdown}
            </div>
          {:else}
            <pre class="p-4 text-xs text-zinc-700 whitespace-pre-wrap wrap-break-word leading-relaxed">
              {result.content}
            </pre>
          {/if}
        </div>
      </Card>
    {/if}

  </div>
</div>