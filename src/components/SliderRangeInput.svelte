<script>
  import numeral from "numeral";

  import TooltipNumber from "./TooltipNumber.svelte";
  import Tooltip from "~/components/Tooltip.svelte";

  export let currentPrice;
  export let lowerPrice;
  export let upperPrice;

  $: sliderValue = Math.max(
    0,
    Math.min(
      ((currentPrice - lowerPrice) / (upperPrice - lowerPrice)) * 100,
      100
    )
  );

  let selectedCurrent = 0;
  let isShowTooltip = false;
</script>

<div class="w-[90%] h-1 relative bg-gray-200 rounded-lg appearance-none">
  <div
    class="absolute top-[50%] -translate-y-1/2 h-1 left-1/2 transform -translate-x-1/2 w-[70%] bg-[#1e96fc]"
  >
    <div
      class="absolute top-[50%] left-[0%] -translate-y-1/2 w-2 h-2 rounded-full bg-[#1e96fc]"
      on:mouseover={() => {
        selectedCurrent = lowerPrice;
        isShowTooltip = true;
      }}
      on:mouseleave={() => {
        selectedCurrent = 0;
        isShowTooltip = false;
      }}
    >
      <div
        class="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs"
      >
        <TooltipNumber number={lowerPrice} />
      </div>

      {#if isShowTooltip && selectedCurrent === lowerPrice}
        <div
          class="absolute left-1/2 trasnform -translate-x-1/2 -top-8"
          style="z-index: 2147483648;"
        >
          <Tooltip
            text={`Min price: $${numeral(lowerPrice).format("0,0.00")}`}
          />
        </div>
      {/if}
    </div>

    <div
      class="absolute top-[50%] -translate-y-1/2 -translate-x-1/2 w-1 h-3 bg-yellow-300"
      style={`left: ${sliderValue}%;`}
      on:mouseover={() => {
        selectedCurrent = currentPrice;
        isShowTooltip = true;
      }}
      on:mouseleave={() => {
        selectedCurrent = 0;
        isShowTooltip = false;
      }}
    >
      {#if isShowTooltip && selectedCurrent === currentPrice}
        <div
          class="absolute left-1/2 trasnform -translate-x-1/2 -top-8"
          style="z-index: 2147483648;"
        >
          <Tooltip
            text={`Current price: $${numeral(currentPrice).format("0,0.00")}`}
          />
        </div>
      {/if}
    </div>

    <div
      class="absolute top-[50%] right-[0%] -translate-y-1/2 z-1 w-2 h-2 rounded-full bg-[#1e96fc]"
      on:mouseover={() => {
        selectedCurrent = upperPrice;
        isShowTooltip = true;
      }}
      on:mouseleave={() => {
        selectedCurrent = 0;
        isShowTooltip = false;
      }}
    >
      <div
        class="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs"
      >
        <TooltipNumber number={upperPrice} />
      </div>

      {#if isShowTooltip && selectedCurrent === upperPrice}
        <div
          class="absolute left-1/2 trasnform -translate-x-1/2 -top-8"
          style="z-index: 2147483648;"
        >
          <Tooltip
            text={`Max price: $${numeral(upperPrice).format("0,0.00")}`}
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<style></style>
