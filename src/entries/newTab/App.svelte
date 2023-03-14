<script lang="ts">
  import "flowbite/dist/flowbite.css";
  import { onMount, onDestroy } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import numeral from "numeral";
  import { i18n } from "~/lib/i18n";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { nimbusApi } from "~/lib/network";
  import { formatBalance } from "~/utils";

  import HoldingInfo from "~/components/HoldingInfo.svelte";
  import NewCard from "~/components/NewCard.svelte";
  import EChart from "~/components/EChart.svelte";
  import OpportunityCard from "~/components/OpportunityCard.svelte";
  import Select from "~/components/Select.svelte";
  import CountUpNumber from "~/components/CountUpNumber.svelte";

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
  import Table from "~/components/PositionTable/Table.svelte";

  // let MultipleLang = {
  //   title: i18n("newtabPage.title", "Hi there,"),
  //   sub_title: i18n("newtabPage.sub-title", "Today update"),

  //   settings: i18n("newtabPage.settings", "Settings"),
  //   your_portfolio: i18n("newtabPage.your-portfolio", "Your portfolio"),
  //   portfolio_breakdown: i18n(
  //     "newtabPage.portfolio-breakdown",
  //     "Portfolio breakdown"
  //   ),
  //   recent_transaction: i18n(
  //     "newtabPage.recent-transaction",
  //     "Recent transaction"
  //   ),
  //   news_title: i18n("newtabPage.news-title", "You might interested in"),

  //   btn_text: i18n("newtabPage.suggest-btn-text", "Suggest a content"),
  // };

  let overviewData;
  let opportunitiesData;
  let newsData;
  let walletData;
  let positionsData;

  let optionPie = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 170px;">
              <div style="display: flex; align-items: centers; gap: 4px">
                <img src=${params.data.logo} alt="" width=20 height=20 /> 
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                  ${params.name} (${params.data.symbol})
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">${
                  params.data.name_balance
                }</div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">${
                  params.data.value_balance
                }</div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">${
                  params.data.name_value
                }</div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">$${
                  params.data.value_value
                }</div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">${
                  params.data.name_ratio
                }</div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">${formatBalance(
                  params.value
                )}%</div>
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
        radius: ["30%", "70%"],
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
    },
    series: [],
  };

  const getOverviewData = async () => {
    try {
      const response = await nimbusApi.get("/overview");
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
        return dayjs(item.date).format("DD/MM/YY");
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
      const response = await nimbusApi.get("/opportunities");
      opportunitiesData = response.opportunities;
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getNewsData = async () => {
    try {
      const response = await nimbusApi.get("/news");
      newsData = response.news;
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getWalletData = async () => {
    try {
      const response = await nimbusApi.get("/holding");
      walletData = response.holding;
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getPositionsData = async () => {
    try {
      const response = await nimbusApi.get("/positions");
      positionsData = response.positions;
      console.log("res data Position: ", response);
    } catch (e) {
      console.log("error: ", e);
    }
  };

  onMount(() => {
    getOverviewData();
    getOpportunitiesData();
    getNewsData();
    getWalletData();
    getPositionsData();
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

  const walletList = [
    {
      logo: logo,
      label: "All chains",
      value: "all",
    },
    {
      logo: logo,
      label: "Ethereum Wallet",
      value: "eth",
    },
    {
      logo: logo,
      label: "BNB Wallet",
      value: "bnb",
    },
    {
      logo: logo,
      label: "Polygon Wallet",
      value: "polygon",
    },
    {
      logo: logo,
      label: "Optimism Wallet",
      value: "optimism",
    },
    {
      logo: logo,
      label: "Avalanche Wallet",
      value: "avalanche",
    },
  ];

  const chainList = [
    {
      logo: logo,
      label: "All chains",
      value: "all",
    },
    {
      logo: logo,
      label: "Ethereum Wallet",
      value: "eth",
    },
  ];

  let search = "";
  let timer;
  let selectedTokenAllocation = "token";
  let headerScrollY = false;

  let selectedWallet = walletList[0];
  let selectedChain = chainList[0];

  const debounce = (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      search = value;
    }, 300);
  };
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
      <div class="flex items-center xl:gap-4 gap-3">
        <a
          href="#"
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
        >
          <img src={Portfolio} alt="Portfolio" />
          <span class="text-white font-semibold xl:text-base text-sm">
            Portfolio
          </span>
        </a>
        <a
          href="#"
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
        >
          <img src={Analytic} alt="Analytic" />
          <span class="text-white font-semibold xl:text-base text-sm">
            Analytic
          </span>
        </a>
        <a
          href="#"
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
        >
          <img src={Transactions} alt="Transactions" />
          <span class="text-white font-semibold xl:text-base text-sm">
            Transactions
          </span>
        </a>
        <a
          href={`chrome-extension://${browser.runtime.id}/src/entries/options/index.html`}
          target="_blank"
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
        >
          <img src={Settings} alt="Settings" />
          <span class="text-white font-semibold xl:text-base text-sm">
            Settings
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
            class="bg-[#525B8C] w-full py-2 xl:pr-4 pr-2 rounded-r-[1000px] text-[#ffffff80] border-none focus:outline-none focus:ring-0"
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
          <div class="flex items-center gap-5">
            {#each walletList.slice(0, 4) as chain, index}
              <div
                id={chain.value}
                class={`text-base text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${
                  chain.value === selectedWallet.value && "bg-[#ffffff1c]"
                }`}
                class:hover:no-underline={chain.value === selectedWallet.value}
                on:click={() => {
                  selectedWallet = chain;
                }}
              >
                <img
                  src={index === 0 ? All : chain.logo}
                  alt="logo"
                  width="18"
                  height="18"
                />
                {chain.label}
              </div>
            {/each}
            <Select
              isSelectWallet
              listSelect={walletList.slice(4, walletList.length)}
              bind:selected={selectedWallet}
            />
          </div>
          <button
            class="flex items-center gap-3 px-4 py-2 bg-[#1E96FC] rounded-xl"
          >
            <img src={Plus} alt="" width="12" height="12" />
            <div class="text-base font-medium text-white">Add Wallet</div>
          </button>
        </div>
        <div class="flex justify-between items-end">
          <div class="flex items-end gap-6">
            <div class="text-5xl text-white font-semibold">Overview</div>
            <div class="flex items-center gap-2 mb-1">
              <div class="cursor-pointer">
                <img src={Reload} alt="" />
              </div>
              <div class="text-xs text-white font-medium">
                Data updated {dayjs(overviewData?.updatedAt).fromNow()}
              </div>
            </div>
          </div>
          <Select listSelect={chainList} bind:selected={selectedChain} />
        </div>
      </div>
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">Networth:</div>
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
            <div class="text-[#00000099] text-base font-medium">Claimable</div>
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
              Total assets
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
              Total Debts
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
        <!-- Token Allocation -->
        <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
          <div class="flex justify-between mb-1">
            <div class="pl-4 text-2xl font-medium text-black">
              Token Allocation
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
          <EChart id={2} theme="white" option={optionPie} height={465} />
        </div>

        <!-- Performance -->
        <div class="flex-1 border border-[#0000001a] rounded-[20px] p-6">
          <div class="pl-4 text-2xl font-medium text-black mb-3">
            Performance
          </div>
          <EChart id={1} theme="white" option={optionLine} height={433} />
        </div>
      </div>

      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <!-- Wallet -->
        <div
          class="xl:w-[65%] w-full flex-col border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="text-2xl font-medium text-black mb-6">Wallet</div>
          <div
            class="border border-[#0000000d] rounded-[10px] overflow-x-scroll"
          >
            <table class="table-fixed 2xl:w-full w-auto">
              <thead>
                <tr class="bg-[#f4f5f880]">
                  <th class="pl-3 py-3">
                    <div
                      class="text-left text-sm uppercase font-semibold text-black min-w-[220px]"
                    >
                      Assets
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm uppercase font-semibold text-black min-w-[120px]"
                    >
                      Market Price
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm uppercase font-semibold text-black min-w-[120px]"
                    >
                      Amount
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm uppercase font-semibold text-black min-w-[120px]"
                    >
                      Value
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-right text-sm uppercase font-semibold text-black min-w-[120px]"
                    >
                      Profit
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {#if walletData && walletData.length}
                  {#each walletData as holding}
                    <HoldingInfo data={holding} />
                  {/each}
                {:else}
                  <div>Empty</div>
                {/if}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Opportunities -->
        <div
          class="xl:w-[35%] w-full flex flex-col border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="text-2xl font-medium text-black mb-6">Opportunities</div>
          <div class="flex flex-col gap-4 overflow-y-auto xl:basis-0 grow">
            {#if opportunitiesData && opportunitiesData.length}
              {#each opportunitiesData as opportunity}
                <OpportunityCard data={opportunity} />
              {/each}
            {:else}
              <div>Empty</div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Position -->
      <div
        class="flex flex-col gap-4 border border-[#0000001a] rounded-[20px] p-6"
      >
        <div
          class="text-2xl font-medium text-black border-b border-[#00000014] pb-4"
        >
          Position
        </div>
        <div class="flex flex-col gap-10">
          {#if positionsData && positionsData.length}
            {#each positionsData as position}
              <Table data={position} />
            {/each}
          {:else}
            <div>Empty</div>
          {/if}
        </div>
      </div>

      <!-- News -->
      <div
        class="flex flex-col gap-10 border border-[#0000001a] rounded-[20px] p-6"
      >
        <div class="flex justify-between border-b border-[#00000014] pb-4">
          <div class="text-2xl font-medium text-black">News</div>
          <a href="#" class="font-bold text-base">View more</a>
        </div>
        <div class="grid 2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1 gap-10">
          {#if newsData && newsData.length}
            {#each newsData as news}
              <NewCard data={news} />
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
</div>

<style windi:preflights:global windi:safelist:global>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-attachment: fixed;
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
</style>
