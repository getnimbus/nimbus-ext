<script lang="ts">
  import { coinmarketcap } from "~/lib/network";
  import dayjs from "dayjs";
  import { i18n } from "~/lib/i18n";
  import { DateInput } from "date-picker-svelte";
  import { isDarkMode } from "~/store";

  import Button from "~/components/Button.svelte";
  import "~/components/Loading.custom.svelte";

  export let handleSubmit = (data, type) => {};
  export let isLoadingSubmit;
  export let listVirtualPortfolio;
  export let selectedWallet;
  export let selectedChain;
  export let defaultData;

  const MultipleLang = {
    assets: i18n("newtabPage.assets", "Assets"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let searchValue = "";
  let timerDebounce;
  let virtualPortfolioName = "";
  let time = new Date();
  let listToken = [];
  let isLoadingListToken = false;
  let selectedTokenList = [];
  let selectedTokenRemove = {};

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      searchValue = value;
    }, 300);
  };

  $: {
    if (selectedWallet && selectedChain && defaultData) {
      getListToken();
    }
  }

  const getListToken = async () => {
    isLoadingListToken = true;
    try {
      const response = await coinmarketcap.get(
        `/generated/core/crypto/cryptos.json`
      );
      if (response) {
        if (defaultData && Object.keys(defaultData).length !== 0) {
          virtualPortfolioName = defaultData.portfolioName;

          time = defaultData.updatedTime;

          listToken = response?.values.map((item) => {
            const selectedToken = defaultData.coins.filter(
              (data) => data.coin === item[0]
            );

            return {
              id: item[0],
              name: item[1],
              symbol: item[2],
              logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${item[0]}.png`,
              percent: selectedToken[0] ? selectedToken[0]?.percent : 0,
            };
          });

          selectedTokenList = listToken.filter((item) => {
            return defaultData.coins.some((data) => data.coin === item.id);
          });
        } else {
          time = new Date();
          virtualPortfolioName = "";
          searchValue = "";
          selectedTokenList = [];
          remaining = 0;
          selectedTokenRemove = {};
          listToken = response?.values.map((item) => {
            return {
              id: item[0],
              name: item[1],
              symbol: item[2],
              logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${item[0]}.png`,
              percent: 0,
            };
          });
        }

        isLoadingListToken = false;
      }
    } catch (e) {
      console.log("e: ", e);
      isLoadingListToken = false;
    }
  };

  $: searchDataResult = searchValue
    ? listToken.filter(
        (item) =>
          item.name.toLowerCase() === searchValue.toLowerCase() ||
          item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : listToken.slice(0, 1000);

  $: {
    if (selectedTokenList) {
      searchDataResult = searchDataResult?.map((item) => {
        return {
          ...item,
          percent:
            selectedTokenRemove &&
            Object.keys(selectedTokenRemove).length !== 0 &&
            selectedTokenRemove.id === item.id
              ? 0
              : item.percent,
        };
      });

      listToken = listToken?.map((item) => {
        return {
          ...item,
          percent:
            selectedTokenRemove &&
            Object.keys(selectedTokenRemove).length !== 0 &&
            selectedTokenRemove.id === item.id
              ? 0
              : item.percent,
        };
      });

      if (selectedTokenList.length === 0) {
        selectedTokenRemove = {};
      }
    }
  }

  $: remaining = selectedTokenList.reduce(
    (prev, item) => prev + Number(item.percent),
    0
  );

  $: {
    if (listVirtualPortfolio.length === 0) {
      virtualPortfolioName = "";
      searchValue = "";
      selectedTokenList = [];
      remaining = 0;
      listToken = listToken.map((item) => {
        return {
          ...item,
          percent: 0,
        };
      });
    }
  }
</script>

<div class="flex flex-col gap-5">
  <div class="flex lg:flex-row flex-col justify-between gap-4">
    <div class="flex-1 flex flex-col gap-1 input-2 w-full p-4">
      <div class="xl:text-base text-xl text-[#666666] font-medium">
        Virtual portfolio name
      </div>
      <input
        type="text"
        placeholder="Your virtual portfolio name"
        class="py-1 px-[6px] rounded-[3px] focus:outline-none focus:ring-0 xl:text-base text-lg font-normal text-[#5E656B] placeholder-[#5E656B]"
        style="border: 1px solid rgba(103, 113, 137, 0.3)"
        value={virtualPortfolioName}
        on:keyup={(e) => (virtualPortfolioName = e.target.value)}
      />
    </div>

    <div class="flex-1 flex flex-col gap-1 input-2 w-full p-4">
      <div class="xl:text-base text-xl text-[#666666] font-medium">
        {#if defaultData && Object.keys(defaultData).length !== 0}
          Initial Time
        {:else}
          Update Time
        {/if}
      </div>
      {#if defaultData && Object.keys(defaultData).length !== 0}
        <DateInput
          value={time}
          format="yyyy-MM-dd"
          min={defaultData.updatedTime}
          max={new Date()}
        />
      {:else}
        <DateInput value={time} format="yyyy-MM-dd" max={new Date()} />
      {/if}
    </div>
  </div>

  <div class="flex xl:flex-row flex-col justify-between gap-4">
    <div
      class="flex-1 border border_0000001a rounded-[20px] p-4 flex flex-col gap-2 relative"
    >
      <div class="flex md:flex-row flex-col justify-between md:items-end gap-4">
        <div class="flex flex-col">
          <div class="xl:text-xl text-2xl font-medium">1. Choose coins</div>
          <div class="xl:text-base text-lg font-normal text-gray-500">
            Choose one or more to start
          </div>
        </div>
        <div
          class={`border focus:outline-none md:w-max w-full py-[6px] px-3 rounded-lg ${
            searchValue ? "bg-[#F0F2F7]" : "bg-white"
          }`}
        >
          <input
            on:keyup={({ target: { value } }) => debounceSearch(value)}
            value={searchValue}
            placeholder={"Find by token name"}
            type="text"
            class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
              searchValue ? "bg-[#F0F2F7]" : ""
            }`}
          />
        </div>
      </div>

      <div
        class="border border_0000000d rounded-[10px] overflow-y-auto h-[550px]"
      >
        <table
          class={`table-auto w-full ${
            isLoadingListToken ||
            (searchDataResult && searchDataResult.length === 0)
              ? "h-full"
              : ""
          }`}
        >
          {#if isLoadingListToken}
            <tbody>
              <tr>
                <td colspan={2}>
                  <div class="flex justify-center items-center py-3 px-3">
                    <loading-icon />
                  </div>
                </td>
              </tr>
            </tbody>
          {:else}
            <tbody>
              {#if searchDataResult && searchDataResult.length === 0}
                <tr>
                  <td colspan={2}>
                    <div
                      class="flex justify-center items-center py-3 px-3 xl:text-lg text-xl text-gray-400"
                    >
                      {MultipleLang.empty}
                    </div>
                  </td>
                </tr>
              {:else}
                {#each searchDataResult as data}
                  <tr
                    class="group transition-all cursor-pointer"
                    on:click={() => {
                      const isIncludes = selectedTokenList.find(
                        (item) => item.id === data.id
                      );
                      if (!isIncludes) {
                        selectedTokenList = [
                          ...selectedTokenList,
                          listToken.filter((item) => item.id === data.id)[0],
                        ];
                      }
                    }}
                  >
                    <td
                      class={`py-3 pl-3 ${
                        darkMode
                          ? "group-hover:bg-[#00000033]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div class="text-left flex items-center gap-3">
                        <img
                          src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${data.id}.png`}
                          alt=""
                          width="30"
                          height="30"
                          class="rounded-full"
                        />
                        <div class="flex flex-col gap-1">
                          <div class=" xl:text-sm text-xl font-medium relative">
                            {#if data?.name === undefined}
                              N/A
                            {:else}
                              {data?.name}
                            {/if}
                          </div>
                          <div
                            class="text_00000080 text-xs font-medium relative"
                          >
                            {#if data?.symbol === undefined}
                              N/A
                            {:else}
                              {data?.symbol}
                            {/if}
                          </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          {#if data?.suggest && data.suggest.length}
                            {#each data?.suggest as item}
                              <a
                                href={item.url}
                                target="_blank"
                                class="flex items-center justyfy-center px-2 py-1 text_27326F text-[10px] font-medium bg-[#1e96fc33] rounded-[1000px]"
                              >
                                {item.tile}
                              </a>
                            {/each}
                          {/if}
                        </div>
                      </div>
                    </td>

                    <td
                      class={`py-3 w-10 ${
                        darkMode
                          ? "group-hover:bg-[#00000033]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div class="flex justify-center">
                        <div class="text-3xl text_00000080">&rsaquo;</div>
                      </div>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          {/if}
        </table>
      </div>
    </div>

    <div
      class="flex-1 border border_0000001a rounded-[20px] p-4 flex flex-col gap-2 relative"
    >
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <div class="xl:text-xl text-2xl font-medium">2. Coin Allocation</div>
          <div class="xl:text-base text-lg font-normal text-gray-500">
            Remaining: <span
              class={`${remaining === 100 ? "text-gray-500" : "text-red-500"}`}
              >{remaining}%</span
            >/100%
          </div>
        </div>
        {#if selectedTokenList && selectedTokenList.length !== 0}
          <div
            class="xl:text-base text-lg text-red-500 cursor-pointer"
            on:click={() => {
              selectedTokenList = [];
              remaining = 0;
              selectedTokenRemove = {};
              listToken = listToken.map((item) => {
                return {
                  ...item,
                  percent: 0,
                };
              });
            }}
          >
            Clear All
          </div>
        {/if}
      </div>

      <div
        class="border border_0000000d rounded-[10px] overflow-y-auto h-[550px]"
      >
        {#each selectedTokenList as data (data.id)}
          <div id={data.id} class="grid grid-cols-2 gap-2 my-2 mx-2">
            <div
              class="py-2 pl-2 col-span-1 border border_0000000d rounded-[10px]"
            >
              <div class="text-left flex items-center gap-3">
                <img
                  src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${data.id}.png`}
                  alt=""
                  width="30"
                  height="30"
                  class="rounded-full"
                />
                <div class="flex flex-col gap-1">
                  <div class=" xl:text-sm text-xl font-medium relative">
                    {#if data.name === undefined}
                      N/A
                    {:else}
                      {data.name}
                    {/if}
                  </div>
                  <div class="text_00000080 text-xs font-medium relative">
                    {#if data.symbol === undefined}
                      N/A
                    {:else}
                      {data.symbol}
                    {/if}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-1 flex items-center gap-6">
              <div
                class="flex-1 border border_0000000d rounded-[10px] h-full flex justify-between items-center px-2"
              >
                <div
                  class="flex-1 flex justify-center items-center xl:text-3xl text-5xl text-gray-500"
                >
                  <div
                    class="cursor-pointer"
                    on:click={() => {
                      if (data.percent > 0) {
                        data.percent -= 1;
                        selectedTokenList = selectedTokenList.map((item) => {
                          if (item.id === data.id) {
                            return data;
                          }
                          return item;
                        });
                      }
                    }}
                  >
                    -
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.percent}
                  on:keyup={(e) => {
                    if (e.target.value) {
                      let number = 0;
                      if (parseInt(e.target.value) < parseInt(e.target.min)) {
                        e.target.value = e.target.min;
                        number = e.target.min;
                      } else if (
                        parseInt(e.target.value) > parseInt(e.target.max)
                      ) {
                        e.target.value = e.target.max;
                        number = e.target.max;
                      } else {
                        number = e.target.value;
                      }
                      selectedTokenList = selectedTokenList.map((item) => {
                        if (item.id === data.id) {
                          return {
                            ...data,
                            percent: Number(number),
                          };
                        }
                        return item;
                      });
                    }
                  }}
                  class="w-max border-none focus:outline-none focus:ring-0 xl:text-xl text-3xl font-normal text-[#5E656B] placeholder-[#5E656B] text-center"
                />
                <div
                  class="flex-1 flex justify-center items-center xl:text-3xl text-5xl text-gray-500"
                >
                  <div
                    class="cursor-pointer"
                    on:click={() => {
                      if (data.percent < 100) {
                        data.percent += 1;
                        selectedTokenList = selectedTokenList.map((item) => {
                          if (item.id === data.id) {
                            return data;
                          }
                          return item;
                        });
                      }
                    }}
                  >
                    +
                  </div>
                </div>
              </div>
              <div
                class="xl:text-3xl text-5xl text-gray-500 cursor-pointer text-center"
                on:click={() => {
                  selectedTokenList = selectedTokenList.filter(
                    (item) => item.id !== data.id
                  );
                  selectedTokenRemove = data;
                }}
              >
                &times;
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="flex justify-end">
    <div class="md:w-[120px] w-full">
      {#if remaining !== 100 || virtualPortfolioName.length === 0}
        <Button variant="disabled" disabled>
          <div class="xl:text-base text-2xl font-medium">
            {defaultData && Object.keys(defaultData).length !== 0
              ? "Edit"
              : "Create"}
          </div>
        </Button>
      {:else}
        <Button
          isLoading={isLoadingSubmit}
          on:click={() =>
            handleSubmit(
              {
                initialTime: dayjs(time).format("YYYY-MM-DD"),
                portfolioName: virtualPortfolioName,
                coins: selectedTokenList.map((item) => {
                  return {
                    coin: item.id.toString(),
                    percent: item.percent,
                  };
                }),
              },
              defaultData && Object.keys(defaultData).length !== 0
                ? "edit"
                : "add"
            )}
        >
          <div class="xl:text-base text-2xl font-medium">
            {defaultData && Object.keys(defaultData).length !== 0
              ? "Edit"
              : "Create"}
          </div>
        </Button>
      {/if}
    </div>
  </div>
</div>

<style>
  :root {
    --date-input-width: 100%;
    --date-picker-background: white;
    --date-picker-foreground: #5e656b;
    --date-picker-selected-color: black;
    --date-picker-highlight-border: transparent;
  }
</style>
