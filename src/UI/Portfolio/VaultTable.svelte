<script lang="ts">
  import { shorterName } from "~/utils";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let data;

  let isShowTooltipName = false;
  let isShowTooltipProtocol = false;
  let sortTag = "default";

  $: formatData = data.map((item) => {
    return {
      ...item,
      tvl: Number(item.tvl),
    };
  });

  const toggleSortTVL = () => {
    switch (sortTag) {
      case "default":
        sortTag = "ascend";
        break;
      case "ascend":
        sortTag = "descend";
        break;
      case "descend":
        sortTag = "default";
        break;
      default:
        sortTag = "default";
    }

    if (sortTag === "ascend") {
      formatData = formatData.sort((a, b) => {
        if (a.tvl > b.tvl) {
          return 1;
        }
        if (a.tvl < b.tvl) {
          return -1;
        }
        return 0;
      });
    }
    if (sortTag === "descend") {
      formatData = formatData.sort((a, b) => {
        if (a.tvl < b.tvl) {
          return 1;
        }
        if (a.tvl > b.tvl) {
          return -1;
        }
        return 0;
      });
    }
    if (sortTag === "default") {
      formatData = data.map((item) => {
        return {
          ...item,
          tvl: Number(item.tvl),
        };
      });
    }
  };
</script>

<div class="h-[563px] flex flex-col gap-4">
  <div class="xl:text-2xl text-4xl font-medium text-black">
    Yield farming opportunities
  </div>
  <div
    class="border border-[#0000000d] rounded-[10px] overflow-visible overflow-y-auto h-[563px] relative"
  >
    <table class="table-auto xl:w-full w-[1200px]">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th
            class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8] xl:w-[230px] w-[280px]"
          >
            <div
              class="text-left xl:text-xs text-base uppercase font-semibold text-black"
            >
              Name
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right xl:text-xs text-base uppercase font-semibold text-black"
            >
              Protocol
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right xl:text-xs text-base uppercase font-semibold text-black"
            >
              APY
            </div>
          </th>
          <th class="py-3 pr-3 rounded-tr-[10px]">
            <div
              class="text-right xl:text-xs text-base uppercase font-semibold text-black flex items-center justify-end gap-2"
            >
              TVL
              <div on:click={toggleSortTVL} class="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="1.2em"
                  viewBox="0 0 320 512"
                  ><path
                    d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                  /></svg
                >
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {#if formatData && formatData.length === 0}
          <tr>
            <td colspan="4">
              <div
                class="flex justify-center items-center py-3 px-3 xl:text-lg text-xl text-gray-400"
              >
                Empty
              </div>
            </td>
          </tr>
        {:else}
          {#each formatData as item}
            <tr
              class="group transition-all cursor-pointer"
              on:click={() => {
                window.open(item.link, "_blank");
              }}
            >
              <td
                class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-9 bg-white xl:w-[230px] w-[280px] group-hover:bg-gray-100"
              >
                <div class="text-left">
                  <div
                    class="text-black xl:text-sm text-xl font-medium relative"
                    on:mouseover={() => {
                      isShowTooltipName = true;
                    }}
                    on:mouseleave={() => (isShowTooltipName = false)}
                  >
                    {#if item.name === undefined}
                      N/A
                    {:else}
                      {item?.name?.length > 20
                        ? shorterName(item.name, 20)
                        : item.name}
                    {/if}
                    {#if isShowTooltipName && item?.name?.length > 20}
                      <div
                        class="absolute -top-8 left-0"
                        style="z-index: 2147483648;"
                      >
                        <tooltip-detail text={item.name} />
                      </div>
                    {/if}
                  </div>
                </div>
              </td>

              <td class="py-3 group-hover:bg-gray-100">
                <div
                  class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
                >
                  <div class="text-left">
                    <div
                      class="text-black xl:text-sm text-xl font-medium relative"
                      on:mouseover={() => {
                        isShowTooltipProtocol = true;
                      }}
                      on:mouseleave={() => (isShowTooltipProtocol = false)}
                    >
                      {#if item.protocol === undefined}
                        N/A
                      {:else}
                        {item?.protocol?.length > 20
                          ? shorterName(item.protocol, 20)
                          : item.protocol}
                      {/if}
                      {#if isShowTooltipProtocol && item?.protocol?.length > 20}
                        <div
                          class="absolute -top-8 left-0"
                          style="z-index: 2147483648;"
                        >
                          <tooltip-detail text={item.protocol} />
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </td>

              <td class="py-3 group-hover:bg-gray-100">
                <div
                  class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
                >
                  <TooltipNumber number={item.apy * 100} type="percent" />%
                </div>
              </td>

              <td class="py-3 pr-3 group-hover:bg-gray-100">
                <div
                  class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
                >
                  $<TooltipNumber number={item.tvl} type="balance" />
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
