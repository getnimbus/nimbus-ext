<script lang="ts">
  export let progress;
  export let leftLabel;
  export let rightLabel;
  export let averageText;
  export let tooltipText;
</script>

<div class="relative">
  <div class="flex items-center gap-2">
    <div class="xl:text-base text-2xl">{leftLabel}</div>
    <div
      class="w-full h-2 rounded-lg relative"
      style="background: linear-gradient(to right, #00A878, #f05252);
"
    >
      <div
        class="w-[1px] h-7 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black"
      />
      <div class="absolute top-5 left-1/2 transform -translate-x-1/2">
        {averageText}
      </div>
    </div>
    <div class="xl:text-base text-2xl">{rightLabel}</div>
  </div>

  <div class="absolute bottom-8" style={`left: ${progress - 7}%;`}>
    <div class="relative text-white bg-black px-4 py-2 rounded-lg">
      <div class="xl:text-base text-2xl">{tooltipText}</div>
      <div class="tooltip-arrow" />
    </div>
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
