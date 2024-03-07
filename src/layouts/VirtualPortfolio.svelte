<script lang="ts">
  import { i18n } from "~/lib/i18n";
  import { Link, useNavigate } from "svelte-navigator";
  import { nimbus } from "~/lib/network";
  import { wallet, chain } from "~/store";
  import { AnimateSharedLayout, Motion } from "svelte-motion";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import OverviewCard from "~/components/OverviewCard.svelte";
  import CountUpNumber from "~/components/CountUpNumber.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Button from "~/components/Button.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import Plus from "~/assets/plus.svg";

  const MultipleLang = {
    networth: i18n("newtabPage.networth", "Net Worth"),
    claimable: i18n("newtabPage.claimable", "Claimable"),
    total_assets: i18n("newtabPage.total-assets", "Total Assets"),
    total_positions: i18n("newtabPage.total-positions", "Total Positions"),
  };

  const navigate = useNavigate();

  let listVirtualPortfolio = [];
  let selectedVirtualPortfolio = {};

  let scrollContainerVirtual;
  let isScrollStartVirtual = true;
  let isScrollEndVirtual = false;
  let containerVirtual;

  const handleScrollVirtual = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerVirtual;
    isScrollStartVirtual = scrollLeft === 0;
    isScrollEndVirtual = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  const virtualPortfolioList = async () => {
    try {
      const response = await nimbus.get(
        `/address/${$wallet}/personalize/virtual-portflio`
      );
      if (response) {
        const virtualPortfolioNameList = Object.getOwnPropertyNames(
          response.data
        );
        listVirtualPortfolio = virtualPortfolioNameList.map((item) => {
          return {
            portfolioName: item,
            coins: response.data[item].tokens.map((coin) => {
              return {
                coin: Number(coin?.coinId),
                percent: Number(coin?.percent),
              };
            }),
          };
        });
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  $: {
    if ($wallet) {
      virtualPortfolioList();
    }
  }
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col mb-5 gap-14">
        <div class="flex items-center justify-between">
          <Link to="/analytic" class="cursor-pointer">
            <div class="flex items-center gap-1 text-white">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="xl:text-sm text-2xl font-medium">Analytics</div>
            </div>
          </Link>
        </div>
        <div class="flex justify-between items-center w-full -mt-10">
          {#if listVirtualPortfolio && listVirtualPortfolio.length !== 0}
            <div
              class="relative overflow-hidden w-full flex flex-row gap-3 justify-between items-center"
              bind:this={containerVirtual}
            >
              <div
                class={`text-white absolute left-0 py-2 rounded-tl-lg rounded-bl-lg ${
                  isScrollStartVirtual ? "hidden" : "block"
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
                class="w-max flex gap-3 overflow-x-auto whitespace-nowrap"
                bind:this={scrollContainerVirtual}
                on:scroll={handleScrollVirtual}
              >
                <AnimateSharedLayout>
                  {#each listVirtualPortfolio as item (item.portfolioName)}
                    <div
                      id={item.portfolioName}
                      class="w-max flex-shrink-0 relative xl:text-lg text-2xl text-white py-1 px-3 flex items-center gap-2 rounded-[100px] cursor-pointer hover:underline"
                      class:hover:no-underline={item ===
                        selectedVirtualPortfolio}
                      on:click={() => {
                        selectedVirtualPortfolio = item;
                      }}
                    >
                      <div
                        class={`relative z-2 ${
                          item === selectedVirtualPortfolio && "text-white"
                        }`}
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
                            class="absolute inset-0 z-1 rounded-full bg-[#ffffff1c]"
                            use:motion
                          />
                        </Motion>
                      {/if}
                    </div>
                  {/each}
                </AnimateSharedLayout>
              </div>
              {#if scrollContainerVirtual?.scrollWidth >= containerVirtual?.offsetWidth}
                <div
                  class={`text-white absolute right-0 py-2 rounded-tr-lg rounded-br-lg ${
                    isScrollEndVirtual ? "hidden" : "block"
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
          {:else}
            <div class="xl:text-lg text-2xl text-white">Empty</div>
          {/if}
          <div class="w-max">
            <Button
              variant="tertiary"
              on:click={() => {
                navigate(
                  `/custom-virtual-portfolio?chain=${encodeURIComponent(
                    $chain
                  )}&address=${encodeURIComponent($chain)}`
                );
              }}
            >
              <img src={Plus} alt="" class="xl:w-3 xl:h-3 w-4 h-4" />
              <div class="xl:text-base text-2xl font-medium text-white">
                Add virtual portfolio
              </div>
            </Button>
          </div>
        </div>

        <div class="xl:text-5xl text-7xl font-medium text-white">
          Virtual Portfolio
        </div>
      </div>
      <div class="flex xl:flex-row flex-col justify-between gap-6">
        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <OverviewCard title={MultipleLang.networth}>
            <div class="xl:text-3xl text-5xl flex">
              $<CountUpNumber number={0} type="balance" />
            </div>
            <div class="flex items-center gap-3 opacity-50">
              <div
                class={`flex xl:text-lg text-3xl font-medium ${
                  false ? "text-red-500" : "text-[#00A878]"
                }`}
              >
                {#if false}
                  ↓
                {:else}
                  ↑
                {/if}
                <CountUpNumber number={Math.abs(0)} type="percent" />%
              </div>
              <div class="text-[#00000066] xl:text-base text-2xl font-medium">
                24h
              </div>
            </div>
          </OverviewCard>

          <OverviewCard title={MultipleLang.claimable}>
            <div class="flex xl:text-3xl text-5xl">
              {#if {}.toString().toLowerCase().includes("e-")}
                $<TooltipNumber number={0} type="balance" />
              {:else}
                $<CountUpNumber number={0} type="balance" />
              {/if}
            </div>
            <div class="flex items-center gap-3 opacity-50">
              <div
                class={`flex xl:text-lg text-3xl font-medium ${
                  false ? "text-red-500" : "text-[#00A878]"
                }`}
              >
                {#if false}
                  ↓
                {:else}
                  ↑
                {/if}
                <CountUpNumber number={Math.abs(0)} type="percent" />%
              </div>
              <div class="text-[#00000066] xl:text-base text-2xl font-medium">
                24h
              </div>
            </div>
          </OverviewCard>
        </div>

        <div class="flex-1 flex md:flex-row flex-col justify-between gap-6">
          <OverviewCard title={MultipleLang.total_assets}>
            <div class="xl:text-3xl text-5xl flex">
              $<CountUpNumber number={0} type="balance" />
            </div>
            <div class="flex items-center gap-3 opacity-50">
              <div
                class={`flex xl:text-lg text-3xl font-medium ${
                  false ? "text-red-500" : "text-[#00A878]"
                }`}
              >
                {#if 0}
                  ↓
                {:else}
                  ↑
                {/if}
                <CountUpNumber number={Math.abs(0)} type="percent" />%
              </div>
              <div class="text-[#00000066] xl:text-base text-2xl font-medium">
                24h
              </div>
            </div>
          </OverviewCard>

          <OverviewCard title={MultipleLang.total_positions}>
            <div class="flex xl:text-3xl text-5xl">
              {#if {}.toString().toLowerCase().includes("e-")}
                $<TooltipNumber number={0} type="balance" />
              {:else}
                $<CountUpNumber number={0} type="balance" />
              {/if}
            </div>
            <div class="flex items-center gap-3 opacity-50">
              <div
                class={`flex xl:text-lg text-3xl font-medium ${
                  false ? "text-red-500" : "text-[#00A878]"
                }`}
              >
                {#if false}
                  ↓
                {:else}
                  ↑
                {/if}
                <CountUpNumber number={Math.abs(0)} type="percent" />%
              </div>
              <div class="text-[#00000066] xl:text-base text-2xl font-medium">
                24h
              </div>
            </div>
          </OverviewCard>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] -mt-26">
    <div class="bg-white rounded-[20px] xl:p-8 p-4 xl:shadow-md">
      <div
        class="border border_0000001a rounded-[20px] p-6 flex flex-col gap-4"
      >
        hello
      </div>
    </div>
  </div>
</ErrorBoundary>

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
