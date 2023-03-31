<script lang="ts">
  import "flowbite/dist/flowbite.css";
  import { onMount, onDestroy } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage, getCurrentContext } from "webext-bridge";
  import numeral from "numeral";
  import { i18n, currentLang } from "~/lib/i18n";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import "dayjs/locale/vi";
  import "dayjs/locale/en";
  dayjs.extend(relativeTime);
  dayjs.locale(currentLang);
  import { formatBalance } from "~/utils";
  import { v4 as uuidv4 } from "uuid";
  import io from "socket.io-client";
  import type { OverviewData } from "~/types/OverviewData";
  import type { OpportunityData } from "~/types/OpportunityData";
  import type { NewData } from "~/types/NewData";
  import type { WalletData } from "~/types/WalletData";
  import type { PositionData } from "~/types/PositionData";
  import type { AddressData } from "~/types/AddressData";

  import HoldingInfo from "~/components/HoldingInfo.svelte";
  import NewCard from "~/components/NewCard.svelte";
  import EChart from "~/components/EChart.svelte";
  import OpportunityCard from "~/components/OpportunityCard.svelte";
  import Select from "~/components/Select.svelte";
  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import Table from "~/components/PositionTable/Table.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import "~/components/Loading.custom.svelte";

  import Wallet from "~/assets/wallet.svg";
  import All from "~/assets/all.svg";
  import logo from "~/assets/btc.png";
  import Plus from "~/assets/plus.svg";
  import MoveUp from "~/assets/move-up.svg";
  import Avatar from "~/assets/user.svg";
  import Logo from "~/assets/logo-white.svg";
  import Reload from "~/assets/reload.svg";
  import Analytic from "~/assets/analytic.svg";
  import Portfolio from "~/assets/portfolio.svg";
  import Settings from "~/assets/settings.svg";
  import Transactions from "~/assets/transactions.svg";
  import News from "~/assets/news.svg";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytic: i18n("newtabPage.analytic", "Analytic"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    settings: i18n("newtabPage.settings", "Settings"),
    wallet: i18n("newtabPage.wallet", "Wallet"),
    view_more: i18n("newtabPage.view-more", "View more"),
    opportunities: i18n("newtabPage.opportunities", "Opportunities"),
    positions: i18n("newtabPage.positions", "Positions"),
    assets: i18n("newtabPage.assets", "Assets"),
    market_price: i18n("newtabPage.market-price", "Market price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    profit: i18n("newtabPage.profit", "Profit"),
    overview: i18n("newtabPage.overview", "Overview"),
    token_allocation: i18n("newtabPage.token-allocation", "Token Allocation"),
    performance: i18n("newtabPage.performance", "Performance"),
    networth: i18n("newtabPage.networth", "Net Worth"),
    claimable: i18n("newtabPage.claimable", "Claimable"),
    total_assets: i18n("newtabPage.total-assets", "Total Assets"),
    total_debts: i18n("newtabPage.total-debts", "Total Debts"),
    empty_wallet: i18n("newtabPage.empty-wallet", "No wallet add yet."),
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
    data_updated: i18n("newtabPage.data-updated", "Data updated"),

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

  const socket = io("blabla");
  $: console.log("socket: ", socket);

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
    },
    performance: [],
    updatedAt: "",
  };
  let opportunitiesData: OpportunityData = [];
  let newsData: NewData = [];
  let walletData: WalletData = [];
  let positionsData: PositionData = [];
  let listAddress = [
    {
      logo: Wallet,
      label: "All wallet",
      value: "all",
    },
  ];
  let selectedWallet = listAddress[0];
  let isOpenAddModal = false;
  let errors: any = {};
  let isReload = false;

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
                  ${params.name} (${params.data.symbol})
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_balance]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatBalance(params.data.value_balance)}</div>
              </div>
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
        left: -140,
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
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 190px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #00b580; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[0].seriesName}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[0].value >= 0 ? "rgba(0, 0, 0, 0.7)" : "red"
                };">
                  ${params[0].value}%
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #f7931a; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[1].seriesName}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[1].value >= 0 ? "rgba(0, 0, 0, 0.7)" : "red"
                };">
                  ${params[1].value}%
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between;">
                <div style="width: 135px; font-weight: 500; font-size: 14px; line-height: 17px; color: black; display: flex; align-items: centers; gap: 6px;">
                  <div style="background: #547fef; width: 12px; height: 12px; border-radius: 100%; margin-top: 3px;"></div>
                  ${params[2].seriesName}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[2].value >= 0 ? "rgba(0, 0, 0, 0.7)" : "red"
                };">
                  ${params[2].value}%
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

  let address = "";
  let label = "";

  const handleReload = async () => {
    isReload = true;
    try {
      const response: boolean = await sendMessage("reloadNewTab", undefined);
      if (response) {
        setTimeout(() => {
          isReload = false;
        }, 2000);
      }
    } catch (e) {
      console.log("e: ", e);
      isReload = false;
    }
  };

  const getOverviewData = async () => {
    try {
      const response: OverviewData = await sendMessage(
        "getOverview",
        undefined
      );
      overviewData = response;

      let sum = 0;
      overviewData?.breakdownToken.map((item) => (sum += item.value));

      const formatDataPieChart = overviewData?.breakdownToken.map((item) => {
        return {
          logo: item.logo,
          name: item.name,
          symbol: item.symbol,
          name_ratio: "Ratio",
          value: (item.value / sum) * 100,
          name_value: "Value",
          value_value: item.value,
          name_balance: "Balance",
          value_balance: item.amount,
        };
      });

      optionPie = {
        ...optionPie,
        series: [
          {
            ...optionPie.series[0],
            data: formatDataPieChart,
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
            stack: "Total",
            lineStyle: {
              type: "solid",
              color: "#00b580",
            },
            data: formatDataPortfolio,
          },
          {
            name: "Bitcoin",
            type: "line",
            stack: "Total",
            lineStyle: {
              type: "dashed",
              color: "#f7931a",
            },
            data: formatDataBTC,
          },
          {
            name: "Ethereum",
            type: "line",
            stack: "Total",
            lineStyle: {
              type: "dashed",
              color: "#547fef",
            },
            data: formatDataETH,
          },
        ],
      };
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getOpportunitiesData = async () => {
    try {
      const response: OpportunityData = await sendMessage(
        "getListOpportunity",
        undefined
      );
      opportunitiesData = response;
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getNewsData = async () => {
    try {
      const response: NewData = await sendMessage("getListNew", undefined);
      newsData = response;
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getWalletData = async () => {
    try {
      const response: WalletData = await sendMessage(
        "getWalletData",
        undefined
      );
      walletData = response;
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getPositionsData = async () => {
    try {
      const response: PositionData = await sendMessage(
        "getPositionData",
        undefined
      );
      positionsData = response;
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getListAddress = async () => {
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
    } catch (error) {
      console.log(error);
    }
  };

  onMount(() => {
    getOverviewData();
    getOpportunitiesData();
    getNewsData();
    getWalletData();
    getPositionsData();
    getListAddress();
  });

  onMount(() => {
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

      e.target.reset();
      isOpenAddModal = false;
    } else {
      console.log("Invalid Form");
    }
  };

  const chainList = [
    {
      logo: logo,
      label: "All chains",
      value: "all",
    },
    {
      logo: logo,
      label: "Ethereum",
      value: "eth",
    },
  ];
  let search = "";
  let timer;
  let selectedTokenAllocation = "token";
  let headerScrollY = false;
  let selectedChain = chainList[0];

  const debounce = (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      search = value;
    }, 300);
  };

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });

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
</script>

<div class="flex flex-col pb-10">
  <div
    class="border-header py-1 sticky top-0 bg-[#27326F]"
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
          <img src={Portfolio} alt="Portfolio" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.portfolio}
          </span>
        </div>
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "analytic"}
          on:click={() => (navActive = "analytic")}
        >
          <img src={Analytic} alt="Analytic" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.analytic}
          </span>
        </div>
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "transactions"}
          on:click={() => (navActive = "transactions")}
        >
          <img src={Transactions} alt="Transactions" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.transactions}
          </span>
        </div>
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "news"}
          on:click={() => (navActive = "news")}
        >
          <img src={News} alt="News" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.news}
          </span>
        </div>
        <a
          href={`chrome-extension://${browser.runtime.id}/src/entries/options/index.html`}
          target="_blank"
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
        >
          <img src={Settings} alt="Settings" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.settings}
          </span>
        </a>
      </div>
      <div class="flex justify-between items-center xl:gap-4 gap-2">
        <div
          class="bg-[#525B8C] xl:pl-4 pl-3 flex items-center gap-1 rounded-[1000px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="xl:h-7 xl:w-7 h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            on:keyup={({ target: { value } }) => debounce(value)}
            autofocus
            value={search}
            placeholder="Search by address"
            type="text"
            class="bg-[#525B8C] w-full py-2 xl:pr-4 pr-2 rounded-r-[1000px] text-[#ffffff80] placeholder-[#ffffff80] border-none focus:outline-none focus:ring-0"
          />
        </div>
        <div
          class="bg-[#525B8C] rounded-full flex justify-center items-center w-10 h-10"
        >
          <svg
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="xl:h-6 xl:w-6 h-5 w-5 text-white"
          >
            <path
              d="M9.61249 21.9553C9.87859 22.4208 10.2621 22.8084 10.7247 23.0794C11.1873 23.3504 11.7129 23.4954 12.249 23.4999C12.7852 23.5044 13.3131 23.3683 13.7803 23.1051C14.2474 22.8419 14.6373 22.4609 14.9112 21.9999"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M19.7375 11.5V8.425C19.7375 4.45 16.25 1 12.2375 1C10.2622 1.04393 8.37994 1.84821 6.98283 3.24533C5.58571 4.64244 4.78143 6.52467 4.7375 8.5V11.5C4.7375 14.9125 2 15.4375 2 17.35C2 19.075 5.9375 20.425 12.2375 20.425C18.5375 20.425 22.475 19.075 22.475 17.35C22.475 15.4375 19.7375 14.9125 19.7375 11.5Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="w-[40px] h-[40px] rounded-full overflow-hidden">
          <img src={Avatar} alt="avatar" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </div>
  <div id="top" class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto w-[82%]">
      <div class="flex flex-col gap-14 mb-5">
        <div class="flex justify-between items-center">
          {#if listAddress && listAddress.length > 1}
            <div class="flex items-center gap-5">
              {#if listAddress.length > 4}
                {#each listAddress.slice(0, 4) as item, index}
                  <div
                    id={item.value}
                    class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                      item.value === selectedWallet.value && "bg-[#ffffff1c]"
                    }`}
                    class:hover:no-underline={item.value ===
                      selectedWallet.value}
                    on:click={() => {
                      selectedWallet = item;
                    }}
                  >
                    <img
                      src={index === 0 ? All : item.logo}
                      alt="logo"
                      width="16"
                      height="16"
                    />
                    {item.label}
                  </div>
                {:else}
                  <div class="w-full flex justify-center items-center">
                    <loading-icon />
                  </div>
                {/each}
                <Select
                  isSelectWallet
                  listSelect={listAddress.slice(4, listAddress.length)}
                  bind:selected={selectedWallet}
                />
              {:else}
                {#each listAddress as item, index}
                  <div
                    id={item.value}
                    class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                      item.value === selectedWallet.value && "bg-[#ffffff1c]"
                    }`}
                    class:hover:no-underline={item.value ===
                      selectedWallet.value}
                    on:click={() => {
                      selectedWallet = item;
                    }}
                  >
                    <img
                      src={index === 0 ? All : item.logo}
                      alt="logo"
                      width="16"
                      height="16"
                    />
                    {item.label}
                  </div>
                {:else}
                  <div class="w-full flex justify-center items-center">
                    <loading-icon />
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
        <div class="flex justify-between items-end">
          <div class="flex items-end gap-6">
            <div class="text-5xl text-white font-semibold">
              {MultipleLang.overview}
            </div>
            <div class="flex items-center gap-2 mb-1">
              <div
                class="cursor-pointer"
                class:loading={isReload}
                on:click={handleReload}
              >
                <img src={Reload} alt="" />
              </div>
              <div class="text-xs text-white font-medium">
                {MultipleLang.data_updated}
                {dayjs(overviewData?.updatedAt).fromNow()}
              </div>
            </div>
          </div>
          <Select listSelect={chainList} bind:selected={selectedChain} />
        </div>
      </div>
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              {MultipleLang.networth}
            </div>
            <div class="text-3xl text-black">
              $<CountUpNumber
                id="networth"
                number={overviewData?.overview.networth}
              />
            </div>
            <div class="flex items-center gap-3">
              <div
                class={`text-lg font-medium ${
                  overviewData?.overview.networthChange < 0
                    ? "text-red-500"
                    : "text-[#00A878]"
                }`}
              >
                {#if overviewData?.overview.networthChange < 0}
                  ↓
                {:else}
                  ↑
                {/if}
                <CountUpNumber
                  id="networth_grouth"
                  number={Math.abs(overviewData?.overview.networthChange)}
                />%
              </div>
              <div class="text-[#00000066] text-base font-medium">
                {overviewData?.overview.change}
              </div>
            </div>
          </div>
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              {MultipleLang.claimable}
            </div>
            <div class="text-3xl text-black">
              $<CountUpNumber
                id="claimable"
                number={overviewData?.overview.claimable}
              />
            </div>
            <div class="flex items-center gap-3">
              <div
                class={`text-lg font-medium ${
                  overviewData?.overview.claimableChange < 0
                    ? "text-red-500"
                    : "text-[#00A878]"
                }`}
              >
                {#if overviewData?.overview.claimableChange < 0}
                  ↓
                {:else}
                  ↑
                {/if}
                <CountUpNumber
                  id="claimable_grouth"
                  number={Math.abs(overviewData?.overview.claimableChange)}
                />%
              </div>
              <div class="text-[#00000066] text-base font-medium">
                {overviewData?.overview.change}
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              {MultipleLang.total_assets}
            </div>
            <div class="text-3xl text-black">
              $<CountUpNumber
                id="total_assets"
                number={overviewData?.overview.assets}
              />
            </div>
            <div class="flex items-center gap-3">
              <div
                class={`text-lg font-medium ${
                  overviewData?.overview.assetsChange < 0
                    ? "text-red-500"
                    : "text-[#00A878]"
                }`}
              >
                {#if overviewData?.overview.assetsChange < 0}
                  ↓
                {:else}
                  ↑
                {/if}
                <CountUpNumber
                  id="total_assets_grouth"
                  number={Math.abs(overviewData?.overview.assetsChange)}
                />%
              </div>
              <div class="text-[#00000066] text-base font-medium">
                {overviewData?.overview.change}
              </div>
            </div>
          </div>
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              {MultipleLang.total_debts}
            </div>
            <div class="text-3xl text-black">
              $<CountUpNumber
                id="total_debts"
                number={overviewData?.overview.debts}
              />
            </div>
            <div class="flex items-center gap-3">
              <div
                class={`text-lg font-medium ${
                  overviewData?.overview.debtsChange < 0
                    ? "text-red-500"
                    : "text-[#00A878]"
                }`}
              >
                {#if overviewData?.overview.debtsChange < 0}
                  ↓
                {:else}
                  ↑
                {/if}
                <CountUpNumber
                  id="total_debts_grouth"
                  number={Math.abs(overviewData?.overview.debtsChange)}
                />%
              </div>
              <div class="text-[#00000066] text-base font-medium">
                {overviewData?.overview.change}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="max-w-[2000px] m-auto w-[90%] -mt-26">
    <div
      class="flex flex-col gap-7 bg-white rounded-[20px] p-8"
      style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
    >
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div
          class="xl:flex-[0.8] flex-1 border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="flex justify-between mb-1">
            <div class="pl-4 text-2xl font-medium text-black">
              {MultipleLang.token_allocation}
            </div>
            <!-- <div class="flex items-center gap-2">
              <div
                class={`cursor-pointer text-base font-medium py-[6px] px-4 rounded-[100px] transition-all ${
                  selectedTokenAllocation === "token" &&
                  "bg-[#1E96FC] text-white"
                }`}
                on:click={() => (selectedTokenAllocation = "token")}
              >
                Token
              </div>
              <div
                class={`cursor-pointer text-base font-medium py-[6px] px-4 rounded-[100px] transition-all ${
                  selectedTokenAllocation === "chain" &&
                  "bg-[#1E96FC] text-white"
                }`}
                on:click={() => (selectedTokenAllocation = "chain")}
              >
                Chain
              </div>
            </div> -->
          </div>
          <EChart
            id="pie-chart"
            theme="white"
            option={optionPie}
            height={465}
          />
        </div>

        <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
          <div class="pl-4 text-2xl font-medium text-black mb-3">
            {MultipleLang.performance}
          </div>
          <EChart
            id="line-chart"
            theme="white"
            option={optionLine}
            height={433}
          />
        </div>
      </div>

      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div
          class="xl:w-[65%] w-full flex-col border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="text-2xl font-medium text-black mb-6">
            {MultipleLang.wallet}
          </div>
          <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
            <table class="table-auto 2xl:w-full xl:w-auto w-full">
              <thead>
                <tr class="bg-[#f4f5f880]">
                  <th class="pl-3 py-3">
                    <div
                      class="text-left text-sm uppercase font-semibold text-black min-w-[220px]"
                    >
                      {MultipleLang.assets}
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm uppercase font-semibold text-black min-w-[120px]"
                    >
                      {MultipleLang.market_price}
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm uppercase font-semibold text-black min-w-[120px]"
                    >
                      {MultipleLang.amount}
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm uppercase font-semibold text-black min-w-[130px]"
                    >
                      {MultipleLang.value}
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-right text-sm uppercase font-semibold text-black min-w-[125px]"
                    >
                      {MultipleLang.profit}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {#if walletData && walletData.length}
                  {#each walletData as holding}
                    <HoldingInfo data={holding} />
                  {:else}
                    <tr>
                      <td colspan="5">
                        <div class="flex justify-center items-center py-4 px-3">
                          <loading-icon />
                        </div>
                      </td>
                    </tr>
                  {/each}
                {:else}
                  <div>Empty</div>
                {/if}
              </tbody>
            </table>
          </div>
        </div>

        <div
          class="xl:w-[35%] w-full flex flex-col border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="text-2xl font-medium text-black mb-6">
            {MultipleLang.opportunities}
          </div>
          <div class="flex flex-col gap-4 overflow-y-auto xl:basis-0 grow">
            {#if opportunitiesData && opportunitiesData.length}
              {#each opportunitiesData as opportunity}
                <OpportunityCard data={opportunity} />
              {:else}
                <div class="w-full h-[120px] flex justify-center items-center">
                  <loading-icon />
                </div>
              {/each}
            {:else}
              <div>Empty</div>
            {/if}
          </div>
        </div>
      </div>

      <div
        class="flex flex-col gap-4 border border-[#0000001a] rounded-[20px] p-6"
      >
        <div
          class="text-2xl font-medium text-black border-b border-[#00000014] pb-4"
        >
          {MultipleLang.positions}
        </div>
        <div class="flex flex-col gap-10">
          {#if positionsData && positionsData.length}
            {#each positionsData as position}
              <Table data={position} />
            {:else}
              <div class="w-full h-[120px] flex justify-center items-center">
                <loading-icon />
              </div>
            {/each}
          {:else}
            <div>Empty</div>
          {/if}
        </div>
      </div>

      <div
        class="flex flex-col gap-10 border border-[#0000001a] rounded-[20px] p-6"
      >
        <div class="flex justify-between border-b border-[#00000014] pb-4">
          <div class="text-2xl font-medium text-black">{MultipleLang.news}</div>
          <a href="#" class="font-bold text-base">{MultipleLang.view_more}</a>
        </div>

        <div
          class={`grid ${
            newsData && newsData.length
              ? "2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1"
              : "grid-cols-1"
          } gap-10`}
        >
          {#if newsData && newsData.length}
            {#each newsData as news}
              <NewCard data={news} />
            {:else}
              <div class="w-full h-[120px] flex justify-center items-center">
                <loading-icon />
              </div>
            {/each}
          {:else}
            <div>Empty</div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  <div class="sticky bottom-4 flex justify-end pr-4">
    <a
      class="p-4 w-[52px] h-[52px] rounded-full bg-[#27326F]"
      style="box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);"
      href="#top"
    >
      <img src={MoveUp} alt="UP" width="20" height="20" />
    </a>
  </div>
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
          width={70}
          on:click={() => {
            errors = {};
            isOpenAddModal = false;
          }}
        >
          {MultipleLang.content.modal_cancel}</Button
        >
        <Button width={70} type="submit">
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
    animation: loading 1.4s ease-in-out alternate infinite;
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
