<svelte:options tag="address-highlight" />

<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { isEmpty } from "lodash";
  import { isSaveAddressLabel } from "../../../store";

  import tooltip from "./tooltip";
  import "./AddressInfo.custom.svelte";

  export let address;
  export let name;

  let isShow = false;
  let addressLabel = "";
  let isUnfocus = false;

  isSaveAddressLabel.subscribe((value) => {
    isUnfocus = value;
  });

  const getAddressLabel = async () => {
    const addressLabelRes = await browser.storage.sync.get(address);
    if (!isEmpty(addressLabelRes)) {
      addressLabel = addressLabelRes[address];
    } else {
      addressLabel = address;
    }
    isSaveAddressLabel.update((n) => (n = false));
  };

  onMount(() => {
    getAddressLabel();
  });

  $: isUnfocus && getAddressLabel();

  $: isDarkMode =
    document.querySelector("html").getAttribute("data-theme") === "dark"
      ? true
      : false;
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
      {#if addressLabel && addressLabel !== address}
        {addressLabel}
      {:else}
        <slot />
      {/if}
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
    class="rounded-[1000px] py-1 px-2 bg-[#1E96FC4D] select-none cursor-pointer whitespace-nowrap"
  >
    <span
      class="text-[#27326F] text-sm font-medium"
      class:text-white={isDarkMode}>More info</span
    >
    {#if isShow}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-[#27326F]"
        class:stroke-white={isDarkMode}
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
        class:stroke-white={isDarkMode}
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
