<svelte:options tag="address-highlight" />

<script>
  import tooltip from "./tooltip";
  export let address;
</script>

<reset-style>
  <span class="inline-flex items-center no-underline">
    <span
      use:tooltip={{
        interactive: true,
        delay: [300, null],
        appendTo: () => document.body,
        // content: popperElement,
        content: `<address-spreadtext address="${address}" />`,
        allowHTML: true,
        offset: [0, 5],
        placement: "top",
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
      }}
      class="ml-[0.5em] inline-block whitespace-nowrap transition-all text-sky-400 rounded-[3px] py-[2px] px-1 max-w-[8em] cursor-pointer overflow-hidden bg-sky-100 hover:max-w-[7rem] select-none"
    >
      📒 <span class="font-sans">More info</span>
    </span>
  </span>
</reset-style>

<style>
</style>
