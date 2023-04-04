<script>
  import { formatBalance } from "~/utils";
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
</script>

<tr>
  <td class="pl-3 py-4">
    <div class="text-left flex items-start gap-2 min-w-[220px]">
      <img src={data.logo} alt="token" width="20" height="20" />
      <div class="flex flex-col gap-1">
        <div class="text-black text-sm font-medium">{data.name}</div>
        <div class="text-[#00000080] text-xs font-medium">{data.symbol}</div>
      </div>
      <div class="flex flex-wrap gap-2">
        {#if data.suggest && data.suggest.length}
          {#each data.suggest as item}
            <a
              href={item.url}
              target="_blank"
              class="flex items-center justyfy-center px-2 py-1 text-[#27326F] text-[10px] font-medium bg-[#1e96fc33] rounded-[1000px]"
            >
              {item.tile}
            </a>
          {/each}
        {/if}
      </div>
    </div>
  </td>
  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium text-right min-w-[120px]">
      ${formatBalance(data.rate)}
    </div>
  </td>
  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium text-right min-w-[120px]">
      {formatBalance(data.amount)}
    </div>
  </td>
  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium text-right min-w-[130px]">
      ${formatBalance(data.amount * data.rate)}
    </div>
  </td>
  <td class="pr-3 py-4">
    <div
      class="flex items-center justify-end gap-1 text-sm font-medium min-w-[125px]"
    >
      <div
        class={`${
          data.amount * data.rate - data.rate >= 0
            ? "text-[#00A878]"
            : "text-red-500"
        }`}
      >
        ${formatBalance(Math.abs(data.amount * data.rate - data.rate))}
      </div>
      <img
        src={data.amount * data.rate - data.rate >= 0 ? TrendUp : TrendDown}
        alt="trend"
        class="mb-1"
      />
    </div>
  </td>
</tr>

<style>
  .test {
    border: 1px solid red;
  }
</style>
