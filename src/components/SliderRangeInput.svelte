<script>
  export let currentPrice;
  export let lowerPrice;
  export let upperPrice;

  $: console.log({
    currentPrice,
    upperPrice,
    lowerPrice,
  });
</script>

<div class="w-[90%] h-1 relative bg-gray-200 rounded-lg appearance-none">
  <div
    class={`absolute top-[50%] -translate-y-1/2 h-1 left-[] w-[] bg-blue-400`}
  >
    <div
      class={`absolute top-[50%] left-[] -translate-y-1/2 -translate-x-1/2 z-1 w-2 h-2 rounded-full bg-blue-400`}
    />
    <div
      class={`absolute top-[50%] left-[] -translate-y-1/2 -translate-x-1/2 z-1 w-1 h-3 bg-yellow-300`}
    />
    <div
      class={`absolute top-[50%] right-[] -translate-y-1/2 -translate-x-1/2 z-1 w-2 h-2 rounded-full bg-blue-400`}
    />
  </div>
</div>

<style></style>
