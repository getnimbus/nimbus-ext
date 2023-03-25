<script>
  import dayjs from "dayjs";
  import { formatBalance } from "~/utils";
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let profit = Math.random() * 100 * (Math.random() > 0.5 ? 1 : -1);
</script>

<table class="table-fixed w-full">
  <thead>
    <tr class="bg-[#f4f5f880]">
      <th class="pl-3 py-3">
        <div class="text-sm font-semibold text-black uppercase text-left">
          Pool
        </div>
      </th>
      <th class="py-3">
        <div class="text-right text-sm font-semibold text-black uppercase">
          Entry
        </div>
      </th>
      <th class="py-3">
        <div class="text-right text-sm font-semibold text-black uppercase">
          Entry Time
        </div>
      </th>
      <th class="py-3">
        <div class="text-right text-sm font-semibold text-black uppercase">
          APY (%)
        </div>
      </th>
      <th class="py-3">
        <div class="text-right text-sm font-semibold text-black uppercase">
          Healthy
        </div>
      </th>
      <th class="pr-3 py-3">
        <div class="text-sm font-semibold text-black uppercase text-right">
          Value (USD)
        </div>
      </th>
      <th class="pr-3 py-3">
        <div class="text-sm font-semibold text-black uppercase text-right">
          Profit & Loss
        </div>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="pl-3 py-4">
        <div class="text-left flex items-start gap-2">
          <img src={data.logo} alt="token" width="20" height="20" />
          <div class="flex flex-col gap-1">
            <div class="text-black text-sm font-medium">{data.name}</div>
            {#if data.tokens && data.tokens.length}
              <div class="flex items-center gap-1">
                {#each data.tokens as token, index}
                  <div class="text-[#00000080] text-xs font-medium">
                    {token.symbol}
                  </div>
                  {#if index < data.tokens.length - 1}
                    <div class="text-[#00000080] text-xs font-medium">-</div>
                  {/if}
                {/each}
              </div>
            {:else}
              <div>None</div>
            {/if}
          </div>
        </div>
      </td>
      <td class="py-4">
        <div class="text-right text-sm text-[#00000099] font-medium">
          {formatBalance(data.inputValue)}
        </div>
      </td>
      <td class="py-4">
        <div class="text-right text-sm text-[#00000099] font-medium">
          {dayjs(data.inputTime).format("DD/MM/YYYY - HH:mm")}
        </div>
      </td>
      <td class="py-4">
        <div class="text-right text-sm text-[#00000099] font-medium">
          {formatBalance(data.apy)}
        </div>
      </td>
      <td class="py-4">
        <div class="text-right text-sm text-[#00000099] font-medium">
          {formatBalance(data.healthyScore)}
        </div>
      </td>
      <td class="pr-3 py-4">
        <div class="text-right text-sm text-[#00000099] font-medium">
          ${formatBalance(data.currentValue)}
        </div>
      </td>
      <td class="pr-3 py-4">
        <div
          class="flex items-center justify-end gap-1 text-sm font-medium min-w-[125px]"
        >
          <div class={`${profit >= 0 ? "text-[#00A878]" : "text-red-500"}`}>
            ${formatBalance(Math.abs(profit))}
          </div>
          <img
            src={profit >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="mb-1"
          />
        </div>
      </td>
    </tr>
  </tbody>
</table>

<style>
</style>
