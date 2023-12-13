<script lang="ts">
  import { selectedPackage, isDarkMode } from "~/store";
  import { shorterName } from "~/utils";
  import { useNavigate } from "svelte-navigator";

  import Tooltip from "~/components/Tooltip.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import Button from "~/components/Button.svelte";

  export let data;

  const navigate = useNavigate();

  let isShowTooltipProtocol = false;
  let sortTVL = "default";
  let sortAPY = "default";

  $: formatData = data?.map((item) => {
    return {
      ...item,
      tvl: Number(item.tvl),
      apy: item.apy * 100,
    };
  });

  const toggleSortTVL = () => {
    if ($selectedPackage === "FREE") {
      return;
    }
    switch (sortTVL) {
      case "default":
        sortTVL = "asc";
        break;
      case "asc":
        sortTVL = "desc";
        break;
      case "desc":
        sortTVL = "default";
        break;
      default:
        sortTVL = "default";
    }

    if (sortTVL === "asc") {
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
    if (sortTVL === "desc") {
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
    if ($selectedPackage === "FREE") {
      return;
    }

    switch (sortAPY) {
      case "default":
        sortAPY = "asc";
        break;
      case "asc":
        sortAPY = "desc";
        break;
      case "desc":
        sortAPY = "default";
        break;
      default:
        sortAPY = "default";
    }

    if (sortAPY === "asc") {
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
    if (sortAPY === "desc") {
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

  $: sortIcon = (sortType) => {
    return `<svg
                    height="0.9rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0" /><g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M16.0686 15H7.9313C7.32548 15 7.02257 15 6.88231 15.1198C6.76061 15.2238 6.69602 15.3797 6.70858 15.5393C6.72305 15.7232 6.93724 15.9374 7.36561 16.3657L11.4342 20.4344C11.6323 20.6324 11.7313 20.7314 11.8454 20.7685C11.9458 20.8011 12.054 20.8011 12.1544 20.7685C12.2686 20.7314 12.3676 20.6324 12.5656 20.4344L16.6342 16.3657C17.0626 15.9374 17.2768 15.7232 17.2913 15.5393C17.3038 15.3797 17.2392 15.2238 17.1175 15.1198C16.9773 15 16.6744 15 16.0686 15Z"
                        stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "desc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.9313 9.00005H16.0686C16.6744 9.00005 16.9773 9.00005 17.1175 8.88025C17.2393 8.7763 17.3038 8.62038 17.2913 8.46082C17.2768 8.27693 17.0626 8.06274 16.6342 7.63436L12.5656 3.56573C12.3676 3.36772 12.2686 3.26872 12.1544 3.23163C12.054 3.199 11.9458 3.199 11.8454 3.23163C11.7313 3.26872 11.6323 3.36772 11.4342 3.56573L7.36561 7.63436C6.93724 8.06273 6.72305 8.27693 6.70858 8.46082C6.69602 8.62038 6.76061 8.7763 6.88231 8.88025C7.02257 9.00005 7.32548 9.00005 7.9313 9.00005Z"
                         stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "asc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                  </svg>`;
  };
</script>

<div class="h-[563px] flex flex-col gap-4">
  <div class="text-4xl font-medium xl:text-2xl">
    Yield farming opportunities
  </div>
  <div
    class={`rounded-[10px] overflow-x-auto overflow-y-auto h-[563px] relative ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <table
      class={`table-auto xl:w-full w-[1200px] ${
        formatData && formatData.length === 0 ? "h-full" : ""
      }`}
    >
      <thead>
        <tr class="bg_f4f5f8 sticky left-0 top-0 z-10">
          <th
            class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 top-0 z-10 bg_f4f5f8 w-[550px]"
          >
            <div class="font-medium text-left uppercase xl:text-xs text-xl">
              Name
            </div>
          </th>
          <th class="py-3">
            <div class="font-medium text-right uppercase xl:text-xs text-xl">
              Chain
            </div>
          </th>
          <th class="py-3">
            <div class="font-medium text-right uppercase xl:text-xs text-xl">
              Protocol
            </div>
          </th>
          <th class="py-3">
            <div
              class="flex items-center justify-end gap-2 font-medium text-right uppercase xl:text-xs text-xl"
            >
              APY
              <div on:click={toggleSortAPY} class="cursor-pointer">
                {@html sortIcon(sortAPY)}
              </div>
            </div>
          </th>
          <th class="py-3 pr-3 rounded-tr-[10px]">
            <div
              class="flex items-center justify-end gap-2 font-medium text-right uppercase xl:text-xs text-xl"
            >
              <TooltipTitle
                tooltipText={"Total value locked in this protocol"}
                isBigIcon>TVL</TooltipTitle
              >
              <div on:click={toggleSortTVL} class="cursor-pointer">
                {@html sortIcon(sortTVL)}
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
                class="h-full flex items-center justify-center px-3 py-3 text-gray-400 xl:text-lg text-xl"
              >
                Empty
              </div>
            </td>
          </tr>
        {:else}
          {#each (formatData || [])?.slice(0, $selectedPackage === "FREE" ? 10 : undefined) as item}
            <tr
              class="transition-all cursor-pointer group"
              on:click={() => {
                window.open(item.link, "_blank");
              }}
            >
              <td
                class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-9 w-[550px] ${
                  $isDarkMode
                    ? "bg-[#131313] group-hover:bg-[#000]"
                    : "bg-white group-hover:bg-gray-100"
                }`}
              >
                <div class="font-medium text-left xl:text-sm text-2xl">
                  {#if item.name === undefined}
                    N/A
                  {:else}
                    {item.name}
                  {/if}
                </div>
              </td>

              <td
                class={`py-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div class="flex justify-end font-medium xl:text-sm text-2xl">
                  {item.chain}
                </div>
              </td>

              <td
                class={`py-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div
                  class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end"
                >
                  <div
                    class="relative"
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
                        class="absolute left-0 -top-8"
                        style="z-index: 2147483648;"
                      >
                        <Tooltip text={item.protocol} />
                      </div>
                    {/if}
                  </div>
                </div>
              </td>

              <td
                class={`py-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div
                  class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end"
                >
                  <TooltipNumber number={item.apy} type="percent" />%
                </div>
              </td>

              <td
                class={`py-3 pr-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div
                  class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end"
                >
                  $<TooltipNumber number={item.tvl} type="balance" />
                </div>
              </td>
            </tr>
          {/each}
        {/if}
        {#if $selectedPackage === "FREE"}
          <tr
            class={`absolute z-10 left-0 right-0 bottom-0 top-[220px] flex justify-center pt-10 backdrop-blur-md bg-gradient-to-t to-transparent ${
              $isDarkMode
                ? "bg-black/90 from-[#000] via-[#222222]"
                : "bg-white/95 from-white via-white"
            } `}
          >
            <td colspan="5" class="flex flex-col items-center gap-1">
              <div class="text-lg font-medium">
                Use Nimbus at its full potential
              </div>
              <div class="text-base text-gray-500">
                Upgrade to Premium to access all other <span class="font-medium"
                  >{formatData.length - 5 > 0
                    ? formatData.length - 5
                    : ""}</span
                > opportunities
              </div>
              <div class="mt-2 w-max">
                <Button variant="premium" on:click={() => navigate("/upgrade")}
                  >Upgrade Plan</Button
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
