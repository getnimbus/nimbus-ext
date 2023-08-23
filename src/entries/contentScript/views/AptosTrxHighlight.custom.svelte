<svelte:options tag="aptos-trx-highlight" />

<script lang="ts">
  import mixpanel from "mixpanel-browser";

  import tooltip from "./tooltip";
  import "./AptosTrxInfo.custom.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";

  export let id;

  let isShow = false;
</script>

<Mixpanel>
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
          mixpanel.track("user_interactive_version_info");
        },
        onUntrigger: () => {
          isShow = false;
        },
        // content: popperElement,
        content: `<aptos-trx-info id="${id}" />`,
        allowHTML: true,
        placement: "bottom-start",
        arrow: false,
        animation: "shift-away",
        maxWidth: "none",
      }}
      class="rounded-[1000px] py-1 px-2 bg-[#A5D5FE] select-none cursor-pointer whitespace-nowrap"
    >
      <span class="text_27326F text-sm font-medium">More info</span>
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
</Mixpanel>

<style>
</style>
