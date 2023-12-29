<script>
  import { autoFontSize, formatValue } from "~/utils";

  import EChart from "~/components/EChart.svelte";
  import Loading from "~/components/Loading.svelte";

  export let data;
  export let loading;

  let isEmptyData = false;

  let optionBar = {
    tooltip: {
      trigger: "axis",
      extraCssText: "z-index: 9997",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 220px;">
              <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: white">
                ${params[0].axisValue}
              </div>
              ${params
                .map((item) => {
                  return `
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));">
                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); display: flex; align-items: centers; gap: 4px; font-weight: 500; color: white">
                    <span>${item?.marker}</span>
                    Value
                  </div>

                  <div style="grid-template-columns: repeat(1, minmax(0, 1fr)); text-align: right;">
                    <div style="display:flex; justify-content: flex-end; align-items: center; gap: 4px; flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: white;">
                      ${formatValue(item.value)}
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
      data: [],
    },
    xAxis: [
      {
        type: "category",
        axisTick: { show: false },
        data: [],
        axisLabel: {
          fontSize: autoFontSize(),
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          fontSize: autoFontSize(),
        },
      },
    ],
    series: [],
  };

  const formatData = (data) => {
    if (data.length !== 0) {
      optionBar = {
        ...optionBar,
        xAxis: [
          {
            type: "category",
            axisTick: { show: false },
            data: data.map((item) => item.symbol),
            axisLabel: {
              fontSize: autoFontSize(),
            },
          },
        ],
        legend: {
          data: data.map((item) => item.symbol),
        },
        series: [
          {
            type: "bar",
            barStyle: {
              type: "solid",
            },
            emphasis: {
              focus: "series",
            },
            data: data.map((item) => item.value),
          },
        ],
      };
    } else {
      isEmptyData = true;
    }
  };

  $: {
    if (data) {
      formatData(data || []);
    }
  }
</script>

<div class="flex flex-col gap-4 p-[24px] rounded-[20px] bg-black">
  <div class="text-white text-xl font-medium">Top changes</div>
  {#if loading}
    <div
      class="flex justify-center items-center h-full xl:text-lg text-xl text-white h-[385px]"
    >
      <Loading />
    </div>
  {:else}
    <div>
      {#if isEmptyData}
        <div
          class="flex justify-center items-center h-full xl:text-lg text-xl text-white h-[385px]"
        >
          Empty
        </div>
      {:else}
        <EChart
          id="recap-top-changes"
          theme="dark"
          notMerge={true}
          option={optionBar}
          height={385}
        />
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>
