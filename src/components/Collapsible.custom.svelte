<svelte:options tag="collapsible-custom" />

<script lang="ts">
  export let content = false;
  let expanded = false;
</script>

<div class="flex flex-col">
  <div aria-expanded={expanded} class="flex items-center justify-between">
    <div class="text-xs">
      <slot name="title" />
    </div>
    {#if content}
      <div class="cursor-pointer" on:click={() => (expanded = !expanded)}>
        {#if expanded}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-[#27326F]"
          >
            <path
              d="M10 8.86365L6 4.50001L2 8.86365"
              stroke="auto"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {:else}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-[#27326F]"
          >
            <path
              d="M2 5.13635L6 9.49999L10 5.13635"
              stroke="auto"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </div>
    {/if}
  </div>
  {#if content}
    <div hidden={!expanded}>
      <div class="text-[11px] font-normal">
        <slot name="content" />
      </div>
    </div>
  {/if}
</div>

<style>
</style>
