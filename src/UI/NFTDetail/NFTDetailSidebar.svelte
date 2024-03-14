<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { priceSubscribe } from "~/lib/price-ws";
  import { wallet, chain, isDarkMode, realtimePrice } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { AnimateSharedLayout, Motion } from "svelte-motion";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import NftCard from "~/components/NFTCard.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import Loading from "~/components/Loading.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import NftDetailItem from "./NFTDetailItem.svelte";
  import NftTradeHistory from "./NFTTradeHistory.svelte";

  export let showSideNftDetail;
  export let selectedNftCollectionId;
  export let selectedNftCollectionChain;

  let tokens = [];
  let data: any = {};
  let nativeToken = {};
  let marketPriceNFT = 0;

  let selectedTypeDisplay: "grid" | "table" = "grid";

  const handleValidateAddress = async (address: string) => {
    if (address) {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      return (
        response?.data || {
          address: "",
          type: "",
        }
      );
    }
  };

  $: queryValidate = createQuery({
    queryKey: ["validate", $wallet],
    queryFn: () => handleValidateAddress($wallet),
    staleTime: Infinity,
    retry: false,
  });

  // nft holding
  const getHoldingNFT = async (chain) => {
    let addressChain = chain;

    if (addressChain === "ALL") {
      const validateAccount = $queryValidate.data;
      addressChain = validateAccount?.type;
    }

    const response = await nimbus
      .get(
        `/v2/address/${$wallet}/nft-holding?chain=${
          addressChain === "BUNDLE" ? "" : addressChain
        }`
      )
      .then((response: any) => response?.data);
    return response;
  };

  const formatDataHoldingNFT = (dataNftHolding) => {
    const selectedCollection = dataNftHolding.find(
      (item) =>
        item?.collectionId?.toLowerCase() ===
        selectedNftCollectionId?.toLowerCase()
    );
    if (selectedCollection) {
      tokens = selectedCollection?.tokens;

      data = {
        ...selectedCollection,
        marketPrice: Number(selectedCollection?.marketPrice || 0),
        current_native_value:
          Number(selectedCollection?.floorPrice) *
          selectedCollection?.tokens?.length,
        current_value:
          Number(selectedCollection?.floorPrice) *
          Number(selectedCollection?.marketPrice) *
          selectedCollection?.tokens?.length,
      };

      nativeToken = selectedCollection?.nativeToken;

      if (
        selectedCollection?.nativeToken?.cmcId &&
        Number(selectedCollection?.nativeToken?.cmcId) !== 0
      ) {
        priceSubscribe(
          [Number(selectedCollection?.nativeToken?.cmcId)],
          selectedCollection?.collection?.chain
        );
      }
    }
  };

  // query nft holding
  $: queryNftHolding = createQuery({
    queryKey: ["nft-holding", $wallet, $chain],
    queryFn: () => getHoldingNFT($chain),
    staleTime: Infinity,
    retry: false,
    enabled:
      $wallet &&
      $wallet.length !== 0 &&
      showSideNftDetail &&
      !$queryValidate.isFetching,
  });

  $: {
    if (
      !$queryNftHolding.isError &&
      $queryNftHolding.data !== undefined &&
      selectedNftCollectionId
    ) {
      formatDataHoldingNFT($queryNftHolding.data);
    }
  }

  $: {
    if ($realtimePrice && data) {
      marketPriceNFT = $realtimePrice[data?.nativeToken?.cmcId]
        ? Number($realtimePrice[data?.nativeToken?.cmcId]?.price)
        : Number(data?.marketPrice);

      data = {
        ...data,
        marketPrice: $realtimePrice[data?.nativeToken?.cmcId]
          ? Number($realtimePrice[data?.nativeToken?.cmcId]?.price)
          : Number(data?.marketPrice),
        current_native_value: Number(data?.floorPrice) * data?.tokens?.length,
        current_value:
          Number(data?.floorPrice) *
          ($realtimePrice[data?.nativeToken?.cmcId]
            ? Number($realtimePrice[data?.nativeToken?.cmcId]?.price)
            : Number(data?.marketPrice)) *
          data?.tokens?.length,
      };
    }
  }

  $: totalCost = data?.tokens?.reduce(
    (prev, item) => prev + Number(item.cost),
    0
  );

  $: totalNativeTokenPrice = data?.tokens?.reduce(
    (prev, item) => prev + Number(item.price),
    0
  );

  $: profitAndLoss =
    totalNativeTokenPrice === 0
      ? 0
      : Number(data?.current_native_value) - Number(totalNativeTokenPrice || 0);

  $: profitAndLossPercent =
    totalNativeTokenPrice === 0
      ? 0
      : (profitAndLoss * data?.marketPrice) / Math.abs(Number(totalCost));
</script>

<ErrorBoundary>
  <div class="flex flex-col justify-between gap-6">
    <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
      <OverviewCard title={"Position Value"}>
        <div class="text-3xl flex">
          <TooltipNumber number={data?.current_value} type="value" />
        </div>
        <div class="text-lg flex">
          {tokens.length}
          {tokens.length > 1 ? "NFTs" : "NFT"}
        </div>
      </OverviewCard>

      <OverviewCard
        title={"Profit & Loss"}
        tooltipText="Price NFTs now - Price NFTs at time you spent"
        isTooltip
      >
        <div class="flex items-end gap-1">
          <div
            class={`text-3xl ${
              profitAndLoss !== 0
                ? profitAndLoss >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : ""
            }`}
          >
            <TooltipNumber number={Math.abs(profitAndLoss)} type="balance" />
          </div>
          <span class="text-xl text-gray-500">
            {data?.nativeToken?.symbol || "-"}
          </span>
        </div>
        <div
          class={`text-lg flex ${
            profitAndLossPercent !== 0
              ? profitAndLossPercent >= 0
                ? "text-[#00A878]"
                : "text-red-500"
              : ""
          }`}
        >
          {#if profitAndLossPercent !== 0}
            {#if profitAndLossPercent < 0}
              ↓
            {:else}
              ↑
            {/if}
          {/if}
          <TooltipNumber
            number={Math.abs(profitAndLossPercent) * 100}
            type={Math.abs(Number(profitAndLossPercent)) > 100
              ? "balance"
              : "percent"}
          />%
        </div>
      </OverviewCard>
    </div>

    <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
      <OverviewCard
        title={"Cost"}
        tooltipText="Learn more"
        link="https://docs.getnimbus.io/metrics/average_cost/"
      >
        <div class="text-3xl flex items-end gap-1">
          <TooltipNumber number={totalNativeTokenPrice} type="balance" />
          <span class="text-xl text-gray-500">
            {data?.nativeToken?.symbol || "-"}
          </span>
        </div>
        <div class="text-lg flex">
          <TooltipNumber number={totalCost} type="value" />
        </div>
      </OverviewCard>

      <OverviewCard
        title={"Floor Price"}
        tooltipText={false
          ? "The Floor price from Magic Eden marketplace. "
          : "The Floor price of last 24h, if there is no volume, the floor price is 0"}
        isTooltip
        link={false
          ? `https://magiceden.io/ordinals/marketplace/${selectedNftCollectionId}`
          : ""}
      >
        <div class="text-3xl flex items-end gap-1">
          <TooltipNumber
            number={Number(data?.floorPrice || 0)}
            type="balance"
          />
          <span class="text-xl text-gray-500">
            {data?.nativeToken?.symbol || "-"}
          </span>
        </div>
        <div class="text-lg flex">
          <TooltipNumber
            number={Number(data?.floorPrice || 0) * (marketPriceNFT || 0)}
            type="value"
          />
        </div>
      </OverviewCard>
    </div>
  </div>

  <div
    class={`rounded-[20px] xl:p-6 p-3 flex flex-col gap-4 ${
      $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
    }`}
  >
    <div class="flex justify-between items-center">
      <div class="text-2xl font-medium">List NFT</div>
      <div class="flex items-center gap-2">
        <AnimateSharedLayout>
          <div
            class="relative cursor-pointer py-2 px-3 rounded-[10px] transition-all"
            on:click|stopPropagation={() => (selectedTypeDisplay = "grid")}
          >
            <div
              class={`relative z-20 w-[18px] h-[18px] ${
                selectedTypeDisplay === "grid" && "text-white"
              }`}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M4.44444 0H0.888889C0.397969 0 0 0.397969 0 0.888889V4.44444C0 4.93536 0.397969 5.33333 0.888889 5.33333H4.44444C4.93536 5.33333 5.33333 4.93536 5.33333 4.44444V0.888889C5.33333 0.397969 4.93536 0 4.44444 0Z"
                /><path
                  d="M11.7778 0H8.22222C7.7313 0 7.33333 0.397969 7.33333 0.888889V4.44444C7.33333 4.93536 7.7313 5.33333 8.22222 5.33333H11.7778C12.2687 5.33333 12.6667 4.93536 12.6667 4.44444V0.888889C12.6667 0.397969 12.2687 0 11.7778 0Z"
                /><path
                  d="M19.1111 0H15.5556C15.0646 0 14.6667 0.397969 14.6667 0.888889V4.44444C14.6667 4.93536 15.0646 5.33333 15.5556 5.33333H19.1111C19.602 5.33333 20 4.93536 20 4.44444V0.888889C20 0.397969 19.602 0 19.1111 0Z"
                /><path
                  d="M4.44444 7.33333H0.888889C0.397969 7.33333 0 7.7313 0 8.22222V11.7778C0 12.2687 0.397969 12.6667 0.888889 12.6667H4.44444C4.93536 12.6667 5.33333 12.2687 5.33333 11.7778V8.22222C5.33333 7.7313 4.93536 7.33333 4.44444 7.33333Z"
                /><path
                  d="M11.7778 7.33333H8.22222C7.7313 7.33333 7.33333 7.7313 7.33333 8.22222V11.7778C7.33333 12.2687 7.7313 12.6667 8.22222 12.6667H11.7778C12.2687 12.6667 12.6667 12.2687 12.6667 11.7778V8.22222C12.6667 7.7313 12.2687 7.33333 11.7778 7.33333Z"
                /><path
                  d="M19.1111 7.33333H15.5556C15.0646 7.33333 14.6667 7.7313 14.6667 8.22222V11.7778C14.6667 12.2687 15.0646 12.6667 15.5556 12.6667H19.1111C19.602 12.6667 20 12.2687 20 11.7778V8.22222C20 7.7313 19.602 7.33333 19.1111 7.33333Z"
                /><path
                  d="M4.44444 14.6667H0.888889C0.397969 14.6667 0 15.0646 0 15.5556V19.1111C0 19.602 0.397969 20 0.888889 20H4.44444C4.93536 20 5.33333 19.602 5.33333 19.1111V15.5556C5.33333 15.0646 4.93536 14.6667 4.44444 14.6667Z"
                /><path
                  d="M11.7778 14.6667H8.22222C7.7313 14.6667 7.33333 15.0646 7.33333 15.5556V19.1111C7.33333 19.602 7.7313 20 8.22222 20H11.7778C12.2687 20 12.6667 19.602 12.6667 19.1111V15.5556C12.6667 15.0646 12.2687 14.6667 11.7778 14.6667Z"
                /><path
                  d="M19.1111 14.6667H15.5556C15.0646 14.6667 14.6667 15.0646 14.6667 15.5556V19.1111C14.6667 19.602 15.0646 20 15.5556 20H19.1111C19.602 20 20 19.602 20 19.1111V15.5556C20 15.0646 19.602 14.6667 19.1111 14.6667Z"
                /></svg
              >
            </div>
            {#if selectedTypeDisplay === "grid"}
              <Motion
                let:motion
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div
                  class="absolute inset-0 rounded-[10px] bg-[#1E96FC] z-10"
                  use:motion
                />
              </Motion>
            {/if}
          </div>
          <div
            class="relative cursor-pointer py-2 px-3 rounded-[10px] transition-all"
            on:click|stopPropagation={() => (selectedTypeDisplay = "table")}
          >
            <div
              class={`relative z-20 w-[18px] h-[18px] ${
                selectedTypeDisplay === "table" && "text-white"
              }`}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M4.44444 0H0.888889C0.397969 0 0 0.397969 0 0.888889V4.44444C0 4.93536 0.397969 5.33333 0.888889 5.33333H4.44444C4.93536 5.33333 5.33333 4.93536 5.33333 4.44444V0.888889C5.33333 0.397969 4.93536 0 4.44444 0Z"
                /><path
                  d="M19.11 1.5H8.22222C7.7313 1.5 7.33333 1.89797 7.33333 2.38889V2.94444C7.33333 3.43536 7.7313 3.83333 8.22222 3.83333H19.11C19.6009 3.83333 20 3.43536 20 2.94444V2.38889C20 1.89797 19.6009 1.5 19.11 1.5Z"
                /><path
                  d="M4.44444 7.33333H0.888889C0.397969 7.33333 0 7.7313 0 8.22222V11.7778C0 12.2687 0.397969 12.6667 0.888889 12.6667H4.44444C4.93536 12.6667 5.33333 12.2687 5.33333 11.7778V8.22222C5.33333 7.7313 4.93536 7.33333 4.44444 7.33333Z"
                /><path
                  d="M19.11 8.83333H8.22222C7.7313 8.83333 7.33333 9.2313 7.33333 9.72222V10.2778C7.33333 10.7687 7.7313 11.1667 8.22222 11.1667H19.11C19.6009 11.1667 20 10.7687 20 10.2778V9.72222C20 9.2313 19.6009 8.83333 19.11 8.83333Z"
                /><path
                  d="M4.44444 14.6667H0.888889C0.397969 14.6667 0 15.0646 0 15.5556V19.1111C0 19.602 0.397969 20 0.888889 20H4.44444C4.93536 20 5.33333 19.602 5.33333 19.1111V15.5556C5.33333 15.0646 4.93536 14.6667 4.44444 14.6667Z"
                /><path
                  d="M19.11 16.1667H8.22222C7.7313 16.1667 7.33333 16.5646 7.33333 17.0556V17.6111C7.33333 18.102 7.7313 18.5 8.22222 18.5H19.11C19.6009 18.5 20 18.102 20 17.6111V17.0556C20 16.5646 19.6009 16.1667 19.11 16.1667Z"
                /></svg
              >
            </div>
            {#if selectedTypeDisplay === "table"}
              <Motion
                let:motion
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div
                  class="absolute inset-0 rounded-[10px] bg-[#1E96FC] z-10"
                  use:motion
                />
              </Motion>
            {/if}
          </div>
        </AnimateSharedLayout>
      </div>
    </div>

    {#if $queryNftHolding.isFetching}
      <div class="min-h-[320px] flex justify-center items-center col-span-4">
        <Loading />
      </div>
    {:else if !$queryNftHolding.isFetching && tokens.length === 0}
      <div
        class="min-h-[320px] flex justify-center items-center col-span-4 text-base text-gray-400"
      >
        Empty
      </div>
    {:else}
      <div>
        {#if selectedTypeDisplay === "grid"}
          <div class="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6">
            {#each tokens as item}
              <NftCard
                data={item}
                {nativeToken}
                marketPrice={marketPriceNFT || 0}
                floorPrice={Number(data?.floorPrice || 0)}
              />
            {/each}
          </div>
        {:else}
          <div
            class={`rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
              $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
            }`}
          >
            <table class="table-auto xl:w-full w-[1400px] h-full">
              <thead>
                <tr class="bg_f4f5f8">
                  <th
                    class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[220px]"
                  >
                    <div class="text-left text-sm uppercase font-medium">
                      Name
                    </div>
                  </th>

                  <th class="py-3">
                    <div class="text-right text-sm uppercase font-medium">
                      Cost
                    </div>
                  </th>

                  <th class="py-3 pr-3 rounded-tr-[10px]">
                    <div class="text-right text-sm uppercase font-medium">
                      <TooltipTitle
                        tooltipText="Price NFTs now - Price NFTs at time you spent"
                      >
                        Profit & Loss
                      </TooltipTitle>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {#each tokens as item}
                  <NftDetailItem
                    {item}
                    {nativeToken}
                    marketPrice={marketPriceNFT || 0}
                    floorPrice={Number(data?.floorPrice || 0)}
                  />
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <NftTradeHistory {selectedNftCollectionChain} {selectedNftCollectionId} />
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
