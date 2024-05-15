<script lang="ts">
  import dayjs from "dayjs";
  import { i18n } from "~/lib/i18n";
  import { DateInput } from "date-picker-svelte";
  import { isDarkMode } from "~/store";
  import { handleMarketTokens } from "~/lib/queryAPI";
  import { createQuery } from "@tanstack/svelte-query";

  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

  export let handleSubmit = (data, type) => {};
  export let handleCancel = () => {};
  export let isLoading;
  export let listVirtualPortfolio;
  export let defaultData;
  export let type;

  const MultipleLang = {
    assets: i18n("newtabPage.assets", "Assets"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let searchValue = "";
  let virtualPortfolioName = "";
  let time = new Date();
  let listToken = [];

  let selectedTokenList = [];
  let selectedTokenRemove: any = {};

  // get list all token
  $: queryListToken = createQuery({
    queryKey: ["list-all-token"],
    queryFn: () => handleMarketTokens(),
    staleTime: Infinity,
  });

  $: {
    if (!$queryListToken.isError && $queryListToken?.data) {
      formatListAllToken($queryListToken?.data);
    }
  }

  const formatListAllToken = (data) => {
    listToken = data?.map((item) => {
      return {
        id: item?.id,
        name: item?.name,
        symbol: item?.symbol,
        logo: item?.large,
        percent: 0,
      };
    });
  };

  $: {
    if (
      listToken &&
      listToken.length !== 0 &&
      listVirtualPortfolio &&
      listVirtualPortfolio.length !== 0
    ) {
      if (type === "edit") {
        if (defaultData && Object.keys(defaultData).length !== 0) {
          virtualPortfolioName = defaultData.portfolioName;

          time = dayjs(defaultData.updatedTime).toDate();

          listToken = listToken.map((item) => {
            const selectedToken = defaultData.coins.find(
              (data) => data.coinId === item.id
            );
            return {
              ...item,
              percent: selectedToken !== undefined ? selectedToken.percent : 0,
            };
          });

          selectedTokenList = listToken.filter((item) => {
            return defaultData.coins.some((data) => data.coinId === item.id);
          });
        }
      }
    }
  }

  $: searchDataResult = searchValue
    ? listToken.filter(
        (item) =>
          item.name.toLowerCase() === searchValue.toLowerCase() ||
          item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : listToken.slice(0, 100);

  $: {
    if (selectedTokenList) {
      searchDataResult = searchDataResult?.map((item) => {
        return {
          ...item,
          percent:
            selectedTokenRemove &&
            Object.keys(selectedTokenRemove).length !== 0 &&
            selectedTokenRemove?.id === item.id
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
            selectedTokenRemove?.id === item.id
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
</script>

<div class="flex flex-col gap-6">
  <div class="flex lg:flex-row flex-col justify-between gap-6">
    <div
      class={`flex-1 flex flex-col gap-2 input-2 w-full p-4 border border_0000001a ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff]"
      }`}
    >
      <div class="xl:text-base text-2xl font-medium">
        Virtual portfolio name
      </div>
      <input
        type="text"
        placeholder="Your virtual portfolio name"
        class={`py-1 px-[6px] rounded-[3px] focus:outline-none focus:ring-0 xl:text-base text-lg font-normal ${
          virtualPortfolioName && !$isDarkMode
            ? "bg-[#F0F2F7]"
            : "bg-transparent"
        } ${
          $isDarkMode ? "text-white" : "text-[#5E656B] placeholder-[#5E656B]"
        }`}
        style="border: 1px solid rgba(103, 113, 137, 0.3)"
        value={virtualPortfolioName}
        on:change={(event) => {
          virtualPortfolioName = event?.target.value;
        }}
      />
    </div>

    <div
      class={`flex-1 flex flex-col gap-2 input-2 w-full p-4 border border_0000001a ${
        $isDarkMode
          ? "bg-[#222222] dark-date-picker"
          : "bg-[#fff] light-date-picker"
      }`}
    >
      <div class="xl:text-base text-2xl font-medium">
        {#if type === "edit"}
          Initial Time
        {:else}
          Update Time
        {/if}
      </div>
      {#if type === "edit"}
        <DateInput
          value={time}
          format="yyyy-MM-dd"
          min={dayjs(defaultData.updatedTime).toDate()}
          max={new Date()}
        />
      {:else}
        <DateInput value={time} format="yyyy-MM-dd" max={new Date()} />
      {/if}
    </div>
  </div>

  <div class="flex xl:flex-row flex-col justify-between gap-6">
    <div
      class={`flex-1 w-full flex flex-col gap-4 input-2 p-4 relative border border_0000001a ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff]"
      }`}
    >
      <div class="flex md:flex-row flex-col justify-between md:items-end gap-4">
        <div class="flex flex-col gap-1">
          <div class="xl:text-xl text-2xl font-medium">1. Choose coins</div>
          <div class="text-base font-normal text-gray-500">
            Choose one or more to start
          </div>
        </div>
        <input
          bind:value={searchValue}
          on:change={(event) => {
            searchValue = event?.target.value;
          }}
          placeholder={"Find by token name"}
          type="text"
          class={`py-1 px-[6px] rounded-[3px] focus:outline-none focus:ring-0 text-base font-normal ${
            virtualPortfolioName && !$isDarkMode
              ? "bg-[#F0F2F7]"
              : "bg-transparent"
          } ${
            $isDarkMode ? "text-white" : "text-[#5E656B] placeholder-[#5E656B]"
          }`}
          style="border: 1px solid rgba(103, 113, 137, 0.3)"
        />
      </div>

      <div
        class="border border_0000000d rounded-[10px] overflow-y-auto h-[550px]"
      >
        <table
          class={`table-auto w-full ${
            $queryListToken.isFetching ||
            (searchDataResult && searchDataResult.length === 0)
              ? "h-full"
              : ""
          }`}
        >
          {#if $queryListToken.isFetching}
            <tbody>
              <tr>
                <td colspan={2}>
                  <div class="flex justify-center items-center py-3 px-3">
                    <Loading />
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
                      class="flex justify-center items-center py-3 px-3 text-base text-gray-400"
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
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
                          : "group-hover:bg-gray-100"
                      }`}
                    >
                      <div class="text-left flex items-center gap-3">
                        <img
                          src={data?.logo}
                          alt=""
                          width="30"
                          height="30"
                          class="rounded-full"
                        />
                        <div class="flex flex-col gap-1">
                          <div class="xl:text-sm text-2xl font-medium relative">
                            {#if data?.name === undefined}
                              N/A
                            {:else}
                              {data?.name}
                            {/if}
                          </div>
                          <div
                            class="text_00000080 xl:text-xs text-lg font-medium relative"
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
                                class="flex items-center justyfy-center px-2 py-1 text_27326F xl:text-[10px] text-base font-medium bg-[#1e96fc33] rounded-[1000px]"
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
                        $isDarkMode
                          ? "group-hover:bg-[#000]"
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
      class={`flex-1 w-full flex flex-col gap-4 input-2 p-4 relative border border_0000001a ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff]"
      }`}
    >
      <div class="flex justify-between items-end">
        <div class="flex flex-col gap-1">
          <div class="xl:text-xl text-2xl font-medium">2. Coin Allocation</div>
          <div class="text-base font-normal text-gray-500">
            Remaining: <span
              class={`${remaining === 100 ? "text-gray-500" : "text-red-500"}`}
              >{remaining}%</span
            >/100%
          </div>
        </div>
        {#if selectedTokenList && selectedTokenList.length !== 0}
          <div
            class="text-base text-red-500 cursor-pointer"
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
        {#each selectedTokenList as data}
          <div id={data.id} class="grid grid-cols-2 gap-2 my-2 mx-2">
            <div
              class="py-2 pl-2 col-span-1 border border_0000000d rounded-[10px]"
            >
              <div class="text-left flex items-center gap-3">
                <img
                  src={data?.logo}
                  alt=""
                  width="30"
                  height="30"
                  class="rounded-full"
                />
                <div class="flex flex-col gap-1">
                  <div class="xl:text-sm text-2xl font-medium relative">
                    {#if data.name === undefined}
                      N/A
                    {:else}
                      {data.name}
                    {/if}
                  </div>
                  <div
                    class="text_00000080 xl:text-xs text-lg font-medium relative"
                  >
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
                  step="0.01"
                  value={data.percent}
                  on:change={(event) => {
                    let value = parseFloat(event?.target?.value);

                    if (isNaN(value) || value < 0) {
                      value = 0;
                    }
                    if (value > 100) {
                      value = 100;
                    }

                    selectedTokenList = selectedTokenList.map((item) => {
                      if (item.id === data.id) {
                        return {
                          ...item,
                          percent: value,
                        };
                      }
                      return item;
                    });
                  }}
                  class={`w-max border-none focus:outline-none focus:ring-0 xl:text-xl text-3xl font-normal text-center  ${
                    $isDarkMode
                      ? "text-white bg-transparent"
                      : "text-[#5E656B] placeholder-[#5E656B]"
                  }`}
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

  <div class="flex items-center justify-end gap-6">
    <div
      class="text-[#27326f] font-medium cursor-pointer"
      on:click={() => {
        handleCancel();
      }}
    >
      Cancel
    </div>
    <div class="md:w-[120px] w-full">
      {#if remaining !== 100 || virtualPortfolioName.length === 0}
        <Button variant="disabled" disabled>
          <div class={`${$isDarkMode ? "text-gray-400" : "text-white"}`}>
            {type === "edit" ? "Edit" : "Create"}
          </div>
        </Button>
      {:else}
        <Button
          {isLoading}
          disabled={isLoading}
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
              type
            )}
        >
          {type === "edit" ? "Edit" : "Create"}
        </Button>
      {/if}
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }

  .light-date-picker {
    --date-input-width: 100%;
    --date-picker-background: white;
    --date-picker-foreground: #5e656b;
    --date-picker-selected-color: black;
    --date-picker-highlight-border: transparent;
  }

  .dark-date-picker {
    --date-input-width: 100%;
    --date-picker-background: #222222;
    --date-picker-foreground: #fff;
    --date-picker-selected-color: black;
    --date-picker-highlight-border: transparent;
  }
</style>
