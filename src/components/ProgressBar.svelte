<script lang="ts">
  export let progress: number;
  export let leftLabel: string;
  export let rightLabel: string;
  export let averageText: string;
  export let tooltipText: string;
</script>

<div class="relative pt-[50px]">
  <div class="flex items-center gap-2">
    <div class="xl:text-base text-2xl">{leftLabel}</div>
    <div
      class="w-full h-2 rounded-lg relative"
      style="background: linear-gradient(to right, rgb(37, 183, 112), rgb(255, 199, 1), rgb(225, 64, 64));"
    >
      <div
        class="w-[1px] h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-700"
      />
      <div
        class="absolute bottom-8 transform -translate-x-1/2"
        style={`left: ${progress}%;`}
      >
        <div class="relative text-white bg-black px-3 py-2 rounded-md">
          <div class="text-sm">{tooltipText}</div>
          <div class="tooltip-arrow" />
        </div>
      </div>
      <div class="absolute top-5 left-1/2 transform -translate-x-1/2">
        {averageText}
      </div>
    </div>
    <div class="xl:text-base text-2xl">{rightLabel}</div>
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
