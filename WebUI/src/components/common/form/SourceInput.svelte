<script lang="ts">
  import { Globe, Code2 } from "@lucide/svelte"
  import { SourceMode } from "../../../ts/ui/SourceMode"

  let { url = $bindable(""), html = $bindable(""), mode = $bindable(SourceMode.Url), disabled = false, onSubmit, }: {
    url?: string
    html?: string
    mode?: SourceMode
    disabled?: boolean
    onSubmit?: () => void
  } = $props()

  function toggleMode() {
    mode = mode === SourceMode.Url ? SourceMode.Html : SourceMode.Url
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && mode === SourceMode.Url) {
      onSubmit?.()
    }
  }
</script>

<div class="relative flex-1">
  <!-- Mode toggle icon -->
  <button
      type="button"
      onclick={toggleMode}
      title={mode === SourceMode.Url ? "Switch to HTML input" : "Switch to URL input"}
      class="absolute left-3 top-3 z-10 text-zinc-400 hover:text-primary transition-colors cursor-pointer"
      aria-label="Toggle input mode"
  >
    {#if mode === SourceMode.Url}
      <Globe class="w-4 h-4" />
    {:else}
      <Code2 class="w-4 h-4 text-primary" />
    {/if}
  </button>

  {#if mode === SourceMode.Url}
    <input type="url" bind:value={url} placeholder="https://example.com" onkeydown={onKeydown} {disabled}
        class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-zinc-300
             text-zinc-800 placeholder-zinc-400
             focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
             disabled:opacity-50 disabled:cursor-not-allowed transition"
    />
  {:else}
    <textarea bind:value={html} placeholder="<html>…</html>" rows={5} {disabled}
        class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-primary ring-1 ring-primary
             text-zinc-800 placeholder-zinc-400 text-sm font-mono resize-y
             focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition">

    </textarea>
  {/if}
</div>