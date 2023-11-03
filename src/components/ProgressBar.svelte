<script lang="ts">
  export let progress: number;
  export let leftLabel: string | number;
  export let rightLabel: string | number;
  export let averageText: string;
  export let tooltipText: string;
  export let lowerIsBetter = true;
  export let isDoubleMark = false;
  export let progressTwo = 0;
  export let tooltipTextTwo = "";
  export let isProfitLoss = false;

  $: range = lowerIsBetter
    ? "linear-gradient(to right, rgb(37, 183, 112), rgb(255, 199, 1), rgb(225, 64, 64))"
    : "linear-gradient(to right, rgb(225, 64, 64), rgb(255, 199, 1), rgb(37, 183, 112))";
</script>

<div class="relative pt-[40px] pb-[20px]">
  <div
    class="h-2 rounded-lg relative"
    style={`background: ${
      isProfitLoss
        ? "linear-gradient(to right, rgb(225, 64, 64) 50%, rgb(37, 183, 112) 50%)"
        : range
    };`}
  >
    <div class="absolute top-5 left-0 xl:text-sm text-xl">{leftLabel}</div>
    <div
      class="w-[1px] h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-700"
    />
    <div
      class="absolute bottom-5 transform -translate-x-1/2"
      style={`left: ${Math.min(Math.max(progress, 0), 100)}%;`}
    >
      <div class="relative text-white bg-black px-2 py-1 rounded-md">
        <div class="xl:text-xs text-base whitespace-nowrap">
          {tooltipText}
        </div>
        <div class="tooltip-arrow" />
      </div>
    </div>
    {#if isDoubleMark}
      <div
        class="absolute bottom-5 transform -translate-x-1/2"
        style={`left: ${Math.min(Math.max(progressTwo, 0), 100)}%;`}
      >
        <div class="relative text-white bg-black px-2 py-1 rounded-md">
          <div class="xl:text-xs text-base whitespace-nowrap">
            {tooltipTextTwo}
          </div>
          <div class="tooltip-arrow" />
        </div>
      </div>
    {/if}
    <div
      class="absolute top-5 xl:text-sm text-xl left-1/2 transform -translate-x-1/2 whitespace-nowrap"
    >
      {averageText}
    </div>
    <div class="absolute top-5 right-0 xl:text-sm text-xl">{rightLabel}</div>
  </div>
</div>

<style>
  .tooltip-arrow {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -4px;
    height: 8px;
    width: 8px;
    background: transparent;
  }

  .tooltip-arrow::before {
    content: "";
    transform: rotate(45deg);
    background: black;
    height: 8px;
    width: 8px;
    position: absolute;
  }
</style>
