<svelte:options tag="address-highlight" />

<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { isEmpty } from "lodash";
  import { isSaveAddressLabel } from "~/store";
  import mixpanel from "mixpanel-browser";
  import tooltip from "../../../lib/tooltip";

  import Mixpanel from "~/components/Mixpanel.svelte";
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
    const addressLabelRes = await browser.storage.sync.get(
      address?.toString().toLowerCase()
    );
    if (!isEmpty(addressLabelRes)) {
      addressLabel = addressLabelRes[address?.toString().toLowerCase()];
    } else {
      addressLabel = address;
    }
    isSaveAddressLabel.update((n) => (n = false));
  };

  onMount(() => {
    getAddressLabel();
  });

  $: (isUnfocus && getAddressLabel()) || (address && getAddressLabel());
</script>

<Mixpanel>
  <span>
    {#if name !== "NEAR1"}
      <span
        use:tooltip={{
          interactive: true,
          delay: [100, null],
          appendTo: () => document.body,
          onTrigger: () => {
            // hide default tooltip for etherscan page
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
        {#if addressLabel}
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
        onTrigger: (_, e) => {
          e.preventDefault();
          e.stopPropagation();
          isShow = true;
          mixpanel.track("user_interactive_address_info");
        },
        onUntrigger: (_, e) => {
          e.preventDefault();
          e.stopPropagation();
          isShow = false;
        },
        // content: popperElement,
        content: `<address-info address="${address}" isAddressDetail=${true} />`,
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
</Mixpanel>

<style>
</style>
