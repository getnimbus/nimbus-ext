<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { i18n, currentLang } from "~/lib/i18n";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import "dayjs/locale/vi";
  import "dayjs/locale/en";
  dayjs.extend(relativeTime);
  dayjs.locale(currentLang);
  import { formatBalance, formatCurrency } from "~/utils";
  import { v4 as uuidv4 } from "uuid";
  import { disconnectWs, initWS } from "~/lib/price-ws";
  import { groupBy, isEmpty } from "lodash";
  import { Motion } from "svelte-motion";
  import { wait } from "../background/utils";

  import type { OverviewData, OverviewDataRes } from "~/types/OverviewData";
  import type { OpportunityData } from "~/types/OpportunityData";
  import type { NewData, NewDataRes } from "~/types/NewData";
  import type { WalletData, WalletDataRes } from "~/types/WalletData";
  import type { PositionData, PositionDataRes } from "~/types/PositionData";
  import type { AddressData } from "~/types/AddressData";

  import Select from "~/components/Select.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import "~/components/Tooltip.custom.svelte";
  import Overview from "~/components/NewTabUI/Overview.svelte";
  import Positions from "~/components/NewTabUI/Positions.svelte";
  import News from "~/components/NewTabUI/News.svelte";
  import Charts from "~/components/NewTabUI/Charts.svelte";
  import Holding from "~/components/NewTabUI/Holding.svelte";
  import Opportunities from "~/components/NewTabUI/Opportunities.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";

  import Wallet from "~/assets/wallet.svg";
  import All from "~/assets/all.svg";
  import logo from "~/assets/btc.png";
  import Ethereum from "~/assets/ethereum.png";
  import Bnb from "~/assets/bnb.png";
  import Polygon from "~/assets/polygon.png";
  import Arbitrum from "~/assets/arbitrum.png";
  import Solana from "~/assets/solana.png";
  import Plus from "~/assets/plus.svg";
  import Comment from "~/assets/comment-bubble-icon.svg";
  import Avatar from "~/assets/user.svg";
  import Logo from "~/assets/logo-white.svg";
  import Reload from "~/assets/reload.svg";
  import AnalyticIcon from "~/assets/analytic.svg";
  import PortfolioIcon from "~/assets/portfolio.svg";
  import SettingsIcon from "~/assets/settings.svg";
  import TransactionsIcon from "~/assets/transactions.svg";
  import NewsIcon from "~/assets/news.svg";
  import Search from "~/assets/search.svg";
  import Bell from "~/assets/bell.svg";
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  const chainList = [
    {
      logo: logo,
      label: "All chains",
      value: "all",
    },
    {
      logo: Ethereum,
      label: "Ethereum",
      value: "eth",
    },
    {
      logo: Bnb,
      label: "BNB",
      value: "bnb",
    },
    {
      logo: Polygon,
      label: "Polygon",
      value: "polygon",
    },
    {
      logo: Solana,
      label: "Solana",
      value: "solana",
    },
    {
      logo: Arbitrum,
      label: "Arbitrum",
      value: "arbitrum",
    },
  ];

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytic: i18n("newtabPage.analytic", "Analytic"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    settings: i18n("newtabPage.settings", "Settings"),
    overview: i18n("newtabPage.overview", "Overview"),
    empty_wallet: i18n("newtabPage.empty-wallet", "No wallet add yet."),
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

  const variants = {
    visible: { opacity: 1, y: 0, display: "flex" },
    hidden: { opacity: 0, y: 500, display: "none" },
  };

  let navActive = "portfolio";
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
  let opportunitiesData: OpportunityData = [];
  let newsData: NewData = [];
  let walletData: WalletData = [];
  let positionsData: PositionData = [];
  let dataUpdatedTime;
  let listAddress = [];
  let selectedWallet;
  let isOpenAddModal = false;
  let errors: any = {};
  let headerScrollY = false;
  let address = "";
  let label = "";
  let search = "";
  let timerDebounce;
  let isLoading = false;

  let isLoadingSync = false;
  let isLoadingFullPage = false;
  let isShowChat = false;
  let isCopied = false;
  let showTooltipCopyAddress = false;
  let totalPositions = 0;
  let totalClaimable = 0;
  let totalAssets = 0;
  let isEmptyDataPie = false;
  let syncMsg = "";

  let optionPie = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 190px;">
              <div style="display: flex; align-items: centers; gap: 4px">
                <img src=${params.data.logo} alt="" width=20 height=20 /> 
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
                  ${formatBalance(params.data.value_balance)}</div>
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

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      search = value;
    }, 300);
  };

  const getOverview = async (isReload: boolean = false) => {
    isEmptyDataPie = false;
    try {
      const response: OverviewDataRes = await sendMessage("getOverview", {
        address: selectedWallet.value,
        reload: isReload,
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

        const topFourBreakdown = sortBreakdown.slice(0, 4);
        const orderBreakdown = sortBreakdown.slice(4, sortBreakdown.length);

        const sumOrderBreakdown = (orderBreakdown || []).reduce(
          (prev, item) => prev + Number(item.value),
          0
        );

        const dataPieChartOrderBreakdown = [
          {
            logo: "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
            name: "Others tokens",
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
      });
      if (selectedWallet.value === response.address) {
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

  const getHolding = async (isReload: boolean = false) => {
    try {
      const response: WalletDataRes = await sendMessage("getHolding", {
        address: selectedWallet.value,
        reload: isReload,
      });

      if (selectedWallet.value === response.address) {
        const formatData = response.result.map((item) => {
          return {
            ...item,
            value: item.amount * item.rate,
          };
        });
        walletData = formatData.sort((a, b) => {
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

  const getNews = async (isReload: boolean = false) => {
    try {
      const response: NewDataRes = await sendMessage("getNews", {
        address: selectedWallet.value,
        reload: isReload,
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

  const getOpportunities = async (isReload: boolean = false) => {
    try {
      const response: OpportunityData = await sendMessage("getOpportunities", {
        address: selectedWallet.value,
        reload: isReload,
      });
      opportunitiesData = response;
      return response;
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getSyncStatus = async () => {
    try {
      const response: any = await sendMessage("getSyncStatus", {
        address: selectedWallet.value,
      });
      dataUpdatedTime = response?.data?.lastSync;
      return response;
    } catch (e) {
      console.log("e: ", e);
    }
  };

  let loadingOverview = false;
  let loadingHolding = false;
  let loadingPositions = false;
  let loadingNews = false;
  let loadingOpportunities = false;

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
    loadingOverview = true;
    loadingHolding = true;
    loadingPositions = true;
    loadingNews = true;
    loadingOpportunities = true;

    isLoading = true;
    isLoadingSync = false;
    try {
      if (type === "reload") {
        console.log("Going to full sync");
        await sendMessage("getSync", {
          address: selectedWallet.value,
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
      if (!syncStatus?.data?.lastSync) {
        console.log("Going to full sync");
        await sendMessage("getSync", {
          address: selectedWallet.value,
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

            const resOverview = await getOverview(type === "reload");
            if (resOverview) {
              loadingOverview = false;
            }

            const resHolding = await getHolding(type === "reload");
            if (resHolding) {
              loadingHolding = false;
            }

            const resPositions = await getPositions(type === "reload");
            if (resPositions) {
              loadingPositions = false;
            }

            const resNews = await getNews(type === "reload");
            if (resNews) {
              loadingNews = false;
            }

            const resOpportunities = await getOpportunities(type === "reload");
            if (resOpportunities) {
              loadingOpportunities = false;
            }

            if (
              resOverview &&
              resHolding &&
              resPositions &&
              resNews &&
              resOpportunities
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
          loadingHolding = false;
          loadingPositions = false;
          loadingNews = false;
          loadingOpportunities = false;
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

      const structWalletData = response.map((item) => {
        return {
          id: item.id,
          logo: item.logo || Wallet,
          label: item.label,
          value: item.address,
        };
      });

      listAddress = listAddress.concat(structWalletData);

      const selectedWalletRes = await browser.storage.sync.get(
        "selectedWallet"
      );
      if (selectedWalletRes && !isEmpty(selectedWalletRes)) {
        selectedWallet = selectedWalletRes.selectedWallet;
      } else {
        selectedWallet = listAddress[0];
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

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });

  // handle add wallet
  const isRequiredFieldValid = (value) => {
    return value != null && value !== "";
  };

  const validateForm = (data) => {
    if (!isRequiredFieldValid(data.address)) {
      errors["address"] = {
        ...errors["address"],
        required: true,
        msg: MultipleLang.content.address_required,
      };
    } else {
      errors["address"] = { ...errors["address"], required: false };
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
    const regexETHAddress = /0x[a-fA-F0-9]{40}$/i;

    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    validateForm(data);

    if (
      !Object.keys(errors).some((inputName) => errors[inputName]["required"])
    ) {
      if (data.address && !regexETHAddress.test(data.address)) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: MultipleLang.content.re_input_address,
        };
        return;
      }

      const isDuplicatedAddress = listAddress.some((item) => {
        return item.value === data.address;
      });

      if (isDuplicatedAddress) {
        errors["address"] = {
          ...errors["address"],
          required: true,
          msg: MultipleLang.content.duplicate_address,
        };
        return;
      }

      Object.assign(data, { id: uuidv4() });

      const dataFormat = {
        id: data.id,
        logo: Wallet,
        label: data.label,
        value: data.address,
      };

      const addWallet = [...listAddress, dataFormat];
      listAddress = addWallet;

      if (addWallet.length === 1) {
        selectedWallet = listAddress[0];
      }

      const filterWalletList = addWallet.filter((item) => item.value !== "all");
      const structWalletList = filterWalletList.map((item) => {
        return {
          id: data.id,
          logo: Wallet,
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

  let selectedTokenAllocation = "token";
  let selectedChain = chainList[0];
  let showTooltipAnalytic = false;
  let showTooltipTransactions = false;

  $: {
    if (
      address &&
      errors.address &&
      errors.address.msg === "Address is required"
    ) {
      errors["address"] = { ...errors["address"], required: false, msg: "" };
    }
    if (label && errors.label && errors.label.msg === "Label is required") {
      errors["label"] = { ...errors["label"], required: false, msg: "" };
    }
  }

  $: {
    if (selectedWallet) {
      browser.storage.sync.set({ selectedWallet: selectedWallet }).then(() => {
        console.log("save selected address to sync storage");
      });
      handleGetAllData("sync");
    }
  }
</script>

<div class="flex flex-col" class:pb-10={listAddress && listAddress.length > 0}>
  <div
    class={`border-header py-1 top-0 bg-[#27326F] ${
      listAddress && listAddress.length > 0
        ? "sticky"
        : "absolute left-0 right-0"
    }`}
    style="z-index: 2147483647; {headerScrollY
      ? 'box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);'
      : ''}"
  >
    <div
      class="flex justify-between items-center max-w-[2000px] m-auto w-[90%]"
    >
      <img
        src={Logo}
        alt="logo"
        class="-ml-8 xl:w-[177px] xl:h-[60px] w-[167px] h-[50px]"
      />
      <div class="flex items-center gap-3">
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "portfolio"}
          on:click={() => (navActive = "portfolio")}
        >
          <img src={PortfolioIcon} alt="" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.portfolio}
          </span>
        </div>
        <div class="relative">
          <div
            class="flex items-center xl:gap-3 gap-1 py-2 xl:px-4 px-2 rounded-[1000px] transition-all cursor-default"
            class:bg-[#525B8C]={navActive === "analytic"}
            on:click={() => {
              // navActive = "analytic";
            }}
            on:mouseenter={() => (showTooltipAnalytic = true)}
            on:mouseleave={() => (showTooltipAnalytic = false)}
          >
            <img src={AnalyticIcon} alt="" />
            <span class="text-[#6B7280] font-semibold xl:text-base text-sm">
              {MultipleLang.analytic}
            </span>
          </div>
          {#if showTooltipAnalytic}
            <div
              class="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
              style="z-index: 2147483648;"
            >
              <tooltip-detail text={"Soon"} />
            </div>
          {/if}
        </div>
        <div class="relative">
          <div
            class="flex items-center xl:gap-3 gap-1 py-2 xl:px-4 px-2 rounded-[1000px] transition-all cursor-default"
            class:bg-[#525B8C]={navActive === "transactions"}
            on:click={() => {
              // navActive = "transactions";
            }}
            on:mouseenter={() => (showTooltipTransactions = true)}
            on:mouseleave={() => (showTooltipTransactions = false)}
          >
            <img src={TransactionsIcon} alt="" />
            <span class="text-[#6B7280] font-semibold xl:text-base text-sm">
              {MultipleLang.transactions}
            </span>
          </div>
          {#if showTooltipTransactions}
            <div
              class="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
              style="z-index: 2147483648;"
            >
              <tooltip-detail text={"Soon"} />
            </div>
          {/if}
        </div>
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "news"}
          on:click={() => {
            navActive = "news";
            chrome.tabs.create({ url: "src/entries/news/index.html" });
          }}
        >
          <img src={NewsIcon} alt="" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.news}
          </span>
        </div>
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "options"}
          on:click={() => {
            navActive = "options";
            chrome.tabs.create({ url: "src/entries/options/index.html" });
          }}
        >
          <img src={SettingsIcon} alt="" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.settings}
          </span>
        </div>
      </div>
      <div class="flex justify-between items-center xl:gap-4 gap-2">
        <div class="w-[170px]" />
        <!-- <div
          class="bg-[#525B8C] xl:pl-4 pl-3 flex items-center gap-1 rounded-[1000px]"
        >
          <img src={Search} alt="" />
          <input
            on:keyup={({ target: { value } }) => debounceSearch(value)}
            autofocus
            value={search}
            placeholder={MultipleLang.search_placeholder}
            type="text"
            class="bg-[#525B8C] w-full py-2 xl:pr-4 pr-2 rounded-r-[1000px] text-[#ffffff80] placeholder-[#ffffff80] border-none focus:outline-none focus:ring-0"
          />
        </div> -->
        <!-- <div
          class="bg-[#525B8C] rounded-full flex justify-center items-center w-10 h-10"
        >
          <img src={Bell} alt="" />
        </div>
        <div class="w-[40px] h-[40px] rounded-full overflow-hidden">
          <img src={Avatar} alt="avatar" class="w-full h-full object-cover" />
        </div> -->
      </div>
    </div>
  </div>
  {#if isLoadingFullPage}
    <div class="flex items-center justify-center h-screen">
      <loading-icon />
    </div>
  {:else}
    <div>
      {#if listAddress.length === 0}
        <div class="flex justify-center items-center h-screen">
          <div
            class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center"
          >
            <div class="text-lg">
              Add your wallet to keep track of your investments.
            </div>
            <button
              class="flex items-center gap-3 px-4 py-2 bg-[#1E96FC] rounded-xl"
              on:click={() => (isOpenAddModal = true)}
            >
              <img src={Plus} alt="" width="12" height="12" />
              <div class="text-base font-medium text-white">
                {MultipleLang.content.btn_text}
              </div>
            </button>
          </div>
        </div>
      {:else}
        <div class="header-container">
          <div class="flex flex-col max-w-[2000px] m-auto w-[82%]">
            <div class="flex flex-col gap-14 mb-5">
              <div class="flex justify-between items-center">
                {#if listAddress && listAddress.length > 0}
                  <div class="flex items-center gap-5">
                    {#if listAddress.length > 4}
                      {#each listAddress.slice(0, 4) as item}
                        <div
                          id={item.value}
                          class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                            item.value === selectedWallet?.value &&
                            "bg-[#ffffff1c]"
                          }`}
                          class:hover:no-underline={item.value ===
                            selectedWallet?.value}
                          on:click={() => {
                            selectedWallet = item;
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
                        isWalletSelect={true}
                        isOptionsPage={true}
                        isSelectWallet={true}
                        listSelect={listAddress.slice(4, listAddress.length)}
                        bind:selected={selectedWallet}
                      />
                    {:else}
                      {#each listAddress as item}
                        <div
                          id={item.value}
                          class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                            item.value === selectedWallet?.value &&
                            "bg-[#ffffff1c]"
                          }`}
                          class:hover:no-underline={item.value ===
                            selectedWallet?.value}
                          on:click={() => {
                            selectedWallet = item;
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
                <button
                  class="flex items-center gap-3 px-4 py-2 bg-[#1E96FC] rounded-xl"
                  on:click={() => (isOpenAddModal = true)}
                >
                  <img src={Plus} alt="" width="12" height="12" />
                  <div class="text-base font-medium text-white">
                    {MultipleLang.content.btn_text}
                  </div>
                </button>
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
                    <CopyToClipboard
                      iconSize={16}
                      address={selectedWallet.value}
                      isAddressInfo={false}
                      iconColor="#fff"
                    />
                  </div>
                  <Select
                    isWalletSelect={false}
                    isOptionsPage={false}
                    isSelectWallet={false}
                    listSelect={chainList}
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
                isLoading={loadingOverview}
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
              <loading-icon />
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
              <div class="flex xl:flex-row flex-col justify-between gap-6">
                <Holding
                  isLoading={loadingHolding}
                  data={walletData}
                  bind:totalAssets
                />
                <Opportunities
                  isLoading={loadingOpportunities}
                  data={opportunitiesData}
                />
              </div>
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
                    isShowChat = true;
                  }}
                  class="mx-auto"
                >
                  <Button variant="secondary"
                    >{MultipleLang.missed_protocol}</Button
                  >
                </div>
              </div>
              <News isLoading={loadingNews} data={newsData} />
            </div>
          {/if}
        </div>

        <div class="sticky bottom-4 flex justify-end pr-4">
          <div
            class="p-4 w-[52px] h-[52px] rounded-full bg-[#27326F] cursor-pointer"
            style="box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);"
            on:click={() => {
              isShowChat = !isShowChat;
            }}
          >
            <img src={Comment} alt="cmt" width="20" height="20" />
          </div>
          <Motion
            initial="hidden"
            animate={isShowChat ? "visible" : "hidden"}
            {variants}
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
                src="https://tawk.to/chat/643d59714247f20fefec1e8d/1gu7qapef"
                class="h-[580px] w-full"
              />
              <div
                class="absolute top-3 right-5 cursor-pointer font-medium"
                on:click={() => {
                  isShowChat = false;
                }}
              >
                Close
              </div>
            </div>
          </Motion>
        </div>
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
</div>

<style windi:preflights:global windi:safelist:global>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 164px;
    padding-top: 24px;
  }

  .shadow {
    box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);
  }

  .border-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .border {
    border: 1px solid rgba(0, 0, 0, 0.1);
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
