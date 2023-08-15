<script lang="ts">
  import { selectedPackage } from "~/store";
  import { shorterName } from "~/utils";
  import { useNavigate } from "svelte-navigator";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import Button from "~/components/Button.svelte";

  export let data;

  const navigate = useNavigate();

  let packageSelected = "";
  selectedPackage.subscribe((value) => {
    packageSelected = value;
  });

  let isShowTooltipProtocol = false;
  let sortTVL = "default";
  let sortAPY = "default";

  $: formatData = data.map((item) => {
    return {
      ...item,
      tvl: Number(item.tvl),
      apy: item.apy * 100,
    };
  });

  const toggleSortTVL = () => {
    if (packageSelected === "FREE") {
      return;
    }
    switch (sortTVL) {
      case "default":
        sortTVL = "ascend";
        break;
      case "ascend":
        sortTVL = "descend";
        break;
      case "descend":
        sortTVL = "default";
        break;
      default:
        sortTVL = "default";
    }

    if (sortTVL === "ascend") {
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
    if (sortTVL === "descend") {
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
    if (sortTVL === "default") {
      formatData = data.map((item) => {
        return {
          ...item,
          tvl: Number(item.tvl),
          apy: item.apy * 100,
        };
      });
    }
  };

  const toggleSortAPY = () => {
    if (packageSelected === "FREE") {
      return;
    }

    switch (sortAPY) {
      case "default":
        sortAPY = "ascend";
        break;
      case "ascend":
        sortAPY = "descend";
        break;
      case "descend":
        sortAPY = "default";
        break;
      default:
        sortAPY = "default";
    }

    if (sortAPY === "ascend") {
      formatData = formatData.sort((a, b) => {
        if (a.apy > b.apy) {
          return 1;
        }
        if (a.apy < b.apy) {
          return -1;
        }
        return 0;
      });
    }
    if (sortAPY === "descend") {
      formatData = formatData.sort((a, b) => {
        if (a.apy < b.apy) {
          return 1;
        }
        if (a.apy > b.apy) {
          return -1;
        }
        return 0;
      });
    }
    if (sortAPY === "default") {
      formatData = data.map((item) => {
        return {
          ...item,
          tvl: Number(item.tvl),
          apy: item.apy * 100,
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
            class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8] w-[550px]"
          >
            <div
              class="text-left xl:text-xs text-base uppercase font-medium text-black"
            >
              Name
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right xl:text-xs text-base uppercase font-medium text-black"
            >
              Chain
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right xl:text-xs text-base uppercase font-medium text-black"
            >
              Protocol
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-right xl:text-xs text-base uppercase font-medium text-black flex items-center justify-end gap-2"
            >
              APY
              <div on:click={toggleSortAPY} class="cursor-pointer">
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
          <th class="py-3 pr-3 rounded-tr-[10px]">
            <div
              class="text-right xl:text-xs text-base uppercase font-medium text-black flex items-center justify-end gap-2"
            >
              <TooltipTitle
                tooltipText={"Total value locked in this protocol"}
                isBigIcon>TVL</TooltipTitle
              >
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
      <tbody class="relative">
        {#if formatData && formatData.length === 0}
          <tr>
            <td colspan="5">
              <div
                class="flex justify-center items-center py-3 px-3 xl:text-lg text-xl text-gray-400"
              >
                Empty
              </div>
            </td>
          </tr>
        {:else}
          {#each formatData.slice(0, packageSelected === "FREE" ? 10 : undefined) as item}
            <tr
              class="group transition-all cursor-pointer"
              on:click={() => {
                window.open(item.link, "_blank");
              }}
            >
              <td
                class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-9 bg-white w-[550px] group-hover:bg-gray-100"
              >
                <div
                  class="text-left text-black xl:text-sm text-xl font-medium"
                >
                  {#if item.name === undefined}
                    N/A
                  {:else}
                    {item.name}
                  {/if}
                </div>
              </td>

              <td class="py-3 group-hover:bg-gray-100">
                <div class="xl:text-sm text-xl font-medium flex justify-end">
                  {item.chain}
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
                  <TooltipNumber number={item.apy} type="percent" />%
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
        {#if packageSelected === "FREE"}
          <tr
            class="absolute z-10 left-0 right-0 bottom-0 top-[220px] flex justify-center pt-10 bg-white/90 backdrop-blur-md bg-gradient-to-t from-white via-white to-transparent"
          >
            <td colspan="5" class="flex flex-col items-center gap-1">
              <div class="text-lg font-medium">
                Use Nimbus at its full potential
              </div>
              <div class="text-gray-500 text-base">
                Upgrade to Premium to access all other <span class="font-medium"
                  >{formatData.length - 5}</span
                > opportunities
              </div>
              <div class="w-max mt-2">
                <Button variant="premium" on:click={() => navigate("/upgrade")}
                  >Start 30-day Trial</Button
                >
              </div>
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
