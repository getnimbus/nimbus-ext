<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import LendingBorrowItem from "./TableItem/LendingBorrowItem.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let positions;
  export let position;
  export let sum;
  export let sum_claimable;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-end">
    <div class="xl:text-xl text-3xl font-semibold">{position}</div>
    <div class="flex flex-col gap-1">
      <div class="xl:text-3xl text-4xl font-semibold flex justify-end">
        $<TooltipNumber number={Math.abs(sum)} type="balance" />
      </div>
      <!-- <div class="xl:text-lg text-2xl font-medium text-gray-600 flex justify-end gap-1">
        {MultipleLang.claimable}:
        <span>
          $<TooltipNumber number={sum_claimable} />
        </span>
      </div> -->
    </div>
  </div>

  <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
    <table class="table-auto xl:w-full w-[1200px]">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th
            class="pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8]"
          >
            <div
              class="xl:text-xs text-base font-semibold text-black uppercase text-left"
            >
              Pool
            </div>
          </th>

          <th class="py-3">
            <div
              class="text-right xl:text-xs text-base font-semibold text-black uppercase"
            >
              Amount
            </div>
          </th>

          <th class="py-3">
            <div
              class="text-right xl:text-xs text-base font-semibold text-black uppercase"
            >
              Entry
            </div>
          </th>

          <!-- <th class="py-3">
            <div class="text-right xl:text-xs text-base font-semibold text-black uppercase">
              Entry Time
            </div>
          </th>

          <th class="py-3">
            <div class="text-right xl:text-xs text-base font-semibold text-black uppercase">
              APY (%)
            </div>
          </th> -->

          <th class="py-3">
            <div
              class="xl:text-xs text-base font-semibold text-black uppercase text-right"
            >
              Value
            </div>
          </th>

          <th class="pr-3 py-3">
            <div
              class="xl:text-xs text-base font-semibold text-black uppercase text-right"
            >
              Profit & Loss
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each positions as item}
          <LendingBorrowItem data={item} />
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
</style>
