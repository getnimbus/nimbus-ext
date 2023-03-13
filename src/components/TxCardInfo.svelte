<script>
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import logo from "~/assets/btc.png";
</script>

<div class="py-4 px-3 grid grid-cols-12 items-center">
  <div class="col-span-4 flex items-start gap-2">
    <img src={logo} alt="token" width="20" height="20" class="mt-1" />
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <div class="text-black text-sm font-medium">Bitcoin</div>
        <div
          class="flex items-center justyfy-center px-2 py-1 text-[#27326F] text-xs font-medium bg-[#1e96fc33] rounded-[1000px]"
        >
          Farm up to 45% APY
        </div>
      </div>
      <div class="text-[#00000080] text-xs font-medium">BTC</div>
    </div>
  </div>
  <div class="col-span-3 text-sm text-[#00000099] font-medium">$10,000</div>
  <div class="col-span-2 text-sm text-[#00000099] font-medium">1</div>
  <div class="col-span-2 text-sm text-[#00000099] font-medium">$10,000</div>
  <div class="col-span-1 flex items-center gap-1 text-sm font-medium">
    <div class="text-[#00A878]">$12,000</div>
    <img src={TrendUp} alt="trend" class="mb-1" />
  </div>
</div>

<style>
</style>
