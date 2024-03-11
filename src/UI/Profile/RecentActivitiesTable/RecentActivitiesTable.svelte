<script lang="ts">
  import { chain, isDarkMode } from "~/store";
  import { nimbus } from "~/lib/network";
  import { onMount } from "svelte";
  import { filterDuplicates } from "~/utils";

  import Loading from "~/components/Loading.svelte";
  import Button from "~/components/Button.svelte";
  import RecentActivityItem from "./RecentActivityItem.svelte";
  import RecentActivityMobileItem from "./RecentActivityMobileItem.svelte";

  export let selectedAddress;
  export let isSync = false;
  export let enabledFetchAllData = false;

  $: isFetch = isSync ? enabledFetchAllData : true;

  let isLoading = false;
  let data = [];
  let pageToken = 1;
  let isDisabled = false;

  const getRecentActivities = async (address, chain, paginate) => {
    isLoading = true;
    try {
      const response: any = await nimbus.get(
        `/v2/analysis/${address}/recent-activities?chain=${chain}&page=${paginate}`
      );
      if (response && response?.data) {
        data = [...data, ...response?.data?.data];
        if (response.data.page === pageToken) {
          isDisabled = true;
        }
        pageToken = response.data.page;
      }
    } catch (e) {
      console.error("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  const handleLoadMore = (paginate: number) => {
    getRecentActivities(selectedAddress, $chain, paginate);
  };

  $: {
    if (selectedAddress || $chain) {
      if (selectedAddress?.length !== 0 && $chain?.length !== 0) {
        data = [];
        pageToken = 1;
        isLoading = false;
        getRecentActivities(selectedAddress, $chain, 1);
      }
    }
  }

  let tableTokenHeader;
  let isStickyTableToken = false;

  onMount(() => {
    const handleScroll = () => {
      const clientRectTokenHeader = tableTokenHeader?.getBoundingClientRect();
      isStickyTableToken = clientRectTokenHeader?.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<div
  class="col-span-4 xl:border border_0000001a rounded-xl flex flex-col gap-3 xl:p-6 py-3"
>
  <div class="flex justify-start text-2xl font-medium">Recent Trades</div>

  <!-- Desktop view -->
  <div
    class={`xl:block hidden rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <table class="table-auto xl:w-full w-[2000px] h-full">
      <thead
        class={isStickyTableToken ? "sticky top-0 z-9" : ""}
        bind:this={tableTokenHeader}
      >
        <tr class="bg_f4f5f8">
          <th
            class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[200px]"
          >
            <div class="text-left xl:text-xs text-xl uppercase font-medium">
              From
            </div>
          </th>
          <th
            class="py-3 xl:static xl:bg-transparent sticky left-[200px] z-10 bg_f4f5f8 w-[200px]"
          >
            <div class="text-left xl:text-xs text-xl uppercase font-medium">
              To
            </div>
          </th>
          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Trade size
            </div>
          </th>
          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Fee
            </div>
          </th>
          <th class="py-3 pr-3 rounded-tr-[10px]">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Transaction
            </div>
          </th>
        </tr>
      </thead>

      {#if isLoading && pageToken === 1}
        <tbody>
          <tr>
            <td colspan={5}>
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if data && data.length === 0}
            <tr>
              <td colspan={5}>
                <div
                  class="flex justify-center items-center h-full py-3 px-3 text-base text-gray-400"
                >
                  Empty
                </div>
              </td>
            </tr>
          {:else}
            {#each filterDuplicates(data) as item, index}
              <RecentActivityItem
                {item}
                lastIndex={data.length - 1 === index}
              />
            {/each}
          {/if}
        </tbody>
      {/if}
    </table>
  </div>

  <!-- Mobile view -->
  <div
    class={`xl:hidden block rounded-[10px] p-2 overflow-hidden w-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    {#if isLoading && pageToken === 1}
      <div class="flex justify-center items-center h-full py-3 px-3">
        <Loading />
      </div>
    {:else}
      <div>
        {#if data && data.length === 0}
          <div
            class="flex justify-center items-center h-full py-3 px-3 text-base text-gray-400"
          >
            Empty
          </div>
        {:else}
          {#each filterDuplicates(data) as item}
            <RecentActivityMobileItem {item} />
          {/each}
        {/if}
      </div>
    {/if}
  </div>

  <div class="mx-auto">
    <div class="w-[140px]">
      {#if isDisabled || data.length === 0}
        <Button disabled>Load more</Button>
      {:else}
        <Button
          variant="secondary"
          on:click={() => handleLoadMore(pageToken)}
          disabled={isLoading}
          {isLoading}
          >Load more
        </Button>
      {/if}
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
