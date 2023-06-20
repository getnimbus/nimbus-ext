<svelte:options tag="trx-highlight" />

<script lang="ts">
  import { onMount } from "svelte";
  import tooltip from "./tooltip";
  import "./TrxInfo.custom.svelte";
  import mixpanel from "mixpanel-browser";

  export let hash;
  export let name;

  let isShow = false;

  onMount(() => {
    mixpanel.init("d56364b743cd70634fe5bea51e1d7e1c", {
      debug: true,
      ignore_dnt: true,
    });
  });
</script>

<span>
  <slot />
  <span
    use:tooltip={{
      interactive: true,
      delay: [300, null],
      trigger: "click focusin",
      appendTo: () => document.body,
      onTrigger: () => {
        isShow = true;
        mixpanel.track("user_interactive_trx_info");
      },
      onUntrigger: () => {
        isShow = false;
      },
      // content: popperElement,
      content: `<trx-info hash="${hash}" isTrxDetail=${true} />`,
      allowHTML: true,
      placement: "bottom-start",
      arrow: false,
      animation: "shift-away",
      maxWidth: "none",
    }}
    class="rounded-[1000px] py-1 px-2 bg-[#A5D5FE] select-none cursor-pointer whitespace-nowrap"
  >
    <span class="text-[#27326F] text-sm font-medium">More info</span>
    {#if isShow}
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
  </span>
</span>

<style>
</style>
