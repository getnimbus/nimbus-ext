<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";
  import { nimbus } from "~/lib/network";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import dayjs from "dayjs";
  import { isDarkMode } from "~/store";

  import Tooltip from "~/components/Tooltip.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";
  import Button from "~/components/Button.svelte";
  import FormVirtualPortfolio from "~/UI/VirtualPortfolio/FormVirtualPortfolio.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import Plus from "~/assets/plus.svg";
  import PlusBlack from "~/assets/plus-black.svg";

  let selectedWallet: string = "";
  let selectedChain: string = "";

  let showDisableAddBtn = false;
  let listVirtualPortfolio = [];
  let selectedVirtualPortfolio = {};
  let isLoadingSubmit = false;

  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let chainParams = urlParams.get("chain");
    let addressParams = urlParams.get("address");

    if (chainParams && addressParams) {
      selectedWallet = addressParams;
      selectedChain = chainParams;
      virtualPortfolioList();
    }
  });

  const virtualPortfolioList = async () => {
    try {
      const response = await nimbus.get(
        `/address/${selectedWallet}/personalize/virtual-portflio`
      );
      if (response) {
        const virtualPortfolioNameList = Object.getOwnPropertyNames(
          response.data
        );

        listVirtualPortfolio = virtualPortfolioNameList.map((item) => {
          return {
            updatedTime: dayjs(response.data[item].updatedTime).toDate(),
            portfolioName: item,
            coins: response.data[item].tokens.map((coin) => {
              return {
                coin: Number(coin?.coinId),
                percent: Number(coin?.percent),
              };
            }),
          };
        });

        if (listVirtualPortfolio && listVirtualPortfolio.length > 1) {
          selectedVirtualPortfolio =
            listVirtualPortfolio[listVirtualPortfolio.length - 1];
        } else {
          selectedVirtualPortfolio = listVirtualPortfolio[0];
        }
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const handleSubmit = async (data, type) => {
    isLoadingSubmit = true;
    try {
      let response;
      if (type === "edit") {
        response = await nimbus.put(
          `/address/${selectedWallet}/personalize/virtual-portflio?portfolioName=${selectedVirtualPortfolio.portfolioName}`,
          data
        );
      } else {
        response = await nimbus.post(
          `/address/${selectedWallet}/personalize/virtual-portflio`,
          data
        );
      }
      if (response) {
        virtualPortfolioList();
        isLoadingSubmit = false;

        toastMsg = `Successfully ${
          type === "edit" ? "edit" : "create"
        } your virtual portfolio!`;
        isSuccessToast = true;
        trigger();
      }
    } catch (e) {
      console.error("e: ", e);
      isLoadingSubmit = false;
      toastMsg = `Something wrong when ${
        type === "edit" ? "edit" : "create"
      } your custom category. Please try again!`;
      isSuccessToast = false;
      trigger();
    }
  };

  const handleDelete = async () => {
    try {
      const response = await nimbus.delete(
        `/address/${selectedWallet}/personalize/virtual-portflio?portfolioName=${selectedVirtualPortfolio?.portfolioName}`,
        {}
      );
      if (response) {
        virtualPortfolioList();
        toastMsg = "Successfully delete your virtual portfolio!";
        isSuccessToast = true;
        trigger();
      }
    } catch (e) {
      console.error("e: ", e);
      toastMsg =
        "Something wrong when delete your custom category. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col mb-5 gap-14">
        <div class="flex items-center justify-between">
          <Link to="/" class="cusor-pointer">
            <div class="flex items-center gap-1 text-white">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="xl:text-sm text-2xl font-medium">
                Back to Portfolio
              </div>
            </div>
          </Link>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-white">
              <div class="xl:text-5xl text-7xl font-medium">
                Personal Virtual Portfolio
              </div>
            </div>
            {#if selectedWallet && selectedWallet.length !== 0}
              <div class="text-base">
                <Copy
                  address={selectedWallet}
                  iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                  color={`${$isDarkMode ? "#fff" : "#000"}`}
                />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] -mt-26">
    <div class="bg-white rounded-[20px] xl:p-8 p-6 xl:shadow-md">
      <div
        class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4"
      >
        <div class="xl:text-2xl text-4xl font-medium">
          Custom Virtual Portfolio
        </div>
        <div class="flex justify-between">
          <div
            class="relative overflow-hidden w-full flex gap-3 justify-between items-center"
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
                ><path
                  d="M15 6L9 12L15 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                /></svg
              >
            </div>
            <div
              class="w-max flex gap-3 overflow-x-auto whitespace-nowrap px-2"
              bind:this={scrollContainer}
              on:scroll={handleScroll}
            >
              <AnimateSharedLayout>
                {#each listVirtualPortfolio as item (item.portfolioName)}
                  <div
                    id={item.portfolioName}
                    class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                    on:click={() => {
                      selectedVirtualPortfolio = item;
                    }}
                  >
                    <div
                      class={`relative ${
                        selectedVirtualPortfolio === item && "text-white"
                      }`}
                      style="z-index: 2"
                    >
                      {item.portfolioName}
                    </div>
                    {#if item === selectedVirtualPortfolio}
                      <Motion
                        let:motion
                        layoutId="active-pill"
                        transition={{ type: "spring", duration: 0.6 }}
                      >
                        <div
                          class="absolute inset-0 rounded-full bg-[#1E96FC]"
                          style="z-index: 1"
                          use:motion
                        />
                      </Motion>
                    {/if}
                  </div>
                {/each}
              </AnimateSharedLayout>
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
                  ><path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  /></svg
                >
              </div>
            {/if}
          </div>

          <div class="flex items-center gap-4 w-max">
            {#if selectedVirtualPortfolio && selectedVirtualPortfolio !== null && Object.keys(selectedVirtualPortfolio).length !== 0}
              <div
                class="text-red-500 cursor-pointer xl:text-lg text-2xl"
                on:click={handleDelete}
              >
                Delete
              </div>
            {/if}
            <div
              class="relative w-max"
              on:mouseenter={() => {
                if (listVirtualPortfolio.length > 2) {
                  showDisableAddBtn = true;
                }
              }}
              on:mouseleave={() => {
                if (listVirtualPortfolio.length > 2) {
                  showDisableAddBtn = false;
                }
              }}
            >
              {#if listVirtualPortfolio.length > 2}
                <Button variant="disabled" disabled>
                  <img
                    src={$isDarkMode ? PlusBlack : Plus}
                    alt=""
                    width="12"
                    height="12"
                  />
                  <div
                    class={`text-2xl font-medium xl:text-base ${
                      $isDarkMode ? "text-gray-400" : "text-white"
                    }`}
                  >
                    Add virtual portfolio
                  </div>
                </Button>
              {:else}
                <Button
                  variant="tertiary"
                  on:click={() => (selectedVirtualPortfolio = {})}
                >
                  <img src={Plus} alt="" width="12" height="12" />
                  <div class="xl:text-base text-2xl font-medium text-white">
                    Add virtual portfolio
                  </div>
                </Button>
              {/if}
              {#if showDisableAddBtn}
                <div
                  class="absolute transform -translate-x-1/2 -top-8 left-1/2 w-max"
                  style="z-index: 2147483648;"
                >
                  <Tooltip text={"Maximum 3 virtual portfolio"} />
                </div>
              {/if}
            </div>
          </div>
        </div>
        <FormVirtualPortfolio
          {listVirtualPortfolio}
          defaultData={selectedVirtualPortfolio}
          {selectedWallet}
          {selectedChain}
          {handleSubmit}
          {isLoadingSubmit}
        />
      </div>
    </div>
  </div>
</ErrorBoundary>

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-10">
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

<style>
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
