<script>
  import TooltipNumber from "./TooltipNumber.svelte";

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
</script>

<div class="w-[90%] h-1 relative bg-gray-200 rounded-lg appearance-none">
  <div
    class="absolute top-[50%] -translate-y-1/2 h-1 left-1/2 transform -translate-x-1/2 w-[70%] bg-blue-400"
  >
    <div
      class="absolute top-[50%] left-[0%] -translate-y-1/2 -translate-x-1/2 z-1 w-2 h-2 rounded-full bg-blue-400"
    >
      <div
        class="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs"
      >
        <TooltipNumber number={lowerPrice} />
      </div>
    </div>

    <div
      class="absolute top-[50%] -translate-y-1/2 -translate-x-1/2 z-1 w-1 h-3 bg-yellow-300"
      style={`left: ${sliderValue}%;`}
    ></div>

    <div
      class="absolute top-[50%] right-[-10%] -translate-y-1/2 -translate-x-1/2 z-1 w-2 h-2 rounded-full bg-blue-400"
    >
      <div
        class="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs"
      >
        <TooltipNumber number={upperPrice} />
      </div>
    </div>
  </div>
</div>

<style></style>
