<script lang="ts">
  import { onMount } from "svelte";
  import {
    netWorthFilter,
    sharpeRatioFilter,
    volatilityFilter,
    returnsFilter,
  } from "~/utils";

  import Button from "~/components/Button.svelte";

  export let closeModal = () => {};
  export let submit = (value) => {};
  export let resetFilter = () => {};

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
  <div class="xl:text-2xl text-4xl font-medium text-black">
    Filter whales list
  </div>
  <div class="flex flex-col xl:gap-6 gap-8">
    <div
      class={`border focus:outline-none w-full py-[6px] px-3 rounded-lg ${
        searchValue ? "bg-[#F0F2F7]" : "bg-white"
      }`}
    >
      <input
        on:keyup={({ target: { value } }) => debounceSearch(value)}
        on:keydown={(event) => {
          if ((event.which == 13 || event.keyCode == 13) && searchValue) {
            console.log("searchValue: ", searchValue);
          }
        }}
        value={searchValue}
        placeholder={"Filter by token name"}
        type="text"
        class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-base text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
          searchValue ? "bg-[#F0F2F7]" : ""
        }`}
      />
    </div>
    <div class="flex flex-col xl:gap-6 gap-8">
      <div class="grid grid-cols-4 gap-6">
        <div class="col-span-1 xl:text-base text-2xl">Net Worth</div>
        <div class="col-span-3 flex flex-wrap gap-4">
          {#each netWorthFilter as item}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium rounded-[100px] transition-all flex items-center gap-2 bg-gray-100"
            >
              <div
                class={`px-3 py-1 ${
                  selectedNetWorth === item.value
                    ? "pl-3 pr-0 text-[#006CEC]"
                    : ""
                }`}
                on:click={() => {
                  selectedNetWorth = item.value;
                }}
              >
                {item.label}
              </div>
              {#if selectedNetWorth.length !== 0 && selectedNetWorth === item.value}
                <div on:click={() => (selectedNetWorth = "")} class="pr-3">
                  <svg
                    class="css-1tl8n6g"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM5.35355 4.64645C5.15829 4.45118 4.84171 4.45118 4.64645 4.64645C4.45118 4.84171 4.45118 5.15829 4.64645 5.35355L7.29289 8L4.64645 10.6464C4.45118 10.8417 4.45118 11.1583 4.64645 11.3536C4.84171 11.5488 5.15829 11.5488 5.35355 11.3536L8 8.70711L10.6464 11.3536C10.8417 11.5488 11.1583 11.5488 11.3536 11.3536C11.5488 11.1583 11.5488 10.8417 11.3536 10.6464L8.70711 8L11.3536 5.35355C11.5488 5.15829 11.5488 4.84171 11.3536 4.64645C11.1583 4.45118 10.8417 4.45118 10.6464 4.64645L8 7.29289L5.35355 4.64645Z"
                      fill="#006CEC"
                    /></svg
                  >
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
      <div class="grid grid-cols-4 gap-6">
        <div class="col-span-1 xl:text-base text-2xl">Sharpe ratio</div>
        <div class="col-span-3 flex flex-wrap gap-4">
          {#each sharpeRatioFilter as item}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium rounded-[100px] transition-all flex items-center gap-2 bg-gray-100"
            >
              <div
                class={`px-3 py-1 ${
                  selectedSharpeRatio === item.value
                    ? "pl-3 pr-0 text-[#006CEC]"
                    : ""
                }`}
                on:click={() => {
                  selectedSharpeRatio = item.value;
                }}
              >
                {item.label}
              </div>
              {#if selectedSharpeRatio.length !== 0 && selectedSharpeRatio === item.value}
                <div on:click={() => (selectedSharpeRatio = "")} class="pr-3">
                  <svg
                    class="css-1tl8n6g"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM5.35355 4.64645C5.15829 4.45118 4.84171 4.45118 4.64645 4.64645C4.45118 4.84171 4.45118 5.15829 4.64645 5.35355L7.29289 8L4.64645 10.6464C4.45118 10.8417 4.45118 11.1583 4.64645 11.3536C4.84171 11.5488 5.15829 11.5488 5.35355 11.3536L8 8.70711L10.6464 11.3536C10.8417 11.5488 11.1583 11.5488 11.3536 11.3536C11.5488 11.1583 11.5488 10.8417 11.3536 10.6464L8.70711 8L11.3536 5.35355C11.5488 5.15829 11.5488 4.84171 11.3536 4.64645C11.1583 4.45118 10.8417 4.45118 10.6464 4.64645L8 7.29289L5.35355 4.64645Z"
                      fill="#006CEC"
                    /></svg
                  >
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
      <div class="grid grid-cols-4 gap-6">
        <div class="col-span-1 xl:text-base text-2xl">Volatility</div>
        <div class="col-span-3 flex flex-wrap gap-4">
          {#each volatilityFilter as item}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium rounded-[100px] transition-all flex items-center gap-2 bg-gray-100"
            >
              <div
                class={`px-3 py-1 ${
                  selectedVolatility === item.value
                    ? "pl-3 pr-0 text-[#006CEC]"
                    : ""
                }`}
                on:click={() => {
                  selectedVolatility = item.value;
                }}
              >
                {item.label}
              </div>
              {#if selectedVolatility.length !== 0 && selectedVolatility === item.value}
                <div on:click={() => (selectedVolatility = "")} class="pr-3">
                  <svg
                    class="css-1tl8n6g"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM5.35355 4.64645C5.15829 4.45118 4.84171 4.45118 4.64645 4.64645C4.45118 4.84171 4.45118 5.15829 4.64645 5.35355L7.29289 8L4.64645 10.6464C4.45118 10.8417 4.45118 11.1583 4.64645 11.3536C4.84171 11.5488 5.15829 11.5488 5.35355 11.3536L8 8.70711L10.6464 11.3536C10.8417 11.5488 11.1583 11.5488 11.3536 11.3536C11.5488 11.1583 11.5488 10.8417 11.3536 10.6464L8.70711 8L11.3536 5.35355C11.5488 5.15829 11.5488 4.84171 11.3536 4.64645C11.1583 4.45118 10.8417 4.45118 10.6464 4.64645L8 7.29289L5.35355 4.64645Z"
                      fill="#006CEC"
                    /></svg
                  >
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
      <div class="grid grid-cols-4 gap-6">
        <div class="col-span-1 xl:text-base text-2xl">Return</div>
        <div class="col-span-3 flex flex-wrap gap-4">
          {#each returnsFilter as item}
            <div
              class="relative cursor-pointer xl:text-base text-2xl font-medium rounded-[100px] transition-all flex items-center gap-2 bg-gray-100"
            >
              <div
                class={`px-3 py-1 ${
                  listSelectedReturn.find(
                    (selected) => selected === item.value
                  ) === item.value
                    ? "pl-3 pr-0 text-[#006CEC]"
                    : ""
                }`}
                on:click={() => {
                  listSelectedReturn = [...listSelectedReturn, item.value];
                }}
              >
                {item.label}
              </div>
              {#if listSelectedReturn.length !== 0 && listSelectedReturn.find((selected) => selected === item.value) === item.value}
                <div
                  on:click={() =>
                    (listSelectedReturn = listSelectedReturn.filter(
                      (selected) => selected !== item.value
                    ))}
                  class="pr-3"
                >
                  <svg
                    class="css-1tl8n6g"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM5.35355 4.64645C5.15829 4.45118 4.84171 4.45118 4.64645 4.64645C4.45118 4.84171 4.45118 5.15829 4.64645 5.35355L7.29289 8L4.64645 10.6464C4.45118 10.8417 4.45118 11.1583 4.64645 11.3536C4.84171 11.5488 5.15829 11.5488 5.35355 11.3536L8 8.70711L10.6464 11.3536C10.8417 11.5488 11.1583 11.5488 11.3536 11.3536C11.5488 11.1583 11.5488 10.8417 11.3536 10.6464L8.70711 8L11.3536 5.35355C11.5488 5.15829 11.5488 4.84171 11.3536 4.64645C11.1583 4.45118 10.8417 4.45118 10.6464 4.64645L8 7.29289L5.35355 4.64645Z"
                      fill="#006CEC"
                    /></svg
                  >
                </div>
              {/if}
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
