<script lang="ts">
  import "flowbite/dist/flowbite.css";
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { chart } from "svelte-apexcharts";
  import { Avatar, Button, ImagePlaceholder } from "flowbite-svelte";
  import numeral from "numeral";
  import { i18n } from "~/lib/i18n";

  import TxCardInfo from "~/components/TxCardInfo.svelte";
  import NewCard from "~/components/NewCard.svelte";
  import EChart from "~/components/EChart.svelte";

  import logo from "../../assets/user.png";

  let MultipleLang = {
    title: i18n("newtabPage.title", "Hi there,"),
    sub_title: i18n("newtabPage.sub-title", "Today update"),

    settings: i18n("newtabPage.settings", "Settings"),
    your_portfolio: i18n("newtabPage.your-portfolio", "Your portfolio"),
    portfolio_breakdown: i18n(
      "newtabPage.portfolio-breakdown",
      "Portfolio breakdown"
    ),
    recent_transaction: i18n(
      "newtabPage.recent-transaction",
      "Recent transaction"
    ),
    news_title: i18n("newtabPage.news-title", "You might interested in"),

    btn_text: i18n("newtabPage.suggest-btn-text", "Suggest a content"),
  };

  let totalBalanceUsd = 0;

  let optionPieChart = {
    series: [],
    labels: [],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total balance (USD)",
              color: "#000",
              formatter: () => {
                return totalBalanceUsd;
              },
            },
          },
        },
      },
    },
    chart: {
      type: "donut",
      height: 465,
    },
    tooltip: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const getPieChartData = async () => {
    try {
      // const data = (await sendMessage("getPieChartData", undefined)) as any;

      const data = await fetch(
        `https://utils.getnimbus.io/portfolio/${"0x8980dbbe60d92b53b08ff95ea1aaaabb7f665bcb"}`
      ).then((response) => response.json());

      const dataFormat = data.data.assets.filter((item) => {
        return parseFloat(item.balanceUsd) > 0;
      });

      const balanceList = dataFormat.map((item) => {
        return parseFloat(numeral(item.balanceUsd).format("0,0.0000"));
      });

      const tokenList = dataFormat.map((item) => {
        return item.tokenName;
      });

      totalBalanceUsd = numeral(data.data.totalBalanceUsd).format("0,0.0000");

      optionPieChart = {
        ...optionPieChart,
        series: balanceList,
        labels: tokenList,
      };
    } catch (e) {
      console.log("e: ", e);
    }
  };

  onMount(() => {
    getPieChartData();
  });

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });

  let optionPie = {
    title: {
      text: "Token Allocation",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: "50%",
        data: [
          { value: 1048, name: "Search Engine" },
          { value: 735, name: "Direct" },
          { value: 580, name: "Email" },
          { value: 484, name: "Union Ads" },
          { value: 300, name: "Video Ads" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
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
</script>

<div class="max-w-[2000px] m-auto w-[90%] h-full py-6 font-family">
  <div class="flex justify-between items-start">
    <div class="flex flex-col gap-2">
      <div class="title-1">{MultipleLang.title}</div>
      <div class="title-2">{MultipleLang.sub_title}</div>
    </div>
    <div class="flex justify-between items-center gap-6">
      <a
        href={`chrome-extension://${browser.runtime.id}/src/entries/options/index.html`}
        target="_blank"
        class="flex flex-col items-center gap-1 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <div>{MultipleLang.settings}</div>
      </a>
      <div class="w-[48px] h-[48px] rounded-full overflow-hidden">
        <Avatar src={logo} />
        <!-- <img class="w-full h-full object-contain" src={logo} alt="avatar" /> -->
      </div>
    </div>
  </div>
  <div class="mt-12 flex flex-col gap-12">
    <div class="flex lg:flex-row flex-col justify-between gap-6">
      <div class="flex-1">
        <div class="title-3 text-gray-500 mb-4">
          {MultipleLang.your_portfolio}
        </div>
        <div class="border shadow rounded-lg p-3">
          <EChart id={2} theme="white" option={optionPie} height={465} />
        </div>
      </div>
      <div class="flex-1">
        <div class="title-3 text-gray-500 mb-4">
          {MultipleLang.portfolio_breakdown}
        </div>
        <div class="border shadow rounded-lg p-3">
          <div class="title-4 text-gray-700 mb-1 pl-4">Performance</div>
          <EChart id={1} theme="white" option={optionLine} height={433} />
        </div>
      </div>
    </div>
    <div>
      <div class="title-3 text-gray-500 mb-4">
        {MultipleLang.recent_transaction}
      </div>
      <div
        class="border rounded-lg py-6 px-8 flex flex-col gap-4 max-h-[660px] overflow-y-auto shadow"
      >
        <TxCardInfo />
        <TxCardInfo />
      </div>
    </div>
    <div>
      <div class="title-3 text-gray-500 mb-4">{MultipleLang.news_title}</div>
      <div class="flex flex-col gap-4">
        <NewCard />
        <NewCard />
        <NewCard />
        <NewCard />
        <NewCard />
        <div class="rounded-lg border p-3 shadow flex gap-6 justify-between">
          <ImagePlaceholder />
        </div>
      </div>
      <div class="mt-4 flex justify-center">
        <Button gradient color="cyanToBlue">{MultipleLang.btn_text}</Button>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
  .border {
    border: 0.2px solid rgb(229, 231, 235);
  }

  .font-family {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,
      Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  }
</style>
