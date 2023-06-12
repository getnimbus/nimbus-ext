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
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import { disconnectWs, initWS } from "~/lib/price-ws";
  import {
    chainList,
    formatBalance,
    formatCurrency,
    getAddressContext,
    showChatAnimationVariants,
  } from "~/utils";
  import { wait } from "../../entries/background/utils";
  import { isOpenReport, wallet } from "~/store";

  import type { AddressData } from "~/types/AddressData";
  import type { NewData, NewDataRes } from "~/types/NewData";
  import type { OverviewData, OverviewDataRes } from "~/types/OverviewData";
  import type { PositionData, PositionDataRes } from "~/types/PositionData";
  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";
  import type { NFTData, HoldingNFTRes } from "~/types/HoldingNFTData";

  import Button from "~/components/Button.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";
  import Charts from "~/components/PortfolioSections/Charts.svelte";
  import Holding from "~/components/PortfolioSections/Holding.svelte";
  import News from "~/components/PortfolioSections/News.svelte";
  import Overview from "~/components/PortfolioSections/Overview.svelte";
  import Positions from "~/components/PortfolioSections/Positions.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Select from "~/components/Select.svelte";
  import "~/components/Tooltip.custom.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import Comment from "~/assets/comment-bubble-icon.svg";
  import Plus from "~/assets/plus.svg";
  import Reload from "~/assets/reload.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import TrendUp from "~/assets/trend-up.svg";
  import EthereumLogo from "~/assets/ethereum.png";
  import BitcoinLogo from "~/assets/bitcoin.png";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytic: i18n("newtabPage.analytic", "Analytic"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    market: i18n("newtabPage.market", "Market"),
    settings: i18n("newtabPage.settings", "Settings"),
    overview: i18n("newtabPage.overview", "Overview"),
    empty_wallet: i18n("newtabPage.empty-wallet", "No wallet added yet."),
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
    addwallet: i18n(
      "newtabPage.addwallet",
      "Add your wallet to keep track of your investments."
    ),
    content: {
      btn_text: i18n(
        "optionsPage.accounts-page-content.address-btn-text",
        "Add Wallet"
      ),
      modal_cancel: i18n(
        "optionsPage.accounts-page-content.modal-cancel",
        "Cancel"
      ),
      modal_add: i18n(
        "optionsPage.accounts-page-content.modal-add-wallet",
        "Add"
      ),
      modal_address_label: i18n(
        "optionsPage.accounts-page-content.modal-address-label",
        "Wallet"
      ),
      modal_label_label: i18n(
        "optionsPage.accounts-page-content.modal-label-label",
        "Label"
      ),
      modal_add_title: i18n(
        "optionsPage.accounts-page-content.modal-add-title",
        "Add Your Wallet"
      ),
      modal_add_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-add-sub-title",
        "Add your wallet will give you more option to see the information at page new tab"
      ),
      address_required: i18n(
        "optionsPage.accounts-page-content.address-required",
        "Address is required"
      ),
      label_required: i18n(
        "optionsPage.accounts-page-content.label-required",
        "Label is required"
      ),
      re_input_address: i18n(
        "optionsPage.accounts-page-content.re-input-address",
        "Please enter your wallet address again!"
      ),
      duplicate_address: i18n(
        "optionsPage.accounts-page-content.duplicate-address",
        "This wallet address is duplicated!"
      ),
    },
  };

  let selectedWallet: any = {};
  wallet.subscribe((value) => {
    selectedWallet = value;
  });
  let overviewData: OverviewData = {
    breakdownToken: [],
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
  let listAddress = [];
  let isOpenAddModal = false;
  let errors: any = {};
  let headerScrollY = false;
  let address = "";
  let label = "";
  let isLoading = false;
  let isLoadingSync = false;
  let isLoadingFullPage = false;
  let isShowChat = false;
  isOpenReport.subscribe((value) => {
    isShowChat = value;
  });
  let showDisableAddWallet = false;
  let showFollowTooltip = false;
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
  let optionPie = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
      extraCssText: "z-index: 9997",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 190px;">
              <div style="display: flex; align-items: centers; gap: 4px">
                <img src=${
                  params.data.logo
                } alt="" width=20 height=20 style="border-radius: 100%" /> 
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                  ${params.name} ${
          params.data.symbol ? `(${params.data.symbol})` : ""
        }
                </div>
              </div>
              ${
                params.data.name_balance
                  ? `<div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_balance]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatCurrency(params.data.value_balance)}</div>
              </div>`
                  : ""
              }
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_value]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  $${formatBalance(params.data.value_value)}</div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_ratio]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatBalance(params.value)}%
                </div>
              </div>
            </div>`;
      },
    },
    legend: {
      orient: "vertical",
      right: "right",
      bottom: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "60%"],
        left: -250,
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
  };
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
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[0].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[0].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                  ${formatCurrency(Math.abs(params[0].value))}%
                  <img
                    src=${params[0].value >= 0 ? TrendUp : TrendDown} 
                    alt=""
                    style="margin-bottom: 4px;"
                  />
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #f7931a; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[1].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[1].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                  ${formatCurrency(Math.abs(params[1].value))}%
                  <img
                    src=${params[1].value >= 0 ? TrendUp : TrendDown} 
                    alt=""
                    style="margin-bottom: 4px;"
                  />
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #547fef; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[2].seriesName}
                </div>
                <div style="display:flex; justify-content: center; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[2].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                  ${formatCurrency(Math.abs(params[2].value))}%
                  <img
                    src=${params[2].value >= 0 ? TrendUp : TrendDown} 
                    alt=""
                    style="margin-bottom: 4px;"
                  />
                </div>
              </div>
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

  const getOverview = async (isReload: boolean = false) => {
    isEmptyDataPie = false;
    try {
      const response: OverviewDataRes = await sendMessage("getOverview", {
        address: selectedWallet.value,
        reload: isReload,
        chain: selectedChain.value,
      });

      if (selectedWallet.value === response.address) {
        overviewData = response.result;

        if (overviewData?.breakdownToken.length === 0) {
          isEmptyDataPie = true;
        }

        const sum = (overviewData?.breakdownToken || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const sortBreakdown = overviewData?.breakdownToken.sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });

        const topFourBreakdown = sortBreakdown.slice(0, 4).map((item) => {
          return {
            ...item,
            id: item.id || "N/A",
            symbol: item.symbol || "N/A",
            name: item.name || "N/A",
          };
        });
        const orderBreakdown = sortBreakdown.slice(4, sortBreakdown.length);

        const sumOrderBreakdown = (orderBreakdown || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const dataPieChartOrderBreakdown = [
          {
            logo: "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
            name: "Other tokens",
            symbol: "",
            name_ratio: "Ratio",
            value: (sumOrderBreakdown / sum) * 100,
            name_value: "Value",
            value_value: sumOrderBreakdown,
            name_balance: "",
            value_balance: 0,
          },
        ];

        const formatDataPieChartTopFour = topFourBreakdown.map((item) => {
          return {
            logo: item.logo,
            name: item.name || item.symbol,
            symbol: item.symbol,
            name_ratio: "Ratio",
            value: (Number(item.value) / sum) * 100,
            name_value: "Value",
            value_value: Number(item.value),
            name_balance: "Balance",
            value_balance: Number(item.amount),
          };
        });

        optionPie = {
          ...optionPie,
          series: [
            {
              ...optionPie.series[0],
              data:
                sumOrderBreakdown > 0
                  ? formatDataPieChartTopFour.concat(dataPieChartOrderBreakdown)
                  : formatDataPieChartTopFour,
            },
          ],
        };

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
        address: selectedWallet.value,
        reload: isReload,
        chain: selectedChain.value,
      });
      if (
        selectedWallet.value === response.address &&
        response &&
        response.result
      ) {
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
        address: selectedWallet.value,
        reload: isReload,
        chain: selectedChain.value,
      });

      if (selectedWallet.value === response.address) {
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
        address: selectedWallet.value,
        reload: isReload,
        chain: selectedChain.value,
      });

      if (selectedWallet.value === response.address) {
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
        address: selectedWallet.value,
        reload: isReload,
        chain: selectedChain.value,
      });
      if (selectedWallet.value === response.address) {
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
        address: selectedWallet.value,
        chain: selectedChain.value,
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
          address: selectedWallet.value,
          chain: selectedChain.value,
        });
      }

      let syncStatus = await getSyncStatus();
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
          address: selectedWallet.value,
          chain: selectedChain.value,
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

  const getListAddress = async () => {
    isLoadingFullPage = true;
    console.log("Start get list address");
    try {
      const response: AddressData = await sendMessage(
        "getListAddress",
        undefined
      );

      const structWalletData = (response || []).map((item) => {
        return {
          id: item.id,
          label: item.label,
          value: item.address,
        };
      });

      listAddress = listAddress.concat(structWalletData);

      const selectedWalletRes = await browser.storage.sync.get(
        "selectedWallet"
      );

      if (
        selectedWalletRes &&
        !isEmpty(JSON.parse(selectedWalletRes.selectedWallet))
      ) {
        wallet.update(
          (n) => (n = JSON.parse(selectedWalletRes.selectedWallet))
        );
      }

      if (
        selectedWalletRes &&
        isEmpty(JSON.parse(selectedWalletRes.selectedWallet)) &&
        listAddress.length
      ) {
        wallet.update((n) => (n = listAddress[0]));
      }

      const urlParams = new URLSearchParams(window.location.search);
      const addressParams = urlParams.get("address");
      if (addressParams) {
        wallet.update(
          (n) =>
            (n = {
              id: addressParams,
              logo: "",
              label: "",
              value: addressParams,
            })
        );
      }
      if (!addressParams && selectedWallet && listAddress.length === 0) {
        wallet.update((n) => (n = {}));
      }

      isLoadingFullPage = false;
    } catch (error) {
      console.log(error);
      isLoadingFullPage = false;
    }
  };

  onMount(() => {
    getListAddress();
    initWS();

    const lastScrollY = window.pageYOffset;
    const handleCheckIsSticky = () => {
      const scrollY = window.pageYOffset;
      headerScrollY = scrollY > lastScrollY;
    };
    window.addEventListener("scroll", handleCheckIsSticky);
    return () => {
      window.removeEventListener("scroll", handleCheckIsSticky);
    };
  });

  onDestroy(() => {
    disconnectWs();
  });

  // handle add wallet
  const isRequiredFieldValid = (value) => {
    return value != null && value !== "";
  };

  const validateForm = (data) => {
    const isDuplicatedAddress = listAddress.some((item) => {
      return item.value === data.address;
    });

    if (!isRequiredFieldValid(data.address)) {
      errors["address"] = {
        ...errors["address"],
        required: true,
        msg: MultipleLang.content.address_required,
      };
    } else {
      if (data.address && !getAddressContext(data.address)) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: MultipleLang.content.re_input_address,
        };
        return;
      } else if (isDuplicatedAddress) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: MultipleLang.content.duplicate_address,
        };
        return;
      } else {
        errors["address"] = { ...errors["address"], required: false };
      }
    }

    if (!isRequiredFieldValid(data.label)) {
      errors["label"] = {
        ...errors["label"],
        required: true,
        msg: MultipleLang.content.label_required,
      };
    } else {
      errors["label"] = { ...errors["label"], required: false };
    }
  };

  const onSubmit = (e) => {
    const formData = new FormData(e.target);

    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    validateForm(data);

    if (
      !Object.keys(errors).some((inputName) => errors[inputName]["required"])
    ) {
      const dataFormat = {
        id: data.address,
        label: data.label,
        value: data.address,
      };

      const addWallet = [...listAddress, dataFormat];
      listAddress = addWallet;

      if (addWallet.length === 1) {
        wallet.update((n) => (n = listAddress[0]));
      }

      const filterWalletList = addWallet.filter((item) => item.value !== "all");
      const structWalletList = filterWalletList.map((item) => {
        return {
          id: item.value,
          logo: item.logo,
          label: item.label,
          address: item.value,
        };
      });

      browser.storage.sync
        .set({ listAddress: JSON.stringify(structWalletList) })
        .then(() => {
          console.log("save address to sync storage");
        });

      // sendMessage("getSync", { address: dataFormat.value }); // Auto call sync when we add wallet?

      e.target.reset();
      isOpenAddModal = false;
    } else {
      console.log("Invalid Form");
    }
  };

  let formatChainList = [];
  let selectedChain = chainList[0];

  $: {
    if (
      address &&
      errors.address &&
      errors.address.msg === MultipleLang.content.address_required
    ) {
      errors["address"] = { ...errors["address"], required: false, msg: "" };
    }
    if (
      label &&
      errors.label &&
      errors.label.msg === MultipleLang.content.label_required
    ) {
      errors["label"] = { ...errors["label"], required: false, msg: "" };
    }
  }

  $: {
    if (
      selectedWallet !== undefined &&
      Object.keys(selectedWallet).length !== 0
    ) {
      browser.storage.sync
        .set({ selectedWallet: JSON.stringify(selectedWallet) })
        .then(() => {
          console.log("save selected address to sync storage");
        });
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?address=${selectedWallet.value}`
      );
      handleGetAllData("sync");
    }
  }

  $: formatListAddress = listAddress.map((item) => {
    return {
      ...item,
      logo:
        getAddressContext(item.value).type === "EVM"
          ? EthereumLogo
          : BitcoinLogo,
    };
  });

  $: {
    if (selectedWallet) {
      switch (getAddressContext(selectedWallet.value)?.type) {
        case "EVM":
          formatChainList = chainList.filter(
            (item) =>
              item.value === "ALL" ||
              item.value === "ETH" ||
              item.value === "GNOSIS" ||
              item.value === "BNB" ||
              item.value === "POLYGON" ||
              item.value === "SOLANA" ||
              item.value === "ARBITRUM"
          );
          break;
        case "BTC":
          formatChainList = chainList.filter((item) => item.value === "BTC");
          break;
        default:
          formatChainList = chainList;
      }
    }
  }
</script>

<ErrorBoundary>
  {#if isLoadingFullPage}
    <div class="flex items-center justify-center h-screen">
      <loading-icon />
    </div>
  {:else}
    <div>
      {#if formatListAddress.length === 0 && Object.keys(selectedWallet).length === 0}
        <div class="flex justify-center items-center h-screen">
          <div
            class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center"
          >
            <div class="text-lg">
              {MultipleLang.addwallet}
            </div>
            <Button
              variant="tertiary"
              width={136}
              on:click={() => (isOpenAddModal = true)}
            >
              <img src={Plus} alt="" width="12" height="12" />
              <div class="text-base font-medium text-white">
                {MultipleLang.content.btn_text}
              </div>
            </Button>
          </div>
        </div>
      {:else}
        <div class="header-container">
          <div class="flex flex-col max-w-[2000px] m-auto w-[82%]">
            <div class="flex flex-col gap-14 mb-5">
              <div class="flex justify-between items-center">
                {#if formatListAddress.length !== 0}
                  <div class="flex items-center gap-5">
                    {#if formatListAddress.length > 4}
                      {#each formatListAddress.slice(0, 4) as item}
                        <div
                          id={item.value}
                          class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                            item.value === selectedWallet?.value &&
                            "bg-[#ffffff1c]"
                          }`}
                          class:hover:no-underline={item.value ===
                            selectedWallet?.value}
                          on:click={() => {
                            wallet.update((n) => (n = item));
                          }}
                        >
                          <img
                            src={item.logo}
                            alt="logo"
                            width="16"
                            height="16"
                          />
                          {item.label}
                        </div>
                      {/each}
                      <Select
                        isOptionsPage={true}
                        isSelectWallet={true}
                        listSelect={formatListAddress.slice(
                          4,
                          formatListAddress.length
                        )}
                        bind:selected={selectedWallet}
                      />
                    {:else}
                      {#each formatListAddress as item}
                        <div
                          id={item.value}
                          class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                            item.value === selectedWallet?.value &&
                            "bg-[#ffffff1c]"
                          }`}
                          class:hover:no-underline={item.value ===
                            selectedWallet?.value}
                          on:click={() => {
                            wallet.update((n) => (n = item));
                          }}
                        >
                          <img
                            src={item.logo}
                            alt="logo"
                            width="16"
                            height="16"
                          />
                          {item.label}
                        </div>
                      {/each}
                    {/if}
                  </div>
                {:else}
                  <div class="text-white text-base font-semibold">
                    {MultipleLang.empty_wallet}
                  </div>
                {/if}
                <div
                  class="relative"
                  on:mouseenter={() => {
                    if (
                      APP_TYPE.TYPE !== "EXT" &&
                      formatListAddress.length === 3
                    ) {
                      showDisableAddWallet = true;
                    }
                  }}
                  on:mouseleave={() => {
                    if (
                      APP_TYPE.TYPE !== "EXT" &&
                      formatListAddress.length === 3
                    ) {
                      showDisableAddWallet = false;
                    }
                  }}
                >
                  <Button
                    variant={APP_TYPE.TYPE !== "EXT" &&
                    formatListAddress.length === 3
                      ? "disabled"
                      : "tertiary"}
                    width={136}
                    on:click={() => {
                      if (
                        APP_TYPE.TYPE !== "EXT" &&
                        formatListAddress.length === 3
                      ) {
                        window.open("https://getnimbus.io", "_blank");
                      } else {
                        isOpenAddModal = true;
                      }
                    }}
                  >
                    <img src={Plus} alt="" width="12" height="12" />
                    <div class="text-base font-medium text-white">
                      {MultipleLang.content.btn_text}
                    </div>
                  </Button>
                  {#if showDisableAddWallet}
                    <div
                      class="absolute -top-8 left-1/2 transform -translate-x-1/2"
                      style="z-index: 2147483648;"
                    >
                      <tooltip-detail
                        text={"Install our extension to add more wallet"}
                      />
                    </div>
                  {/if}
                </div>
              </div>

              {#if !isLoadingSync}
                <div class="flex justify-between items-end">
                  <div class="flex flex-col gap-3">
                    <div class="flex items-end gap-6">
                      <div class="text-5xl text-white font-semibold">
                        {MultipleLang.overview}
                      </div>
                      <div class="flex items-center gap-2 mb-1">
                        <div
                          class="cursor-pointer"
                          class:loading={isLoading}
                          on:click={() => handleGetAllData("reload")}
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
                    </div>
                    <div class="flex items-center gap-4">
                      <div class="text-base">
                        <CopyToClipboard
                          address={selectedWallet.value}
                          iconColor="#fff"
                          color="#fff"
                        />
                      </div>
                      <div
                        class="relative"
                        on:mouseenter={() => {
                          showFollowTooltip = true;
                        }}
                        on:mouseleave={() => {
                          showFollowTooltip = false;
                        }}
                      >
                        <a
                          href="https://forms.gle/UdUbaEevMYLp4SFK8"
                          target="_blank"
                        >
                          <Button
                            variant="secondary"
                            width={140}
                            size="supper-small">Follow this whale 🐳</Button
                          >
                        </a>
                        {#if showFollowTooltip}
                          <div
                            class="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            style="z-index: 2147483648;"
                          >
                            <tooltip-detail
                              text={"Alert me when it makes a move"}
                            />
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                  <Select
                    isOptionsPage={false}
                    isSelectWallet={false}
                    listSelect={formatChainList}
                    bind:selected={selectedChain}
                  />
                </div>
              {/if}
            </div>
            {#if !isLoadingSync}
              <Overview
                data={overviewData}
                {totalPositions}
                {totalClaimable}
                {totalAssets}
                isLoading={loadingOverview &&
                  loadingPositions &&
                  loadingHoldingToken &&
                  loadingHoldingNFT}
              />
            {/if}
          </div>
        </div>
        <div class="max-w-[2000px] m-auto w-[90%] -mt-26">
          {#if isLoadingSync}
            <div
              class="bg-white text-xl font-medium flex flex-col gap-5 justify-center items-center border border-[#0000001a] rounded-[20px] p-6 h-screen"
            >
              {syncMsg}
              {#if syncMsg !== "Invalid address"}
                <loading-icon />
              {/if}
            </div>
          {:else}
            <div
              class="flex flex-col gap-7 bg-white rounded-[20px] p-8"
              style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
            >
              <Charts
                isLoading={loadingOverview}
                {optionPie}
                {optionLine}
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
                  <Button variant="secondary"
                    >{MultipleLang.missed_protocol}</Button
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
                <!-- src="https://embed-609567819.sleekplan.app/?style=intercom#" -->
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
      {/if}
    </div>
  {/if}
  <AppOverlay isOpen={isOpenAddModal} on:close={() => (isOpenAddModal = false)}>
    <div class="title-3 text-gray-600 font-semibold max-w-[530px]">
      {MultipleLang.content.modal_add_title}
    </div>
    <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-3 mt-4">
      <div class="flex flex-col gap-1 w-[530px]">
        <div class="flex flex-col gap-1">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              address ? "bg-[#F0F2F7]" : ""
            }`}
            class:input-border-error={errors.address && errors.address.required}
          >
            <div class="text-xs text-[#666666] font-medium">
              {MultipleLang.content.modal_address_label}
            </div>
            <input
              type="text"
              id="address"
              name="address"
              placeholder={MultipleLang.content.modal_address_label}
              value=""
              class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B] ${
                address ? "bg-[#F0F2F7]" : ""
              }
              `}
              on:keyup={({ target: { value } }) => (address = value)}
            />
          </div>
          {#if errors.address && errors.address.required}
            <div class="text-red-500">
              {errors.address.msg}
            </div>
          {/if}
        </div>
      </div>
      <div class="flex flex-col gap-1 w-[530px]">
        <div class="flex flex-col gap-1">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              label ? "bg-[#F0F2F7]" : ""
            }`}
            class:input-border-error={errors.label && errors.label.required}
          >
            <div class="text-xs text-[#666666] font-medium">
              {MultipleLang.content.modal_label_label}
            </div>
            <input
              type="text"
              id="label"
              name="label"
              placeholder={MultipleLang.content.modal_label_label}
              value=""
              class={`p-0 border-none focus:outline-none focus:ring-0 text-sm font-normal text-[#5E656B] placeholder-[#5E656B] ${
                label ? "bg-[#F0F2F7]" : ""
              }
              `}
              on:keyup={({ target: { value } }) => (label = value)}
            />
          </div>
          {#if errors.label && errors.label.required}
            <div class="text-red-500">
              {errors.label.msg}
            </div>
          {/if}
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button
          variant="secondary"
          width={90}
          on:click={() => {
            errors = {};
            isOpenAddModal = false;
          }}
        >
          {MultipleLang.content.modal_cancel}</Button
        >
        <Button width={90} type="submit">
          {MultipleLang.content.modal_add}</Button
        >
      </div>
    </form>
  </AppOverlay>
</ErrorBoundary>

<style>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 164px;
    padding-top: 24px;
  }

  .input-border {
    border: 1px solid rgb(229, 231, 235);
  }

  .input-border-error {
    border: 1px solid red;
  }

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
