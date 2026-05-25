<script lang="ts">
  import Card from "../common/form/Card.svelte"
  import ComboBox from "../common/form/ComboBox.svelte"
  import SwitchInput from "../common/form/SwitchInput.svelte"
  import { Option } from "../../ts/ui/Option"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import { WebFetcher } from "../../ts/model/WebFetcher"
  import { WebContentExtractor } from "../../ts/model/WebContentExtractor"
  import { MarkdownConverter } from "../../ts/model/MarkdownConverter"
  import { ExtractionRequest } from "../../ts/model/ExtractionRequest"
  import { WebFetcherOptions } from "../../ts/model/WebFetcherOptions"
  import { WebContentExtractorOptions } from "../../ts/model/WebContentExtractorOptions"
  import { MarkdownConverterOptions } from "../../ts/model/MarkdownConverterOptions"
  import type { ExtractionResult } from "../../ts/model/ExtractionResult"
  import { DI } from "../../ts/service/DI"
  import { ExtractionAction } from "../../ts/ui/ExtractionAction"
  import SplitButton from "../common/form/SplitButton.svelte"
  import SourceInput from "../common/form/SourceInput.svelte"
  import { SourceMode } from "../../ts/ui/SourceMode"
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"


  let { extractionResult = $bindable(), convertResult = $bindable(), error = $bindable() } =
    $props<{ extractionResult?: ExtractionResult, convertResult?: MarkdownConversionResult, error?: string }>()

  let action = $state(ExtractionAction.Extract)
  let sourceMode = $state(SourceMode.Url)
  let rawHtml = $state("")

  let url = $state("")
  let format = $state<OutputFormat>(OutputFormat.Markdown)
  let includeMetadata = $state<boolean | undefined>(false)
  let fetcher = $state<WebFetcher | undefined>(undefined)
  let extractor = $state<WebContentExtractor | undefined>(undefined)
  let converter = $state<MarkdownConverter | undefined>(undefined)
  let loading = $state(false)
  let actionRequiresExtraction = $derived(action === ExtractionAction.Extract || action === ExtractionAction.CompareExtractors)

  const service = DI.service


  async function executeAction() {
    if (action === ExtractionAction.Extract) {
      await extract()
    } else if (action === ExtractionAction.Convert) {
      await convert()
    }
  }

  async function extract() {
    if (!url.trim()) {
      return
    }

    loading = true
    error = undefined
    extractionResult = undefined

    const request = new ExtractionRequest(url.trim(), format, includeMetadata ?? false,
      new WebFetcherOptions(fetcher ? [ fetcher ] : undefined),
      new WebContentExtractorOptions(extractor ? [ extractor ] : undefined),
      new MarkdownConverterOptions(converter ? [ converter ] : undefined,),
    )

    try {
      extractionResult = await service.extract(request)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      loading = false
    }
  }

  async function convert() {
    const html = rawHtml.trim()
    if (!html) {
      return
    }

    loading = true
    error = undefined
    convertResult = undefined

    try {
      convertResult = await service.convertHtmlToMarkdown(html)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      loading = false
    }
  }

  const extractOptions = [
    new Option(ExtractionAction.Extract, "Extract"),
    new Option(ExtractionAction.Convert, "Convert"),
    new Option(ExtractionAction.CompareExtractors, "Compare Extractors"),
    new Option(ExtractionAction.CompareConverters, "Compare Converters"),
  ]

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

  $effect(() => {
    sourceMode = action === ExtractionAction.Convert || action === ExtractionAction.CompareConverters ? SourceMode.Html : SourceMode.Url
  })
</script>


<Card>
  <div class="flex flex-col gap-2.5 m-2">
    <div class="flex gap-2 items-center">
      <SourceInput bind:url bind:html={rawHtml} bind:mode={sourceMode} disabled={loading} onSubmit={executeAction}/>

      <SplitButton options={extractOptions} selectedOption={action} loading={loading}
                   disabled={loading || (sourceMode === SourceMode.Url ? !url.trim() : !rawHtml.trim())} onSelect={(value) => { action = value; executeAction() }} />
    </div>

    <!-- Options row -->
    <div class="flex flex-wrap items-center gap-3.5 px-1">
      {#if actionRequiresExtraction}
        <ComboBox label="Output" options={formatOptions} selectedOption={format} selectionChanged={value => format = value} />
      {/if}

      <SwitchInput label="Include metadata" bind:value={includeMetadata} disabled={loading} />

      {#if actionRequiresExtraction}
        <ComboBox label="Fetcher" options={fetcherOptions} selectedOption={fetcher} selectionChanged={value => fetcher = value} />

        <ComboBox label="Extractor" options={extractorOptions} selectedOption={extractor} selectionChanged={value => extractor = value} />
      {/if}

      {#if format !== OutputFormat.Html}
        <ComboBox label="Converter" options={converterOptions} selectedOption={converter} selectionChanged={value => converter = value} />
      {/if}
    </div>
  </div>
</Card>