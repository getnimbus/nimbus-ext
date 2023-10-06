<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { Link } from "svelte-navigator";
  import { priceSubscribe } from "~/lib/price-ws";
  import mixpanel from "mixpanel-browser";
  import { typeWallet } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import NftCard from "~/components/NFTCard.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import Loading from "~/components/Loading.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let tokens = [];
  let data = {};
  let nativeToken = {};
  let marketPriceNFT;

  let addressWallet = "";
  let collectionId = "";

  // nft holding
  const getHoldingNFT = async (address) => {
    const response = await nimbus
      .get(`/v2/address/${address}/nft-holding?chain=ALL`)
      .then((response) => response?.data);
    return response;
  };

  const formatDataHoldingNFT = (dataNftHolding) => {
    const selectedCollection = dataNftHolding.find(
      (item) => item?.collectionId.toLowerCase() === collectionId.toLowerCase()
    );
    if (selectedCollection) {
      tokens = selectedCollection?.tokens;

      marketPriceNFT = {
        id: -1,
        market_price: selectedCollection?.marketPrice || 0,
      };

      data = {
        ...selectedCollection,
        current_value:
          selectedCollection?.floorPrice *
          selectedCollection?.marketPrice *
          selectedCollection?.tokens?.length,
      };

      nativeToken = selectedCollection?.nativeToken;

      if (
        selectedCollection?.nativeToken?.cmc_id &&
        Number(selectedCollection?.nativeToken?.cmc_id) !== 0
      ) {
        priceSubscribe(
          [Number(selectedCollection?.nativeToken?.cmc_id)],
          (item) => {
            marketPriceNFT = {
              id: item.id,
              market_price: item.p,
            };
          }
        );
      }
    }
  };

  // query nft holding
  $: queryNftHolding = createQuery({
    queryKey: ["nft-holding", addressWallet],
    queryFn: () => getHoldingNFT(addressWallet),
    staleTime: Infinity,
    enabled: addressWallet.length !== 0,
  });

  $: {
    if (!$queryNftHolding.isError && $queryNftHolding.data !== undefined) {
      formatDataHoldingNFT($queryNftHolding.data);
    }
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let collectionIDParams = urlParams.get("id");
    let addressParams = urlParams.get("address");

    if (collectionIDParams && addressParams) {
      mixpanel.track("nft_detail_page", {
        address: addressParams,
        collection_type: collectionIDParams,
      });
      collectionId = collectionIDParams;
      addressWallet = addressParams;
    }
  });

  $: {
    if (marketPriceNFT && data) {
      data = {
        ...data,
        marketPrice: marketPriceNFT.market_price,
        current_value:
          data?.floorPrice * marketPriceNFT.market_price * data?.tokens?.length,
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

  $: profitAndLoss = data?.current_value - (totalCost || 0);

  $: profitAndLossPercent =
    Math.abs(totalCost || 0) === 0 ? 0 : profitAndLoss / Math.abs(totalCost);

  $: console.log("data: ", data);
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col gap-14 mb-5">
        <div class="flex justify-between items-center">
          <Link to="/" class="cusor-pointer">
            <div class="text-white flex items-center gap-1">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="xl:text-sm text-2xl font-semibold">
                Back to Portfolio
              </div>
            </div>
          </Link>
        </div>
        <div class="text-3xl font-semibold text-white">
          {data?.collection?.name || "-"}
        </div>
      </div>

      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <OverviewCard title={"Position Value"}>
            <div class="xl:text-3xl text-5xl flex">
              <TooltipNumber number={data?.current_value} type="value" />
            </div>
            <div class="xl:text-lg text-3xl flex">
              {tokens.length}
              {tokens.length > 1 ? "NFTs" : "NFT"}
            </div>
          </OverviewCard>

          <OverviewCard
            title={"Profit & Loss"}
            tooltipText="Price NFTs now - Price NFTs at time you spent"
            isTooltip
          >
            <div
              class={`xl:text-3xl text-5xl flex ${
                profitAndLoss !== 0
                  ? profitAndLoss >= 0
                    ? "text-[#00A878]"
                    : "text-red-500"
                  : "text_00000099"
              }`}
            >
              <TooltipNumber number={Math.abs(profitAndLoss)} type="value" />
            </div>
            <div
              class={`xl:text-lg text-3xl flex ${
                profitAndLossPercent !== 0
                  ? profitAndLossPercent >= 0
                    ? "text-[#00A878]"
                    : "text-red-500"
                  : "text_00000099"
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
            <div class="xl:text-3xl text-5xl flex items-end gap-1">
              <TooltipNumber number={totalNativeTokenPrice} type="balance" />
              <span class="text-xl text-gray-500">
                {data?.nativeToken?.symbol}
              </span>
            </div>
            <div class="xl:text-lg text-3xl flex">
              <TooltipNumber number={totalCost} type="value" />
            </div>
          </OverviewCard>

          <OverviewCard
            title={"Floor Price"}
            tooltipText={typeWalletAddress === "EVM"
              ? "The Floor price of last 24h, if there is no volume, the floor price is 0"
              : "The Floor price from Magic Eden marketplace. "}
            isTooltip
            link={typeWalletAddress === "EVM"
              ? ""
              : `https://magiceden.io/ordinals/marketplace/${collectionId}`}
          >
            <div class="xl:text-3xl text-5xl flex items-end gap-1">
              <TooltipNumber
                number={Number(data?.floorPrice || 0)}
                type="balance"
              />
              <span class="text-xl text-gray-500">
                {data?.nativeToken?.symbol}
              </span>
            </div>
            <div class="xl:text-lg text-3xl flex">
              <TooltipNumber
                number={(data?.floorPrice || 0) *
                  (marketPriceNFT?.market_price || 0)}
                type="value"
              />
            </div>
          </OverviewCard>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] -mt-26">
    <div
      class="flex flex-col gap-7 bg-white rounded-[20px] xl:p-8 p-6 mt-6"
      style="box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.10);"
    >
      <div class="border border_0000001a rounded-[20px] p-6">
        <div class="flex flex-col gap-6">
          <div class="xl:text-2xl text-4xl font-medium">List NFT</div>
          {#if $queryNftHolding.isFetching}
            <div
              class="min-h-[320px] flex justify-center items-center col-span-4"
            >
              <Loading />
            </div>
          {:else if !$queryNftHolding.isFetching && tokens.length === 0}
            <div
              class="min-h-[320px] flex justify-center items-center col-span-4 text-lg text-gray-400"
            >
              Empty
            </div>
          {:else}
            <div
              class="grid gid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
            >
              {#each tokens as item}
                <NftCard
                  data={item}
                  {nativeToken}
                  {totalCost}
                  marketPrice={marketPriceNFT?.market_price || 0}
                />
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }
</style>
