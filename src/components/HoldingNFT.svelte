<script lang="ts">
  import { useNavigate } from "svelte-navigator";
  import { shorterName } from "~/utils";
  import { typeWallet, isDarkMode } from "~/store";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
  export let selectedWallet;

  const navigate = useNavigate();

  let typeWalletAddress = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let showTooltipListNFT = false;
  let isShowTooltipName = false;

  $: totalCost = data?.tokens?.reduce(
    (prev, item) => prev + Number(item.cost),
    0
  );

  $: totalNativeTokenPrice = data?.tokens?.reduce(
    (prev, item) => prev + Number(item.price),
    0
  );

  $: profitAndLoss =
    totalCost === 0 ? 0 : data?.current_value - (totalCost || 0);

  $: profitAndLossPercent =
    Math.abs(totalCost || 0) === 0 ? 0 : profitAndLoss / Math.abs(totalCost);
</script>

<tr
  class="group transition-all cursor-pointer"
  on:click={() => {
    navigate(
      `nft-detail?id=${encodeURIComponent(
        data.collectionId
      )}&address=${encodeURIComponent(selectedWallet)}`
    );
  }}
>
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 w-[220px] ${
      darkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="relative">
      <div
        class="xl:text-sm text-2xl font-medium flex justify-start relative"
        on:mouseover={() => {
          isShowTooltipName = true;
        }}
        on:mouseleave={() => (isShowTooltipName = false)}
      >
        {data?.collection?.name
          ? data?.collection?.name.length > 24
            ? shorterName(data?.collection?.name, 20)
            : data?.collection?.name
          : "N/A"}
        {#if isShowTooltipName && data?.collection?.name?.length > 24}
          <div class="absolute -top-8 left-0" style="z-index: 2147483648;">
            <tooltip-detail text={data?.collection?.name} />
          </div>
        {/if}
      </div>
    </div>
  </td>

  <td
    class={`py-3 xl:static xl:bg-transparent sticky left-[220px] z-10 w-[200px] ${
      darkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="relative">
      <div
        class="flex justify-start w-max"
        on:mouseenter={() => (showTooltipListNFT = true)}
        on:mouseleave={() => (showTooltipListNFT = false)}
      >
        {#if data?.tokens?.length > 5}
          {#each data?.tokens.slice(0, 4) as token, index}
            <img
              src={token?.imageUrl ||
                "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
              alt=""
              class={`xl:w-9 xl:h-9 w-12 h-12 rounded-md border border-gray-300 overflow-hidden ${
                index > 0 && "-ml-2"
              }`}
            />
          {/each}
          <div class="relative xl:w-9 xl:h-9 w-12 h-12">
            <img
              src={data?.tokens[4].imageUrl ||
                "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
              alt=""
              class="xl:w-9 xl:h-9 w-12 h-12 rounded-md border border-gray-300 overflow-hidden -ml-2"
            />
            <div
              class="absolute top-0 -left-2 w-full h-full bg-[#00000066] text-white text-center flex justify-center items-center pb-2 rounded-md"
            >
              ...
            </div>
          </div>
          {#if showTooltipListNFT && data?.tokens?.length > 5}
            <div class="absolute -top-7 left-0" style="z-index: 2147483648;">
              <tooltip-detail
                text={`${data?.tokens?.length} NFTs on collection ${data?.collection?.name}`}
              />
            </div>
          {/if}
        {:else}
          {#each data?.tokens as token, index}
            <img
              src={token?.imageUrl ||
                "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
              alt=""
              class={`xl:w-9 xl:h-9 w-12 h-12 rounded-md border border-gray-300 overflow-hidden ${
                index > 0 && "-ml-2"
              }`}
            />
          {/each}
        {/if}
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text_00000099 font-medium flex flex-col items-end gap-1"
    >
      <div class="w-max flex items-center gap-1">
        <TooltipNumber number={Number(data?.floorPrice)} type="balance" />
        <div>{data?.nativeToken?.symbol || ""}</div>
      </div>
      <div class="w-max">
        <TooltipNumber
          number={Number(data?.floorPrice) * data?.marketPrice}
          type="value"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text_00000099 font-medium flex flex-col items-end gap-1"
    >
      <div class="w-max flex items-center gap-1">
        <TooltipNumber number={totalNativeTokenPrice} type="balance" />
        <div>
          {data?.nativeToken?.symbol || ""}
        </div>
      </div>
      <div class="w-max">
        <TooltipNumber number={totalCost} type="value" />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text_00000099 font-medium flex flex-col items-end gap-1"
    >
      <div class="w-max flex items-center gap-1">
        <TooltipNumber
          number={Number(data?.current_value) / data?.marketPrice}
          type="balance"
        />
        <div>
          {data?.nativeToken?.symbol || ""}
        </div>
      </div>
      <TooltipNumber number={data?.current_value} type="value" />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="flex items-center justify-end gap-1 xl:text-sm text-2xl font-medium"
    >
      <div class="flex flex-col">
        <div
          class={`flex justify-end gap-1 ${
            profitAndLoss !== 0
              ? profitAndLoss >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : "text_00000099"
          }`}
        >
          <TooltipNumber
            number={Math.abs(profitAndLoss) / data?.marketPrice}
            type="balance"
          />
          <div>
            {data?.nativeToken?.symbol || ""}
          </div>
        </div>

        <div
          class={`flex justify-end ${
            profitAndLoss !== 0
              ? profitAndLoss >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : "text_00000099"
          }`}
        >
          <TooltipNumber number={Math.abs(profitAndLoss)} type="value" />
        </div>

        <div class="flex items-center justify-end gap-1">
          <div
            class={`flex items-center ${
              profitAndLossPercent !== 0
                ? profitAndLossPercent >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber
              number={Math.abs(profitAndLossPercent) * 100}
              type={Math.abs(Number(profitAndLossPercent)) > 100
                ? "balance"
                : "percent"}
            />
            <span>%</span>
          </div>
          {#if profitAndLossPercent !== 0}
            <img
              src={profitAndLossPercent >= 0 ? TrendUp : TrendDown}
              alt="trend"
              class="mb-1"
            />
          {/if}
        </div>
      </div>
    </div>
  </td>

  <td
    class={`py-3 w-10 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-center">
      <div
        use:tooltip={{
          content: `<tooltip-detail text="Show detail" />`,
          allowHTML: true,
          placement: "top",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          version="1.1"
          width="14"
          height="14"
          viewBox="0 0 256 256"
          xml:space="preserve"
        >
          <defs />
          <g
            style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;"
            transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
          >
            <path
              d="M 87.994 0 H 69.342 c -1.787 0 -2.682 2.16 -1.418 3.424 l 5.795 5.795 l -33.82 33.82 L 28.056 31.196 l -3.174 -3.174 c -1.074 -1.074 -2.815 -1.074 -3.889 0 L 0.805 48.209 c -1.074 1.074 -1.074 2.815 0 3.889 l 3.174 3.174 c 1.074 1.074 2.815 1.074 3.889 0 l 15.069 -15.069 l 14.994 14.994 c 1.074 1.074 2.815 1.074 3.889 0 l 1.614 -1.614 c 0.083 -0.066 0.17 -0.125 0.247 -0.202 l 37.1 -37.1 l 5.795 5.795 C 87.84 23.34 90 22.445 90 20.658 V 2.006 C 90 0.898 89.102 0 87.994 0 z"
              style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
              transform=" matrix(1 0 0 1 0 0) "
              stroke-linecap="round"
              fill={darkMode ? "white" : "black"}
            />
            <path
              d="M 65.626 37.8 v 49.45 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 23.518 L 65.626 37.8 z"
              style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
              transform=" matrix(1 0 0 1 0 0) "
              stroke-linecap="round"
              fill={darkMode ? "white" : "black"}
            />
            <path
              d="M 47.115 56.312 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 42.03 L 47.115 56.312 z"
              style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
              transform=" matrix(1 0 0 1 0 0) "
              stroke-linecap="round"
              fill={darkMode ? "white" : "black"}
            />
            <path
              d="M 39.876 60.503 c -1.937 0 -3.757 -0.754 -5.127 -2.124 l -6.146 -6.145 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 59.844 C 41.952 60.271 40.933 60.503 39.876 60.503 z"
              style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
              transform=" matrix(1 0 0 1 0 0) "
              stroke-linecap="round"
              fill={darkMode ? "white" : "black"}
            />
            <path
              d="M 22.937 46.567 L 11.051 58.453 c -0.298 0.298 -0.621 0.562 -0.959 0.8 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 48.004 L 22.937 46.567 z"
              style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill-rule: nonzero; opacity: 1;"
              transform=" matrix(1 0 0 1 0 0) "
              stroke-linecap="round"
              fill={darkMode ? "white" : "black"}
            />
          </g>
        </svg>
      </div>
    </div>
  </td>
</tr>

<style windi:preflights:global windi:safelist:global>
</style>
