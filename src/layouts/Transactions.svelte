<script lang="ts">
  import { onMount } from "svelte";
  import mixpanel from "mixpanel-browser";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { wallet, chain, typeWallet, isDarkMode } from "~/store";
  import { nimbus } from "~/lib/network";
  import { otherGeneration } from "~/lib/chains";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import HistoricalTransactions from "~/UI/Transaction/HistoricalTransactions.svelte";
  import AddressManagement from "~/components/AddressManagement.svelte";
  import CoinSelector from "~/components/CoinSelector.svelte";
  import Select from "~/components/Select.svelte";

  import All from "~/assets/all.svg";

  const types = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Buy",
      value: "buy",
    },
    {
      label: "Swap",
      value: "swap",
    },
    {
      label: "Sell",
      value: "sell",
    },
    {
      label: "Unknown",
      value: "unknown",
    },
  ];

  let isLoading = false;
  let data = [];
  let pageToken = "";
  let paginate = "";

  let selectedType = {
    label: "All",
    value: "all",
  };

  let selectedCoin = {
    name: "All",
    logo: All,
    symbol: "all",
  };

  $: selectedTypeValue = selectedType?.value;
  $: selectedCoinValue = selectedCoin?.symbol;

  const getListTransactions = async (type: string, coin: string) => {
    isLoading = true;
    try {
      const response: any = await nimbus.get(
        `/v2/address/${$wallet}/history?chain=${$chain}&pageToken=${paginate}${
          type !== "all" ? `&type=${type}` : ""
        }${coin !== "all" ? `&coin=${coin}` : ""}`
      );
      if (
        response &&
        response?.data?.data &&
        response?.data?.data.length !== 0
      ) {
        data = [...data, ...response?.data?.data];
        pageToken = response?.data?.pageToken;
      }

      isLoading = false;
    } catch (e) {
      console.log("e");
    }
  };

  const handleLoadMore = (page: string) => {
    paginate = page;
  };

  $: {
    if (
      $wallet ||
      $chain ||
      paginate ||
      selectedTypeValue ||
      selectedCoinValue
    ) {
      if (
        Boolean(
          $wallet &&
            $wallet.length !== 0 &&
            $chain &&
            $chain?.length !== 0 &&
            $typeWallet !== "BUNDLE" &&
            !otherGeneration.includes($typeWallet)
        )
      ) {
        getListTransactions(selectedTypeValue, selectedCoinValue);
      }
    }
  }

  $: {
    if ($wallet || $chain) {
      data = [];
      pageToken = "";
    }
  }

  onMount(() => {
    mixpanel.track("transaction_page");
  });
</script>

<ErrorBoundary>
  <AddressManagement type="order" title="Transactions">
    <span slot="body">
      <div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] -mt-32 relative">
        <div class="trx_container rounded-[20px] xl:p-8 p-4">
          <div
            class={`rounded-[20px] xl:p-6 py-4 px-3 flex flex-col gap-4 ${
              $isDarkMode
                ? "bg-[#222222]"
                : "bg-[#fff] xl:border border_0000001a"
            }`}
          >
            <div class="flex flex-col justify-between gap-4 xl:flex-row">
              <div class="text-2xl font-medium">Historical Transactions</div>
              {#if $typeWallet === "EVM"}
                <div class="xl:flex hidden items-center gap-4">
                  <CoinSelector
                    bind:selected={selectedCoin}
                    positionSelectList="right-0"
                  />
                  <Select
                    type="lang"
                    bind:selected={selectedType}
                    listSelect={types}
                    positionSelectList="right-0"
                  />
                </div>

                <div class="xl:hidden flex items-center gap-4">
                  <CoinSelector
                    bind:selected={selectedCoin}
                    positionSelectList="left-0"
                  />
                  <Select
                    type="lang"
                    bind:selected={selectedType}
                    listSelect={types}
                    positionSelectList="left-0"
                  />
                </div>
              {/if}
            </div>
            <HistoricalTransactions
              {isLoading}
              {pageToken}
              data={data || []}
              loadMore={handleLoadMore}
            />
          </div>
        </div>

        {#if otherGeneration.includes($typeWallet) || $typeWallet === "BUNDLE"}
          <div
            class={`absolute top-0 left-0 rounded-[20px] w-full h-full flex flex-col items-center gap-3 justify-center z-7 backdrop-blur-md ${
              $isDarkMode ? "bg-black/90" : "bg-white/95"
            }`}
          >
            <div class="text-lg">Coming soon 🚀</div>
          </div>
        {/if}
      </div>
    </span>
  </AddressManagement>
</ErrorBoundary>

<style>
  :global(body) .trx_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .trx_container {
    background: #0f0f0f;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 1);
  }
</style>
