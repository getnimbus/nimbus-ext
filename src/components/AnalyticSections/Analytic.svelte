<script lang="ts">
  import { wallet, chain } from "~/store";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import * as echarts from "echarts";

  import AddressManagement from "~/components/AddressManagement.svelte";
  import EChart from "~/components/EChart.svelte";

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let isLoading = false;
  let isEmptyDataChart = false;

  const getVirtualData = (year) => {
    const date = +echarts.time.parse(year + "-01-01");
    const end = +echarts.time.parse(+year + 1 + "-01-01");
    const dayTime = 3600 * 24 * 1000;
    const data = [];
    for (let time = date; time < end; time += dayTime) {
      data.push([
        echarts.time.format(time, "{yyyy}-{MM}-{dd}", false),
        Math.floor(Math.random() * 10000),
      ]);
    }
    console.log("data: ", data);
    return data;
  };

  let option = {
    tooltip: {},
    visualMap: {
      min: 0,
      max: 10000,
      calculable: true,
      orient: "horizontal",
      top: 0,
      right: 40,
      inRange: {
        color: ["#00A878"],
        opacity: [0, 1],
      },

      controller: {
        inRange: {
          opacity: [0, 1],
        },
        outOfRange: {
          color: "#f4f5f880",
        },
      },
    },
    calendar: {
      top: 80,
      left: 60,
      right: 60,
      cellSize: ["auto", "auto"],
      range: "2016",
      itemStyle: {
        borderWidth: 0.5,
      },
      yearLabel: { show: false },
    },
    dayLabel: {
      nameMap: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    series: {
      type: "heatmap",
      coordinateSystem: "calendar",
      data: getVirtualData("2016"),
    },
  };
</script>

<AddressManagement type="order" title="Analytic">
  <span slot="body">
    <div class="max-w-[2000px] m-auto w-[90%] -mt-32">
      <div
        class="flex flex-col gap-7 bg-white rounded-[20px] p-8"
        style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
      >
        <div
          class="border border-[#0000001a] rounded-[20px] pt-6 pb-9 flex flex-col gap-4"
        >
          <div class="text-2xl font-medium text-black pl-6">
            Historical Activities
          </div>
          {#if isLoading}
            <div class="flex items-center justify-center h-[165px]">
              <loading-icon />
            </div>
          {:else}
            <div class="h-full">
              {#if isEmptyDataChart}
                <div
                  class="flex justify-center items-center h-full text-lg text-gray-400"
                >
                  Empty
                </div>
              {:else}
                <div class="-mt-12">
                  <EChart id="calendar-chart" theme="white" {option} />
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </span>
</AddressManagement>

<style>
</style>
