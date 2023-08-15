<script lang="ts">
  export let progress: number;
  export let leftLabel: string;
  export let rightLabel: string;
  export let averageText: string;
  export let tooltipText: string;
  export let lowerIsBetter = true;

  $: range = lowerIsBetter
    ? "linear-gradient(to right, rgb(37, 183, 112), rgb(255, 199, 1), rgb(225, 64, 64))"
    : "linear-gradient(to right, rgb(225, 64, 64), rgb(255, 199, 1), rgb(37, 183, 112))";
</script>

<div class="relative pt-[40px] pb-[20px]">
  <div class="flex items-center gap-2">
    <div class="text-sm">{leftLabel}</div>
    <div class="w-full h-2 rounded-lg relative" style={`background: ${range};`}>
      <div
        class="w-[1px] h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-700"
      />
      <div
        class="absolute bottom-5 transform -translate-x-1/2"
        style={`left: ${Math.min(Math.max(progress, 0), 100)}%;`}
      >
        <div class="relative text-white bg-black px-2 py-1 rounded-md">
          <div class="text-xs">{tooltipText}</div>
          <div class="tooltip-arrow" />
        </div>
      </div>
      <div
        class="absolute top-5 text-sm left-1/2 transform -translate-x-1/2 whitespace-nowrap"
      >
        {averageText}
      </div>
    </div>
    <div class="text-sm">{rightLabel}</div>
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
