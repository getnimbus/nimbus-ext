<script lang="ts">
  import { onMount } from "svelte";
  import {
    netWorthFilter,
    sharpeRatioFilter,
    volatilityFilter,
    returnsFilter,
  } from "~/utils";
  import { isDarkMode } from "~/store";

  import Button from "~/components/Button.svelte";

  export let closeModal = () => {};
  export let submit = (value) => {};
  export let resetFilter = () => {};

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let searchValue = "";
  let timerSearchDebounce;

  let selectedNetWorth = "";
  let selectedSharpeRatio = "";
  let selectedVolatility = "";
  let listSelectedReturn: string[] = [];

  const debounceSearch = (value) => {
    clearTimeout(timerSearchDebounce);
    timerSearchDebounce = setTimeout(() => {
      searchValue = value;
    }, 300);
  };

  onMount(() => {
    const whalesTokenSearch = localStorage.getItem("whales_token_search");
    const whalesNetworthSelected = localStorage.getItem(
      "whales_networth_selected"
    );
    const whalesSharperatioSelected = localStorage.getItem(
      "whales_sharperatio_selected"
    );
    const whalesVolatilitySelected = localStorage.getItem(
      "whales_volatility_selected"
    );
    const whalesReturnSelected = localStorage.getItem("whales_return_selected");

    if (
      whalesTokenSearch ||
      whalesNetworthSelected ||
      whalesSharperatioSelected ||
      whalesVolatilitySelected ||
      whalesReturnSelected
    ) {
      searchValue = whalesTokenSearch;
      selectedNetWorth = whalesNetworthSelected;
      selectedSharpeRatio = whalesSharperatioSelected;
      selectedVolatility = whalesVolatilitySelected;
      listSelectedReturn = JSON.parse(whalesReturnSelected);
      submit({
        searchValue,
        selectedNetWorth,
        selectedSharpeRatio,
        selectedVolatility,
        listSelectedReturn,
      });
    } else {
      searchValue = "";
      selectedNetWorth = "";
      selectedSharpeRatio = "";
      selectedVolatility = "";
      listSelectedReturn = [];
    }
  });
</script>

<div class="flex flex-col xl:gap-7 gap-9">
  <div class="xl:text-2xl text-4xl font-medium">Filter whales list</div>
  <div class="flex flex-col xl:gap-6 gap-8">
    <div
      class={`border focus:outline-none w-full py-[6px] px-3 rounded-lg ${
        searchValue && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
      }`}
    >
      <input
        on:keyup={({ target: { value } }) => debounceSearch(value)}
        value={searchValue}
        placeholder={"Filter by token name. Eg: ETH, UNI,..."}
        type="text"
        class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-base text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
          searchValue && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
        }`}
      />
    </div>
    <div class="flex flex-col xl:gap-6 gap-8">
      <div class="grid grid-cols-4 gap-6">
        <div class="col-span-1 xl:text-base text-2xl">Net Worth</div>
        <div class="col-span-3 flex flex-wrap gap-4">
          {#each netWorthFilter as item}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium rounded-[100px] transition-all flex items-center gap-2 bg_fafafbff"
            >
              <div
                class={`px-3 py-1 ${
                  selectedNetWorth === item.value ? "text-[#006CEC]" : ""
                }`}
                on:click={() => {
                  if (selectedNetWorth === item.value) {
                    selectedNetWorth = "";
                  } else {
                    selectedNetWorth = item.value;
                  }
                }}
              >
                {item.label}
              </div>
            </div>
          {/each}
        </div>
      </div>
      <div class="grid grid-cols-4 gap-6">
        <div class="col-span-1 xl:text-base text-2xl">Sharpe ratio</div>
        <div class="col-span-3 flex flex-wrap gap-4">
          {#each sharpeRatioFilter as item}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium rounded-[100px] transition-all flex items-center gap-2 bg_fafafbff"
            >
              <div
                class={`px-3 py-1 ${
                  selectedSharpeRatio === item.value ? "text-[#006CEC]" : ""
                }`}
                on:click={() => {
                  if (selectedSharpeRatio === item.value) {
                    selectedSharpeRatio = "";
                  } else {
                    selectedSharpeRatio = item.value;
                  }
                }}
              >
                {item.label}
              </div>
            </div>
          {/each}
        </div>
      </div>
      <div class="grid grid-cols-4 gap-6">
        <div class="col-span-1 xl:text-base text-2xl">Volatility</div>
        <div class="col-span-3 flex flex-wrap gap-4">
          {#each volatilityFilter as item}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium rounded-[100px] transition-all flex items-center gap-2 bg_fafafbff"
            >
              <div
                class={`px-3 py-1 ${
                  selectedVolatility === item.value ? "text-[#006CEC]" : ""
                }`}
                on:click={() => {
                  if (selectedVolatility === item.value) {
                    selectedVolatility = "";
                  } else {
                    selectedVolatility = item.value;
                  }
                }}
              >
                {item.label}
              </div>
            </div>
          {/each}
        </div>
      </div>
      <div class="grid grid-cols-4 gap-6">
        <div class="col-span-1 xl:text-base text-2xl">Return</div>
        <div class="col-span-3 flex flex-wrap gap-4">
          {#each returnsFilter as item}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium rounded-[100px] transition-all flex items-center gap-2 bg_fafafbff"
            >
              <div
                class={`px-3 py-1 ${
                  listSelectedReturn.find(
                    (selected) => selected === item.value
                  ) === item.value
                    ? "text-[#006CEC]"
                    : ""
                }`}
                on:click={() => {
                  const selectedItem = listSelectedReturn.find(
                    (selected) => selected === item.value
                  );
                  if (!selectedItem) {
                    listSelectedReturn = [...listSelectedReturn, item.value];
                  } else {
                    listSelectedReturn = listSelectedReturn.filter(
                      (selected) => selected !== item.value
                    );
                  }
                }}
              >
                {item.label}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="flex justify-end lg:gap-2 gap-6">
      <div class="lg:w-[120px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            searchValue = "";
            selectedNetWorth = "";
            selectedSharpeRatio = "";
            selectedVolatility = "";
            listSelectedReturn = [];
            localStorage.removeItem("whales_token_search");
            localStorage.removeItem("whales_networth_selected");
            localStorage.removeItem("whales_sharperatio_selected");
            localStorage.removeItem("whales_volatility_selected");
            localStorage.removeItem("whales_return_selected");
            resetFilter();
            closeModal();
          }}
        >
          Reset
        </Button>
      </div>
      <div class="lg:w-[120px] w-full">
        <Button
          variant="tertiary"
          on:click={() => {
            localStorage.setItem("whales_token_search", searchValue);
            localStorage.setItem("whales_networth_selected", selectedNetWorth);
            localStorage.setItem(
              "whales_sharperatio_selected",
              selectedSharpeRatio
            );
            localStorage.setItem(
              "whales_volatility_selected",
              selectedVolatility
            );
            localStorage.setItem(
              "whales_return_selected",
              JSON.stringify(listSelectedReturn)
            );
            submit({
              searchValue,
              selectedNetWorth,
              selectedSharpeRatio,
              selectedVolatility,
              listSelectedReturn,
            });
            closeModal();
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
