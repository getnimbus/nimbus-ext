<script>
  import CopyToClipboard from "svelte-copy-to-clipboard";

  import { wait } from "../entries/background/utils";
  import { shorterAddress } from "~/utils";

  export let iconSize;
  export let address;
  export let isAddressInfo;
  export let isOptionsPage = false;
  export let iconColor;

  let isCopied = false;
  let showTooltipCopyAddress = false;
</script>

<CopyToClipboard
  text={address}
  let:copy
  on:copy={async () => {
    isCopied = true;
    await wait(1000);
    isCopied = false;
  }}
>
  <div class="flex items-center gap-2">
    <div
      class={`${
        isOptionsPage
          ? "text-sm text-black"
          : isAddressInfo
          ? "text-sm text-[#00000099]"
          : "text-base text-white"
      } font-normal`}
    >
      {isAddressInfo ? shorterAddress(address) : address}
    </div>
    <div class="cursor-pointer" on:click={copy}>
      {#if isCopied}
        <svg
          width={iconSize}
          height={iconSize}
          id="Layer_1"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 122.88 74.46"
          fill={iconColor}
          ><defs
            ><style>
              .cls-1 {
                fill-rule: evenodd;
              }
            </style></defs
          ><title>double-tick</title><path
            class="cls-1"
            d="M1.87,47.2a6.33,6.33,0,1,1,8.92-9c8.88,8.85,17.53,17.66,26.53,26.45l-3.76,4.45-.35.37a6.33,6.33,0,0,1-8.95,0L1.87,47.2ZM30,43.55a6.33,6.33,0,1,1,8.82-9.07l25,24.38L111.64,2.29c5.37-6.35,15,1.84,9.66,8.18L69.07,72.22l-.3.33a6.33,6.33,0,0,1-8.95.12L30,43.55Zm28.76-4.21-.31.33-9.07-8.85L71.67,4.42c5.37-6.35,15,1.83,9.67,8.18L58.74,39.34Z"
          /></svg
        >
      {:else}
        <div
          class="relative"
          on:mouseenter={() => (showTooltipCopyAddress = true)}
          on:mouseleave={() => (showTooltipCopyAddress = false)}
        >
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 12 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.1875 3.3125H10.6875V10.1875H3.8125V7.6875"
              stroke={iconColor}
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8.1875 0.8125H1.3125V7.6875H8.1875V0.8125Z"
              stroke={iconColor}
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {#if showTooltipCopyAddress}
            <div
              class="absolute -top-7 left-1/2 transform -translate-x-1/2"
              style="z-index: 2147483648;"
            >
              <tooltip-detail text={"Copy address to clipboard"} />
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</CopyToClipboard>

<style>
</style>
