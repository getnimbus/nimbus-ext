<svelte:options tag="price-convert" />

<script>
  import { onMount } from "svelte";
  import { formatCurrency } from "./utils";

  export let symbol;
  export let price;

  let amount1 = 1;
  let amount2 = 0;

  const onInputAmount1 = (e) => {
    if (Number.isNaN(Number(e.target.value))) {
      return;
    }
    amount1 = Number(e.target.value) || 0;
    amount2 = formatCurrency(amount1 * price);
  };

  const onInputAmount2 = (e) => {
    if (Number.isNaN(Number(e.target.value))) {
      return;
    }
    amount2 = Number(e.target.value);
    amount1 = amount2 / price;
  };

  onMount(() => {
    amount2 = formatCurrency(amount1 * price);
  });
</script>

<div class="my-1 flex items-end justify-between">
  <div class="flex flex-col text-black">
    <div class="mb-1 font-semibold text-center">{symbol}</div>
    <input
      class="py-2 px-1 flex-1 rounded border input-border w-30 bg-white focus:ring-1 focus:ring-sky-600 focus:outline-none"
      type="text"
      bind:value={amount1}
      on:input={onInputAmount1}
    />
  </div>
  <div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-6 h-6 text-gray-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  </div>
  <div class="flex flex-col text-black">
    <div class="mb-1 font-semibold text-center">USD</div>
    <input
      class="py-2 px-1 input-border flex-1 rounded w-30 bg-white focus:ring-1 focus:ring-sky-600 focus:outline-none"
      type="text"
      bind:value={amount2}
      on:input={onInputAmount2}
    />
  </div>
</div>

<style>
  .input-border {
    border: 1px solid skyblue;
  }
</style>
