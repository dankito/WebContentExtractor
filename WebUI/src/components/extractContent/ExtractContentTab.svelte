<script lang="ts">
  import { marked } from "marked"
  import { AlertCircle, Code, Eye, Globe, Loader2 } from "@lucide/svelte"
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
  import MetadataView from "../result/MetadataView.svelte"
  import ContentView from "../result/ContentView.svelte"

  let url = $state("")
  let format = $state<OutputFormat>(OutputFormat.Markdown)
  let includeMetadata = $state<boolean | undefined>(false)
  let fetcher = $state<WebFetcher | undefined>(undefined)
  let extractor = $state<WebContentExtractor | undefined>(undefined)
  let converter = $state<MarkdownConverter | undefined>(undefined)
  let loading = $state(false)
  let error = $state<string | undefined>(undefined)
  let result = $state<ExtractionResult | undefined>(undefined)

  const formatOptions = [
    new Option(OutputFormat.Html, "HTML"),
    new Option(OutputFormat.Markdown, "Markdown"),
    new Option(OutputFormat.Text, "Text"),
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
</script>


<div class="h-full min-h-0">
  <div class="flex flex-col gap-4 w-full h-full min-h-0 max-w-100 lg:max-w-200 mx-auto">

    <!-- URL + controls row -->
    <Card>
      <div class="flex flex-col gap-2.5 m-2">
        <div class="flex gap-2 items-center">
          <div class="relative flex-1">
            <Globe class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
            <input type="url" bind:value={url} placeholder="https://example.com"
                   onkeydown={onKeydown} disabled={loading}
                class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-zinc-300
                       text-zinc-800 placeholder-zinc-400
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed transition"
            />
          </div>
          <button onclick={extract} disabled={loading || !url.trim()}
                  class="flex items-center justify-center px-4 py-2.5 bg-zinc-300 border-zinc-400 rounded-lg whitespace-nowrap hover:bg-zinc-400 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
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
          <ComboBox label="Output" options={formatOptions} selectedOption={format} selectionChanged={value => format = value} />

          <SwitchInput label="Include metadata" bind:value={includeMetadata} disabled={loading} />

          <ComboBox label="Fetcher" options={fetcherOptions} selectedOption={fetcher} selectionChanged={value => fetcher = value} />

          <ComboBox label="Extractor" options={extractorOptions} selectedOption={extractor} selectionChanged={value => extractor = value} />

          {#if format !== OutputFormat.Html}
            <ComboBox label="Converter" options={converterOptions} selectedOption={converter} selectionChanged={value => converter = value} />
          {/if}
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
      {#if result.metadata}
        <MetadataView metadata={result.metadata} />
      {/if}

      <ContentView content={result.content} format={result.format} extractor={result.extraction_result?.extractor} />
    {/if}

  </div>
</div>