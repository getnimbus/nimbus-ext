<script lang="ts">
  import { onMount } from "svelte";
  import { navigateTo } from "svelte-router-spa";
  import { nimbus } from "~/lib/network";
  import { wallet, chain, typeWallet, user, isDarkMode } from "~/store";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { createQuery } from "@tanstack/svelte-query";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";
  import Select from "~/components/Select.svelte";
  import Copy from "~/components/Copy.svelte";
  import FormVirtualPortfolio from "~/UI/VirtualPortfolio/FormVirtualPortfolio.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import Plus from "~/assets/plus.svg";
  import PlusBlack from "~/assets/plus-black.svg";

  let listVirtualPortfolio = [];
  let selectedVirtualPortfolio = {};

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParams = urlParams.get("address");

    if (addressParams) {
      wallet.update((n) => (n = addressParams));
    }
  });

  const virtualPortfolioList = async (address: string) => {
    const response = await nimbus.get(
      `/address/${address}/personalize/virtual-portfolio`
    );
    return response;
  };

  $: queryAddressVirtualPortfolio = createQuery({
    queryKey: ["list-virtual-portfolio-address", $wallet],
    queryFn: () => virtualPortfolioList($wallet),
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
                  coin: Number(coin?.coinId),
                  percent: Number(coin?.percent),
                };
              }
            ),
          };
        });
    }
  }

  let showDisableAdd = false;
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

  let type = "create";
  let isLoading = false;
  const handleSubmit = (data: any) => {
    console.log("HELLO WORLD: ", data);
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

        <div
          class="flex lg:flex-row flex-col lg:items-center items-start justify-between gap-6"
        >
          <!-- desktop list virtual portfolio -->
          <div class="hidden xl:block">
            {#if listVirtualPortfolio && listVirtualPortfolio?.length !== 0}
              <div class="flex items-center gap-5">
                {#if listVirtualPortfolio.length > 5}
                  <AnimateSharedLayout>
                    {#each listVirtualPortfolio as item, index}
                      <div
                        id={item.value}
                        class="relative xl:text-base text-2xl text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                        class:hover:no-underline={item.value ===
                          selectedVirtualPortfolio?.value}
                        on:click={() => {
                          selectedVirtualPortfolio = {};
                        }}
                      >
                        {item.value}
                        {#if item.value === selectedVirtualPortfolio?.value}
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
                          Object.keys($user).length === 0 ? "-top-8" : "-top-12"
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
                        id={item.value}
                        class="relative xl:text-base text-2xl text-white py-1 xl:pl-2 xl:pr-3 px-3 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                        class:hover:no-underline={item.value ===
                          selectedVirtualPortfolio?.value}
                        on:click={() => {
                          selectedVirtualPortfolio = {};
                        }}
                      >
                        {item.value}
                        {#if item.value === selectedVirtualPortfolio?.value}
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
                {#each listVirtualPortfolio as item, index}
                  <div
                    id={item.value}
                    class={`w-max flex-shrink-0 relative text-xl text-white py-1 px-3 flex items-center gap-2 rounded-[100px] ${$user && Object.keys($user).length === 0 ? "opacity-50" : "opacity-100"}`}
                    class:hover:no-underline={item.value ===
                      selectedVirtualPortfolio?.value}
                    on:click={() => {
                      selectedVirtualPortfolio = {};
                    }}
                  >
                    {item.label}
                    {#if item.value === selectedVirtualPortfolio?.value}
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
            <!-- btn edit virtual portfolio -->
            <div class="w-max">
              <Button variant="no-outlined">Edit</Button>
            </div>

            <!-- btn add virtual portfolio -->
            <div
              class="relative xl:w-max lg:w-[290px] w-max flex justify-end"
              on:mouseenter={() => {
                if ($user && Object.keys($user).length === 0) {
                  showDisableAdd = true;
                }
              }}
              on:mouseleave={() => {
                if ($user && Object.keys($user).length === 0) {
                  showDisableAdd = false;
                }
              }}
            >
              {#if $user && Object.keys($user).length === 0}
                <Button variant="disabled" disabled>
                  <img
                    src={$isDarkMode ? PlusBlack : Plus}
                    alt=""
                    class="w-3 h-3"
                  />
                  <div
                    class={`${$isDarkMode ? "text-gray-400" : "text-white"}`}
                  >
                    Add virtual portfolio
                  </div>
                </Button>
              {:else}
                <Button
                  variant="tertiary"
                  on:click={() => {
                    navigateTo(
                      `/custom-virtual-portfolio?type=${$typeWallet}&chain=${$chain}&address=${$wallet}}`
                    );
                  }}
                >
                  <img src={Plus} alt="" class="w-3 h-3" />
                  <div class="text-white">Add virtual portfolio</div>
                </Button>
              {/if}

              {#if showDisableAdd}
                <div
                  class={`xl:block hidden absolute transform left-1/2 -translate-x-1/2 ${
                    Object.keys($user).length === 0 ? "-top-8" : "-top-12"
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
      </div>
    </div>
  </div>

  <div
    class="xl:min-h-screen max-w-[2000px] m-auto xl:w-[90%] w-[90%] xl:-mt-26 -mt-34"
  >
    <div class="bg-white rounded-[20px] xl:p-8 p-4 xl:shadow-md">
      <div
        class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4"
      >
        hello
      </div>
    </div>
  </div>

  <!-- <div class="bg-white rounded-[20px] xl:p-8 p-4 xl:shadow-md">
    <div class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4">
      <FormVirtualPortfolio
        {listVirtualPortfolio}
        defaultData={selectedVirtualPortfolio}
        {handleSubmit}
        {isLoading}
      />
    </div>
  </div> -->
</ErrorBoundary>

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
</style>
