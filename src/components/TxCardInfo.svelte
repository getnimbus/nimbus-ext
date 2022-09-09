<svelte:options tag="app-tx-card-info" />

<script>
  import logo from "../assets/logo.svg";
</script>

<div class="border-bottom pb-4 flex justify-between items-center gap-16">
  <div class="flex items-center gap-30">
    <div class="flex flex-col gap-1 text-gray-400">
      <div>2022/02/13 15:30:24</div>
      <div class="flex items-center gap-2">
        <div
          class="bg-sky-200 w-[20px] h-[20px] rounded-full overflow-hidden border"
        >
          <img class="w-full h-full object-contain" src={logo} alt="avatar" />
        </div>
        <div>0x82fe...db97</div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div
        class="bg-sky-200 w-[36px] h-[36px] rounded-full overflow-hidden border"
      >
        <img class="w-full h-full object-contain" src={logo} alt="avatar" />
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-gray-400">Receive</div>
        <div>0x28c6...1d60</div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <div
        class="bg-sky-200 w-[20px] h-[20px] rounded-full overflow-hidden border"
      >
        <img class="w-full h-full object-contain" src={logo} alt="avatar" />
      </div>
      <div>+0.0938 ETH</div>
    </div>
  </div>

  <div>Gas Fee: 0.0018 ETH ($5.21)</div>
</div>

<style>
  .border-bottom {
    border-bottom: 0.2px solid rgb(229, 231, 235);
  }
</style>
