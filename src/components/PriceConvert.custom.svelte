<svelte:options tag="price-convert" />

<script>
  import { onMount } from "svelte";
  import { track } from "~/lib/data-tracking";
  import { formatCurrency } from "../utils";

  export let symbol;
  export let price;

  let amount1 = 1;
  let amount2 = 0;

  const onInputAmount1 = (e) => {
    if (Number.isNaN(parseFloat(e.target.value))) {
      return;
    }
    amount1 = e.target.value;
    amount2 = amount1 * price;
  };

  const onInputAmount2 = (e) => {
    if (Number.isNaN(parseFloat(e.target.value))) {
      return;
    }
    amount2 = e.target.value;
    amount1 = amount2 / price;
  };

  onMount(() => {
    amount2 = amount1 * price;
  });

  $: {
    if (amount1 !== 1) {
      track("Sidebar status", {
        symbol,
        amount1,
        amount2,
      });
    }
  }
</script>

<reset-style>
  <div class="mt-2 flex items-center justify-between gap-2">
    <div
      class="flex-1 flex flex-col input-border px-3 py-[6px] gap-1 rounded-[5px]"
    >
      <div class="text-[#666666] text-xs font-medium">{symbol}</div>
      <input
        class="text-black border-none outline-none bg-transparent text-sm font-medium w-full"
        inputmode="decimal"
        pattern="[0-9]*(.[0-9]+)?"
        type="text"
        autocorrect="off"
        autocomplete="off"
        bind:value={amount1}
        on:input={onInputAmount1}
      />
    </div>
    <div class="w-6 h-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6 text-[#212121]"
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
    <div
      class="flex-1 flex flex-col input-border px-3 py-[6px] gap-1 rounded-[5px]"
    >
      <div class="text-[#666666] text-xs font-medium">USD</div>
      <input
        class="text-black border-none outline-none bg-transparent text-sm font-medium w-full"
        inputmode="decimal"
        pattern="[0-9]*(.[0-9]+)?"
        type="text"
        autocorrect="off"
        autocomplete="off"
        bind:value={amount2}
        on:input={onInputAmount2}
      />
    </div>
  </div>
  {#if amount2.toString() === "NaN" || amount1.toString() === "NaN"}
    <div class="text-[10px] text-red-700 mt-2">Invalid number</div>
  {:else}
    <div class="text-[10px] text-gray-700 mt-2">
      {formatCurrency(amount1)}
      {symbol} equals ${formatCurrency(amount2)} USD
    </div>
  {/if}
</reset-style>

<style>
  .input-border {
    border: 1px solid #00000014;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
