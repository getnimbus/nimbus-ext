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

<div class="py-4 flex items-end justify-around">
  <div class="flex flex-col">
    <div class="mb-1">{symbol}</div>
    <input
      class="py-2 px-[6px] flex-1 rounded border border-[#e5e7eb] w-30 bg-transparent text-black"
      type="text"
      bind:value={amount1}
      on:input={onInputAmount1}
    />
  </div>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="w-6 h-6 text-sky-400 my-2 pb-1 shrink-0"
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
  <div class="flex flex-col">
    <div class="mb-1">USD</div>
    <input
      class="py-2 px-[6px] flex-1 rounded border border-[#e5e7eb] w-30 bg-transparent text-black"
      type="text"
      bind:value={amount2}
      on:input={onInputAmount2}
    />
  </div>
</div>

<style>
</style>
