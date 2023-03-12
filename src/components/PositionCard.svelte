<script>
  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import logo from "~/assets/btc.png";
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-3">
      <img src={logo} alt="logo" width={40} height={40} />
      <div class="text-lg font-semibold uppercase">PancakeSwap</div>
    </div>
    <div class="text-3xl font-semibold">$488.5</div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px]">
    <div class="grid grid-cols-12 bg-[#f4f5f880] p-3 rounded-t-left-[10px]">
      <div class="col-span-2 text-sm font-semibold text-black uppercase">
        Pool
      </div>
      <div class="col-span-3 text-sm font-semibold text-black uppercase">
        Invest
      </div>
      <div class="col-span-2 text-sm font-semibold text-black uppercase">
        Reward
      </div>
      <div class="col-span-2 text-sm font-semibold text-black uppercase">
        Unlock time
      </div>
      <div class="col-span-2 text-sm font-semibold text-black uppercase">
        Value (USD)
      </div>
      <div class="col-span-1 text-sm font-semibold text-black uppercase">
        Profit (USD)
      </div>
    </div>
    <div class=" py-4 px-3 grid grid-cols-12 items-center">
      <div class="col-span-2 flex items-start gap-2">
        <img src={logo} alt="token" width="20" height="20" class="mt-1" />
        <div class="flex flex-col gap-1">
          <div class="text-black text-sm font-medium">Cake IFO</div>
          <div class="text-[#00000080] text-xs font-medium">CAKE</div>
        </div>
      </div>
      <div class="col-span-3 text-sm text-[#00000099] font-medium">
        500 CAKE (10,000$)
      </div>
      <div class="col-span-2 text-sm text-[#00000099] font-medium">
        1 CAKE (100$)
      </div>
      <div class="col-span-2 text-sm text-[#00000099] font-medium">
        27/09/2023
      </div>
      <div class="col-span-2 text-sm text-[#00000099] font-medium">10,000$</div>
      <div class="col-span-1 flex items-center text-sm font-medium">
        <div class="text-[#00A878]">12,000$</div>
        <img src={TrendUp} alt="trend" />
      </div>
    </div>
  </div>
</div>

<style>
</style>
