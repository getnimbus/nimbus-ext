<script lang="ts">
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { chart } from "svelte-apexcharts";

  import TxCardInfo from "~/components/TxCardInfo.normal.svelte";
  import NewCard from "~/components/NewCard.normal.svelte";

  import logo from "../../assets/user.png";
  import { onMount } from "svelte";

  let optionLineChart = {
    series: [
      {
        name: "USD",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: "BTC",
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    chart: {
      height: 453,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      type: "datetime",
      categories: [
        "2018-09-19T00:00:00.000Z",
        "2018-09-19T01:30:00.000Z",
        "2018-09-19T02:30:00.000Z",
        "2018-09-19T03:30:00.000Z",
        "2018-09-19T04:30:00.000Z",
        "2018-09-19T05:30:00.000Z",
        "2018-09-19T06:30:00.000Z",
      ],
    },
    grid: {
      borderColor: "transparent",
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
  };

  let optionPieChart = {
    series: [44, 55, 41, 17, 15],
    chart: {
      type: "donut",
      height: 465,
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
  // const fetchAddressNews = async () => {
  //   console.log("Fetch news");
  //   const data = (await sendMessage("coinList", undefined)) as any;
  //   console.log(data);
  // };

  onMount(() => {
    // fetchAddressNews();
  });
</script>

<div class="max-w-[1440px] m-auto w-[90%] h-full py-6">
  <div class="flex justify-between items-start">
    <div class="flex flex-col gap-2">
      <div class="title-1">Hi there,</div>
      <div class="title-2">Today update</div>
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
        <div>Settings</div>
      </a>
      <div class="bg-sky-200 w-[48px] h-[48px] rounded-full overflow-hidden">
        <img class="w-full h-full object-contain" src={logo} alt="avatar" />
      </div>
    </div>
  </div>
  <div class="mt-12 flex flex-col gap-12">
    <div class="flex lg:flex-row flex-col justify-between gap-6">
      <div class="flex-1">
        <div class="title-3 text-gray-500 mb-4">Your portfolio</div>
        <div class="border shadow rounded-lg p-3">
          <div use:chart={optionLineChart} />
        </div>
      </div>
      <div class="flex-1">
        <div class="title-3 text-gray-500 mb-4">Portfolio breakdown</div>
        <div class="border shadow rounded-lg p-3">
          <div use:chart={optionPieChart} />
        </div>
      </div>
    </div>
    <div>
      <div class="title-3 text-gray-500 mb-4">Recent Transaction</div>
      <div
        class="border rounded-lg py-6 px-8 flex flex-col gap-4 max-h-[660px] overflow-y-auto shadow"
      >
        <TxCardInfo />
        <TxCardInfo />
      </div>
    </div>
    <div>
      <div class="title-3 text-gray-500 mb-4">You might interested in</div>
      <div class="flex flex-col gap-4">
        <NewCard />
        <NewCard />
        <NewCard />
        <NewCard />
        <NewCard />
      </div>
      <div class="mt-4 flex justify-center">
        <button class="btn-primary w-max">Suggest a content</button>
      </div>
    </div>
  </div>
</div>

<!-- <style windi:preflights:global windi:safelist:global>
  .border {
    border: 0.5px solid rgb(229, 231, 235);
  }
</style> -->
<style windi:preflights:global windi:safelist:global></style>
