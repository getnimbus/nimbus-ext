<script lang="ts">
  import { useNavigate } from "svelte-navigator";
  import { shorterName } from "~/utils";
  import { typeWallet, isDarkMode } from "~/store";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import Chart from "~/assets/chart.svg";

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

  $: profitAndLoss = data?.current_value - (data?.totalCost || 0);
  $: profitAndLossPercent =
    Math.abs(data?.totalCost || 0) === 0
      ? 0
      : profitAndLoss / Math.abs(data?.totalCost);
</script>

<tr
  class={`group transition-all ${
    typeWalletAddress === "BTC" ? "cursor-pointer" : ""
  }`}
  on:click={() => {
    if (typeWalletAddress === "EVM") {
      return;
    }
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
        {data?.collection?.name && data?.collection?.name.length > 24
          ? shorterName(data?.collection?.name, 20)
          : data?.collection?.name}
        {#if isShowTooltipName && data?.collection?.name.length > 24}
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
        class="flex justify-start"
        on:mouseenter={() => (showTooltipListNFT = true)}
        on:mouseleave={() => (showTooltipListNFT = false)}
      >
        {#if data?.balance > 5}
          {#each data?.tokens.slice(0, 4) as token, index}
            <img
              src={token?.image_url ||
                "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
              alt=""
              class={`w-9 h-9 rounded-md border border-gray-300 overflow-hidden bg-white ${
                index > 0 && "-ml-2"
              }`}
            />
          {/each}
          <div class="relative w-9 h-9">
            <img
              src={data?.tokens[4].image_url ||
                "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
              alt=""
              class="w-9 h-9 rounded-md border border-gray-300 overflow-hidden -ml-2 bg-white"
            />
            <div
              class="absolute top-0 -left-2 w-full h-full bg-[#00000066] text-white text-center flex justify-center items-center pb-2 rounded-md"
            >
              ...
            </div>
          </div>
          {#if showTooltipListNFT && data?.balance > 5}
            <div class="absolute -top-7 left-0" style="z-index: 2147483648;">
              <tooltip-detail
                text={`${data?.balance} NFTs on collection ${data?.collection?.name}`}
              />
            </div>
          {/if}
        {:else}
          {#each data?.tokens as token, index}
            <img
              src={token?.image_url ||
                "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
              alt=""
              class={`w-9 h-9 rounded-md border border-gray-300 overflow-hidden bg-white ${
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
    <div class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end">
      <TooltipNumber number={data?.floorPriceBTC} type="balance" /><span
        class="mx-1">{typeWalletAddress === "EVM" ? "ETH" : "BTC"}</span
      >
      | $<TooltipNumber
        number={data?.floorPriceBTC * data?.market_price}
        type="balance"
      />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end">
      <TooltipNumber number={data?.totalCostBTC} type="balance" /><span
        class="mx-1"
      >
        {typeWalletAddress === "EVM" ? "ETH" : "BTC"}
      </span>
      | $<TooltipNumber number={data?.totalCost} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end">
      $<TooltipNumber number={data?.current_value} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="flex items-center justify-end gap-1 xl:text-sm text-2xl font-medium"
    >
      <div class="flex flex-col">
        <div
          class={`flex justify-end ${
            profitAndLoss >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          $<TooltipNumber number={Math.abs(profitAndLoss)} type="balance" />
        </div>
        <div class="flex items-center justify-end gap-1">
          <div
            class={`flex items-center ${
              profitAndLossPercent >= 0 ? "text-[#00A878]" : "text-red-500"
            }`}
          >
            <TooltipNumber
              number={Math.abs(profitAndLossPercent) * 100}
              type="percent"
            />
            <span>%</span>
          </div>
          <img
            src={profitAndLoss >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="mb-1"
          />
        </div>
      </div>
    </div>
  </td>

  {#if typeWalletAddress === "BTC"}
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
          <img src={Chart} alt="" width={14} height={14} />
        </div>
      </div>
    </td>
  {/if}
</tr>

<style>
</style>
