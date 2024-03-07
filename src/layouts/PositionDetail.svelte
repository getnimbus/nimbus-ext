<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { Link } from "svelte-navigator";
  import { autoFontSize } from "~/utils";

  import tooltip from "~/entries/contentScript/views/tooltip";
  import EChart from "~/components/EChart.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import Button from "~/components/Button.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";

  let option = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {},
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLabel: {
        fontSize: autoFontSize(),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "${value}",
        fontSize: autoFontSize(),
      },
    },
    series: [
      {
        name: "Highest",
        type: "line",
        data: [10, 11, 13, 11, 12, 12, 9],
        markPoint: {
          data: [
            { type: "max", name: "Max" },
            { type: "min", name: "Min" },
          ],
        },
        markLine: {
          data: [{ type: "average", name: "Avg" }],
        },
      },
      {
        name: "Lowest",
        type: "line",
        data: [1, 1.5, 2, 5, 3, 2, 6],
        markPoint: {
          data: [{ name: "周最低", value: 1.5, xAxis: 1, yAxis: 1.5 }],
        },
        markLine: {
          data: [
            { type: "average", name: "Avg" },
            [
              {
                symbol: "none",
                x: "90%",
                yAxis: "max",
              },
              {
                symbol: "circle",
                label: {
                  position: "start",
                  formatter: "Max",
                },
                type: "max",
                name: "最高点",
              },
            ],
          ],
        },
      },
    ],
  };
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col mb-5 gap-14">
        <div class="flex items-center justify-between">
          <Link to="/" class="cusor-pointer">
            <div class="flex items-center gap-1 text-white">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="text-xl font-medium xl:text-sm">Portfolio</div>
            </div>
          </Link>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-white">
              <div class="text-3xl font-medium">hello</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-between gap-6 xl:flex-row">
        <div class="flex flex-col justify-between flex-1 gap-6 md:flex-row">
          <OverviewCard title={"Current Value"}>
            <div class="flex items-end gap-1 text-5xl xl:text-3xl">
              <CountUpNumber number={0} type="balance" />
            </div>
            <div class="flex text-3xl xl:text-lg">
              $<CountUpNumber number={0} type="balance" />
            </div>
          </OverviewCard>

          <OverviewCard
            title={"Profit & Loss"}
            tooltipText="Profit and loss is calculated by buying & hold on every time you add/remove liquidity"
            isTooltip
          >
            <div
              class={`xl:text-3xl text-5xl flex ${
                0 >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              $<CountUpNumber number={Math.abs(0)} type="balance" />
            </div>
            <div
              class={`xl:text-lg text-3xl flex ${
                0 >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              {#if 0 < 0}
                ↓
              {:else}
                ↑
              {/if}
              <CountUpNumber number={Math.abs(0) * 100} type="percent" />%
            </div>
          </OverviewCard>
        </div>

        <div class="flex flex-col justify-between flex-1 gap-6 md:flex-row">
          <OverviewCard title={"Unclaimed Fees"}>
            <div class="flex text-5xl xl:text-3xl">
              $<CountUpNumber number={0} type="balance" />
            </div>
          </OverviewCard>

          <OverviewCard title={"Impermanent Loss"}>
            <div
              class={`xl:text-3xl text-5xl flex ${
                0 >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              $<CountUpNumber number={Math.abs(0)} type="balance" />
            </div>
            <div
              class={`xl:text-lg text-3xl flex ${
                0 >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              {#if 0 < 0}
                ↓
              {:else}
                ↑
              {/if}
              <CountUpNumber number={Math.abs(0) * 100} type="percent" />%
            </div>
          </OverviewCard>
        </div>
      </div>
    </div>
  </div>
  <div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] -mt-26">
    <div
      class="flex flex-col gap-7 bg-white rounded-[20px] xl:p-8 p-4 mt-6"
      style="box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.10);"
    >
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-6 xl:flex-row">
          <div class="border border_0000001a rounded-[20px] p-6 flex-1">
            <div class="text-2xl font-medium">Fees</div>
            <div class="flex flex-col gap-4 mt-2">
              <div class="grid grid-cols-3">
                <div class="col-span-1" />
                <div class="col-span-1 font-medium">Claimable</div>
                <div class="col-span-1 font-medium">Claimed</div>
              </div>
              <div class="grid items-start grid-cols-3">
                <div class="flex items-center col-span-1 gap-2">
                  <img
                    src="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                    width="30"
                    height="30"
                    class="rounded-full"
                    alt=""
                  />
                  <div>ETH</div>
                </div>
                <div class="flex flex-col col-span-1 gap-1">
                  <div class="">1.66</div>
                  <div class="text-gray-500">$3,120.18</div>
                </div>
                <div class="flex flex-col col-span-1 gap-1">
                  <div class="">0</div>
                  <div class="text-gray-500">$0</div>
                </div>
              </div>
              <div class="grid items-start grid-cols-3">
                <div class="flex items-center col-span-1 gap-2">
                  <img
                    src="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                    width="30"
                    height="30"
                    class="rounded-full"
                    alt=""
                  />
                  <div>ETH</div>
                </div>
                <div class="flex flex-col col-span-1 gap-1">
                  <div class="">1.66</div>
                  <div class="text-gray-500">$3,120.18</div>
                </div>
                <div class="flex flex-col col-span-1 gap-1">
                  <div class="">0</div>
                  <div class="text-gray-500">$0</div>
                </div>
              </div>
            </div>
            <div
              class="border-t-[1px] border_0000000d mt-4 pt-4 flex justify-between items-center"
            >
              <div class="text-lg font-medium">Total fees</div>
              <div class="text-xl font-medium">$3,120.18</div>
            </div>
          </div>

          <div class="border border_0000001a rounded-[20px] p-6 flex-1">
            <div class="text-2xl font-medium">Liquidity</div>
            <div class="flex flex-col gap-4 mt-2">
              <div class="grid grid-cols-3">
                <div class="col-span-1" />
                <div class="col-span-1 font-medium">Current</div>
                <div class="col-span-1 font-medium">Provided</div>
              </div>
              <div class="grid items-start grid-cols-3">
                <div class="flex items-center col-span-1 gap-2">
                  <img
                    src="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                    width="30"
                    height="30"
                    class="rounded-full"
                    alt=""
                  />
                  <div>ETH</div>
                </div>
                <div class="flex flex-col col-span-1 gap-1">
                  <div class="">1.66</div>
                  <div class="text-gray-500">$3,120.18</div>
                </div>
                <div class="flex flex-col col-span-1 gap-1">
                  <div class="">0</div>
                  <div class="text-gray-500">$0</div>
                </div>
              </div>
              <div class="grid items-start grid-cols-3">
                <div class="flex items-center col-span-1 gap-2">
                  <img
                    src="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                    width="30"
                    height="30"
                    class="rounded-full"
                    alt=""
                  />
                  <div>ETH</div>
                </div>
                <div class="flex flex-col col-span-1 gap-1">
                  <div class="">1.66</div>
                  <div class="text-gray-500">$3,120.18</div>
                </div>
                <div class="flex flex-col col-span-1 gap-1">
                  <div class="">0</div>
                  <div class="text-gray-500">$0</div>
                </div>
              </div>
            </div>
            <div
              class="border-t-[1px] border_0000000d mt-4 pt-4 flex justify-between items-center"
            >
              <div class="text-lg font-medium">Impermanent Loss</div>
              <div class="text-xl font-medium">$3,120.18</div>
            </div>
          </div>
        </div>

        <div class="border border_0000001a rounded-[20px] p-6">
          <div class="text-2xl font-medium">Price Range</div>

          <EChart
            id="chartPriceRange"
            theme="white"
            {option}
            height={420}
            notMerge={true}
          />

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between gap-6">
              <div
                class="flex flex-col justify-center items-center border border_0000000d px-4 py-2 rounded-[20px] flex-1"
              >
                <div class="text-lg font-medium">Min Price</div>
                <div>2,439.6504</div>
              </div>
              <svg
                width="30px"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M15.2297 12.4277L11.0205 17.4023"
                  stroke="#000"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                /><path
                  d="M0.968262 12.4277L15.2298 12.4277"
                  stroke="#000"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                /><path
                  d="M2.35278 7.58392L6.56201 2.60938"
                  stroke="#000"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                /><path
                  d="M16.6143 7.58398L2.35278 7.58398"
                  stroke="#000"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                /></svg
              >
              <div
                class="flex flex-col justify-center items-center border border_0000000d px-4 py-2 rounded-[20px] flex-1"
              >
                <div class="text-lg font-medium">Max Price</div>
                <div>2,439.6504</div>
              </div>
            </div>
            <div
              class="flex flex-col justify-center items-center border border_0000000d px-4 py-2 rounded-[20px]"
            >
              <div class="text-lg font-medium">Current Price</div>
              <div>2,439.6504</div>
            </div>
            <div class="flex flex-col items-center justify-center">
              <div class="text-lg font-medium">Liquidation Amount</div>
              1 ETH = 2,671.6718 IMX
            </div>
          </div>
        </div>
      </div>

      <div class="border border_0000001a rounded-[20px] p-6">
        <div class="flex flex-col gap-6">
          <div class="flex items-center justify-between">
            <div class="text-2xl font-medium">History</div>
            <div
              use:tooltip={{
                content: `<tooltip-detail text="Premium feature. Coming soon" />`,
                allowHTML: true,
                placement: "top",
              }}
            >
              <Button variant="premium">Export Data</Button>
            </div>
          </div>

          <div class="border border_0000000d rounded-[10px] overflow-x-auto">
            <table class="table-auto xl:w-full w-[1200px]">
              <thead>
                <tr class="bg_f4f5f8">
                  <th
                    class="py-3 pl-3 xl:static xl:bg-transparent sticky left-0 z-9 bg_f4f5f8"
                  >
                    <div class="text-xs font-medium text-left uppercase">
                      Transaction
                    </div>
                  </th>
                  <th class="py-3">
                    <div class="text-xs font-medium text-left uppercase">
                      From
                    </div>
                  </th>
                  <th class="py-3">
                    <div class="text-xs font-medium text-left uppercase">
                      To
                    </div>
                  </th>
                  <th class="py-3 min-w-[100px]">
                    <div class="text-xs font-medium text-left uppercase">
                      Type
                    </div>
                  </th>
                  <th class="py-3 pr-3">
                    <div class="text-xs font-medium text-left uppercase">
                      Token change
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan={5}>
                    <div
                      class="flex items-center justify-center px-3 py-4 text-lg text-gray-400"
                    >
                      Empty
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }
</style>
