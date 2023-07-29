<script lang="ts">
  import { onMount } from "svelte";
  import { wallet, chain } from "~/store";
  import { i18n } from "~/lib/i18n";
  import { sendMessage } from "webext-bridge";
  import { nimbus } from "~/lib/network";

  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";
  import type { OverviewDataRes } from "~/types/OverviewData";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";
  import TokenAllocation from "~/components/TokenAllocation.svelte";
  import "~/components/Loading.custom.svelte";
  import Button from "~/components/Button.svelte";

  const MultipleLang = {
    token_allocation: i18n("newtabPage.token-allocation", "Token Allocation"),
  };

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let chainParams = urlParams.get("chain");
    let addressParams = urlParams.get("address");

    if (APP_TYPE.TYPE === "EXT") {
      const params = decodeURIComponent(window.location.hash)
        .split("?")[1]
        .split("&")
        .reduce(function (result, param) {
          var [key, value] = param.split("=");
          result[key] = value;
          return result;
        }, {});

      chainParams = params.chain;
      addressParams = params.address;
    }

    if (chainParams && addressParams) {
      selectedWallet = addressParams;
      selectedChain = chainParams;
    }
  });

  let holdingTokenData: TokenData = [];
  let dataPieChart = {
    token: {
      sumOrderBreakdownToken: 0,
      formatDataPieChartTopFiveToken: [],
      dataPieChartOrderBreakdownToken: [],
    },
  };
  let isEmptyDataPie = false;
  let isLoading = false;

  let compareData = {};
  let isLoadingDataCompare = false;
  let searchCompare = "";
  let timerSearchDebounce;

  const debounceSearchCompare = (value) => {
    clearTimeout(timerSearchDebounce);
    timerSearchDebounce = setTimeout(() => {
      searchCompare = value;
    }, 300);
  };

  const getAnalyticCompare = async () => {
    isLoadingDataCompare = true;
    try {
      const response: any = await nimbus.get(
        `/v2/analysis/${selectedWallet}/compare?compareAddress=${searchCompare}`
      );
      if (response && response.data) {
        compareData = response.data;
        isLoadingDataCompare = false;
      }
    } catch (e) {
      console.log("e: ", e);
      isLoadingDataCompare = false;
    }
  };

  const getOverview = async (isReload: boolean = false) => {
    isEmptyDataPie = false;
    try {
      const response: OverviewDataRes = await sendMessage("getOverview", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      if (selectedWallet === response?.address) {
        if (response.result?.breakdownToken?.length === 0) {
          isEmptyDataPie = true;
          isLoading = false;
        }

        // pie chart format data Token holding
        const sumToken = (response.result?.breakdownToken || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const sortBreakdownToken = response.result?.breakdownToken.sort(
          (a, b) => {
            if (a.value < b.value) {
              return 1;
            }
            if (a.value > b.value) {
              return -1;
            }
            return 0;
          }
        );

        const topFiveBreakdownToken = sortBreakdownToken
          .slice(0, 5)
          .map((item) => {
            return {
              ...item,
              id: item.id || "N/A",
              symbol: item.symbol || "N/A",
              name: item.name || "N/A",
            };
          });

        const orderBreakdownToken = sortBreakdownToken.slice(
          5,
          sortBreakdownToken.length
        );

        const sumOrderBreakdownToken = (orderBreakdownToken || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const dataPieChartOrderBreakdownToken = [
          {
            logo: "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
            name: "Other tokens",
            symbol: "",
            name_ratio: "Ratio",
            value: (sumOrderBreakdownToken / sumToken) * 100,
            name_value: "Value",
            value_value: sumOrderBreakdownToken,
            name_balance: "",
            value_balance: 0,
          },
        ];

        const formatDataPieChartTopFiveToken = topFiveBreakdownToken.map(
          (item) => {
            return {
              logo: item.logo,
              name: item.name || item.symbol,
              symbol: item.symbol,
              name_ratio: "Ratio",
              value: (Number(item.value) / sumToken) * 100,
              name_value: "Value",
              value_value: Number(item.value),
              name_balance: "Balance",
              value_balance: Number(item.amount),
            };
          }
        );

        const formatDataPie = {
          token: {
            sumOrderBreakdownToken,
            formatDataPieChartTopFiveToken,
            dataPieChartOrderBreakdownToken,
          },
        };
        dataPieChart = formatDataPie;

        return formatDataPie;
      } else {
        // console.log("response: ", response)
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getHoldingToken = async (isReload: boolean = false) => {
    try {
      const response: HoldingTokenRes = await sendMessage("getHoldingToken", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      if (selectedWallet === response?.address) {
        const formatData = response.result.map((item) => {
          return {
            ...item,
            value: item.amount * item.rate,
          };
        });
        holdingTokenData = formatData.sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });
        return response;
      } else {
        // console.log("response: ", response)
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const handleGetAllData = async () => {
    isLoading = true;
    try {
      const [resOverview, resTokenHolding] = await Promise.all([
        getOverview().then((res) => {
          return res;
        }),
        getHoldingToken().then((res) => {
          return res;
        }),
      ]);

      if (resOverview && resTokenHolding) {
        isLoading = false;
      }
    } catch (e) {
      console.log("e: ", e);
      isLoading = false;
    }
  };

  const handleSelectedTableTokenHolding = (data, selectDatPieChart) => {
    if (data.data && data.data.length !== 0) {
      console.log({
        data,
        selectDatPieChart,
      });
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        handleGetAllData();
        getAnalyticCompare();
      }
    }
  }

  $: console.log("compareData: ", compareData);
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="xl:text-5xl text-7xl text-black font-semibold">Compare</div>
      <div class="xl:text-xl text-3xl text-black font-medium">
        <Copy address={selectedWallet} iconColor="#000" color="#000" />
      </div>
    </div>
    <div class="flex gap-6">
      <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
        <div class="xl:text-2xl text-4xl font-medium text-black w-full mb-6">
          {MultipleLang.token_allocation}
        </div>
        {#if isLoading}
          <div class="flex items-center justify-center h-[633px]">
            <loading-icon />
          </div>
        {:else}
          <div class="h-full">
            {#if isEmptyDataPie}
              <div
                class="flex justify-center items-center h-full xl:text-lg text-xl text-gray-400 h-[633px]"
              >
                Empty
              </div>
            {:else}
              <div class="-mt-2">
                <TokenAllocation
                  {dataPieChart}
                  {holdingTokenData}
                  {handleSelectedTableTokenHolding}
                />
              </div>
            {/if}
          </div>
        {/if}
      </div>
      <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
        {#if searchCompare}
          <div>compare chart</div>
        {:else}
          <div class="xl:text-2xl text-4xl font-medium text-black w-full">
            Compare with
          </div>
          <div class="h-full flex flex-col justify-center gap-6">
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <Button>High risk</Button>
              </div>
              <div class="flex-1">
                <Button>Medium risk</Button>
              </div>
              <div class="flex-1">
                <Button>Low risk</Button>
              </div>
            </div>
            <div class="border-t-[1px] relative">
              <div
                class="absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-gray-400 bg-white text-sm px-2"
              >
                Or
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div
                class={`border focus:outline-none w-full py-2 px-3 rounded-lg flex justify-between items-center ${
                  searchCompare ? "bg-[#F0F2F7]" : "bg-white"
                }`}
              >
                <input
                  on:keyup={({ target: { value } }) =>
                    debounceSearchCompare(value)}
                  on:keydown={(event) => {
                    if (
                      (event.which == 13 || event.keyCode == 13) &&
                      searchCompare
                    ) {
                      getAnalyticCompare();
                    }
                  }}
                  value={searchCompare}
                  placeholder={"Search address to compare"}
                  type="text"
                  class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] h-7 ${
                    searchCompare ? "bg-[#F0F2F7]" : ""
                  }`}
                />
                {#if searchCompare}
                  <div
                    class="cursor-pointer text-xl text-[#5E656B]"
                    on:click={() => {
                      searchCompare = "";
                      getAnalyticCompare();
                    }}
                  >
                    &otimes;
                  </div>
                {/if}
              </div>
              <div class="xl:text-sm text-lg">
                Or <span class="text-blue-500 cursor-pointer"
                  >get inspired from the whale list</span
                >
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
