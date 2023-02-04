<svelte:options tag="trx-highlight" />

<script>
  import tooltip from "./tooltip";
  import "./TrxInfo.custom.svelte";
  export let hash;
</script>

<span>
  <slot />
  <span
    use:tooltip={{
      interactive: true,
      delay: [300, null],
      trigger: "click focusin",
      appendTo: () => document.body,
      // content: popperElement,
      content: `<trx-info hash="${hash}" />`,
      allowHTML: true,
      placement: "bottom-start",
      arrow: false,
      animation: "shift-away",
      maxWidth: "none",
    }}
    class="mx-[0.5em] -mb-[6px] inline-block whitespace-nowrap transition-all text-sky-400 rounded-[5px] py-[2px] px-1 max-w-[8em] cursor-pointer overflow-hidden bg-sky-100 hover:max-w-[7rem] select-none"
  >
    ⚡️ <span class="font-sans">More info</span>
  </span>
</span>

<style>
</style>
