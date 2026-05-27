<script lang="ts" generics="T">
  import type { Option } from "../../../ts/ui/Option"

  let {
    label,
    options,
    selectedOptions = $bindable<T[]>([]),
    placeholder = "Default",
    selectionChanged,
  }: {
    label?: string
    options: Option<T>[]
    selectedOptions?: T[]
    placeholder?: string
    selectionChanged?: (selected: T[]) => void
  } = $props()

  let open = $state(false)

  // ── derived display label ──────────────────────────────────────────────────
  let triggerLabel = $derived(() => {
    if (selectedOptions.length === 0) {
      return placeholder
    }
    if (selectedOptions.length === 1) {
      return options.find(o => o.value === selectedOptions[0])?.label ?? placeholder
    }
    return `${selectedOptions.length} selected`
  })

  // ── toggle one item ────────────────────────────────────────────────────────
  function toggle(value: T) {
    const next = selectedOptions.includes(value)
      ? selectedOptions.filter(v => v !== value)
      : [...selectedOptions, value]
    selectedOptions = next
    selectionChanged?.(next)
  }

  function isSelected(value: T) {
    return selectedOptions.includes(value)
  }

  // ── open / close ───────────────────────────────────────────────────────────
  function toggleOpen() {
    open = !open
  }

  // click-outside via Svelte action
  function clickOutside(node: HTMLElement) {
    function handle(event: MouseEvent) {
      if (!node.contains(event.target as Node)) {
        open = false
      }
    }
    document.addEventListener("mousedown", handle, true)
    return {
      destroy() {
        document.removeEventListener("mousedown", handle, true)
      },
    }
  }

  // close on Escape
  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      open = false
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex items-center gap-1.5" use:clickOutside>
  {#if label}
    <label for={label} class="shrink-0 whitespace-nowrap">{label}</label>
  {/if}

  <div class="relative flex-1 min-w-0 h-full">
    <!-- Trigger button -->
    <button
        id={label}
        type="button"
        onclick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        class="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg
             border border-zinc-300 text-zinc-700 bg-white
             focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
             transition truncate"
    >
      <span class="truncate text-left {selectedOptions.length === 0 ? 'text-zinc-400' : ''}">
        {triggerLabel()}
      </span>
      <!-- Chevron -->
      <svg
          class="shrink-0 w-4 h-4 text-zinc-400 transition-transform duration-200 {open ? 'rotate-180' : ''}"
          viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
      >
        <path fill-rule="evenodd" clip-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        />
      </svg>
    </button>

    <!-- Dropdown panel -->
    {#if open}
      <div
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
          class="absolute z-50 mt-1 w-full min-w-max rounded-lg border border-zinc-200
               bg-white shadow-lg overflow-y-auto max-h-60"
      >
        {#each options as option (String(option.value))}
          <label
              aria-selected={isSelected(option.value)}
              class="flex items-center gap-2.5 px-3 py-2 cursor-pointer select-none
                   hover:bg-zinc-50 transition-colors
                   {option.disabled ? 'opacity-40 pointer-events-none' : ''}"
          >
            <input
                type="checkbox"
                checked={isSelected(option.value)}
                disabled={option.disabled}
                onchange={() => toggle(option.value)}
                class="size-4 rounded border-zinc-300 accent-zinc-500 cursor-pointer"
            />
            <span class="truncate">{option.label}</span>
          </label>
        {/each}

        {#if options.length === 0}
          <p class="px-3 py-2 text-sm text-zinc-400">No options available.</p>
        {/if}
      </div>
    {/if}
  </div>
</div>