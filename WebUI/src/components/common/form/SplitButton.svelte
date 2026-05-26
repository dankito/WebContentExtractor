<script lang="ts" generics="T">
  import { ChevronDown } from "@lucide/svelte"
  import type { Option } from "../../../ts/ui/Option"

  let { options, selectedOption, onSelect, loading = false, disabled = false, }: {
    options: Option<T>[]
    selectedOption: T
    onSelect: (value: T) => void
    loading?: boolean
    disabled?: boolean
  } = $props()

  let open = $state(false)

  const current = $derived(options.find(o => o.value === selectedOption) ?? options[0])

  function selectOption(value: T) {
    onSelect(value)
    open = false
  }

  function onClickOutside(e: MouseEvent) {
    const el = (e.target as HTMLElement).closest("[data-split-button]")
    if (!el) {
      open = false
    }
  }
</script>

<svelte:window onclick={onClickOutside} />

<div class="relative flex" data-split-button>
  <!-- Primary action button -->
  <button onclick={() => onSelect(selectedOption)} {disabled}
      class="flex items-center justify-center gap-2 pl-4 pr-3 py-2.5
           bg-zinc-300 border border-zinc-400 rounded-l-lg
           font-medium whitespace-nowrap
           hover:bg-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed
           cursor-pointer transition-colors"
  >
    {#if loading}
      <span class="icon-[mdi--loading] animate-spin w-4 h-4"></span>
    {/if}
    {current.label}
  </button>

  <!-- Divider -->
  <div class="w-px bg-zinc-300"></div>

  <!-- Chevron toggle -->
  <button
      onclick={(e) => { e.stopPropagation(); open = !open }}
      class="flex items-center justify-center px-2 py-2.5
           bg-zinc-300 border border-l-0 border-zinc-400 rounded-r-lg
           hover:bg-zinc-400 hover:text-zinc-700
           disabled:opacity-40 disabled:cursor-not-allowed
           cursor-pointer transition-colors"
      aria-label="More actions"
  >
    <ChevronDown class="w-4 h-4 transition-transform {open ? 'rotate-180' : ''}" />
  </button>

  <!-- Dropdown -->
  {#if open}
    <div class="absolute right-0 top-full mt-1 z-50 w-[250px]
                bg-white border border-zinc-200 rounded-xl shadow-lg
                py-1 overflow-hidden">
      {#each options as option}
        <button
            onclick={() => selectOption(option.value)}
            class="w-full text-left px-4 py-2 text-sm transition-colors
                 {option.value === selectedOption
                   ? 'text-primary bg-zinc-50 font-medium'
                   : 'text-zinc-700 hover:bg-zinc-200'}"
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/if}
</div>