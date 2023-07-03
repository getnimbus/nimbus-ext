<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import Button from "~/components/Button.svelte";
  import CopyToClipboard from "~/components/CopyToClipboard.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let data;
  export let isLoading;
  export let pageToken;
  export let loadMore = (pageToken) => {};
</script>

<div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
  <table class="table-auto xl:w-full w-[1200px]">
    <thead>
      <tr class="bg-[#f4f5f8]">
        <th class="pl-3 py-3">
          <div class="text-left text-xs uppercase font-semibold text-black">
            Transaction
          </div>
        </th>
        <th class="py-3">
          <div class="text-left text-xs uppercase font-semibold text-black">
            From
          </div>
        </th>
        <th class="py-3">
          <div class="text-left text-xs uppercase font-semibold text-black">
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
          <div class="text-left text-xs uppercase font-semibold text-black">
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
                          >{change?.total < 0 ? "-" : "+"}<TooltipNumber
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
      on:click={() => loadMore(pageToken)}
      disabled={isLoading}
      {isLoading}
      >Load more
    </Button>
  </div>
{/if}

<style></style>
