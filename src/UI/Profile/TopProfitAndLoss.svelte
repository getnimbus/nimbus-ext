<script lang="ts">
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  export let selectedAddress;
</script>

<div class="col-span-2 grid grid-rows-2 flex flex-col gap-5">
  <div class="flex flex-col border border_0000001a rounded-xl px-6 py-6">
    <div class="flex justify-start xl:text-xl text-3xl font-medium pb-3">
      Top 3 Profit(30D)
    </div>
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-2">
          <img
            src="https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
            alt=""
            width="30"
            height="30"
          />
          <span class="font-medium xl:text-lg text-2xl">FLC</span>
        </div>
        <span class="text-green-400">
          +<TooltipNumber number={54} type="value" />
          (+<TooltipNumber number={32} type="percent" />X)
        </span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-2">
          <img
            src="https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
            alt=""
            width="30"
            height="30"
          />
          <span class="font-medium xl:text-lg text-2xl">FLC</span>
        </div>
        <span class="text-green-400">
          +<TooltipNumber number={54} type="value" />
          (+<TooltipNumber number={32} type="percent" />X)
        </span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-2">
          <img
            src="https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
            alt=""
            width="30"
            height="30"
          />
          <span class="font-medium xl:text-lg text-2xl">FLC</span>
        </div>
        <span class="text-green-400">
          +<TooltipNumber number={54} type="value" />
          (+<TooltipNumber number={32} type="percent" />X)
        </span>
      </div>
    </div>
  </div>
  <div class="flex flex-col border border_0000001a rounded-xl px-6 py-6">
    <div class="flex justify-start xl:text-xl text-3xl font-medium pb-3">
      Top 3 Loss(30D)
    </div>
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-2">
          <img
            src="https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
            alt=""
            width="30"
            height="30"
          />
          <span class="font-medium xl:text-lg text-2xl">FLC</span>
        </div>
        <span class="text-red-500">
          -<TooltipNumber number={54} type="value" />
          (-<TooltipNumber number={32} type="percent" />X)
        </span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-2">
          <img
            src="https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
            alt=""
            width="30"
            height="30"
          />
          <span class="font-medium xl:text-lg text-2xl">FLC</span>
        </div>
        <span class="text-red-500">
          -<TooltipNumber number={54} type="value" />
          (-<TooltipNumber number={32} type="percent" />X)
        </span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-2">
          <img
            src="https://raw.githubusercontent.com/getnimbus/assets/main/token.png"
            alt=""
            width="30"
            height="30"
          />
          <span class="font-medium xl:text-lg text-2xl">FLC</span>
        </div>
        <span class="text-red-500">
          -<TooltipNumber number={54} type="value" />
          (-<TooltipNumber number={32} type="percent" />X)
        </span>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
