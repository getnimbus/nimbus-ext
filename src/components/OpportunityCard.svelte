<script>
  import logo from "~/assets/btc.png";
  export let background;
</script>

<div
  style="background: {background};"
  class="rounded-[10px] py-5 px-4 flex items-start gap-3"
>
  <img src={logo} alt="logo" width={45} height={45} />
  <div class="flex flex-col gap-2">
    <div class="text-sm text-[#00000099] font-medium">
      You can join IFO in <span class="highlight">PancakeSwap</span>
      to get
      <span class="highlight">15% SPY</span>
    </div>
    <div class="text-[#00000066] text-xs font-medium">A few seconds ago</div>
  </div>
</div>

<style>
  .highlight {
    font-weight: 600;
    color: black;
  }
</style>
