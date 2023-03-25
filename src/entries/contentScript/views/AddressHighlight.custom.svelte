<svelte:options tag="address-highlight" />

<script>
  import tooltip from "./tooltip";
  import "./AddressInfo.custom.svelte";
  export let address;
  export let name;

  let isShow = false;
</script>

<span>
  {#if name !== "NEAR1"}
    <span
      use:tooltip={{
        interactive: true,
        delay: [100, null],
        appendTo: () => document.body,
        onTrigger: () => {
          // hide default tooltip for ethscan page
          const selectedTooltip = document.getElementsByClassName(
            "tooltip fade bs-tooltip-top show"
          );
          if (selectedTooltip.length > 0) {
            selectedTooltip[0].parentNode.removeChild(selectedTooltip[0]);
          }
        },
        // content: popperElement,
        content: `<address-spreadtext address="${address}" />`,
        allowHTML: true,
        offset: [0, 5],
        placement: "top",
        animation: "shift-away",
      }}
    >
      <slot />
    </span>
  {:else}
    <slot />
  {/if}
  <span
    use:tooltip={{
      interactive: true,
      delay: [300, null],
      trigger: "click focusin",
      appendTo: () => document.body,
      onTrigger: () => {
        isShow = true;
      },
      onUntrigger: () => {
        isShow = false;
      },
      // content: popperElement,
      content: `<address-info address="${address}" />`,
      allowHTML: true,
      placement: "bottom-start",
      arrow: false,
      animation: "shift-away",
      maxWidth: "none",
    }}
    class="rounded-[1000px] py-1 px-2 bg-[#1E96FC4D] select-none cursor-pointer"
  >
    <span class="text-[#27326F] text-sm font-medium">More info</span>
    {#if isShow}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 8.86365L6 4.50001L2 8.86365"
          stroke="#27326F"
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
      >
        <path
          d="M2 5.13635L6 9.49999L10 5.13635"
          stroke="#27326F"
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
