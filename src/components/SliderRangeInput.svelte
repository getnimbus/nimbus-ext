<script>
  import numeral from "numeral";

  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "./TooltipNumber.svelte";

  export let currentPrice;
  export let lowerPrice;
  export let upperPrice;

  let value = 0;

  $: sliderValue = Math.max(
    0,
    Math.min(
      ((Number(currentPrice) - Number(lowerPrice)) /
        (Number(upperPrice) - Number(lowerPrice))) *
        100,
      100
    )
  );

  $: {
    if (sliderValue > 0 && sliderValue < 100) {
      value = sliderValue;
    }
    if (sliderValue <= 0 && Number(currentPrice) < Number(lowerPrice)) {
      value = -20;
    }
    if (sliderValue >= 100 && Number(currentPrice) > Number(upperPrice)) {
      value = 120;
    }
  }
</script>

<div class="w-[90%] h-1 relative bg-gray-200 rounded-lg appearance-none">
  <div
    class="absolute top-[50%] -translate-y-1/2 h-1 left-1/2 transform -translate-x-1/2 w-[70%] bg-[#1e96fc]"
  >
    <div
      class="absolute top-[50%] left-[0%] -translate-y-1/2 w-2 h-2 rounded-full bg-[#1e96fc] z-1"
      use:tooltip={{
        content: `<tooltip-detail text="$${lowerPrice.toString().includes("e-") ? lowerPrice : numeral(lowerPrice).format("0,0.0000")}" />`,
        allowHTML: true,
        placement: "top",
        interactive: true,
      }}
    >
      <div
        class="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs z-1"
      >
        <TooltipNumber number={lowerPrice} />
      </div>
    </div>

    <div
      class="absolute top-[50%] -translate-y-1/2 -translate-x-1/2 w-1 h-3 bg-yellow-300 z-1"
      style={`left: ${value}%;`}
      use:tooltip={{
        content: `<tooltip-detail text="Current Price: $${currentPrice.toString().includes("e-") ? currentPrice : numeral(currentPrice).format("0,0.0000")}" />`,
        allowHTML: true,
        placement: "top",
        interactive: true,
      }}
    ></div>

    <div
      class="absolute top-[50%] right-[0%] -translate-y-1/2 w-2 h-2 rounded-full bg-[#1e96fc] z-1"
      use:tooltip={{
        content: `<tooltip-detail text="$${upperPrice.toString().includes("e-") ? upperPrice : numeral(upperPrice).format("0,0.0000")}" />`,
        allowHTML: true,
        placement: "top",
        interactive: true,
      }}
    >
      <div
        class="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs z-1"
      >
        <TooltipNumber number={upperPrice} />
      </div>
    </div>
  </div>
</div>

<style></style>
