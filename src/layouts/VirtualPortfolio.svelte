<script lang="ts">
  import { onMount } from "svelte";
  import { navigateTo } from "svelte-router-spa";
  import { nimbus } from "~/lib/network";
  import { wallet, user } from "~/store";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { getVirtualPortfolioList } from "~/lib/queryAPI";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import AppOverlay from "~/components/Overlay.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";
  import Select from "~/components/Select.svelte";
  import Copy from "~/components/Copy.svelte";
  import FormVirtualPortfolio from "~/UI/VirtualPortfolio/FormVirtualPortfolio.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import Plus from "~/assets/plus.svg";

  let listVirtualPortfolio = [];
  let selectedVirtualPortfolio: any = {};

  const queryClient = useQueryClient();

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

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParams = urlParams.get("address");

    if (addressParams) {
      wallet.update((n) => (n = addressParams));
    }
  });

  $: queryAddressVirtualPortfolio = createQuery({
    queryKey: ["list-virtual-portfolio-address", $wallet],
    queryFn: () => getVirtualPortfolioList($wallet),
    staleTime: Infinity,
    retry: false,
    enabled: Boolean($wallet && $wallet.length !== 0),
  });

  $: {
    if (
      !$queryAddressVirtualPortfolio.isError &&
      $queryAddressVirtualPortfolio.data !== undefined
    ) {
      const virtualPortfolioNameList = Object.getOwnPropertyNames(
        $queryAddressVirtualPortfolio?.data?.data
      );
      listVirtualPortfolio =
        virtualPortfolioNameList &&
        virtualPortfolioNameList?.map((item) => {
          return {
            portfolioName: item,
            coins: $queryAddressVirtualPortfolio?.data?.data[item]?.tokens?.map(
              (coin) => {
                return {
                  ...coin,
                  percent: Number(coin?.percent),
                };
              }
            ),
            updatedTime:
              $queryAddressVirtualPortfolio?.data?.data[item]?.updatedTime,
          };
        });

      if (
        listVirtualPortfolio &&
        listVirtualPortfolio.length !== 0 &&
        listVirtualPortfolio.length === 1
      ) {
        selectedVirtualPortfolio = listVirtualPortfolio[0];
      }
      if (
        listVirtualPortfolio &&
        listVirtualPortfolio.length !== 0 &&
        listVirtualPortfolio.length > 1
      ) {
        selectedVirtualPortfolio =
          listVirtualPortfolio[listVirtualPortfolio.length - 1];
      }
    }
  }

  let showDisable = false;
  let showDisabledSelect = false;
  let indexSelected = 0;

  let container;
  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  const handleSelectNext = () => {
    if (indexSelected < listVirtualPortfolio.length - 1) {
      indexSelected = indexSelected + 1;

      const selectAddress = listVirtualPortfolio[indexSelected];

      selectedVirtualPortfolio = selectAddress;
    }
  };

  const handleSelectPrev = () => {
    if (indexSelected > 0) {
      indexSelected = indexSelected - 1;

      const selectAddress = listVirtualPortfolio[indexSelected];

      selectedVirtualPortfolio = selectAddress;
    }
  };

  let type = "";
  let isLoading = false;

  const handleSubmit = async (data: any) => {
    try {
      isLoading = true;
      if (type === "add") {
        const responseAdd = await nimbus.post(
          `/address/${$wallet}/personalize/virtual-portfolio`,
          data
        );
        if (responseAdd && responseAdd?.error) {
          toastMsg = `Something wrong when add ${data?.portfolioName} virtual portfolio. Please try again!`;
          isSuccessToast = false;
          trigger();
          return;
        }

        toastMsg = `Successfully add ${data?.portfolioName} virtual portfolio`;
        isSuccessToast = true;
        trigger();
      }
      if (type === "edit") {
        const responseEdit = await nimbus.put(
          `/address/${$wallet}/personalize/virtual-portfolio?portfolioName=${data?.portfolioName}`,
          data
        );

        if (responseEdit && responseEdit?.error) {
          toastMsg = `Something wrong when edit ${data?.portfolioName} virtual portfolio. Please try again!`;
          isSuccessToast = false;
          trigger();
          return;
        }

        toastMsg = `Successfully edit ${data?.portfolioName} virtual portfolio`;
        isSuccessToast = true;
        trigger();
      }

      queryClient.invalidateQueries(["list-virtual-portfolio-address"]);
    } catch (e) {
      console.error(e);
      if (type === "edit") {
        toastMsg = `Something wrong when edit ${data?.portfolioName} virtual portfolio. Please try again!`;
        isSuccessToast = false;
        trigger();
      } else {
        toastMsg = `Something wrong when add ${data?.portfolioName} virtual portfolio. Please try again!`;
        isSuccessToast = false;
        trigger();
      }
    } finally {
      isLoading = false;
      type = "";
    }
  };

  let isOpenConfirmDelete = false;
  let isLoadingDelete = false;

  const handleDeleteVirtualPortfolio = async () => {
    isLoadingDelete = true;
    try {
      const response = await nimbus.delete(
        `/address/${$wallet}/personalize/virtual-portfolio?portfolioName=${selectedVirtualPortfolio?.portfolioName}`,
        {}
      );
      if (response && response?.error) {
        toastMsg = `Something wrong when delete ${selectedVirtualPortfolio?.portfolioName} virtual portfolio. Please try again!`;
        isSuccessToast = false;
        trigger();
        return;
      }

      toastMsg = `Successfully delete ${selectedVirtualPortfolio?.portfolioName} virtual portfolio`;
      isSuccessToast = true;
      trigger();
      queryClient.invalidateQueries(["list-virtual-portfolio-address"]);
    } catch (e) {
      console.error(e);
      toastMsg = `Something wrong when delete ${selectedVirtualPortfolio?.portfolioName} virtual portfolio. Please try again!`;
      isSuccessToast = false;
      trigger();
    } finally {
      isLoadingDelete = false;
    }
  };

  const handleCancel = () => {
    type = "";
  };
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col mb-5 gap-7">
        <div class="flex items-center justify-between">
          <div
            class="flex items-center gap-1 text-white cursor-pointer"
            on:click={() => {
              navigateTo("/");
            }}
          >
            <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
            <div class="xl:text-sm text-2xl font-medium">Portfolio</div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 text-white">
            <div class="xl:text-5xl text-7xl font-medium">
              Virtual Portfolio
            </div>
          </div>
          <div class="text-base">
            <Copy address={$wallet} iconColor="#fff" color="#fff" />
          </div>
        </div>

        {#if type === ""}
          <div
            class="flex lg:flex-row flex-col lg:items-center items-start justify-between gap-6"
          >
            <!-- desktop list virtual portfolio -->
            <div class="hidden xl:block">
              {#if listVirtualPortfolio && listVirtualPortfolio?.length !== 0}
                <div class="flex items-center gap-5">
                  {#if listVirtualPortfolio.length > 5}
                    <AnimateSharedLayout>
                      {#each listVirtualPortfolio as item}
                        <div
                          id={item.portfolioName}
                          class="relative xl:text-base text-2xl text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                          class:hover:no-underline={item.portfolioName ===
                            selectedVirtualPortfolio?.portfolioName}
                          on:click={() => {
                            selectedVirtualPortfolio = item;
                          }}
                        >
                          {item.portfolioName}
                          {#if item.portfolioName === selectedVirtualPortfolio?.portfolioName}
                            <Motion
                              let:motion
                              layoutId="active-pill"
                              transition={{
                                type: "spring",
                                duration: 0.6,
                              }}
                            >
                              <div
                                class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                                use:motion
                              />
                            </Motion>
                          {/if}
                        </div>
                      {/each}
                    </AnimateSharedLayout>

                    <div class="relative">
                      <div
                        class={`relative z-2 ${$user && Object.keys($user).length === 0 ? "opacity-50" : "opacity-100"}`}
                        on:mouseenter={() => {
                          if ($user && Object.keys($user).length === 0) {
                            showDisabledSelect = true;
                          }
                        }}
                        on:mouseleave={() => {
                          if ($user && Object.keys($user).length === 0) {
                            showDisabledSelect = false;
                          }
                        }}
                      >
                        <Select
                          type="wallet"
                          positionSelectList="right-0"
                          listSelect={listVirtualPortfolio.slice(
                            5,
                            listVirtualPortfolio.length
                          )}
                          bind:selected={$wallet}
                          disabled={$user && Object.keys($user).length === 0}
                        />
                      </div>
                      {#if listVirtualPortfolio
                        .slice(5, listVirtualPortfolio.length)
                        .find((item) => item.value === $wallet) !== undefined}
                        <div
                          class="absolute inset-0 rounded-full bg-[#ffffff1c] z-1"
                        />
                      {/if}
                      {#if showDisabledSelect}
                        <div
                          class={`absolute transform left-1/2 -translate-x-1/2 ${
                            Object.keys($user).length === 0
                              ? "-top-8"
                              : "-top-12"
                          }`}
                          style="z-index: 2147483648;"
                        >
                          <div
                            class="max-w-[360px] text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
                          >
                            Connect your wallet to select virtual portfolio
                          </div>
                        </div>
                      {/if}
                    </div>

                    {#if listVirtualPortfolio.length > 10}
                      <div
                        class={`flex items-center gap-3 ${$user && Object.keys($user).length === 0 ? "opacity-50" : "opacity-100"}`}
                      >
                        <div
                          class={`cursor-pointer overflow-hidden border border-white rounded-full ${
                            indexSelected === 0 &&
                            !($user && Object.keys($user).length === 0)
                              ? "opacity-50"
                              : ""
                          }`}
                          on:click={() => {
                            if ($user && Object.keys($user).length === 0) {
                              return;
                            }
                            handleSelectPrev();
                          }}
                        >
                          <div class="transform -translate-x-[1px]">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill="#fff"
                                fill-rule="evenodd"
                                d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <div
                          class={`cursor-pointer overflow-hidden border border-white rounded-full ${
                            indexSelected === listVirtualPortfolio.length - 1 &&
                            !($user && Object.keys($user).length === 0)
                              ? "opacity-50"
                              : ""
                          }`}
                          on:click={() => {
                            if ($user && Object.keys($user).length === 0) {
                              return;
                            }
                            handleSelectNext();
                          }}
                        >
                          <div class="transform translate-x-[1px]">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill="#fff"
                                fill-rule="evenodd"
                                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10L7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    {/if}
                  {:else}
                    <AnimateSharedLayout>
                      {#each listVirtualPortfolio as item}
                        <div
                          id={item.portfolioName}
                          class="relative xl:text-base text-2xl text-white py-1 xl:pl-2 xl:pr-3 px-3 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                          class:hover:no-underline={item.portfolioName ===
                            selectedVirtualPortfolio?.portfolioName}
                          on:click={() => {
                            selectedVirtualPortfolio = item;
                          }}
                        >
                          {item.portfolioName}
                          {#if item.portfolioName === selectedVirtualPortfolio?.portfolioName}
                            <Motion
                              let:motion
                              layoutId="active-pill"
                              transition={{
                                type: "spring",
                                duration: 0.6,
                              }}
                            >
                              <div
                                class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                                use:motion
                              />
                            </Motion>
                          {/if}
                        </div>
                      {/each}
                    </AnimateSharedLayout>
                  {/if}
                </div>
              {:else}
                <div class="text-2xl font-medium text-white xl:text-base">
                  Empty
                </div>
              {/if}
            </div>

            <!-- mobile list virtual portfolio -->
            {#if listVirtualPortfolio && listVirtualPortfolio?.length !== 0}
              <div
                class="relative flex flex-row items-center justify-between w-full gap-3 overflow-hidden xl:hidden"
                bind:this={container}
              >
                <div
                  class={`text-white absolute left-0 py-2 rounded-tl-lg rounded-bl-lg ${
                    isScrollStart ? "hidden" : "block"
                  }`}
                  style="background-image: linear-gradient(to right, rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100% );"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    height="24px"
                    width="24px"
                    viewBox="0 0 24 24"
                    class="sc-aef7b723-0 fKbUaI"
                  >
                    <path
                      d="M15 6L9 12L15 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-miterlimit="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div
                  class="container flex gap-3 overflow-x-auto w-max whitespace-nowrap"
                  bind:this={scrollContainer}
                  on:scroll={handleScroll}
                >
                  {#each listVirtualPortfolio as item}
                    <div
                      id={item.portfolioName}
                      class={`w-max flex-shrink-0 relative text-xl text-white py-1 px-3 flex items-center gap-2 rounded-[100px] ${$user && Object.keys($user).length === 0 ? "opacity-50" : "opacity-100"}`}
                      class:hover:no-underline={item.portfolioName ===
                        selectedVirtualPortfolio?.portfolioName}
                      on:click={() => {
                        selectedVirtualPortfolio = item;
                      }}
                    >
                      {item.portfolioName}
                      {#if item.portfolioName === selectedVirtualPortfolio?.portfolioName}
                        <Motion
                          let:motion
                          layoutId="active-pill"
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <div
                            class="absolute inset-0 rounded-full bg-[#ffffff1c]"
                            use:motion
                          />
                        </Motion>
                      {/if}
                    </div>
                  {/each}
                </div>
                {#if scrollContainer?.scrollWidth >= container?.offsetWidth}
                  <div
                    class={`text-white absolute right-0 py-2 rounded-tr-lg rounded-br-lg ${
                      isScrollEnd ? "hidden" : "block"
                    }`}
                    style="background-image: linear-gradient(to left,rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100%);"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      height="24px"
                      width="24px"
                      viewBox="0 0 24 24"
                      class="sc-aef7b723-0 fKbUaI"
                    >
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                {/if}
              </div>
            {:else}
              <div
                class="block text-2xl font-medium text-white xl:hidden xl:text-base"
              >
                Empty
              </div>
            {/if}

            <div class="flex items-center gap-3">
              <!-- btn delete virtual portfolio -->
              <div
                class="relative w-max"
                on:mouseenter={() => {
                  if ($user && Object.keys($user).length === 0) {
                    showDisable = true;
                  }
                }}
                on:mouseleave={() => {
                  if ($user && Object.keys($user).length === 0) {
                    showDisable = false;
                  }
                }}
              >
                {#if $user && Object.keys($user).length === 0 && selectedVirtualPortfolio && Object.keys(selectedVirtualPortfolio).length === 0}
                  <Button variant="disabled" disabled>Delete</Button>
                {:else}
                  <Button
                    variant="delete"
                    on:click={() => {
                      isOpenConfirmDelete = true;
                    }}>Delete</Button
                  >
                {/if}

                {#if showDisable}
                  <div
                    class={`xl:block hidden absolute transform left-1/2 -translate-x-1/2 ${
                      $user && Object.keys($user).length === 0
                        ? "-top-8"
                        : "-top-12"
                    }`}
                    style="z-index: 2147483648;"
                  >
                    <div
                      class="max-w-[360px] text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
                    >
                      Connect your wallet to add virtual portfolio
                    </div>
                  </div>
                {/if}
              </div>

              <!-- btn edit virtual portfolio -->
              <div
                class="relative w-max"
                on:mouseenter={() => {
                  if ($user && Object.keys($user).length === 0) {
                    showDisable = true;
                  }
                }}
                on:mouseleave={() => {
                  if ($user && Object.keys($user).length === 0) {
                    showDisable = false;
                  }
                }}
              >
                {#if $user && Object.keys($user).length === 0 && selectedVirtualPortfolio && Object.keys(selectedVirtualPortfolio).length === 0}
                  <Button variant="disabled" disabled>Edit</Button>
                {:else}
                  <Button
                    variant="no-outlined"
                    on:click={() => {
                      type = "edit";
                    }}
                  >
                    Edit
                  </Button>
                {/if}

                {#if showDisable}
                  <div
                    class={`xl:block hidden absolute transform left-1/2 -translate-x-1/2 ${
                      $user && Object.keys($user).length === 0
                        ? "-top-8"
                        : "-top-12"
                    }`}
                    style="z-index: 2147483648;"
                  >
                    <div
                      class="max-w-[360px] text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
                    >
                      Connect your wallet to add virtual portfolio
                    </div>
                  </div>
                {/if}
              </div>

              <!-- btn add virtual portfolio -->
              <div
                class="relative w-max"
                on:mouseenter={() => {
                  if ($user && Object.keys($user).length === 0) {
                    showDisable = true;
                  }
                }}
                on:mouseleave={() => {
                  if ($user && Object.keys($user).length === 0) {
                    showDisable = false;
                  }
                }}
              >
                {#if $user && Object.keys($user).length === 0}
                  <Button variant="disabled" disabled>
                    <img src={Plus} alt="" class="w-3 h-3" />
                    Add virtual portfolio
                  </Button>
                {:else}
                  <Button
                    variant="tertiary"
                    on:click={() => {
                      type = "add";
                    }}
                  >
                    <img src={Plus} alt="" class="w-3 h-3" />
                    <div class="text-white">Add virtual portfolio</div>
                  </Button>
                {/if}

                {#if showDisable}
                  <div
                    class={`xl:block hidden absolute transform left-1/2 -translate-x-1/2 ${
                      $user && Object.keys($user).length === 0
                        ? "-top-8"
                        : "-top-12"
                    }`}
                    style="z-index: 2147483648;"
                  >
                    <div
                      class="max-w-[360px] text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
                    >
                      Connect your wallet to add virtual portfolio
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div
    class="xl:min-h-screen max-w-[2000px] m-auto xl:w-[90%] w-[90%] xl:-mt-26 -mt-34"
  >
    {#if type}
      <div
        class="virtual_portfolio_container rounded-[20px] xl:p-8 p-4 xl:shadow-md"
      >
        <FormVirtualPortfolio
          {listVirtualPortfolio}
          defaultData={selectedVirtualPortfolio}
          {handleSubmit}
          {handleCancel}
          {isLoading}
          {type}
        />
      </div>
    {:else}
      <div
        class="virtual_portfolio_container rounded-[20px] xl:p-8 p-4 xl:shadow-md"
      >
        <div
          class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4"
        >
          hello
        </div>
      </div>
    {/if}
  </div>
</ErrorBoundary>

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

<!-- Modal confirm delete virtual portfolio -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenConfirmDelete}
  on:close={() => (isOpenConfirmDelete = false)}
>
  <div class="flex flex-col gap-4 xl:mt-0 mt-4">
    <div class="flex flex-col items-start gap-1">
      <div class="font-semibold title-3">Are you sure?</div>
      <div class="text-gray-500 text-sm">
        Do you really want to delete this virtual portfolio? This process cannot
        revert
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <div class="w-[120px]">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenConfirmDelete = false;
          }}
        >
          Cancel
        </Button>
      </div>
      <div class="w-[120px]">
        <Button
          variant="delete"
          isLoading={isLoadingDelete}
          disabled={isLoadingDelete}
          on:click={() => {
            handleDeleteVirtualPortfolio();
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

<style windi:preflights:global windi:safelist:global>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }

  :global(body) .virtual_portfolio_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .virtual_portfolio_container {
    background: #0f0f0f;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 1);
  }
</style>
