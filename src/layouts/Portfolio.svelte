<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { groupBy, isEmpty } from "lodash";
  import { onDestroy, onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import { i18n } from "~/lib/i18n";
  import { disconnectWs, initWS } from "~/lib/price-ws";
  import { formatCurrency, getAddressContext } from "~/utils";
  import { wait } from "../entries/background/utils";
  import { wallet, chain, typeWallet } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { nimbus } from "~/lib/network";
  import { getHoldingSOL, getOverviewSOL } from "~/solanaAPI";

  import type { NewData, NewDataRes } from "~/types/NewData";
  import type { OverviewData, OverviewDataRes } from "~/types/OverviewData";
  import type { PositionData, PositionDataRes } from "~/types/PositionData";
  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";
  import type { NFTData, HoldingNFTRes } from "~/types/HoldingNFTData";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import Button from "~/components/Button.svelte";
  import Charts from "~/UI/Portfolio/Charts.svelte";
  import Holding from "~/UI/Portfolio/Holding.svelte";
  import News from "~/UI/Portfolio/News.svelte";
  import Overview from "~/UI/Portfolio/Overview.svelte";
  import Positions from "~/UI/Portfolio/Positions.svelte";
  import Testimonial from "~/UI/Testimonial/Testimonial.svelte";
  import Compare from "~/UI/Portfolio/Compare.svelte";
  import "~/components/Tooltip.custom.svelte";
  import RiskReturn from "~/UI/Portfolio/RiskReturn.svelte";

  import Reload from "~/assets/reload.svg";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytic: i18n("newtabPage.analytic", "Analytics"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    market: i18n("newtabPage.market", "Market"),
    settings: i18n("newtabPage.settings", "Settings"),
    overview: i18n("newtabPage.overview", "Overview"),
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
    data_updated: i18n("newtabPage.data-updated", "Data updated"),
    updating_data: i18n("newtabPage.updating-data", "Updating data"),
    search_placeholder: i18n("newtabPage.search-placeholder", "Search address"),
    missed_protocol: i18n(
      "newtabPage.missed-protocol",
      "Missing your protocol?"
    ),
  };

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let overviewData: OverviewData = {
    breakdownToken: [],
    breakdownNft: [],
    overview: {
      assets: 0,
      assetsChange: 0,
      change: "",
      claimable: 0,
      claimableChange: 0,
      debts: 0,
      debtsChange: 0,
      networth: 0,
      networthChange: 0,
      postionNetworth: 0,
      postionNetworthChange: 0,
    },
    portfolioChart: [],
    performance: [],
    updatedAt: "",
  };
  let newsData: NewData = [];
  let holdingTokenData: TokenData = [];
  let holdingNFTData: NFTData = [];
  let positionsData: PositionData = [];
  let overviewDataPerformance = {
    performance: [],
    portfolioChart: [],
  };
  let dataUpdatedTime;
  let isLoading = false;
  let isLoadingSync = false;
  let totalPositions = 0;
  let totalClaimable = 0;
  let totalAssets = 0;
  let isEmptyDataPie = false;
  let syncMsg = "";
  let loadingOverview = false;
  let loadingHoldingToken = false;
  let loadingHoldingNFT = false;
  let loadingPositions = false;
  let loadingNews = false;
  let dataPieChart = {
    token: {
      sumOrderBreakdownToken: 0,
      formatDataPieChartTopFiveToken: [],
      dataPieChartOrderBreakdownToken: [],
    },
    nft: {
      sumOrderBreakdownNft: 0,
      formatDataPieChartTopFiveNft: [],
      dataPieChartOrderBreakdownNft: [],
    },
  };

  let selectedTokenHolding = {
    data: [],
    select: [],
  };
  let selectedDataPieChart = {};

  const getOverview = async (isReload: boolean = false) => {
    isEmptyDataPie = false;
    try {
      const response: OverviewDataRes = await sendMessage("getOverview", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      if (selectedWallet === response?.address) {
        overviewData = response.result;

        if (
          overviewData?.breakdownToken?.length === 0
          // || overviewData?.breakdownNft?.length === 0
        ) {
          isEmptyDataPie = true;
        }

        // pie chart format data Token holding
        const sumToken = (overviewData?.breakdownToken || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const sortBreakdownToken = overviewData?.breakdownToken.sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });

        const topFiveBreakdownToken = sortBreakdownToken
          ?.slice(0, 5)
          .map((item) => {
            return {
              ...item,
              id: item.id || "N/A",
              symbol: item.symbol || "N/A",
              name: item.name || "N/A",
            };
          });

        const orderBreakdownToken = sortBreakdownToken?.slice(
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

        const formatDataPieChartTopFiveToken = topFiveBreakdownToken?.map(
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
              value_balance: Number(item.amount || item.balance),
            };
          }
        );

        // pie chart format data NFT holding
        const sumNft = (overviewData?.breakdownNft || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const sortBreakdownNft = overviewData?.breakdownNft?.sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });

        const topFiveBreakdownNft = sortBreakdownNft
          ?.slice(0, 5)
          .map((item) => {
            return {
              ...item,
              id: item.id || "N/A",
              name: item.collection.name || "N/A",
            };
          });

        const orderBreakdownNft = sortBreakdownNft?.slice(
          5,
          sortBreakdownNft.length
        );

        const sumOrderBreakdownNft = (orderBreakdownNft || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const dataPieChartOrderBreakdownNft = [
          {
            name: "Other NFT Collection",
            name_ratio: "Ratio",
            value: (sumOrderBreakdownNft / sumNft) * 100 || 0,
            name_value: "Value",
            value_value: sumOrderBreakdownNft,
            name_balance: "",
            value_balance: 0,
          },
        ];

        const formatDataPieChartTopFiveNft = topFiveBreakdownNft?.map(
          (item) => {
            return {
              name: item.collection.name || item.collection.symbol,
              name_ratio: "Ratio",
              value: (Number(item.value) / sumNft) * 100 || 0,
              name_value: "Value",
              value_value: Number(item.value),
              name_balance: "Balance",
              value_balance: Number(item.amount || item.balance),
            };
          }
        );

        dataPieChart = {
          token: {
            sumOrderBreakdownToken,
            formatDataPieChartTopFiveToken,
            dataPieChartOrderBreakdownToken,
          },
          nft: {
            sumOrderBreakdownNft,
            formatDataPieChartTopFiveNft,
            dataPieChartOrderBreakdownNft,
          },
        };

        overviewDataPerformance = {
          performance: overviewData?.performance,
          portfolioChart: overviewData?.portfolioChart,
        };

        return response;
      } else {
        return undefined;
      }
    } catch (e) {
      console.error("error: ", e);
      return undefined;
    }
  };

  const getPositions = async (isReload: boolean = false) => {
    try {
      const response: PositionDataRes = await sendMessage("getPositions", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });
      if (selectedWallet === response?.address && response && response.result) {
        const formatData = response.result.map((item) => {
          const groupPosition = groupBy(item.positions, "type");
          return {
            ...item,
            positions: groupPosition,
          };
        });
        positionsData = formatData;

        return response;
      } else {
        return undefined;
      }
    } catch (e) {
      console.error("error: ", e);
      return undefined;
    }
  };

  const getNews = async (isReload: boolean = false) => {
    try {
      const response: NewDataRes = await sendMessage("getNews", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });
      if (selectedWallet === response?.address) {
        newsData = response.result;
        return response;
      } else {
        return undefined;
      }
    } catch (e) {
      console.error("error: ", e);
      return undefined;
    }
  };

  const getHoldingToken = async (isReload: boolean = false) => {
    try {
      const response: HoldingTokenRes = await sendMessage("getHoldingToken", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      const responseVaults = await nimbus.get(
        `/v2/investment/${selectedWallet}/vaults?chain=${
          getAddressContext(selectedWallet)?.type === "SOL" ? "SOL" : ""
        }`
      );

      if (selectedWallet === response?.address) {
        const formatDataTokenHolding = response?.result.map((item) => {
          try {
            const regex = new RegExp(`(^${item?.symbol}|-${item?.symbol})`);
            const filteredVaults = responseVaults?.data?.filter((data) =>
              data.name.match(regex)
            );

            return {
              ...item,
              vaults: filteredVaults,
            };
          } catch (error) {
            return {
              ...item,
              vaults: [],
            };
          }
        });

        const formatData = formatDataTokenHolding.map((item) => {
          return {
            ...item,
            value:
              Number(item?.amount) * Number(item?.price?.price || item?.rate),
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

        return {
          ...response,
          result: formatDataTokenHolding,
        };
      } else {
        return undefined;
      }
    } catch (e) {
      console.error("error: ", e);
      return undefined;
    }
  };

  const getHoldingNFT = async (isReload: boolean = false) => {
    if (
      typeWalletAddress === "CEX" ||
      (typeWalletAddress === "DEX" &&
        getAddressContext(selectedWallet).type === "EVM")
    ) {
      return [];
    }
    try {
      const response: HoldingNFTRes = await sendMessage("getHoldingNFT", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      if (selectedWallet === response?.address) {
        holdingNFTData = response.result;
        return response;
      } else {
        return undefined;
      }
    } catch (e) {
      console.error("error: ", e);
      return undefined;
    }
  };

  const getSyncStatus = async () => {
    try {
      const response: any = await sendMessage("getSyncStatus", {
        address: selectedWallet,
        chain: selectedChain,
      });
      dataUpdatedTime = response?.data?.lastSync;
      return response;
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const handleGetAllData = async (type: string) => {
    loadingOverview = true;
    loadingHoldingToken = true;
    loadingHoldingNFT = true;
    loadingPositions = true;
    loadingNews = true;

    isLoading = true;
    isLoadingSync = false;
    try {
      if (type === "reload") {
        console.log("Going to full sync");
        await sendMessage("getSync", {
          address: selectedWallet,
          chain: selectedChain,
        });
      }

      let syncStatus = await getSyncStatus();
      if (isEmpty(syncStatus)) {
        // syncMsg = "Invalid address";
        isLoadingSync = true;
        return;
      }
      if (syncStatus?.data?.error) {
        syncMsg = syncStatus?.data?.error;
        isLoadingSync = true;
        if (!syncStatus?.data?.canWait) {
          // Cut call when we can not wait
          return;
        }
      }
      if (syncStatus?.error) {
        syncMsg = syncStatus?.error?.error;
        isLoadingSync = true;
        return;
      }
      if (!syncStatus?.data?.lastSync) {
        console.log("Going to full sync");
        await sendMessage("getSync", {
          address: selectedWallet,
          chain: selectedChain,
        });
      }

      while (true) {
        try {
          if (syncStatus?.data?.error) {
            syncMsg = syncStatus?.data?.error;
            isLoadingSync = true;
            if (!syncStatus?.data?.canWait) {
              // Cut call when we can not wait
              return;
            }
          }
          if (syncStatus?.data?.lastSync) {
            console.log("start load data");

            if (getAddressContext(selectedWallet)?.type === "SOL") {
              const [resOverview, resHoldingToken] = await Promise.all([
                handleGetSolHolding().then((res) => {
                  loadingOverview = false;
                  return res;
                }),
                handleGetSolOverview().then((res) => {
                  loadingHoldingToken = false;
                  return res;
                }),
              ]);

              if (
                (resOverview === undefined || resOverview) &&
                (resHoldingToken === undefined || resHoldingToken)
              ) {
                syncMsg = "";
                isLoading = false;
                isLoadingSync = false;
              }

              break;
            } else {
              const [
                resOverview,
                resHoldingToken,
                resHoldingNFT,
                // resPositions,
                // resNews,
              ] = await Promise.all([
                getOverview(type === "reload").then((res) => {
                  loadingOverview = false;
                  return res;
                }),
                getHoldingToken(type === "reload").then((res) => {
                  loadingHoldingToken = false;
                  return res;
                }),
                getHoldingNFT(type === "reload").then((res) => {
                  loadingHoldingNFT = false;
                  return res;
                }),
                // getPositions(type === "reload").then((res) => {
                //   loadingPositions = false;
                //   return res;
                // }),
                // getNews(type === "reload").then((res) => {
                //   loadingNews = false;
                //   return res;
                // }),
              ]);

              if (
                (resOverview === undefined || resOverview) &&
                (resHoldingToken === undefined || resHoldingToken) &&
                (resHoldingNFT === undefined || resHoldingNFT)
                //  && (resPositions === undefined || resPositions)
                //  && (resNews === undefined || resNews)
              ) {
                syncMsg = "";
                isLoading = false;
                isLoadingSync = false;
              }

              break;
            }
          } else {
            isLoadingSync = true;
            await wait(5000);
            syncStatus = await getSyncStatus();
          }
        } catch (e) {
          console.error(e.message);
          syncMsg = "";
          isLoading = false;
          loadingOverview = false;
          loadingHoldingToken = false;
          loadingHoldingNFT = false;
          loadingPositions = false;
          loadingNews = false;

          break;
        }
      }
    } catch (e) {
      console.error("error: ", e);
      isLoading = false;
    }
  };

  const handleGetSolHolding = async () => {
    try {
      const response = await getHoldingSOL(selectedWallet);
      if (response !== undefined) {
        const responseVaults = await nimbus.get(
          `/v2/investment/${selectedWallet}/vaults?chain=SOL`
        );

        const formatDataTokenHolding = response?.map((item) => {
          try {
            const regex = new RegExp(`(^${item?.symbol}|-${item?.symbol})`);
            const filteredVaults = responseVaults?.data?.filter((data) =>
              data.name.match(regex)
            );
            return {
              ...item,
              vaults: filteredVaults,
            };
          } catch (error) {
            return {
              ...item,
              vaults: [],
            };
          }
        });

        const formatData = formatDataTokenHolding?.map((item) => {
          return {
            ...item,
            value:
              Number(item?.amount) * Number(item?.price?.price || item?.rate),
          };
        });

        holdingTokenData = formatData?.sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });

        return {
          ...response,
          result: formatDataTokenHolding,
        };
      } else {
        handleGetAllData("reload");
      }
    } catch (e) {
      console.error("error: ", e);
      return undefined;
    }
  };

  const handleGetSolOverview = async () => {
    try {
      const response = await getOverviewSOL(selectedWallet);

      overviewData = response;

      if (overviewData?.breakdownToken?.length === 0) {
        isEmptyDataPie = true;
      }

      // pie chart format data Token holding
      const sumToken = (overviewData?.breakdownToken || []).reduce(
        (prev, item) => prev + Number(item.value),
        0
      );

      const sortBreakdownToken = overviewData?.breakdownToken?.sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

      const topFiveBreakdownToken = sortBreakdownToken
        ?.slice(0, 5)
        ?.map((item) => {
          return {
            ...item,
            id: item.id || "N/A",
            symbol: item.symbol || "N/A",
            name: item.name || "N/A",
          };
        });

      const orderBreakdownToken = sortBreakdownToken?.slice(
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

      const formatDataPieChartTopFiveToken = topFiveBreakdownToken?.map(
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
            value_balance: Number(item.amount || item.balance),
          };
        }
      );

      // pie chart format data NFT holding
      const sumNft = (overviewData?.breakdownNft || []).reduce(
        (prev, item) => prev + Number(item.value),
        0
      );

      const sortBreakdownNft = overviewData?.breakdownNft?.sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

      const topFiveBreakdownNft = sortBreakdownNft?.slice(0, 5).map((item) => {
        return {
          ...item,
          id: item.id || "N/A",
          name: item.collection.name || "N/A",
        };
      });

      const orderBreakdownNft = sortBreakdownNft?.slice(
        5,
        sortBreakdownNft.length
      );

      const sumOrderBreakdownNft = (orderBreakdownNft || []).reduce(
        (prev, item) => prev + Number(item.value),
        0
      );

      const dataPieChartOrderBreakdownNft = [
        {
          name: "Other NFT Collection",
          name_ratio: "Ratio",
          value: (sumOrderBreakdownNft / sumNft) * 100 || 0,
          name_value: "Value",
          value_value: sumOrderBreakdownNft,
          name_balance: "",
          value_balance: 0,
        },
      ];

      const formatDataPieChartTopFiveNft = topFiveBreakdownNft?.map((item) => {
        return {
          name: item.collection.name || item.collection.symbol,
          name_ratio: "Ratio",
          value: (Number(item.value) / sumNft) * 100 || 0,
          name_value: "Value",
          value_value: Number(item.value),
          name_balance: "Balance",
          value_balance: Number(item.amount || item.balance),
        };
      });

      dataPieChart = {
        token: {
          sumOrderBreakdownToken,
          formatDataPieChartTopFiveToken,
          dataPieChartOrderBreakdownToken,
        },
        nft: {
          sumOrderBreakdownNft,
          formatDataPieChartTopFiveNft,
          dataPieChartOrderBreakdownNft,
        },
      };

      return response;
    } catch (e) {
      console.error("e: ", e);
      return undefined;
    }
  };

  const handleSelectedTableTokenHolding = (data, selectDatPieChart) => {
    if (data.data && data.data.length !== 0) {
      selectedTokenHolding = data;
      selectedDataPieChart = selectDatPieChart;
    }
  };

  onMount(() => {
    initWS();
    mixpanel.track("portfolio_page", {
      address: selectedWallet,
    });
  });

  onDestroy(() => {
    disconnectWs();
  });

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet?.length !== 0 && selectedChain?.length !== 0) {
        overviewDataPerformance = {
          performance: [],
          portfolioChart: [],
        };
        selectedTokenHolding = {
          data: [],
          select: [],
        };
        selectedDataPieChart = {};
        dataPieChart = {
          token: {
            sumOrderBreakdownToken: 0,
            formatDataPieChartTopFiveToken: [],
            dataPieChartOrderBreakdownToken: [],
          },
          nft: {
            sumOrderBreakdownNft: 0,
            formatDataPieChartTopFiveNft: [],
            dataPieChartOrderBreakdownNft: [],
          },
        };
        overviewData = {
          breakdownToken: [],
          breakdownNft: [],
          overview: {
            assets: 0,
            assetsChange: 0,
            change: "",
            claimable: 0,
            claimableChange: 0,
            debts: 0,
            debtsChange: 0,
            networth: 0,
            networthChange: 0,
            postionNetworth: 0,
            postionNetworthChange: 0,
          },
          performance: [],
          portfolioChart: [],
          updatedAt: "",
        };
        positionsData = [];
        newsData = [];
        holdingNFTData = [];
        holdingTokenData = [];

        handleGetAllData("sync");
      }
    }
  }
</script>

<AddressManagement title={MultipleLang.overview}>
  <span slot="reload">
    <div class="flex items-center gap-2 mb-1">
      <div
        class="cursor-pointer"
        class:loading={isLoading}
        on:click={() => {
          handleGetAllData("reload");
          mixpanel.track("user_reload");
        }}
      >
        <img src={Reload} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
      </div>
      <div class="xl:text-xs text-lg text-white font-medium">
        {#if isLoading}
          {MultipleLang.updating_data}
        {:else}
          {MultipleLang.data_updated}
          {dayjs(dataUpdatedTime).fromNow()}
        {/if}
      </div>
    </div>
  </span>
  <span slot="overview">
    {#if !isLoadingSync}
      <Overview
        data={overviewData}
        {totalPositions}
        {totalClaimable}
        {totalAssets}
      />
    {/if}
  </span>
  <span slot="body">
    <div class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] -mt-26">
      {#if isLoadingSync}
        <div
          class="portfolio_container text-xl font-medium flex flex-col gap-5 justify-center items-center rounded-[20px] p-6 h-screen"
        >
          {syncMsg}
          {#if syncMsg !== "Invalid address"}
            <Testimonial />
          {/if}
        </div>
      {:else}
        <div
          class="portfolio_container flex flex-col gap-7 rounded-[20px] xl:p-8 p-6"
        >
          <Charts
            {handleSelectedTableTokenHolding}
            isLoading={loadingOverview}
            {holdingTokenData}
            {overviewDataPerformance}
            {dataPieChart}
            {isEmptyDataPie}
          />

          {#if getAddressContext(selectedWallet)?.type === "EVM" || typeWalletAddress === "CEX"}
            <RiskReturn />
          {/if}

          <Holding
            {selectedWallet}
            isLoadingNFT={loadingHoldingNFT}
            isLoadingToken={loadingHoldingToken}
            {holdingTokenData}
            {selectedTokenHolding}
            {selectedDataPieChart}
            {holdingNFTData}
            bind:totalAssets
          />

          <!-- <News isLoading={loadingNews} data={newsData} /> -->
        </div>
      {/if}
    </div>
  </span>
</AddressManagement>

<style>
  .loading {
    animation-name: loading;
    animation-duration: 1.4s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  @keyframes loading {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  :global(body) .portfolio_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .portfolio_container {
    background: #0f0f0f;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 1);
  }
</style>
