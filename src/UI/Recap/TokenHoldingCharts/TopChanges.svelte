<script>
  import { autoFontSize, formatValue } from "~/utils";
  import numeral from "numeral";

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
        splitNumber: 2,
        axisLabel: {
          formatter: function (value, index) {
            return (
              `${value < 0 ? "-" : ""} $` +
              numeral(Math.abs(value)).format("0.0a")
            );
          },
          fontSize: autoFontSize(),
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
          },
        },
      },
    ],
    grid: {
      top: 15,
      left: "18%",
      right: 0,
      width: "auto",
      bottom: 20,
    },
    series: [],
  };

  const formatData = (data) => {
    console.log(data);
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
            barCategoryGap: "55%",
            itemStyle: {
              color: "white",
            },
            emphasis: {
              // focus: "series",
              itemStyle: {
                color: "#6AC7F5",
              },
            },
            data: data.map((item) => {
              return {
                value: item.value,
                itemStyle: {
                  borderRadius: [7, 7, 0, 0],
                },
              };
            }),
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

<div
  class="w-[370px] h-[256px] flex flex-col gap-3 p-[24px] rounded-[20px] bg-black"
>
  <div class="text-white text-xl font-medium">Top changes</div>
  {#if loading}
    <div
      class="flex justify-center items-center h-full xl:text-lg text-xl text-white h-[335px]"
    >
      <Loading />
    </div>
  {:else}
    <div>
      {#if isEmptyData}
        <div
          class="flex justify-center items-center h-full xl:text-lg text-xl text-white h-[335px]"
        >
          Empty
        </div>
      {:else}
        <EChart
          id="recap-top-changes"
          theme="dark"
          notMerge={true}
          option={optionBar}
          height={166}
        />
      {/if}
    </div>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>
