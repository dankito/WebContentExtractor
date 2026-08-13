<script lang="ts">
  import Card from "../common/form/Card.svelte"
  import ComboBox from "../common/form/ComboBox.svelte"
  import SwitchInput from "../common/form/SwitchInput.svelte"
  import { Option } from "../../ts/ui/Option"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import { WebFetcher } from "../../ts/model/WebFetcher"
  import { WebContentExtractor } from "../../ts/model/WebContentExtractor"
  import { MarkdownConverter } from "../../ts/model/MarkdownConverter"
  import { DI } from "../../ts/service/DI"
  import { ExtractionAction } from "../../ts/ui/ExtractionAction"
  import SplitButton from "../common/form/SplitButton.svelte"
  import SourceInput from "../common/form/SourceInput.svelte"
  import { SourceMode } from "../../ts/ui/SourceMode"
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"
  import { ExtractFromHtmlRequest } from "../../ts/model/ExtractFromHtmlRequest"
  import type { MultiFormatExtractionResult } from "../../ts/model/MultiFormatExtractionResult"
  import MultiSelect from "../common/form/MultiSelect.svelte"
  import type { ExtractResponse } from "../../ts/model/ExtractResponse"
  import { MultiFormatRequest } from "@shared/model/requests/MultiFormatRequest"
  import { OutputSelection } from "@shared/model/requests/OutputSelection"
  import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"


  let { action = $bindable(), sourceMode = $bindable(), format = $bindable(), extractionResults = $bindable(), convertResults = $bindable({}), error = $bindable() } =
    $props<{ action: ExtractionAction, sourceMode: SourceMode, format: OutputFormat, extractionResults?: MultiFormatResponse[], convertResults?: Record<MarkdownConverter, MarkdownConversionResult>, error?: string }>()

  let url = $state("")
  let rawHtml = $state("")

  let includeMetadata = $state<boolean | undefined>(false)
  let fetcher = $state<WebFetcher | undefined>(undefined)
  let extractors = $state<WebContentExtractor[]>([])
  let converters = $state<MarkdownConverter[]>([])

  let loading = $state(false)
  let actionRequiresFetcher = $derived(sourceMode !== SourceMode.Html)
  let actionRequiresExtraction = $derived(action === ExtractionAction.Extract || action === ExtractionAction.CompareExtractors)
  let isSelectingSourceModePossible = $derived(action !== ExtractionAction.Convert && action !== ExtractionAction.CompareConverters)

  const service = DI.service


  $effect(() => {
    if (!!!isSelectingSourceModePossible) {
      sourceMode = SourceMode.Html // URL is not sensible for conversion
    }
  })

  async function executeAction() {
    if (action === ExtractionAction.Extract) {
      if (sourceMode === SourceMode.Html) {
        await extractFromHtml()
      } else {
        await extractFromUrl()
      }
    } else if (action === ExtractionAction.Convert) {
      await convert()
    }
  }

  async function extractFromUrl() {
    const urlStr = url.trim()
    if (!urlStr) {
      return
    }

    loading = true
    error = undefined
    extractionResults = []

    const include = new OutputSelection(true, false, false, true, format === OutputFormat.Markdown || format == OutputFormat.Markdown,
      format === OutputFormat.Text, includeMetadata ?? false)

    // TODO: add WebRequestOptions, MarkdownConversionOptions and TextConversionOptions
    const request = new MultiFormatRequest(urlStr, include)

    try {
      // TODO: support multiple content converters
      // if (extractors.length == 0) {
        const result = await service.extractMultipleResponseFormat(request)
        extractionResults = [ result ]
      // } else {
      //   extractors.forEach(async (extractor, index) => {
      //     extractionResults[index] = await service.extractMultipleResponseFormat({ ...request, extractorOptions: new WebContentExtractorOptions([ extractor ]) })
      //   })
      // }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      loading = false
    }
  }

  async function extractFromHtml() {
    if (!rawHtml.trim()) {
      return
    }

    loading = true
    error = undefined
    extractionResults = []

    // const request = new ExtractFromHtmlRequest(rawHtml.trim(), format, includeMetadata ?? false,
    //   new WebContentExtractorOptions(extractors),
    //   new MarkdownConverterOptions(converters),
    // )

    try {
      // if (extractors.length === 0) {
      //   const result = await service.extractMultipleResponseFormatFromHtml(request)
      //   extractionResults = [ result ]
      // } else {
      //   extractors.forEach(async (extractor, index) => {
      //     extractionResults[index] = await service.extractMultipleResponseFormatFromHtml({ ...request, extractorOptions: new WebContentExtractorOptions([ extractor ]) })
      //   })
      // }

      const result = await service.extractFromHtml(new ExtractFromHtmlRequest(rawHtml.trim(), format, includeMetadata ?? false))

      extractionResults = [ mapToMultiFormatExtractionResult(result, format) ]
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      loading = false
    }
  }

  function mapToMultiFormatExtractionResult(result: ExtractResponse, format: OutputFormat): MultiFormatExtractionResult {

    return {
      url: result.url ?? "",
      // @ts-ignore
      fetchResult: undefined, // should work

      extractionResult: {
        content: result.pageContentHtml
      },
      metadata: result.metadata,

      contentMarkdown: format !== OutputFormat.Markdown ? undefined : { content: result.pageContentHtml },
      contentText: format !== OutputFormat.Text ? undefined : { content: result.pageContentHtml },
    }
  }


  async function convert() {
    const html = rawHtml.trim()
    if (!html) {
      return
    }

    loading = true
    error = undefined
    convertResults = {}

    try {
      // if (converters.length === 0) {
      //   const result = await service.convertHtmlToMarkdown(html)
      //   convertResults[result.converter!] = result
      // } else {
      //   converters.forEach(async (converter) => {
      //     convertResults[converter] = await service.convertHtmlToMarkdown(html, new MarkdownConverterOptions(converter ? [ converter ] : undefined))
      //   })
      // }

      const result = await service.extractFromHtml(new ExtractFromHtmlRequest(html, OutputFormat.Markdown))
      convertResults[MarkdownConverter.Kreuzberg] = { converter: MarkdownConverter.Kreuzberg, content: result.pageContentHtml }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      loading = false
    }
  }

  const extractOptions = [
    new Option(ExtractionAction.Extract, "Extract"),
    new Option(ExtractionAction.Convert, "Convert"),
    // new Option(ExtractionAction.CompareExtractors, "Compare Extractors"),
    // new Option(ExtractionAction.CompareConverters, "Compare Converters"),
  ]

  const formatOptions = [
    new Option(OutputFormat.Html, "HTML"),
    new Option(OutputFormat.Markdown, "Markdown"),
    new Option(OutputFormat.Text, "Text"),
  ]

  const fetcherOptions = [
    new Option(WebFetcher.JsFetchApi, "JS fetch-API"),
    // new Option(WebFetcher.CurlCffi, "curl-cffi"),
    // new Option(WebFetcher.Camoufox, "Camoufox"),
    // new Option(WebFetcher.Zendriver, "Zendriver"),
  ]

  const extractorOptions = [
    // new Option(WebContentExtractor.Trafilatura, "Trafilatura"),
    // new Option(WebContentExtractor.ReadabilityLxml, "Readability Lxml"),
    // new Option(WebContentExtractor.Newspaper4k, "Newspaper4k"),
    new Option(WebContentExtractor.ReadabilityJs, "ReadabilityJs"),
  ]

  const converterOptions = [
    new Option(MarkdownConverter.Kreuzberg, "Kreuzberg"),
    new Option(MarkdownConverter.Turndown, "Turndown"),
  ]

  $effect(() => {
    sourceMode = action === ExtractionAction.Convert || action === ExtractionAction.CompareConverters ? SourceMode.Html : SourceMode.Url
  })
</script>


<Card>
  <div class="flex flex-col gap-2.5 m-2">
    <div class="flex gap-2 items-center">
      <SourceInput bind:url bind:html={rawHtml} bind:mode={sourceMode} disabled={loading} onSubmit={executeAction} {isSelectingSourceModePossible}/>

      <SplitButton options={extractOptions} selectedOption={action} loading={loading}
                   disabled={loading || (sourceMode === SourceMode.Url ? !url.trim() : !rawHtml.trim())} onSelect={(value) => { action = value; executeAction() }} />
    </div>

    <!-- Options row -->
    <div class="flex flex-wrap items-center gap-3.5 px-1">
      {#if actionRequiresExtraction}
        <ComboBox label="Output" options={formatOptions} selectedOption={format} selectionChanged={value => format = value} />
      {/if}

      <SwitchInput label="Include metadata" bind:value={includeMetadata} disabled={loading} />

      {#if actionRequiresFetcher}
        <ComboBox label="Fetcher" options={fetcherOptions} selectedOption={fetcher} selectionChanged={value => fetcher = value} />
      {/if}

      {#if actionRequiresExtraction}
        <MultiSelect label="Extractor" options={extractorOptions} selectedOptions={extractors} selectionChanged={value => extractors = value} />
      {/if}

      {#if action === ExtractionAction.Convert || format !== OutputFormat.Html}
        <MultiSelect label="Converters" options={converterOptions} selectedOptions={converters} selectionChanged={value => converters = value} />
      {/if}
    </div>
  </div>
</Card>