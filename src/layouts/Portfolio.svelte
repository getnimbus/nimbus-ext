<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { groupBy, isEmpty } from "lodash";
  import { onDestroy, onMount } from "svelte";
  import { Motion } from "svelte-motion";
  import { sendMessage } from "webext-bridge";
  import { i18n } from "~/lib/i18n";
  import { disconnectWs, initWS } from "~/lib/price-ws";
  import {
    formatBalance,
    formatCurrency,
    showChatAnimationVariants,
  } from "~/utils";
  import { wait } from "../entries/background/utils";
  import { isOpenReport, wallet, chain } from "~/store";
  import mixpanel from "mixpanel-browser";

  import type { NewData, NewDataRes } from "~/types/NewData";
  import type { OverviewData, OverviewDataRes } from "~/types/OverviewData";
  import type { PositionData, PositionDataRes } from "~/types/PositionData";
  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";
  import type { NFTData, HoldingNFTRes } from "~/types/HoldingNFTData";

  import Button from "~/components/Button.svelte";
  import Charts from "~/UI/Portfolio/Charts.svelte";
  import Holding from "~/UI/Portfolio/Holding.svelte";
  import News from "~/UI/Portfolio/News.svelte";
  import Overview from "~/UI/Portfolio/Overview.svelte";
  import Positions from "~/UI/Portfolio/Positions.svelte";
  import AddressManagement from "~/components/AddressManagement.svelte";
  import Testimonial from "~/UI/Testimonial/Testimonial.svelte";
  import "~/components/Tooltip.custom.svelte";

  import Comment from "~/assets/comment-bubble-icon.svg";
  import Reload from "~/assets/reload.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytic: i18n("newtabPage.analytic", "Analytic"),
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
    search_placeholder: i18n("newtabPage.search-placeholder", "Search"),
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
    performance: [],
    updatedAt: "",
  };
  let newsData: NewData = [];
  let holdingTokenData: TokenData = [];
  let holdingNFTData: NFTData = [];
  let positionsData: PositionData = [];
  let dataUpdatedTime;
  let isLoading = false;
  let isLoadingSync = false;
  let isShowChat = false;
  isOpenReport.subscribe((value) => {
    isShowChat = value;
  });
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
  let optionLine = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: #000;">
                    <span>${item?.marker}</span>
                    ${item?.seriesName}
                  </div>

                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                      item.value >= 0 ? "#05a878" : "#f25f5d"
                    };">
                      ${formatCurrency(Math.abs(item.value))}%
                      <img
                        src=${item.value >= 0 ? TrendUp : TrendDown} 
                        alt=""
                        style="margin-bottom: 4px;"
                      />
                    </div>
                  </div>
                </div>
                `;
                })
                .join("")}
            </div>`;
      },
    },
    legend: {
      lineStyle: {
        type: "solid",
      },
      data: [],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%",
      },
    },
    series: [],
  };
  let dataPieChart = {
    token: {
      sumOrderBreakdownToken: 0,
      formatDataPieChartTopFourToken: [],
      dataPieChartOrderBreakdownToken: [],
    },
    nft: {
      sumOrderBreakdownNft: 0,
      formatDataPieChartTopFourNft: [],
      dataPieChartOrderBreakdownNft: [],
    },
  };

  const getOverview = async (isReload: boolean = false) => {
    isEmptyDataPie = false;
    try {
      const response: OverviewDataRes = await sendMessage("getOverview", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      if (selectedWallet === response.address) {
        overviewData = response.result;

        if (
          overviewData?.breakdownToken.length === 0 ||
          overviewData?.breakdownNft.length === 0
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

        const topFourBreakdownToken = sortBreakdownToken
          .slice(0, 4)
          .map((item) => {
            return {
              ...item,
              id: item.id || "N/A",
              symbol: item.symbol || "N/A",
              name: item.name || "N/A",
            };
          });

        const orderBreakdownToken = sortBreakdownToken.slice(
          4,
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

        const formatDataPieChartTopFourToken = topFourBreakdownToken.map(
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

        // pie chart format data NFT holding
        const sumNft = (overviewData?.breakdownNft || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const sortBreakdownNft = overviewData?.breakdownNft.sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });

        const topFourBreakdownNft = sortBreakdownNft.slice(0, 4).map((item) => {
          return {
            ...item,
            id: item.id || "N/A",
            name: item.collection.name || "N/A",
          };
        });

        const orderBreakdownNft = sortBreakdownNft.slice(
          4,
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

        const formatDataPieChartTopFourNft = topFourBreakdownNft.map((item) => {
          return {
            name: item.collection.name || item.collection.symbol,
            name_ratio: "Ratio",
            value: (Number(item.value) / sumNft) * 100 || 0,
            name_value: "Value",
            value_value: Number(item.value),
            name_balance: "Balance",
            value_balance: Number(item.amount),
          };
        });

        dataPieChart = {
          token: {
            sumOrderBreakdownToken,
            formatDataPieChartTopFourToken,
            dataPieChartOrderBreakdownToken,
          },
          nft: {
            sumOrderBreakdownNft,
            formatDataPieChartTopFourNft,
            dataPieChartOrderBreakdownNft,
          },
        };

        // line chart format data
        const formatXAxis = overviewData?.performance.map((item) => {
          return dayjs(item.date).format("DD MMM YYYY");
        });

        const formatDataPortfolio = overviewData?.performance.map((item) => {
          return {
            value: item.portfolio,
            itemStyle: {
              color: "#00b580",
            },
          };
        });

        const formatDataETH = overviewData?.performance.map((item) => {
          return {
            value: item.eth,
            itemStyle: {
              color: "#547fef",
            },
          };
        });

        const formatDataBTC = overviewData?.performance.map((item) => {
          return {
            value: item.btc,
            itemStyle: {
              color: "#f7931a",
            },
          };
        });

        optionLine = {
          ...optionLine,
          legend: {
            ...optionLine.legend,
            data: [
              {
                name: "Your Portfolio",
                itemStyle: {
                  color: "#00b580",
                },
              },
              {
                name: "Bitcoin",
                itemStyle: {
                  color: "#f7931a",
                },
              },
              {
                name: "Ethereum",
                itemStyle: {
                  color: "#547fef",
                },
              },
            ],
          },
          xAxis: {
            ...optionLine.xAxis,
            data: formatXAxis,
          },
          series: [
            {
              name: "Your Portfolio",
              type: "line",
              lineStyle: {
                type: "solid",
                color: "#00b580",
              },
              data: formatDataPortfolio,
            },
            {
              name: "Bitcoin",
              type: "line",
              lineStyle: {
                type: "dashed",
                color: "#f7931a",
              },
              data: formatDataBTC,
            },
            {
              name: "Ethereum",
              type: "line",
              lineStyle: {
                type: "dashed",
                color: "#547fef",
              },
              data: formatDataETH,
            },
          ],
        };

        return response;
      } else {
        // console.log("response: ", response)
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getPositions = async (isReload: boolean = false) => {
    try {
      const response: PositionDataRes = await sendMessage("getPositions", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });
      if (selectedWallet === response.address && response && response.result) {
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

      if (selectedWallet === response.address) {
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

  const getHoldingNFT = async (isReload: boolean = false) => {
    try {
      const response: HoldingNFTRes = await sendMessage("getHoldingNFT", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      if (selectedWallet === response.address) {
        holdingNFTData = response.result;
        return response;
      } else {
        // console.log("response: ", response)
      }
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getNews = async (isReload: boolean = false) => {
    try {
      const response: NewDataRes = await sendMessage("getNews", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });
      if (selectedWallet === response.address) {
        newsData = response.result;
        return response;
      } else {
        // console.log("response: ", response)
      }
    } catch (e) {
      console.log("error: ", e);
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
      console.log("e: ", e);
    }
  };

  const handleGetAllData = async (type: string) => {
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
      updatedAt: "",
    };
    positionsData = [];
    newsData = [];
    holdingNFTData = [];
    holdingTokenData = [];
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
        syncMsg = syncStatus?.error;
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
            const [
              resOverview,
              resHoldingToken,
              resHoldingNFT,
              resPositions,
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
              getPositions(type === "reload").then((res) => {
                loadingPositions = false;
                return res;
              }),
              // getNews(type === "reload").then((res) => {
              //   loadingNews = false;
              //   return res;
              // }),
            ]);

            if (
              resOverview &&
              resHoldingToken &&
              resHoldingNFT &&
              (resPositions === undefined || resPositions)
            ) {
              syncMsg = "";
              isLoading = false;
              isLoadingSync = false;
            }

            break;
          } else {
            isLoadingSync = true;
            await wait(5000);
            syncStatus = await getSyncStatus();
          }
        } catch (e) {
          console.log(e.message);
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
      console.log("error: ", e);
      isLoading = false;
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
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
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
        <img src={Reload} alt="" />
      </div>
      <div class="text-xs text-white font-medium">
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
    <div class="max-w-[2000px] m-auto w-[90%] -mt-26">
      {#if isLoadingSync}
        <div
          class="bg-white text-xl font-medium flex flex-col gap-5 justify-center items-center border border-[#0000001a] rounded-[20px] p-6 h-screen"
        >
          {syncMsg}
          {#if syncMsg !== "Invalid address"}
            <Testimonial />
          {/if}
        </div>
      {:else}
        <div
          class="flex flex-col gap-7 bg-white rounded-[20px] p-8"
          style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
        >
          <Charts
            isLoading={loadingOverview}
            {optionLine}
            {dataPieChart}
            {isEmptyDataPie}
          />

          <Holding
            {selectedWallet}
            isLoadingNFT={loadingHoldingNFT}
            isLoadingToken={loadingHoldingToken}
            {holdingTokenData}
            {holdingNFTData}
            bind:totalAssets
          />

          <div
            class="border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-4"
          >
            <Positions
              isLoading={loadingPositions}
              data={positionsData}
              bind:totalPositions
              bind:totalClaimable
            />
            <div
              on:click={() => {
                isOpenReport.update((n) => (n = true));
              }}
              class="mx-auto"
            >
              <Button variant="secondary">{MultipleLang.missed_protocol}</Button
              >
            </div>
          </div>

          <!-- <News isLoading={loadingNews} data={newsData} /> -->
        </div>
      {/if}
    </div>

    {#if APP_TYPE.TYPE === "EXT"}
      <div class="sticky bottom-4 flex justify-end pr-4">
        <div
          class="p-4 w-[52px] h-[52px] rounded-full bg-[#27326F] cursor-pointer"
          style="box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);"
          on:click={() => {
            isOpenReport.update((n) => (n = !n));
          }}
        >
          <img src={Comment} alt="cmt" width="20" height="20" />
        </div>
        <Motion
          initial="hidden"
          animate={isShowChat ? "visible" : "hidden"}
          variants={showChatAnimationVariants}
          let:motion
        >
          <div
            class="h-[630px] w-[430px] absolute right-4 bottom-15 p-4 bg-white rounded-[20px] items-end"
            style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
            use:motion
          >
            <iframe
              id="feedback-board"
              src="https://nimbus.featurebase.app"
              class="h-[580px] w-full"
            />
            <div
              class="absolute top-3 right-5 cursor-pointer font-medium"
              on:click={() => {
                isOpenReport.update((n) => (n = false));
              }}
            >
              Close
            </div>
          </div>
        </Motion>
      </div>
    {/if}
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
</style>
