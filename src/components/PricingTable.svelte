<script lang="ts">
  import {
    nimbusCompareFeatureData,
    nimbusPricingData,
  } from "~/data/pricetable";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { isDarkMode } from "~/store";
  import { getTooltipContent } from "~/utils";

  let yearly = true;
  let isHoverCompare;

  const compareResult = (item) => {
    if (item.state === "available") {
      return "✅";
    } else if (item.state === "unavailable") {
      return "⛔";
    } else {
      return "⚠️";
    }
  };

  const compareDescription = (item) => {
    return item.description;
  };
</script>

<!-- pricing table app -->
<div class="rounded-[10px] border border_0000000d">
  <table class="table-auto w-full">
    <thead>
      <tr class={`${$isDarkMode ? "bg-[#131313]" : "bg-gray-100"}`}>
        <th
          class="uppercase font-medium text-left py-3 pl-3 rounded-tl-xl xl:w-[400px] w-[230px]"
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
                    ? "dark:peer-focus:ring-blue-800 dark:bg-gray-700 dark:border-gray-600"
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
                {compareDescription(item.content.free)}
              </div>
            </td>
            <td class="py-4">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.explorer)}
                </span>{" "}
                {compareDescription(item.content.explorer)}
              </div>
            </td>
            <td class="py-4 px-3">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.alpha)}
                </span>{" "}
                {compareDescription(item.content.alpha)}
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<!-- compare table  -->
<div>
  <div class="flex flex-col">
    <h2 class="xl:text-xl text-3xl font-medium w-full mb-4">
      Compare with other apps
    </h2>
  </div>
  <div class="w-full overflow-auto rounded-[10px] border border_0000000d">
    <table
      class="xl:w-full w-[1000px] table-auto rounded-2xl"
      on:mouseleave={() => (isHoverCompare = undefined)}
    >
      <thead>
        <tr
          class={`text-left xl:text-base text-xl ${
            $isDarkMode ? "bg-[#131313]" : "bg-gray-100"
          }`}
        >
          <th
            class={`xl:w-[400px] w-[230px] xl:static sticky top-0 left-0 font-medium py-3 pl-3 rounded-tl-xl ${
              $isDarkMode ? "bg-[#161616]" : "bg-white"
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
      <tbody>
        {#each nimbusCompareFeatureData as item, index}
          <tr
            class={`${$isDarkMode ? "hover:bg-[#000]" : "hover:bg-gray-100"}`}
            on:mouseenter={() => (isHoverCompare = index)}
          >
            <td
              class={`py-4 pl-3 xl:w-[450px] w-[230px] xl:static sticky top-0 left-0 z-50 text-base ${
                isHoverCompare === index && !$isDarkMode
                  ? "bg-gray-100"
                  : isHoverCompare === index && $isDarkMode
                  ? "bg-[#000]"
                  : $isDarkMode
                  ? "bg-[#161616]"
                  : "bg-white"
              } `}
            >
              <div>
                {item.title}
              </div>
            </td>
            <td class="py-4">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.nimbus)}
                </span>{" "}
                {compareDescription(item.content.nimbus)}
              </div>
            </td>
            <td class="py-4">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.excel)}
                </span>{" "}
                {compareDescription(item.content.excel)}
              </div>
            </td>
            <td class="py-4">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.coinstats)}
                </span>{" "}
                {compareDescription(item.content.coinstats)}
              </div>
            </td>
            <td class="py-4">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.debank)}
                </span>{" "}
                {compareDescription(item.content.debank)}
              </div>
            </td>
            <td class="py-4 px-3">
              <div>
                <span class="w-4 h-4">
                  {compareResult(item.content.nansen)}
                </span>{" "}
                {compareDescription(item.content.nansen)}
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
