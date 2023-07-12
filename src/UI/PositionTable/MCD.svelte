<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import McdItem from "./TableItem/MCDItem.svelte";

  export let positions;
  export let position;
  export let sum;
  export let sum_claimable;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };

  let showTooltip = false;
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-end">
    <div class="xl:text-xl text-3xl font-semibold">{position}</div>
    <div class="flex flex-col gap-1">
      <div class="xl:text-3xl text-4xl font-semibold flex justify-end">
        $<TooltipNumber number={sum} type="balance" />
      </div>
      {#if sum_claimable !== 0}
        <div
          class="xl:text-lg text-2xl font-medium text-gray-600 flex justify-end gap-1"
        >
          {MultipleLang.claimable}:
          <span>
            $<TooltipNumber number={sum_claimable} type="balance" />
          </span>
        </div>
      {/if}
    </div>
  </div>

  <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
    <table class="table-auto xl:w-full w-[1400px]">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th
            class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8]"
          >
            <div
              class="xl:text-xs text-base font-semibold text-black uppercase text-left"
            >
              Supply
            </div>
          </th>

          <th class="py-3">
            <div
              class="text-left xl:text-xs text-base font-semibold text-black uppercase"
            >
              Supply Balance
            </div>
          </th>

          <th class="py-3">
            <div
              class="xl:text-xs text-base font-semibold text-black uppercase text-left"
            >
              Borrow
            </div>
          </th>

          <th class="py-3">
            <div
              class="text-left xl:text-xs text-base font-semibold text-black uppercase"
            >
              Borrow Balance
            </div>
          </th>

          <th class="py-3">
            <div
              class="text-left flex items-center gap-1 xl:text-xs text-base font-semibold text-black uppercase"
            >
              Health
              <span
                class="relative w-max"
                on:mouseenter={() => (showTooltip = true)}
                on:mouseleave={() => (showTooltip = false)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12"
                  ><g
                    id="assets-overview"
                    stroke="none"
                    stroke-width="1"
                    fill="none"
                    fill-rule="evenodd"
                    ><g
                      transform="translate(-1258.000000, -1943.000000)"
                      fill="currentColor"
                      id="uniswap"
                      ><g transform="translate(360.000000, 1878.000000)"
                        ><g
                          id="general/question"
                          transform="translate(898.000000, 65.000000)"
                          ><path
                            d="M6,0.25 C9.17563731,0.25 11.75,2.82436269 11.75,6 C11.75,9.17563731 9.17563731,11.75 6,11.75 C2.82436269,11.75 0.25,9.17563731 0.25,6 C0.25,2.82436269 2.82436269,0.25 6,0.25 Z M5.93249458,8.05409347 C5.72033469,8.05409347 5.54674933,8.12159889 5.40209486,8.25660973 C5.25744039,8.39162057 5.18993497,8.56520593 5.18993497,8.77736582 C5.18993497,8.98952571 5.25744039,9.16311107 5.40209486,9.29812191 C5.54674933,9.43313275 5.72033469,9.5102818 5.93249458,9.5102818 C6.14465447,9.5102818 6.31823983,9.44277638 6.4628943,9.30776554 C6.60754877,9.1727547 6.68469782,8.98952571 6.68469782,8.77736582 C6.68469782,8.56520593 6.60754877,8.39162057 6.47253793,8.25660973 C6.32788346,8.12159889 6.14465447,8.05409347 5.93249458,8.05409347 Z M6.10607994,2.4897182 C5.39245123,2.4897182 4.83312061,2.69223446 4.41844446,3.09726697 C3.99412469,3.50229949 3.79160843,4.06163011 3.79160843,4.77525882 L3.79160843,4.77525882 L4.8909824,4.77525882 C4.8909824,4.37022631 4.96813145,4.05198647 5.13207318,3.83018295 C5.31530218,3.56016128 5.61425475,3.43479407 6.03857453,3.43479407 C6.36645799,3.43479407 6.62683604,3.52158675 6.81006503,3.70481575 C6.98365039,3.88804474 7.08008671,4.13877916 7.08008671,4.45701899 C7.08008671,4.69810977 6.99329403,4.92955692 6.81970866,5.14171681 L6.81970866,5.14171681 L6.70398509,5.27672765 C6.07714905,5.83605827 5.70104743,6.24109078 5.57568022,6.50146883 C5.44066938,6.76184687 5.3828076,7.08008671 5.3828076,7.4465447 L5.3828076,7.4465447 L5.3828076,7.58155554 L6.4918252,7.58155554 L6.4918252,7.4465447 C6.4918252,7.21509755 6.54004335,7.01258129 6.63647967,6.81970866 C6.72327235,6.6461233 6.84863956,6.48218157 7.02222492,6.3375271 C7.48511922,5.93249458 7.76478453,5.67211654 7.85157721,5.57568022 C8.08302436,5.26708402 8.20839157,4.87169514 8.20839157,4.38951357 C8.20839157,3.80125206 8.01551895,3.33835776 7.62977369,3.00083066 C7.24402844,2.65365993 6.73291598,2.4897182 6.10607994,2.4897182 Z"
                            id="Combined-Shape"
                          /></g
                        ></g
                      ></g
                    ></g
                  ></svg
                >
                {#if showTooltip}
                  <span
                    class="absolute -top-7 left-1/2 transform -translate-x-1/2"
                    style="z-index: 2147483648;"
                  >
                    <tooltip-detail
                      text="Your assests will be liquidated if the health factor is less than or equal to 1"
                    />
                  </span>
                {/if}
              </span>
            </div>
          </th>

          <th class="pr-3 py-3">
            <div
              class="xl:text-xs text-base font-semibold text-black uppercase text-right"
            >
              Value
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each positions as item}
          <McdItem data={item} />
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
</style>
