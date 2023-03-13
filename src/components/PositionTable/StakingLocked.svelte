<script>
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import logo from "~/assets/btc.png";
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-3">
      <img src={logo} alt="logo" width={40} height={40} />
      <div class="text-lg font-semibold uppercase">Staking-Locked</div>
    </div>
    <div class="text-3xl font-semibold">$488.5</div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px] overflow-x-scroll">
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
              Unlock Time
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              Claimable (USD)
            </div>
          </th>
          <th class="pr-3 py-3">
            <div class="text-sm font-semibold text-black uppercase text-right">
              Value (USD)
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="pl-3 py-4">
            <div class="text-left flex items-start gap-2">
              <img src={logo} alt="token" width="20" height="20" />
              <div class="flex flex-col gap-1">
                <div class="text-black text-sm font-medium">Bitcoin</div>
                <div class="text-[#00000080] text-xs font-medium">BTC</div>
              </div>
            </div>
          </td>
          <td class="py-4">
            <div class="text-right text-sm text-[#00000099] font-medium">
              $10,000
            </div>
          </td>
          <td class="py-4">
            <div class="text-right text-sm text-[#00000099] font-medium">
              1200
            </div>
          </td>
          <td class="py-4">
            <div class="text-right text-sm text-[#00000099] font-medium">
              120
            </div>
          </td>
          <td class="py-4">
            <div class="text-right text-sm text-[#00000099] font-medium">
              $12,000
            </div>
          </td>
          <td class="pr-3 py-4">
            <div
              class="text-right text-sm text-[#00000099] font-medium flex items-center gap-1"
            >
              <div class="text-[#00A878]">$12,000</div>
              <img src={TrendUp} alt="trend" class="mb-1" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
</style>
