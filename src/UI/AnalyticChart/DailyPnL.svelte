<script lang="ts">
  import dayjs from "dayjs";
  import { formatCurrencyV2 } from "~/utils";

  import EChart from "~/components/EChart.svelte";

  import Logo from "~/assets/logo-1.svg";

  export let isEmpty;
  export let isLoading;
  export let dataDailyPnL;

  let option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 250px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                ${params[0].axisValue}
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="font-weight: 500; font-size: 14px; line-height: 12px; color: black; display: flex; align-items: centers; gap: 6px;">
                  ${params[0].marker}
                  Change
                </div>
                <div style="display:flex; justify-content: flex-end; align-items: flex-end; gap: 4px; flex: 1; width: 100%; text-align: right; font-weight: 500; font-size: 14px; line-height: 17px; color: ${
                  params[0].value >= 0 ? "#05a878" : "#f25f5d"
                };">
                  $${formatCurrencyV2(Math.abs(params[0].value))}
                </div>
              </div>
            </div>`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      data: [],
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "${value}",
      },
    },
    series: [
      {
        type: "bar",
        data: [],
      },
    ],
  };

  $: {
    if (dataDailyPnL && dataDailyPnL.length !== 0) {
      const formatXAxis = dataDailyPnL.map((item) => {
        return dayjs(new Date(item.timestamp * 1000)).format("DD MMM YYYY");
      });
      const formatDataDailyPnL = dataDailyPnL.map((item) => {
        return {
          value: item.change,
          itemStyle: {
            color: item.change >= 0 ? "#05a878" : "#f25f5d",
          },
        };
      });
      option = {
        ...option,
        xAxis: {
          data: formatXAxis,
        },
        series: [
          {
            type: "bar",
            data: formatDataDailyPnL,
          },
        ],
      };
    }
  }
</script>

<div class="border border-[#0000001a] rounded-[20px] p-6">
  <div class="font-medium text-black text-xl">Daily PnL</div>
  <div>
    {#if isLoading}
      <div class="flex items-center justify-center h-[415px]">
        <loading-icon />
      </div>
    {:else}
      <div class="h-full w-full">
        {#if isEmpty}
          <div
            class="flex justify-center items-center h-full text-lg text-gray-400 h-[415px]"
          >
            Empty
          </div>
        {:else}
          <div class="relative">
            <EChart
              id="DailyGain"
              theme="white"
              {option}
              height={415}
              notMerge={true}
            />
            <div class="absolute -top-6 right-6 opacity-10">
              <img src={Logo} alt="" width="140" height="140" />
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
