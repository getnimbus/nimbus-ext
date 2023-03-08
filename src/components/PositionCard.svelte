<script>
  import logo from "../assets/btc.png";
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-2">
      <img src={logo} alt="logo" width={50} height={50} />
      <div class="text-lg font-bold">PancakeSwap</div>
    </div>
    <div class="text-lg font-semibold">488.5$</div>
  </div>
  <div class="text-xl text-gray-500 font-bold">Locked staking</div>

  <div class="border-[1.5px] border-light-500 rounded">
    <div class="grid grid-cols-12 bg-light-400 p-3">
      <div class="col-span-1 text-base font-medium text-gray-500">Pool</div>
      <div class="col-span-3 text-base font-medium text-gray-500">Invest</div>
      <div class="col-span-3 text-base font-medium text-gray-500">Reward</div>
      <div class="col-span-2 text-base font-medium text-gray-500">
        Unlock time
      </div>
      <div class="col-span-2 text-base font-medium text-gray-500">
        Value (USD)
      </div>
      <div class="col-span-1 text-base font-medium text-gray-500">
        Profit (USD)
      </div>
    </div>
    <div
      class="border-t-[1.5px] border-light-500 py-4 px-3 grid grid-cols-12 items-center"
    >
      <div class="col-span-1 flex flex-col gap-1">
        <div class="text-sm">Cake IFO</div>
        <div class="text-gray-500">CAKE</div>
      </div>
      <div class="col-span-3 text-sm">500 CAKE (10,000$)</div>
      <div class="col-span-3 text-sm">1 CAKE (100$)</div>
      <div class="col-span-2 text-sm">27/09/2023</div>
      <div class="col-span-2 text-sm">10,000$</div>
      <div class="col-span-1 flex items-center gap-2 text-sm">
        <div>icon</div>
        <div class="text-green-400">12,000$</div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
