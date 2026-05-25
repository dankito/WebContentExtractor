<script lang="ts">
  import type { Option } from "../../../ts/ui/Option"

  let { label, options, selectedOption, selectionChanged }
    : { label: string, options: Option[], selectedOption?: any, selectionChanged: (option: any | undefined) => void } = $props()

  function selectedItemChanged(event: Event) {
    const selectedItem = (event.target as HTMLSelectElement).value
    selectionChanged(selectedItem)
  }
</script>


<div class="flex items-center">
  <label for={label} class="shrink-0 mr-1">{ label }</label>
  <select id={label} class="flex-1 min-w-0 h-full px-2 py-1.5 truncate rounded-lg border border-zinc-300 text-zinc-700
                            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition"
          onchange={e => selectedItemChanged(e)}>
    {#each options as option}
      <option value={option.value} selected={option.value === selectedOption}>{ option.label }</option>
    {/each}
  </select>
</div>