<script>
  import { nimbusPricingData } from "~/data/pricetable";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { isDarkMode } from "~/store";
  import { getTooltipContent } from "~/utils";

  let yearly = true;

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

<!-- pricing table app PC -->
<div>
  <table class="table-auto w-full">
    <thead>
      <tr>
        <th class="uppercase font-medium text-left py-3 w-[400px]"> plans </th>
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
        <th class="uppercase font-medium text-left py-3"
          >alpha
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
      <tr>
        <td class="py-3">
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
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
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
        <td class="py-3">
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
          <tr class="border-y">
            <th colspan="8" class="font-medium py-4 text-left">
              {item.title}
            </th>
          </tr>
        {:else if item.featureStatus === "part"}
          <tr class="border-y">
            <td class="py-4">
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
            <td class="py-4">
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

<!-- pricing table mobile app -->
<div />

<!-- compare table  -->
<div>
  <div class="flex flex-col">
    <h2 class="text-xl font-medium w-full">Compare with other apps</h2>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Nimbus</th>
        <th>Excel</th>
        <th>CoinStats</th>
        <th>DeBank</th>
        <th>Nansen</th>
      </tr>
    </thead>
    <tbody>
      {#each nimbusCompareFeatureData as item}
        <tr>
          <td />
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .underline-dashed {
    text-decoration: underline 1.5px dotted;
    text-underline-offset: 3px;
  }
</style>
