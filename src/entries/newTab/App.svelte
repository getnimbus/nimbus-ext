<script lang="ts">
  import "flowbite/dist/flowbite.css";
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import numeral from "numeral";
  import { i18n } from "~/lib/i18n";

  import TxCardInfo from "~/components/TxCardInfo.svelte";
  import PositionCard from "~/components/PositionCard.svelte";
  import NewCard from "~/components/NewCard.svelte";
  import EChart from "~/components/EChart.svelte";
  import OpportunityCard from "~/components/OpportunityCard.svelte";
  import Select from "~/components/Select.svelte";

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

  // let totalBalanceUsd = 0;

  // let optionPieChart = {
  //   series: [],
  //   labels: [],
  //   plotOptions: {
  //     pie: {
  //       donut: {
  //         labels: {
  //           show: true,
  //           total: {
  //             show: true,
  //             label: "Total balance (USD)",
  //             color: "#000",
  //             formatter: () => {
  //               return totalBalanceUsd;
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  //   chart: {
  //     type: "donut",
  //     height: 465,
  //   },
  //   tooltip: {
  //     enabled: false,
  //   },
  //   responsive: [
  //     {
  //       breakpoint: 480,
  //       options: {
  //         chart: {
  //           width: 200,
  //         },
  //         legend: {
  //           position: "bottom",
  //         },
  //       },
  //     },
  //   ],
  // };

  // const getPieChartData = async () => {
  //   try {
  //     // const data = (await sendMessage("getPieChartData", undefined)) as any;

  //     const data = await fetch(
  //       `https://utils.getnimbus.io/portfolio/${"0x8980dbbe60d92b53b08ff95ea1aaaabb7f665bcb"}`
  //     ).then((response) => response.json());

  //     const dataFormat = data.data.assets.filter((item) => {
  //       return parseFloat(item.balanceUsd) > 0;
  //     });

  //     const balanceList = dataFormat.map((item) => {
  //       return parseFloat(numeral(item.balanceUsd).format("0,0.0000"));
  //     });

  //     const tokenList = dataFormat.map((item) => {
  //       return item.tokenName;
  //     });

  //     totalBalanceUsd = numeral(data.data.totalBalanceUsd).format("0,0.0000");

  //     optionPieChart = {
  //       ...optionPieChart,
  //       series: balanceList,
  //       labels: tokenList,
  //     };
  //   } catch (e) {
  //     console.log("e: ", e);
  //   }
  // };

  // onMount(() => {
  //   getPieChartData();
  // });

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });

  let search = "";
  let timer;
  let selectedTokenAllocation = "token";

  let chainList = [
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

  let selectedWallet = chainList[0];
  let selectedChain = chainList[0];

  let optionPie = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: "Search Engine" },
          { value: 735, name: "Direct" },
          { value: 580, name: "Email" },
          { value: 484, name: "Union Ads" },
          { value: 300, name: "Video Ads" },
        ],
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
      data: ["Email", "Union Ads", "Video Ads", "Direct", "Search Engine"],
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
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Email",
        type: "line",
        stack: "Total",
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: "Union Ads",
        type: "line",
        stack: "Total",
        data: [220, 182, 191, 234, 290, 330, 310],
      },
      {
        name: "Video Ads",
        type: "line",
        stack: "Total",
        data: [150, 232, 201, 154, 190, 330, 410],
      },
      {
        name: "Direct",
        type: "line",
        stack: "Total",
        data: [320, 332, 301, 334, 390, 330, 320],
      },
      {
        name: "Search Engine",
        type: "line",
        stack: "Total",
        data: [820, 932, 901, 934, 1290, 1330, 1320],
      },
    ],
  };

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
    style="z-index: 2147483647; box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
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
            {#each chainList.slice(0, 4) as chain}
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
                {#if chain.value === selectedWallet.value}
                  <img src={chain.logo} alt="logo" width="18" height="18" />
                {/if}
                {chain.label}
              </div>
            {/each}
            <Select
              isSelectWallet={true}
              listSelect={chainList.slice(4, chainList.length)}
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
          <div class="flex items-center gap-6">
            <div class="text-5xl text-white font-semibold">Overview</div>
            <div class="flex items-center gap-2 mt-3">
              <div class="cursor-pointer">
                <img src={Reload} alt="" />
              </div>
              <div class="text-xs text-white font-medium">
                Data updated 2 minutes ago
              </div>
            </div>
          </div>
          <Select listSelect={chainList} bind:selected={selectedChain} />
        </div>
      </div>
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">Networth</div>
            <div class="text-3xl text-black">$7,000,000</div>
            <div class="flex items-center gap-3">
              <div class="text-[#00A878] text-lg font-medium">↑2,32%</div>
              <div class="text-[#00000066] text-base font-medium">24h</div>
            </div>
          </div>
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">Claimable</div>
            <div class="text-3xl text-black">$50,000</div>
            <div class="flex items-center gap-3">
              <div class="text-[#00A878] text-lg font-medium">↑5.39%</div>
              <div class="text-[#00000066] text-base font-medium">24h</div>
            </div>
          </div>
        </div>
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              Total assets
            </div>
            <div class="text-3xl text-black">$5,000,000</div>
            <div class="flex items-center gap-3">
              <div class="text-[#00A878] text-lg font-medium">↑5.39%</div>
              <div class="text-[#00000066] text-base font-medium">24h</div>
            </div>
          </div>
          <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
            <div class="text-[#00000099] text-base font-medium">
              Total Debts
            </div>
            <div class="text-3xl text-black">$2,000,000</div>
            <div class="flex items-center gap-3">
              <div class="text-[#00A878] text-lg font-medium">↑5.39%</div>
              <div class="text-[#00000066] text-base font-medium">24h</div>
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
            <div class="flex items-center gap-2">
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
            </div>
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
          class="flex-1 flex-col border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="text-2xl font-medium text-black mb-6">Wallet</div>
          <div class="border border-[#0000000d] rounded-[10px]">
            <div
              class="grid grid-cols-12 bg-[#f4f5f880] p-3 rounded-t-left-[10px]"
            >
              <div
                class="col-span-4 text-sm uppercase font-semibold text-black"
              >
                Assets
              </div>
              <div
                class="col-span-3 text-sm uppercase font-semibold text-black"
              >
                Market Price
              </div>
              <div
                class="col-span-2 text-sm uppercase font-semibold text-black"
              >
                Amount
              </div>
              <div
                class="col-span-2 text-sm uppercase font-semibold text-black"
              >
                Value
              </div>
              <div
                class="col-span-1 text-sm uppercase font-semibold text-black"
              >
                Profit
              </div>
            </div>
            <TxCardInfo />
            <TxCardInfo />
            <TxCardInfo />
            <TxCardInfo />
          </div>
        </div>

        <!-- Opportunities -->
        <div
          class="flex-[0.4] flex flex-col border border-[#0000001a] rounded-[20px] p-6"
        >
          <div class="text-2xl font-medium text-black mb-6">Opportunities</div>
          <div class="flex flex-col gap-4 overflow-y-auto">
            <OpportunityCard background="#a795fd1a" />
            <OpportunityCard background="#ffcb591a" />
            <OpportunityCard background="#6ac7f51a" />
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
          <PositionCard />
          <PositionCard />
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
        <div class="flex flex-wrap gap-10">
          <NewCard />
          <NewCard />
          <NewCard />
          <NewCard />
          <NewCard />
          <NewCard />
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
  .test {
    border: 1px solid red;
  }

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
