<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import * as echarts from "echarts";

  import type { TrxHistoryDataRes } from "~/types/TrxHistoryData";

  import Button from "~/components/Button.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import AddressManagement from "~/components/AddressManagement.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";
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
  let data = [];
  let pageToken = "";
  let isLoadingChart = false;
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

  const getListTransactions = async (page: string) => {
    isLoading = true;
    try {
      const response: TrxHistoryDataRes = await sendMessage("getTrxHistory", {
        address: selectedWallet,
        chain: selectedChain,
        pageToken: page,
      });
      if (selectedWallet === response.address) {
        data = [...data, ...response.result.data];
        if (
          response.result.pageToken &&
          response.result.pageToken.length !== 0
        ) {
          pageToken = response.result.pageToken;
        }
      } else {
        console.log("response: ", response);
      }
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  $: {
    if (selectedWallet || selectedChain) {
      data = [];
      pageToken = "";
      getListTransactions("");
    }
  }
</script>

<AddressManagement type="order" title="Transactions">
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
        <div
          class="border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-4"
        >
          <div class="text-2xl font-medium text-black">
            Historical Transactions
          </div>
          <div class="border border-[#0000000d] rounded-[10px]">
            <table class="table-auto w-full">
              <thead>
                <tr class="bg-[#f4f5f880]">
                  <th class="pl-3 py-3">
                    <div
                      class="text-left text-xs uppercase font-semibold text-black"
                    >
                      Transaction
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-left text-xs uppercase font-semibold text-black"
                    >
                      From
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-left text-xs uppercase font-semibold text-black"
                    >
                      To
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-left text-xs uppercase font-semibold text-black min-w-[100px]"
                    >
                      Type
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-left text-xs uppercase font-semibold text-black"
                    >
                      Token change
                    </div>
                  </th>
                </tr>
              </thead>
              {#if isLoading && pageToken.length === 0}
                <tbody>
                  <tr>
                    <td colspan={5}>
                      <div class="flex justify-center items-center py-4 px-3">
                        <loading-icon />
                      </div>
                    </td>
                  </tr>
                </tbody>
              {:else}
                <tbody>
                  {#if data && data?.length === 0}
                    <tr>
                      <td colspan={5}>
                        <div
                          class="flex justify-center items-center py-4 px-3 text-lg text-gray-400"
                        >
                          Empty
                        </div>
                      </td>
                    </tr>
                  {:else}
                    {#each data || [] as item}
                      <tr
                        class="hover:bg-gray-100 transition-all border-b-[0.5px] last:border-none"
                      >
                        <td class="pl-3 py-4">
                          <div class="text-left flex items-start gap-2 w-max">
                            <div class="flex flex-col">
                              <div class="text-sm">
                                <CopyToClipboard
                                  address={item?.transaction_hash}
                                  textTooltip="Copy transaction to clipboard"
                                  iconColor="#000"
                                  isShorten={true}
                                  isLink={true}
                                  link={`${
                                    item?.chain === "ETH"
                                      ? `https://etherscan.io/tx/${item?.transaction_hash}`
                                      : `https://www.oklink.com/btc/tx/${item?.transaction_hash}`
                                  }`}
                                />
                              </div>
                              <div class="text-gray-400 text-xs">
                                {dayjs(new Date(item?.detail.timestamp)).format(
                                  "DD/MM/YYYY, hh:mm A"
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td class="py-4">
                          {#if item?.detail?.from}
                            <div class="w-max text-sm">
                              <CopyToClipboard
                                address={item?.detail?.from}
                                iconColor="#000"
                                isShorten={true}
                                isLink={true}
                                link={`${
                                  item?.chain === "ETH"
                                    ? `https://etherscan.io/address/${item?.detail?.from}`
                                    : `https://www.oklink.com/btc/address/${item?.detail?.from}`
                                }`}
                              />
                            </div>
                          {/if}
                        </td>

                        <td class="py-4">
                          {#if item?.detail?.to}
                            <div class="w-max text-sm">
                              <CopyToClipboard
                                address={item?.detail?.to}
                                iconColor="#000"
                                isShorten={true}
                                isLink={true}
                                link={`${
                                  item?.chain === "ETH"
                                    ? `https://etherscan.io/address/${item?.detail?.to}`
                                    : `https://www.oklink.com/btc/address/${item?.detail?.to}`
                                }`}
                              />
                            </div>
                          {/if}
                        </td>

                        <td class="py-4 min-w-[100px]">
                          <div
                            class="text-sm text-[#00000099] font-medium flex justify-start"
                          >
                            {#if item?.type}
                              <div
                                class="w-max px-2 py-1 text-[#27326F] text-[12px] font-normal bg-[#6AC7F533] rounded-[5px] capitalize"
                              >
                                {item?.type}
                              </div>
                            {/if}
                          </div>
                        </td>

                        <td class="py-4 pr-3">
                          <div
                            class="text-sm font-medium flex flex-col items-start gap-2"
                          >
                            {#each item.changes as change}
                              <div class="flex items-center gap-2">
                                <img
                                  src={change?.logo}
                                  alt=""
                                  class="w-5 h-5 overflow-hidden rounded-full object-contain"
                                />
                                <div
                                  class={`flex gap-1 ${
                                    change?.total < 0
                                      ? "text-[#00000099]"
                                      : "text-[#00A878]"
                                  }`}
                                >
                                  <span
                                    >{change?.total < 0
                                      ? "-"
                                      : "+"}<TooltipNumber
                                      number={Math.abs(change?.total)}
                                      type="amount"
                                    />
                                    {change?.symbol || change?.name || "⎯"}
                                  </span>
                                  <span class="flex">
                                    ($<TooltipNumber
                                      number={Math.abs(
                                        change?.total * change?.price?.price
                                      )}
                                      type="balance"
                                    />)
                                  </span>
                                </div>
                              </div>
                            {/each}
                          </div>
                        </td>
                      </tr>
                    {/each}
                  {/if}
                </tbody>
              {/if}
            </table>
          </div>
          {#if pageToken.length !== 0}
            <div class="mx-auto">
              <Button
                variant="secondary"
                on:click={() => getListTransactions(pageToken)}
                disabled={isLoading}
                {isLoading}>Load more</Button
              >
            </div>
          {/if}
        </div>
      </div>
    </div>
  </span>
</AddressManagement>

<style>
</style>
