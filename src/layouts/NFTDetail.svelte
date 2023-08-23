<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { Link } from "svelte-navigator";
  import { priceSubscribe } from "~/lib/price-ws";
  import mixpanel from "mixpanel-browser";
  import { getAddressContext } from "~/utils";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import NftCard from "~/components/NFTCard.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import "~/components/Loading.custom.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";

  let isLoadingListNFT = false;
  let tokens = [];
  let data;
  let marketPriceNFT;
  let addressWallet = "";
  let collectionName = "";

  const getCollectionDetail = async (collectionId, address) => {
    try {
      isLoadingListNFT = true;
      collectionName = collectionId;
      const response = await nimbus
        .get(`/address/${address}/nft-holding/${collectionId}`)
        .then((res) => res.data);
      if (response) {
        tokens = response.tokens;
        marketPriceNFT = {
          id: -1,
          market_price: response?.btcPrice || 0,
        };
        data = {
          ...response,
          market_price: response?.btcPrice || 0,
          current_value:
            response?.floorPriceBTC * response?.btcPrice * response?.balance,
        };
        priceSubscribe([response?.cmc_id], (data) => {
          marketPriceNFT = {
            id: data.id,
            market_price: data.p,
          };
        });
      }
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoadingListNFT = false;
    }
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let collectionIDParams = urlParams.get("id");
    let addressParams = urlParams.get("address");

    if (collectionIDParams && addressParams) {
      mixpanel.track("nft_detail_page", {
        address: addressParams,
        collection_type: collectionIDParams,
      });
      addressWallet = addressParams;
      getCollectionDetail(collectionIDParams, addressParams);
    }
  });

  $: {
    if (marketPriceNFT) {
      data = {
        ...data,
        market_price: marketPriceNFT.market_price,
        current_value:
          data?.floorPriceBTC * marketPriceNFT.market_price * data?.balance,
      };
    }
  }

  $: profitAndLoss = data?.current_value - (data?.overview.totalCost || 0);
  $: profitAndLossPercent =
    Math.abs(data?.overview.totalCost || 0) === 0
      ? 0
      : profitAndLoss / Math.abs(data?.overview.totalCost);
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col gap-14 mb-5">
        <div class="flex justify-between items-center">
          <Link to="/" class="cusor-pointer">
            <div class="text-white flex items-center gap-1">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="xl:text-sm text-xl font-semibold">
                Back to Portfolio
              </div>
            </div>
          </Link>
        </div>
        <div class="text-3xl font-semibold text-white">
          {data?.collection_name || "-"}
        </div>
      </div>
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <OverviewCard title={"Position Value"}>
            <div class="xl:text-3xl text-5xl flex">
              {#if data?.current_value.toString().toLowerCase().includes("e-")}
                $<TooltipNumber number={data?.current_value} type="balance" />
              {:else}
                $<CountUpNumber
                  id="PositionValueHolding"
                  number={data?.current_value}
                  type="balance"
                />
              {/if}
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
                profitAndLossPercent >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              $<CountUpNumber
                id="Profit&Loss"
                number={Math.abs(profitAndLoss)}
                type="balance"
              />
            </div>
            <div
              class={`xl:text-lg text-3xl flex ${
                profitAndLossPercent >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              {#if profitAndLossPercent < 0}
                ↓
              {:else}
                ↑
              {/if}
              <CountUpNumber
                id="Profit&LossPercent"
                number={Math.abs(profitAndLossPercent) * 100}
                type="percent"
              />%
            </div>
          </OverviewCard>
        </div>
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <OverviewCard
            title={"Average Cost"}
            tooltipText="Learn more"
            link="https://docs.getnimbus.io/metrics/average_cost/"
          >
            <div class="xl:text-3xl text-5xl flex items-end gap-1">
              <CountUpNumber
                id="AverageCostBTC"
                number={data?.overview?.avgCostBTC || 0}
                format={8}
                type="amount"
              />
              <span class="text-xl text-gray-500">
                {getAddressContext(addressWallet)?.type === "EVM"
                  ? "ETH"
                  : "BTC"}
              </span>
            </div>
            <div class="xl:text-lg text-3xl flex">
              {#if (data?.overview?.avgCost)
                .toString()
                .toLowerCase()
                .includes("e-")}
                $<TooltipNumber
                  number={data?.overview?.avgCost}
                  type="balance"
                />
              {:else}
                $<CountUpNumber
                  id="AverageCost"
                  number={data?.overview?.avgCost}
                  type="balance"
                />
              {/if}
            </div>
          </OverviewCard>
          <OverviewCard
            title={"Floor Price"}
            tooltipText={getAddressContext(addressWallet)?.type === "EVM"
              ? "The Floor price of last 24h, if there is no volume, the floor price is 0"
              : "The Floor price from Magic Eden marketplace. "}
            isTooltip
            link={getAddressContext(addressWallet)?.type === "EVM"
              ? ""
              : `https://magiceden.io/ordinals/marketplace/${collectionName}`}
          >
            <div class="xl:text-3xl text-5xl flex items-end gap-1">
              <CountUpNumber
                id="24-hourReturn"
                number={data?.floorPriceBTC || 0}
                format={8}
                type="amount"
              />
              <span class="text-xl text-gray-500">
                {getAddressContext(addressWallet)?.type === "EVM"
                  ? "ETH"
                  : "BTC"}
              </span>
            </div>
            <div class="xl:text-lg text-3xl flex">
              $<CountUpNumber
                id="24-hourReturnPercent"
                number={(data?.floorPriceBTC || 0) *
                  (marketPriceNFT?.market_price || 0)}
                type="balance"
              />
            </div>
          </OverviewCard>
        </div>
      </div>
    </div>
  </div>
  <div class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] -mt-26">
    <div
      class="flex flex-col gap-7 bg-white rounded-[20px] xl:p-8 mt-6"
      style="box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.10);"
    >
      <div class="border border_0000001a rounded-[20px] p-6">
        <div class="flex flex-col gap-6">
          <div class="xl:text-2xl text-4xl font-medium">List NFT</div>
          {#if isLoadingListNFT}
            <div
              class="min-h-[320px] flex justify-center items-center col-span-4"
            >
              <loading-icon />
            </div>
          {:else if !isLoadingListNFT && tokens.length === 0}
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

<style>
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
