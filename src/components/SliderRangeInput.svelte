<script>
  export let currentInput;

  const handleCalculateCurrentInput = (input) => {
    // console.log(input);
    const max = input.upperPrice;
    const min = input.lowerPrice;

    return;
  };

  $: calculatedCurrentInput = handleCalculateCurrentInput(currentInput);
</script>

<div class="w-[90%] h-1">
  <div
    class="relative w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
  >
    <div
      class="absolute top-[50%] left-[20%] -translate-y-1/2 h-1 w-[60%] bg-blue-400"
    >
      <div
        class={`absolute top-[50%] left-0 -translate-y-1/2 -translate-x-1/2 z-1 w-2 h-2 rounded-full bg-blue-400`}
      />
      <div
        class={`absolute top-[50%] left-[] -translate-y-1/2 -translate-x-1/2 z-1 w-1 h-3 bg-yellow-300`}
      />
      <div
        class={`absolute top-[50%] right-0 -translate-y-1/2 -translate-x-1/2 z-1 w-2 h-2 rounded-full bg-blue-400`}
      />
    </div>
  </div>
</div>

<style></style>
