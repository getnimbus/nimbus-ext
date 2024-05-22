<script lang="ts">
  import dayjs from "dayjs";
  import { i18n } from "~/lib/i18n";
  import { DateInput } from "date-picker-svelte";
  import { isDarkMode } from "~/store";
  import { handleMarketTokens } from "~/lib/queryAPI";
  import { createQuery } from "@tanstack/svelte-query";
  import { isNaN } from "lodash";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

  export let handleSubmit = (data, type, virtualPortfolioNetworth) => {};
  export let handleCancel = () => {};
  export let isLoading;
  export let listVirtualPortfolio;
  export let defaultData;
  export let type;

  const MultipleLang = {
    assets: i18n("newtabPage.assets", "Assets"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 5;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  let searchValue = "";
  let virtualPortfolioName = "";
  let virtualPortfolioNetworth = 0;
  let time = new Date();
  let listToken = [];

  let selectedTokenList = [];
  let selectedTokenRemove: any = {};

  let checkedStatus = true;

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
          if (defaultData.status === "PRIVATE") {
            checkedStatus = false;
          }

          virtualPortfolioName = defaultData.portfolioName;

          virtualPortfolioNetworth = defaultData?.netWorth;

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

<div class="flex items-center justify-end gap-2 text-[#666666] mb-2">
  <div class="text-base">Is it Public?</div>
  <label class="switch" for="switch">
    <input type="checkbox" id="switch" bind:checked={checkedStatus} />
    <span class="slider" />
  </label>
</div>
<div class="flex flex-col gap-6">
  <div class="flex xl:flex-row flex-col gap-6">
    <div
      class={`flex-1 flex flex-col gap-2 input-2 w-full p-4 border border_0000001a ${
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff]"
      }`}
    >
      <div class="xl:text-base text-2xl font-medium">Portfolio name</div>
      <input
        type="text"
        placeholder="Your portfolio name"
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
        $isDarkMode ? "bg-[#222222]" : "bg-[#fff]"
      }`}
    >
      <div class="xl:text-base text-2xl font-medium">Portfolio networth</div>
      <div
        class={`py-1 px-[6px] rounded-[3px] xl:text-base text-lg font-normal ${
          virtualPortfolioNetworth && !$isDarkMode
            ? "bg-[#F0F2F7]"
            : "bg-transparent"
        } ${
          $isDarkMode ? "text-white" : "text-[#5E656B] placeholder-[#5E656B]"
        }`}
        style="border: 1px solid rgba(103, 113, 137, 0.3)"
      >
        $
        <input
          type="number"
          min="100"
          step="0.01"
          placeholder="0"
          disabled={type === "edit"}
          class={`p-0 border-none focus:outline-none focus:ring-0 ${
            virtualPortfolioNetworth && !$isDarkMode
              ? "bg-[#F0F2F7]"
              : "bg-transparent"
          }`}
          value={virtualPortfolioNetworth}
          on:change={(event) => {
            let value = parseFloat(event?.target?.value);

            if (isNaN(value)) {
              value = 0;
            }
            if (value < 0) {
              value = 0;
            }

            virtualPortfolioNetworth = value;
          }}
        />
      </div>
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
          bind:value={time}
          format="yyyy-MM-dd"
          min={time}
          max={new Date()}
        />
      {/if}
      {#if type === "add"}
        <DateInput bind:value={time} format="yyyy-MM-dd" max={new Date()} />
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
            searchValue && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
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
                    if (value < 0) {
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
      class="font-medium cursor-pointer"
      on:click={() => {
        handleCancel();
      }}
    >
      Cancel
    </div>
    <div class="md:w-[120px] w-full">
      {#if remaining !== 100 || virtualPortfolioName.length === 0 || virtualPortfolioNetworth === 0 || virtualPortfolioNetworth < 100}
        <Button variant="disabled" disabled>
          <div class={`${$isDarkMode ? "text-gray-400" : "text-white"}`}>
            {type === "edit" ? "Edit" : "Create"}
          </div>
        </Button>
      {:else}
        <Button
          {isLoading}
          disabled={isLoading}
          on:click={() => {
            if (Number(virtualPortfolioNetworth) < 100) {
              toastMsg = `Your virtual portfolio networth is lower than $100. Please try again!`;
              isSuccessToast = false;
              trigger();
              return;
            }

            if (virtualPortfolioName.length === 0) {
              toastMsg = `Missing virtual portfolio name. Please try again!`;
              isSuccessToast = false;
              trigger();
              return;
            }

            if (selectedTokenList.find((item) => item.percent === 0)) {
              toastMsg = `One of all token you have been selected and percent input is not valid. Please try again!`;
              isSuccessToast = false;
              trigger();
              return;
            }

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
                status: checkedStatus ? "PUBLIC" : "PRIVATE",
              },
              type,
              Number(virtualPortfolioNetworth)
            );
          }}
        >
          {type === "edit" ? "Edit" : "Create"}
        </Button>
      {/if}
    </div>
  </div>
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full" style="z-index: 2147483648;">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

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

  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }
  input:checked + .slider {
    background-color: #2196f3;
  }
  input:checked + .slider {
    box-shadow: 0 0 1px #2196f3;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
  }

  @media screen and (max-width: 1280px) {
    .switch {
      width: 60px;
      height: 30px;
    }

    .slider {
      border-radius: 44px;
    }

    .slider:before {
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 2px;
    }

    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
  }
</style>
