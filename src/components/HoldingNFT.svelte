<script lang="ts">
  import { useNavigate } from "svelte-navigator";
  import { shorterName, detectedChain, handleImgError } from "~/utils";
  import { typeWallet, isDarkMode } from "~/store";
  import mixpanel from "mixpanel-browser";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import OverlaySidebar from "./OverlaySidebar.svelte";
  import NftDetailSidebar from "~/UI/NFTDetail/NFTDetailSidebar.svelte";
  import Copy from "~/components/Copy.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
  export let selectedWallet;
  export let index;

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

  let showSideNftDetail = false;

  const closeSideNFTDetail = (event) => {
    if (event.key === "Escape") {
      showSideNftDetail = false;
    }
  };

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

<svelte:window on:keydown={closeSideNFTDetail} />

<tr
  class={`group transition-all cursor-pointer ${
    index === 0 && "view-nft-detail"
  } `}
  on:click={() => {
    showSideNftDetail = true;
    mixpanel.track("nft_detail_page", {
      address: selectedWallet,
      collection_type: data.collectionId,
    });
  }}
>
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 w-[220px] ${
      darkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="relative flex flex-col gap-1">
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
      {#if typeWalletAddress === "EVM" || typeWalletAddress === "BUNDLE"}
        <img
          src={detectedChain(data.nativeToken.symbol)}
          alt=""
          width="20"
          height="20"
          class="rounded-full"
        />
      {/if}
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
              on:error={(e) =>
                handleImgError(
                  e,
                  token?.imageUrl,
                  "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                )}
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
              on:error={(e) =>
                handleImgError(
                  e,
                  data?.tokens[4].imageUrl,
                  "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                )}
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
              on:error={(e) =>
                handleImgError(
                  e,
                  token?.imageUrl,
                  "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                )}
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
    class={`py-3 pr-3 ${
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
</tr>

<!-- Sidebar NFT Detail -->
<OverlaySidebar isOpen={showSideNftDetail}>
  <div class="flex flex-col gap-6 p-6">
    <div class="flex justify-between items-start">
      <div
        class="xl:text-5xl text-6xl text-gray-500 cursor-pointer"
        on:click|stopPropagation={() => {
          showSideNftDetail = false;
        }}
      >
        &times;
      </div>
      <div class="flex flex-col items-end">
        <div class="xl:text-3xl text-4xl font-semibold">
          {data?.collection?.name || "-"}
        </div>
        <div class="text-3xl xl:text-xl">
          <Copy
            address={data?.tokens[0]?.contractAddress}
            isShorten
            iconColor={`${darkMode ? "#fff" : "#000"}`}
            color={`${darkMode ? "#fff" : "#000"}`}
          />
        </div>
      </div>
    </div>
    <NftDetailSidebar
      collectionId={data.collectionId}
      addressWallet={selectedWallet}
    />
  </div>
</OverlaySidebar>

<style windi:preflights:global windi:safelist:global>
</style>
