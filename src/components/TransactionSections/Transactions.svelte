<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { wallet, chain } from "~/store";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import { shorterAddress } from "~/utils";

  import type { TrxHistoryDataRes } from "~/types/TrxHistoryData";

  import tooltip from "~/entries/contentScript/views/tooltip";
  import Button from "~/components/Button.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import AddressManagement from "~/components/AddressManagement.svelte";

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
    if (selectedWallet) {
      data = [];
      pageToken = "";
      getListTransactions("");
    }
  }
</script>

<AddressManagement type="transactions" title="Transactions">
  <span slot="body">
    <div class="max-w-[2000px] m-auto w-[90%] -mt-32">
      <div
        class="flex flex-col gap-7 bg-white rounded-[20px] p-8"
        style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
      >
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
                    <tr class="hover:bg-gray-100 transition-all">
                      <td class="pl-3 py-4">
                        <div class="w-max">
                          <a
                            href={`${
                              item?.chain === "ETH"
                                ? `https://etherscan.io/tx/${item?.transaction_hash}`
                                : `https://www.oklink.com/btc/tx/${item?.transaction_hash}`
                            }`}
                            class="hover:text-blue-500 cursor-pointer"
                            target="_blank"
                          >
                            <div class="text-left flex items-start gap-2">
                              <div class="flex flex-col">
                                <div
                                  class="text-sm"
                                  use:tooltip={{
                                    content: `<tooltip-detail text="${item?.transaction_hash}" />`,
                                    allowHTML: true,
                                    placement: "top-start",
                                  }}
                                >
                                  {shorterAddress(item?.transaction_hash)}
                                </div>
                                <div class="text-gray-400 text-xs">
                                  {dayjs(
                                    new Date(item?.detail.timestamp)
                                  ).format("DD MMM YYYY, hh:mm A")}
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      </td>

                      <td class="py-4">
                        {#if item?.detail?.from}
                          <div
                            class="text-sm w-max"
                            use:tooltip={{
                              content: `<tooltip-detail text="${item?.detail?.from}" />`,
                              allowHTML: true,
                              placement: "top-start",
                            }}
                          >
                            <a
                              href={`${
                                item?.chain === "ETH"
                                  ? `https://etherscan.io/address/${item?.detail?.from}`
                                  : `https://www.oklink.com/btc/address/${item?.detail?.from}`
                              }`}
                              class="hover:text-blue-500 cursor-pointer"
                              target="_blank"
                            >
                              {shorterAddress(item?.detail?.from)}
                            </a>
                          </div>
                        {/if}
                      </td>

                      <td class="py-4">
                        {#if item?.detail?.to}
                          <div
                            class="text-sm w-max"
                            use:tooltip={{
                              content: `<tooltip-detail text="${item?.detail?.to}" />`,
                              allowHTML: true,
                              placement: "top-start",
                            }}
                          >
                            <a
                              href={`${
                                item?.chain === "ETH"
                                  ? `https://etherscan.io/address/${item?.detail?.to}`
                                  : `https://www.oklink.com/btc/address/${item?.detail?.to}`
                              }`}
                              class="hover:text-blue-500 cursor-pointer"
                              target="_blank"
                            >
                              {shorterAddress(item?.detail?.to)}
                            </a>
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
                                  >{change?.total < 0 ? "-" : "+"}<TooltipNumber
                                    number={Math.abs(change?.total)}
                                    type="amount"
                                  />
                                  {change?.price?.symbol
                                    ? change?.price?.symbol
                                    : "⎯"}
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
  </span>
</AddressManagement>

<style>
</style>
