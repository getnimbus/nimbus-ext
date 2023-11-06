<script lang="ts">
  import McdItem from "~/UI/PositionTable/TableItem/MCDItem.svelte";
  import {
    nimbusCompareFeatureData,
    nimbusPricingData,
  } from "~/data/pricetable";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { isDarkMode } from "~/store";
  import { getTooltipContent } from "~/utils";
  // import RealtimeVideo from "~/assets/pricing/Realtime.mp4";

  let yearly = true;
  let isHoverCompare;

  let typePrice: "free" | "explorer" | "alpha" = "free";

  const compareResult = (item: any) => {
    if (item.state === "available") {
      return "✅";
    } else if (item.state === "unavailable") {
      return "⛔";
    } else {
      return "⚠️";
    }
  };

  $: handleDataHtml = (item: any) => {
    const contentData =
      typePrice === "free"
        ? item.content.free
        : typePrice === "explorer"
        ? item.content.explorer
        : item.content.alpha;
    return `   <div>
                ${contentData.description}
                <span class="w-4 h-4 ml-2">
                  ${compareResult(contentData)}
                </span>
              </div>`;
  };
</script>

<!-- pricing table app on pc -->
<div class="lg:block hidden rounded-[10px] border border_0000000d">
  <table class="table-auto w-full">
    <thead>
      <tr class={`${$isDarkMode ? "bg-[#131313]" : "bg-gray-100"}`}>
        <th
          class="uppercase font-medium text-left py-3 pl-3 rounded-tl-xl xl:w-[420px] w-[230px]"
        >
          plans
        </th>
        <th class="uppercase font-medium text-left py-3">free</th>
        <th class="uppercase font-medium text-left py-3">
          explorer
          {#if yearly}
            <span
              class="text-white px-2 py-1 font-normal text-sm xl:ml-3 ml-1 bg-[#10b981] rounded-lg"
            >
              S<span class="lowercase">ave</span> $17.5
            </span>
          {/if}
        </th>
        <th class="uppercase font-medium text-left py-3 px-3 rounded-tr-xl">
          alpha
          {#if yearly}
            <span
              class="text-white px-2 py-1 font-normal text-sm xl:ml-3 ml-1 bg-[#10b981] rounded-lg"
            >
              S<span class="lowercase">ave</span> $17.5
            </span>
          {/if}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class={`${$isDarkMode ? "bg-[#131313]" : "bg-gray-100"}`}>
        <td class="py-3 pl-3">
          <div class="flex items-center gap-1">
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                value=""
                class="sr-only peer"
                checked={yearly}
                on:click={() => (yearly = !yearly)}
              />
              <div
                class={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  $isDarkMode
                    ? "peer-focus:ring-blue-800 bg-gray-700 border-gray-600"
                    : "peer-focus:ring-blue-300 after:border-gray-300 bg-gray-200 "
                }`}
              />
            </label>
            <span class="ml-3 text-sm font-medium">
              Annual Billing <span class="text-green-500">(Save 17%)</span>
            </span>
          </div>
        </td>
        <td class="py-3 pr-3">
          <div class="flex flex-col gap-2">
            <span class="text-2xl font-semibold"> $0 </span>
            For those who starting to invest
          </div>
        </td>
        <td class="py-3 pr-3">
          <div class="flex flex-col gap-2">
            <span class="text-2xl font-semibold">
              {yearly ? "$8.25" : "$9.99"}
              <span class="text-base font-medium text-[#6b7380]">/month</span>
            </span>
            Boost your return and reduce your risk
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="flex flex-col gap-2">
            <span class="text-2xl font-semibold">
              {yearly ? "$82.5" : "$99.99"}
              <span class="text-base font-medium text-[#6b7380]">/month</span>
            </span>
            Enjoy all the features without any limited
          </div>
        </td>
      </tr>
      {#each nimbusPricingData as item}
        {#if item.featureStatus === "main"}
          <tr class={`${$isDarkMode ? "bg-[#1C1C1C]" : "bg-gray-50"}`}>
            <th colspan="8" class="font-medium py-4 pl-3 text-left">
              {item.title}
            </th>
          </tr>
        {:else if item.featureStatus === "part"}
          <tr
            class={`${$isDarkMode ? "hover:bg-[#000]" : "hover:bg-gray-100"} `}
          >
            <td class="py-4 pl-3">
              <div>
                {#if item.tippy.used}
                  <div
                    use:tooltip={{
                      content: getTooltipContent(
                        item.tippy.title,
                        item.tippy.content,
                        false,
                        $isDarkMode
                      ),
                      allowHTML: true,
                      placement: "top",
                      interactive: true,
                    }}
                  >
                    <span class="underline-dashed">
                      {item.title}
                    </span>
                  </div>
                {:else}
                  <span>
                    {item.title}
                  </span>
                {/if}
              </div>
            </td>
            <td class="py-4">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.free)}
                </span>{" "}
                {item.content.free.description}
              </div>
            </td>
            <td class="py-4">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.explorer)}
                </span>{" "}
                {item.content.explorer.description}
              </div>
            </td>
            <td class="py-4 px-3">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.alpha)}
                </span>{" "}
                {item.content.alpha.description}
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<!-- pricing table app on mobile ver  -->
<div class="lg:hidden flex flex-col items-center">
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-center gap-1">
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          value=""
          class="sr-only peer"
          checked={yearly}
          on:click={() => (yearly = !yearly)}
        />
        <div
          class={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
            $isDarkMode
              ? "peer-focus:ring-blue-800 bg-gray-700 border-gray-600"
              : "peer-focus:ring-blue-300 after:border-gray-300 bg-gray-200 "
          }`}
        />
      </label>
      <span class="ml-3 text-xl font-medium">
        Annual Billing <span class="text-green-500">(Save 17%)</span>
      </span>
    </div>
    <div class="flex gap-5">
      <div
        class={`uppercase py-3 px-4 text-2xl font-medium rounded-2xl ${
          typePrice === "free" && "bg-blue-100 text-primaryN"
        }`}
        on:click={() => (typePrice = "free")}
      >
        free
      </div>
      <div
        class={`uppercase py-3 px-4 text-2xl font-medium rounded-2xl ${
          typePrice === "explorer" && "bg-blue-100 text-primaryN"
        }`}
        on:click={() => (typePrice = "explorer")}
      >
        explorer
      </div>
      <div
        class={`uppercase py-3 px-4 text-2xl font-medium rounded-2xl ${
          typePrice === "alpha" && "bg-blue-100 text-primaryN"
        }`}
        on:click={() => (typePrice = "alpha")}
      >
        alpha
      </div>
    </div>
    <div class="flex items-center justify-center">
      {#if typePrice === "free"}
        <div class="flex flex-col gap-2 justify-center items-center p-5">
          <div class="text-2xl font-medium uppercase">Free</div>
          <span class="text-4xl font-semibold"> $0 </span>
          <div class="text-lg">For those who starting to invest</div>
        </div>
      {:else if typePrice === "explorer"}
        <div class="flex flex-col gap-2 justify-center items-center p-5">
          <div class="text-2xl font-medium uppercase">
            Explorer{" "}
            {#if yearly}
              <span
                class="text-white px-2 py-1 font-normal text-lg ml-3 bg-[#10b981] rounded-lg"
              >
                S<span class="lowercase">ave</span> $1.75
              </span>
            {/if}
          </div>
          <div class="text-4xl font-medium">
            {yearly ? "$8.25" : "$9.99"}{" "}
            <span class="text-[#6b7380] text-lg font-medium"> /month </span>
          </div>
          <div class="text-lg">Boost your return and reduce your risk</div>
        </div>
      {:else if typePrice === "alpha"}
        <div class="flex flex-col gap-2 justify-center items-center p-5">
          <div class="text-2xl font-medium uppercase">
            Alpha{" "}
            {#if yearly}
              <span
                class="text-white px-2 py-1 font-normal text-lg ml-3 bg-[#10b981] rounded-lg"
              >
                S<span class="lowercase">ave</span> $17.5
              </span>
            {/if}
          </div>
          <div class="text-4xl font-medium">
            {yearly ? "$82.5" : "$99.99"}{" "}
            <span class="text-[#6b7380] text-lg font-medium"> /month </span>
          </div>
          <div class="text-lg">Enjoy all the features without any limited</div>
        </div>
      {/if}
    </div>
  </div>
  <table class="w-full table-auto">
    <tbody>
      {#each nimbusPricingData as item}
        {#if item.featureStatus === "main"}
          <tr>
            <td colspan="8" class="bg-gray-50 text-2xl font-medium py-6 px-3">
              {item.title}
            </td>
          </tr>
        {:else if item.featureStatus === "part"}
          <tr
            class={`text-xl ${
              $isDarkMode ? "hover:bg-[#000]" : "hover:bg-gray-100"
            } `}
          >
            <td class="py-6 px-3">
              <div>
                {#if item.tippy.used}
                  <div
                    use:tooltip={{
                      content: getTooltipContent(
                        item.tippy.title,
                        item.tippy.content,
                        false,
                        $isDarkMode
                      ),
                      allowHTML: true,
                      placement: "top",
                      interactive: true,
                    }}
                  >
                    <span class="underline-dashed">
                      {item.title}
                    </span>
                  </div>
                {:else}
                  <span>
                    {item.title}
                  </span>
                {/if}
              </div>
            </td>
            <td class="py-6 px-3 text-right">
              {@html handleDataHtml(item)}
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<!-- compare table  -->
<div class="flex flex-col gap-4">
  <div class="xl:text-xl text-3xl font-medium w-full">
    Compare with other apps
  </div>
  <div class="w-full overflow-auto rounded-[10px] border border_0000000d">
    <table class="min-w-[1400px] table-auto rounded-2xl">
      <thead>
        <tr
          class={`text-left xl:text-base text-xl ${
            $isDarkMode ? "bg-[#131313]" : "bg-gray-100"
          }`}
        >
          <th
            class={`xl:w-[420px] w-[230px] xl:static sticky top-0 left-0 font-medium py-3 pl-3 rounded-tl-xl ${
              $isDarkMode ? "bg-[#161616]" : "bg-gray-100"
            }`}
          >
            #
          </th>
          <th class="font-medium py-3">Nimbus</th>
          <th class="font-medium py-3">Excel</th>
          <th class="font-medium py-3">CoinStats</th>
          <th class="font-medium py-3">DeBank</th>
          <th class="font-medium py-3 px-3 rounded-tr-xl">Nansen</th>
        </tr>
      </thead>
      <tbody on:mouseleave={() => (isHoverCompare = undefined)}>
        {#each nimbusCompareFeatureData as item, index}
          <tr
            class={`group xl:text-base text-xl ${
              $isDarkMode ? "hover:bg-[#000]" : "hover:bg-gray-100"
            }`}
            on:mouseenter={() => (isHoverCompare = index)}
          >
            <td
              class={`py-4 pl-3 xl:w-auto w-[300px] xl:static sticky top-0 left-0 z-10 ${
                $isDarkMode
                  ? "bg-[#161616] group-hover:bg-[#000]"
                  : "bg-white group-hover:bg-gray-100"
              } `}
            >
              <div>
                {item.title}
              </div>
            </td>
            <td class="py-4 w-[200px]">
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.nimbus)}
                </span>{" "}
                {item.content.nimbus.description}
              </div>
            </td>
            <td class="py-4 w-[200px]">
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.excel)}
                </span>{" "}
                {item.content.excel.description}
              </div>
            </td>
            <td class="py-4 w-[200px]">
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.coinstats)}
                </span>{" "}
                {item.content.coinstats.description}
              </div>
            </td>
            <td class="py-4 w-[200px]">
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.debank)}
                </span>{" "}
                {item.content.debank.description}
              </div>
            </td>
            <td class="py-4 w-[200px] px-3">
              <div>
                <span class="w-4 h-4 mr-1">
                  {compareResult(item.content.nansen)}
                </span>{" "}
                {item.content.nansen.description}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
  .underline-dashed {
    text-decoration: underline 1.5px dotted;
    text-underline-offset: 3px;
  }
</style>
