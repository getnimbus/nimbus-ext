<script>
  import { i18n } from "~/lib/i18n";
  import { formatBalance } from "~/utils";

  import LpProvider from "./LPProvider.svelte";
  import Staking from "./Staking.svelte";
  import StakingLocked from "./StakingLocked.svelte";
  import LendingProvider from "./LendingProvider.svelte";
  import LendingBorrow from "./LendingBorrow.svelte";

  export let data;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
    lp_provider_desc: i18n(
      "newtabPage.lp-provider-desc",
      "Profit is calculated by buying & hold on every time you add/remove liquidity"
    ),
  };

  let types = Object.getOwnPropertyNames(data.positions);
</script>

<div class="flex flex-col">
  <div class="flex justify-between items-center my-6">
    <div class="flex items-center gap-3">
      <img src={data.logo} alt="logo" width={40} height={40} />
      <a
        href={data.url}
        target="_blank"
        class="text-lg font-semibold uppercase"
      >
        {data.protocol}
      </a>
    </div>
    <div class="flex flex-col gap-1">
      <div class="text-3xl font-semibold text-right">
        ${formatBalance(data.currentValue)}
      </div>
      <div class="text-lg font-medium text-gray-600">
        {MultipleLang.claimable}: ${formatBalance(data.claimable)}
      </div>
    </div>
  </div>
  {#if types && types.length !== 0}
    {#each types as position}
      <div class="flex flex-col gap-2 -mt-3">
        <div class="text-base font-semibold">{position}</div>
        <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
          <table class="table-fixed w-full">
            {#if position === "LP-Provider"}
              <thead>
                <tr class="bg-[#f4f5f880]">
                  <th class="pl-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-left"
                    >
                      Pool
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Liquidity Range
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Balance
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Claimable
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Value (USD)
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Profit & Loss
                    </div>
                  </th>
                </tr>
              </thead>
              {#each data?.positions["LP-Provider"] as item}
                <LpProvider data={item} />
              {/each}
            {:else if position === "Staking"}
              <thead>
                <tr class="bg-[#f4f5f880]">
                  <th class="pl-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-left"
                    >
                      Pool
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Entry
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Entry Time
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Claimable (USD)
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Value (USD)
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Profit & Loss
                    </div>
                  </th>
                </tr>
              </thead>
              {#each data?.positions["Staking"] as item}
                <Staking data={item} />
              {/each}
            {:else if position === "Staking locked"}
              <thead>
                <tr class="bg-[#f4f5f880]">
                  <th class="pl-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-left"
                    >
                      Pool
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Entry
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Entry Time
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Unlock Time
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Claimable (USD)
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Value (USD)
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Profit & Loss
                    </div>
                  </th>
                </tr>
              </thead>
              {#each data?.positions["Staking locked"] as item}
                <StakingLocked data={item} />
              {/each}
            {:else if position === "Lending provider"}
              <thead>
                <tr class="bg-[#f4f5f880]">
                  <th class="pl-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-left"
                    >
                      Pool
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Entry
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Entry Time
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      APY (%)
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Value (USD)
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Profit & Loss
                    </div>
                  </th>
                </tr>
              </thead>
              {#each data?.positions["Lending provider"] as item}
                <LendingProvider data={item} />
              {/each}
            {:else if position === "Lending borrow"}
              <thead>
                <tr class="bg-[#f4f5f880]">
                  <th class="pl-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-left"
                    >
                      Pool
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Entry
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Entry Time
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      APY (%)
                    </div>
                  </th>
                  <th class="py-3">
                    <div
                      class="text-right text-sm font-semibold text-black uppercase"
                    >
                      Healthy
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Value (USD)
                    </div>
                  </th>
                  <th class="pr-3 py-3">
                    <div
                      class="text-sm font-semibold text-black uppercase text-right"
                    >
                      Profit & Loss
                    </div>
                  </th>
                </tr>
              </thead>
              {#each data?.positions["Lending borrow"] as item}
                <LendingBorrow data={item} />
              {/each}
            {/if}
          </table>
        </div>
        {#if position === "LP-Provider"}
          <div class="text-xs text-gray-400 text-right mb-5">
            {MultipleLang.lp_provider_desc}
          </div>
        {/if}
      </div>
    {/each}
  {:else}
    <div>Empty</div>
  {/if}
</div>

<style>
</style>
