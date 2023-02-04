<svelte:options tag="address-highlight" />

<script>
  import tooltip from "./tooltip";
  export let address;
</script>

<span>
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
  <span
    use:tooltip={{
      interactive: true,
      delay: [300, null],
      trigger: "click focusin",
      appendTo: () => document.body,
      // content: popperElement,
      content: `<address-info address="${address}" />`,
      allowHTML: true,
      placement: "bottom-start",
      arrow: false,
      animation: "shift-away",
      maxWidth: "none",
    }}
    class="mx-[0.4em] -mb-[6px] inline-block whitespace-nowrap transition-all text-sky-400 rounded-[3px] py-[2px] px-1 max-w-[8em] cursor-pointer overflow-hidden bg-sky-100 hover:max-w-[7rem] select-none"
  >
    📒 <span class="font-sans">More info</span>
  </span>
</span>

<style>
</style>
