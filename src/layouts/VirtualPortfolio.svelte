<script lang="ts">
  import { onMount } from "svelte";
  import { navigateTo } from "svelte-router-spa";
  import { nimbus } from "~/lib/network";
  import {
    wallet,
    typeWallet,
    chain,
    user,
    isDarkMode,
    userPublicAddress,
    selectedPackage,
  } from "~/store";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import {
    getVirtualPortfolio,
    getVirtualPortfolioProfile,
  } from "~/lib/queryAPI";
  import { triggerToast } from "~/utils/functions";
  import * as browser from "webextension-polyfill";

  import Select from "~/components/Select.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import Loading from "~/components/Loading.svelte";
  import FormVirtualPortfolio from "~/UI/VirtualPortfolio/FormVirtualPortfolio.svelte";
  import VirtualPortfolio from "~/UI/VirtualPortfolio/VirtualPortfolio.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import Plus from "~/assets/plus.svg";

  const queryClient = useQueryClient();

  let container;
  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  let isDisabled = false;
  let tooltipDisableAddBtn = "";
  let showDisabledSelectWallet = false;

  $: {
    if ($selectedPackage === "FREE" && listVirtualPortfolio?.length > 2) {
      isDisabled = true;
    } else if (
      $selectedPackage === "EXPLORER" &&
      listVirtualPortfolio?.length > 6
    ) {
      isDisabled = true;
    } else {
      isDisabled = false;
    }
  }

  $: {
    if (isDisabled) {
      if ($selectedPackage === "FREE") {
        tooltipDisableAddBtn =
          "You've reached the maximum number of accounts. Upgrade to the EXPLORER Plan to add more";
      }
      if ($selectedPackage === "EXPLORER") {
        tooltipDisableAddBtn =
          "You've reached the maximum number of accounts. Upgrade to the ALPHA Plan to add more";
      }
    }
  }

  let indexSelectedVirtual = 0;

  const handleSelectNextVirtual = () => {
    if (indexSelectedVirtual < listVirtualPortfolio.length - 1) {
      indexSelectedVirtual = indexSelectedVirtual + 1;
      selectedVirtualPortfolio = listVirtualPortfolio[indexSelectedVirtual];
    }
  };

  const handleSelectPrevVirtual = () => {
    if (indexSelectedVirtual > 0) {
      indexSelectedVirtual = indexSelectedVirtual - 1;
      selectedVirtualPortfolio = listVirtualPortfolio[indexSelectedVirtual];
    }
  };

  let listVirtualPortfolio = [];
  let selectedVirtualPortfolio: any = {};
  let virtualPortfolioId = "";
  let dataVirtualPortfolio = {};
  let listTokenHolding = [];
  let totalNetworth = 0;

  const initialUpdateStateFromParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressParams = urlParams.get("address");
    const chainParams = urlParams.get("chain");
    const typeParams = urlParams.get("type");
    const virtualPortfolioIdParams = urlParams.get("virtualPortfolioId");

    if (addressParams) {
      wallet.update((n) => (n = addressParams));
    }

    if (chainParams) {
      chain.update((n) => (n = chainParams));
    }

    if (typeParams) {
      typeWallet.update((n) => (n = typeParams));
    }

    if (virtualPortfolioIdParams) {
      virtualPortfolioId = virtualPortfolioIdParams;
    }
  };

  onMount(() => {
    initialUpdateStateFromParams();
    handleSelected();
  });

  $: queryVirtualPortfolioProfile = createQuery({
    queryKey: ["virtual-portfolio-profile", $wallet, $userPublicAddress],
    queryFn: () => getVirtualPortfolioProfile($wallet, $userPublicAddress),
    staleTime: Infinity,
    retry: false,
    enabled: Boolean($wallet && $wallet.length !== 0),
  });

  $: {
    if (
      !$queryVirtualPortfolioProfile?.isError &&
      $queryVirtualPortfolioProfile?.data !== undefined
    ) {
      handleFormatListVirtualPortfolio(
        $queryVirtualPortfolioProfile?.data?.data || []
      );
    }
  }

  $: queryVirtualPortfolio = createQuery({
    queryKey: ["virtual-portfolio", virtualPortfolioId, $wallet],
    queryFn: () => getVirtualPortfolio($wallet, virtualPortfolioId),
    staleTime: Infinity,
    retry: false,
    enabled: Boolean(
      $wallet &&
        $wallet.length !== 0 &&
        virtualPortfolioId &&
        virtualPortfolioId?.length !== 0 &&
        !$queryVirtualPortfolioProfile.isError &&
        $queryVirtualPortfolioProfile.data !== undefined &&
        $queryVirtualPortfolioProfile?.data?.data.length !== 0
    ),
  });

  $: {
    if (
      !$queryVirtualPortfolio.isError &&
      $queryVirtualPortfolio.data !== undefined &&
      !$queryVirtualPortfolioProfile.isError &&
      $queryVirtualPortfolioProfile.data !== undefined &&
      $queryVirtualPortfolioProfile?.data?.data.length !== 0
    ) {
      formatDataVirtualPortfolio($queryVirtualPortfolio?.data?.data);
    }
  }

  const handleSelected = async () => {
    const selectedVirtualPortfolioIdRes = await browser.storage.sync.get(
      "selectedVirtualPortfolioId"
    );

    if (
      selectedVirtualPortfolioIdRes?.selectedVirtualPortfolioId !== null &&
      selectedVirtualPortfolioIdRes?.selectedVirtualPortfolioId !==
        "undefined" &&
      listVirtualPortfolio &&
      listVirtualPortfolio.length !== 0
    ) {
      selectedVirtualPortfolio = listVirtualPortfolio.find(
        (item) =>
          item.id === selectedVirtualPortfolioIdRes.selectedVirtualPortfolioId
      );
      virtualPortfolioId =
        selectedVirtualPortfolioIdRes.selectedVirtualPortfolioId;
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          `?type=${$typeWallet}&chain=${$chain}&address=${$wallet}&virtualPortfolioId=${virtualPortfolioId}`
      );
    }
  };

  const handleFormatListVirtualPortfolio = async (data: any) => {
    if (data && data.length !== 0) {
      listVirtualPortfolio = data;

      if (listVirtualPortfolio && listVirtualPortfolio.length === 1) {
        virtualPortfolioId = listVirtualPortfolio[0].id;
        selectedVirtualPortfolio = listVirtualPortfolio.find(
          (item) => item.id === listVirtualPortfolio[0].id
        );
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${$typeWallet}&chain=${$chain}&address=${$wallet}&virtualPortfolioId=${listVirtualPortfolio[0].id}`
        );
      } else {
        virtualPortfolioId =
          listVirtualPortfolio[listVirtualPortfolio.length - 1].id;
        selectedVirtualPortfolio = listVirtualPortfolio.find(
          (item) =>
            item.id === listVirtualPortfolio[listVirtualPortfolio.length - 1].id
        );
        window.history.replaceState(
          null,
          "",
          window.location.pathname +
            `?type=${$typeWallet}&chain=${$chain}&address=${$wallet}&virtualPortfolioId=${listVirtualPortfolio[listVirtualPortfolio.length - 1].id}`
        );
      }
    } else {
      listVirtualPortfolio = [];
      virtualPortfolioId = "";
      selectedVirtualPortfolio = {};
      browser.storage.sync.set({
        selectedVirtualPortfolioId: "undefined",
      });
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          `?type=${$typeWallet}&chain=${$chain}&address=${$wallet}`
      );
    }
  };

  $: {
    if (
      selectedVirtualPortfolio &&
      Object.keys(selectedVirtualPortfolio).length !== 0
    ) {
      virtualPortfolioId = selectedVirtualPortfolio.id;
      browser.storage.sync.set({
        selectedVirtualPortfolioId: selectedVirtualPortfolio.id,
      });
      handleUpdateParams();
    }
  }

  const handleUpdateParams = () => {
    virtualPortfolioId = selectedVirtualPortfolio.id;
    window.history.replaceState(
      null,
      "",
      window.location.pathname +
        `?type=${$typeWallet}&chain=${$chain}&address=${$wallet}&virtualPortfolioId=${virtualPortfolioId}`
    );
  };

  const handleCalculateValueChange = (
    percentPriceChange: number,
    initialValue: number
  ) => {
    const valueChange = initialValue * percentPriceChange;
    return initialValue + valueChange;
  };

  const formatDataVirtualPortfolio = (data: any) => {
    const selectedPortfolioProfile = listVirtualPortfolio.find(
      (item) => item?.id === virtualPortfolioId
    );

    const virtualPortfolioNameList = data && Object.getOwnPropertyNames(data);

    const formatDataVirtualPortfolio =
      virtualPortfolioNameList &&
      virtualPortfolioNameList?.map((item) => {
        return {
          portfolioName: selectedPortfolioProfile?.name,
          coins: data[item]?.tokens?.map((coin) => {
            return {
              ...coin,
              percent: Number(coin?.percent),
            };
          }),
          history: data[item]?.history.map((coin) => {
            return {
              ...coin,
              percent: Number(coin?.percent),
            };
          }),
          updatedTime: selectedVirtualPortfolio?.updatedAt,
        };
      });

    dataVirtualPortfolio = virtualPortfolioNameList.reduce(
      (acc, key, index) => {
        acc[key] = formatDataVirtualPortfolio[index];
        return acc;
      },
      {}
    );

    const formatDataTokenHolding = dataVirtualPortfolio[
      virtualPortfolioId
    ]?.coins?.map((item) => {
      const formatValue =
        item.percentPriceChange !== 0
          ? handleCalculateValueChange(item.percentPriceChange, item.value)
          : item.value;

      return {
        ...item,
        value: formatValue,
      };
    });

    const totalValues = formatDataTokenHolding?.reduce(
      (prev, item) => prev + Number(item?.value),
      0
    );

    listTokenHolding = formatDataTokenHolding?.map((item) => {
      return {
        ...item,
        percent: (Number(item.value) / Number(totalValues)) * 100,
      };
    });

    totalNetworth = listTokenHolding.reduce(
      (prev, item) => prev + Number(item?.value),
      0
    );
  };

  let showDisable = false;

  let isOpenConfirmDelete = false;
  let isLoadingDelete = false;

  let type = "";
  let isLoading = false;

  const handleSubmit = async (
    data: any,
    type: string,
    virtualPortfolioNetworth: any
  ) => {
    try {
      isLoading = true;
      if (type === "add") {
        const responseAdd: any = await nimbus.post(
          `/address/${$wallet}/personalize/virtual-portfolio`,
          {
            ...data,
            virtualPortfolioNetworth,
            createdOwner: $userPublicAddress,
          }
        );
        if (responseAdd && responseAdd?.error) {
          triggerToast(
            `Something wrong when add ${data?.portfolioName} virtual portfolio. Please try again!`,
            "fail"
          );
          return;
        }

        triggerToast(
          `Successfully add ${data?.portfolioName} virtual portfolio`,
          "success"
        );
      }

      if (type === "edit") {
        const responseEdit: any = await nimbus.put(
          `/address/${$wallet}/personalize/virtual-portfolio?portfolioName=${dataVirtualPortfolio[virtualPortfolioId]?.portfolioName}&portfolioProfileId=${virtualPortfolioId}&networth=${totalNetworth}`,
          {
            ...data,
            virtualPortfolioNetworth,
            createdOwner: $userPublicAddress,
          }
        );
        if (responseEdit && responseEdit?.error) {
          triggerToast(
            `Something wrong when edit ${dataVirtualPortfolio[virtualPortfolioId]?.portfolioName} virtual portfolio. Please try again!`,
            "fail"
          );
          return;
        }

        triggerToast(
          `Successfully edit ${dataVirtualPortfolio[virtualPortfolioId]?.portfolioName} virtual portfolio`,
          "success"
        );
      }

      queryClient.invalidateQueries(["virtual-portfolio-profile"]);
      queryClient.invalidateQueries(["virtual-portfolio"]);
      queryClient.invalidateQueries(["virtual-portfolio-performance"]);
    } catch (e) {
      console.error(e);
      if (type === "edit") {
        triggerToast(
          `Something wrong when edit ${data?.portfolioName} virtual portfolio. Please try again!`,
          "fail"
        );
      }
      if (type === "add") {
        triggerToast(
          `Something wrong when add ${data?.portfolioName} virtual portfolio. Please try again!`,
          "fail"
        );
      }
    } finally {
      isLoading = false;
      type = "";
    }
  };

  const handleDeleteVirtualPortfolio = async () => {
    isLoadingDelete = true;
    try {
      const response = await nimbus.delete(
        `/address/${$wallet}/personalize/virtual-portfolio?portfolioName=${selectedVirtualPortfolio?.name}&portfolioProfileId=${virtualPortfolioId}`,
        {}
      );
      if (response && response?.error) {
        triggerToast(
          `Something wrong when delete ${selectedVirtualPortfolio?.name} virtual portfolio. Please try again!`,
          "fail"
        );
        return;
      }

      triggerToast(
        `Successfully delete ${selectedVirtualPortfolio?.name} virtual portfolio`,
        "success"
      );
      queryClient.invalidateQueries(["virtual-portfolio-profile"]);
      queryClient.invalidateQueries(["virtual-portfolio"]);

      virtualPortfolioId = "";
      selectedVirtualPortfolio = {};
      browser.storage.sync.set({
        selectedVirtualPortfolioId: "undefined",
      });
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          `?type=${$typeWallet}&chain=${$chain}&address=${$wallet}`
      );
    } catch (e) {
      console.error(e);
      triggerToast(
        `Something wrong when delete ${selectedVirtualPortfolio?.name} virtual portfolio. Please try again!`,
        "fail"
      );
    } finally {
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
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
              if (type.length === 0) {
                navigateTo("/");
              } else {
                handleCancel();
              }
            }}
          >
            <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
            <div class="xl:text-sm text-2xl font-medium">
              {#if type.length === 0}
                Portfolio
              {:else}
                Back
              {/if}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 text-white">
            <div class="text-4xl font-semibold">Virtual Portfolio</div>
          </div>
          <div class="hidden text-2xl xl:text-base xl:block">
            <Copy address={$wallet} iconColor="#fff" color="#fff" />
          </div>
          <div class="block text-2xl xl:text-base xl:hidden">
            <Copy
              address={$wallet}
              iconColor="#fff"
              color="#fff"
              isShorten
              iconSize={24}
            />
          </div>
        </div>

        {#if type.length === 0}
          {#if $queryVirtualPortfolioProfile.isFetching}
            <div class="flex items-center justify-center">
              <Loading />
            </div>
          {:else}
            <div
              class="flex lg:flex-row flex-col lg:items-center items-start justify-between gap-6"
            >
              <!-- desktop list virtual portfolio -->
              <div class="hidden xl:block">
                {#if listVirtualPortfolio && listVirtualPortfolio?.length !== 0}
                  <div class="flex items-center gap-5">
                    {#if listVirtualPortfolio.length > 5}
                      <AnimateSharedLayout>
                        {#each listVirtualPortfolio.slice(0, 5) as item, index}
                          <div
                            id={item.value}
                            class={`relative xl:text-base text-2xl text-white py-1 px-2 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline ${($selectedPackage === "FREE" ? index > 2 : index > 6) ? "opacity-50" : "opacity-100"}`}
                            class:hover:no-underline={item.name ===
                              selectedVirtualPortfolio?.name}
                            on:click={() => {
                              if (
                                $selectedPackage === "FREE"
                                  ? index > 2
                                  : index > 6
                              ) {
                                return;
                              }
                              selectedVirtualPortfolio = item;
                            }}
                          >
                            {item.name}
                            {#if item.name === selectedVirtualPortfolio?.name}
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
                          class={`relative z-2 ${isDisabled ? "opacity-50" : "opacity-100"}`}
                          on:mouseenter={() => {
                            if (
                              isDisabled ||
                              ($user && Object.keys($user).length === 0)
                            ) {
                              showDisabledSelectWallet = true;
                            }
                          }}
                          on:mouseleave={() => {
                            if (
                              isDisabled ||
                              ($user && Object.keys($user).length === 0)
                            ) {
                              showDisabledSelectWallet = false;
                            }
                          }}
                        >
                          <Select
                            type="lang"
                            positionSelectList="right-0"
                            listSelect={listVirtualPortfolio.slice(
                              5,
                              listVirtualPortfolio.length
                            )}
                            bind:selected={selectedVirtualPortfolio}
                            disabled={isDisabled}
                          />
                        </div>
                        {#if listVirtualPortfolio.slice(5, listVirtualPortfolio.length)}
                          <div
                            class="absolute inset-0 rounded-full bg-[#ffffff1c] z-1"
                          />
                        {/if}
                        {#if showDisabledSelectWallet}
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
                              {tooltipDisableAddBtn}
                            </div>
                          </div>
                        {/if}
                      </div>
                      {#if listVirtualPortfolio.length > 10}
                        <div
                          class={`flex items-center gap-3 ${isDisabled ? "opacity-50" : "opacity-100"}`}
                        >
                          <div
                            class={`cursor-pointer overflow-hidden border border-white rounded-full ${
                              indexSelectedVirtual === 0 && !isDisabled
                                ? "opacity-50"
                                : ""
                            }`}
                            on:click={() => {
                              if (isDisabled) {
                                return;
                              }
                              handleSelectPrevVirtual();
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
                              indexSelectedVirtual ===
                                listVirtualPortfolio.length - 1 && !isDisabled
                                ? "opacity-50"
                                : ""
                            }`}
                            on:click={() => {
                              if (isDisabled) {
                                return;
                              }
                              handleSelectNextVirtual();
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
                            id={item.name}
                            class="relative xl:text-base text-2xl text-white py-1 xl:pl-2 xl:pr-3 px-3 flex items-center rounded-[100px] gap-2 cursor-pointer transition-all hover:underline"
                            class:hover:no-underline={item.name ===
                              selectedVirtualPortfolio?.name}
                            on:click={() => {
                              selectedVirtualPortfolio = item;
                            }}
                          >
                            {item.name}
                            {#if item.name === selectedVirtualPortfolio?.name}
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
                    style="background-image: linear-gradient(to right, rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100%);"
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
                        id={item.name}
                        class={`w-max flex-shrink-0 relative text-xl text-white py-1 px-3 flex items-center gap-2 rounded-[100px] ${$user && Object.keys($user).length === 0 ? "opacity-50" : "opacity-100"}`}
                        class:hover:no-underline={item.name ===
                          selectedVirtualPortfolio?.name}
                        on:click={() => {
                          selectedVirtualPortfolio = item;
                        }}
                      >
                        {item.name}
                        {#if item.name === selectedVirtualPortfolio?.name}
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

              <div class="flex md:flex-row flex-col items-center gap-3">
                {#if $user && Object.keys($user).length !== 0 && listVirtualPortfolio && listVirtualPortfolio?.length !== 0 && virtualPortfolioId && virtualPortfolioId?.length !== 0}
                  <div class="flex items-center gap-3 md:w-max w-full">
                    <div class=" w-max">
                      <Button
                        variant="delete"
                        on:click={() => {
                          isOpenConfirmDelete = true;
                        }}>Delete</Button
                      >
                    </div>

                    <div class=" w-max">
                      <Button
                        variant="no-outlined"
                        on:click={() => {
                          type = "edit";
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                {/if}

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
        {/if}
      </div>
    </div>
  </div>

  <div
    class="xl:min-h-screen max-w-[2000px] m-auto xl:w-[90%] w-[90%] xl:-mt-26 -mt-34"
  >
    {#if type.length === 0}
      <div
        class="virtual_portfolio_container rounded-[20px] xl:p-8 p-4 xl:shadow-md"
      >
        {#if selectedVirtualPortfolio && Object.keys(selectedVirtualPortfolio).length !== 0 && selectedVirtualPortfolio?.status === "PRIVATE" && selectedVirtualPortfolio?.createdOwner?.toLowerCase() !== $userPublicAddress?.toLowerCase()}
          <div
            class="border border_0000001a rounded-[20px] px-6 py-12 flex items-center gap-2 justify-center"
          >
            {#if !virtualPortfolioId || (selectedVirtualPortfolio && Object.keys(selectedVirtualPortfolio).length === 0)}
              {#if $queryVirtualPortfolio.isFetching || $queryVirtualPortfolioProfile.isFetching}
                <Loading />
              {:else}
                Empty
              {/if}
            {:else}
              You can not access this private virtual portfolio from user <Copy
                address={$wallet}
                iconColor={$isDarkMode ? "#fff" : "#000"}
                color={$isDarkMode ? "#fff" : "#000"}
                isShorten
                iconSize={20}
              />
            {/if}
          </div>
        {:else}
          <VirtualPortfolio
            {listTokenHolding}
            isLoading={$queryVirtualPortfolio.isFetching ||
              $queryVirtualPortfolioProfile.isFetching}
            isQuery={!$queryVirtualPortfolioProfile.isError &&
              $queryVirtualPortfolioProfile.data !== undefined &&
              $queryVirtualPortfolioProfile?.data?.data.length !== 0}
            {virtualPortfolioId}
          />
        {/if}
      </div>
    {:else}
      <div
        class="virtual_portfolio_container rounded-[20px] xl:p-8 p-4 xl:shadow-md"
      >
        <FormVirtualPortfolio
          {listVirtualPortfolio}
          defaultData={{
            ...dataVirtualPortfolio[virtualPortfolioId],
            networth: selectedVirtualPortfolio?.networth || 0,
            coins: listTokenHolding,
          }}
          {handleSubmit}
          {handleCancel}
          {isLoading}
          {type}
        />
      </div>
    {/if}
  </div>
</ErrorBoundary>

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
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }

  :global(body) .header-container {
    background-color: #27326f;
    background-image: url("~/assets/capa.svg");
  }
  :global(body.dark) .header-container {
    background-color: #080808;
    background-image: url("~/assets/capa-dark.svg");
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
