<script lang="ts">
  import { i18n } from "~/lib/i18n";

  export let data;

  import CountUpNumber from "../CountUpNumber.svelte";

  const MultipleLang = {
    networth: i18n("newtabPage.networth", "Net Worth"),
    claimable: i18n("newtabPage.claimable", "Claimable"),
    total_assets: i18n("newtabPage.total-assets", "Total Assets"),
    total_debts: i18n("newtabPage.total-debts", "Total Debts"),
  };
</script>

<div class="flex xl:flex-row flex-col justify-between gap-6">
  <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
    <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
      <div class="text-[#00000099] text-base font-medium">
        {MultipleLang.networth}
      </div>
      <div class="text-3xl text-black">
        $<CountUpNumber id="networth" number={data?.overview.networth} />
      </div>
      <div class="flex items-center gap-3">
        <div
          class={`text-lg font-medium ${
            data?.overview.networthChange < 0
              ? "text-red-500"
              : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.networthChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="networth_grouth"
            number={Math.abs(data?.overview.networthChange)}
          />%
        </div>
        <div class="text-[#00000066] text-base font-medium">
          {data?.overview.change}
        </div>
      </div>
    </div>
    <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
      <div class="text-[#00000099] text-base font-medium">
        {MultipleLang.claimable}
      </div>
      <div class="text-3xl text-black">
        $<CountUpNumber id="claimable" number={data?.overview.claimable} />
      </div>
      <div class="flex items-center gap-3">
        <div
          class={`text-lg font-medium ${
            data?.overview.claimableChange < 0
              ? "text-red-500"
              : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.claimableChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="claimable_grouth"
            number={Math.abs(data?.overview.claimableChange)}
          />%
        </div>
        <div class="text-[#00000066] text-base font-medium">
          {data?.overview.change}
        </div>
      </div>
    </div>
  </div>
  <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
    <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
      <div class="text-[#00000099] text-base font-medium">
        {MultipleLang.total_assets}
      </div>
      <div class="text-3xl text-black">
        $<CountUpNumber id="total_assets" number={data?.overview.assets} />
      </div>
      <div class="flex items-center gap-3">
        <div
          class={`text-lg font-medium ${
            data?.overview.assetsChange < 0 ? "text-red-500" : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.assetsChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="total_assets_grouth"
            number={Math.abs(data?.overview.assetsChange)}
          />%
        </div>
        <div class="text-[#00000066] text-base font-medium">
          {data?.overview.change}
        </div>
      </div>
    </div>
    <div class="flex-1 py-4 px-6 rounded-lg flex flex-col gap-3 bg-white">
      <div class="text-[#00000099] text-base font-medium">
        {MultipleLang.total_debts}
      </div>
      <div class="text-3xl text-black">
        $<CountUpNumber id="total_debts" number={data?.overview.debts} />
      </div>
      <div class="flex items-center gap-3">
        <div
          class={`text-lg font-medium ${
            data?.overview.debtsChange < 0 ? "text-red-500" : "text-[#00A878]"
          }`}
        >
          {#if data?.overview.debtsChange < 0}
            ↓
          {:else}
            ↑
          {/if}
          <CountUpNumber
            id="total_debts_grouth"
            number={Math.abs(data?.overview.debtsChange)}
          />%
        </div>
        <div class="text-[#00000066] text-base font-medium">
          {data?.overview.change}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
