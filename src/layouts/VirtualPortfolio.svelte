<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";
  import { nimbus } from "~/lib/network";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";

  let selectedWallet: string = "";
  let selectedChain: string = "";

  let searchValue = "";
  let virtualPortfolioName = "";
  let listToken = [];

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let chainParams = urlParams.get("chain");
    let addressParams = urlParams.get("address");

    if (APP_TYPE.TYPE === "EXT") {
      const params = decodeURIComponent(window.location.hash)
        .split("?")[1]
        .split("&")
        .reduce(function (result, param) {
          var [key, value] = param.split("=");
          result[key] = value;
          return result;
        }, {});

      chainParams = params.chain;
      addressParams = params.address;
    }

    if (chainParams && addressParams) {
      selectedWallet = addressParams;
      selectedChain = chainParams;
      getListToken();
    }
  });

  const getListToken = async () => {
    try {
      const response = await nimbus.get(
        `/address/${selectedWallet}/personalize/virtual-portflio`
      );
      if (response) {
        console.log("response: ", response);
      }
    } catch (e) {
      console.log("e: ", e);
    }
  };
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col mb-5 gap-14">
        <div class="flex items-center justify-between">
          <Link
            to={`${
              APP_TYPE.TYPE === "EXT" ? "src/entries/newTab/index.html" : "/"
            }`}
            class="cusor-pointer"
          >
            <div class="flex items-center gap-1 text-white">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="xl:text-sm text-xl font-semibold">
                Back to Portfolio
              </div>
            </div>
          </Link>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-white">
              <div class="xl:text-5xl text-7xl font-semibold">
                Virtual Portfolio
              </div>
            </div>
            {#if selectedWallet && selectedWallet.length !== 0}
              <div class="text-base">
                <Copy address={selectedWallet} iconColor="#fff" color="#fff" />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] -mt-26">
    <div class="bg-white rounded-[20px] xl:p-8 xl:shadow-md">
      <div
        class="border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-4"
      >
        <div class="xl:text-2xl text-4xl font-medium text-black">
          Create Virtual Portfolio
        </div>

        <div
          class={`flex flex-col gap-1 input-2 w-full py-[6px] px-3 ${
            virtualPortfolioName ? "bg-[#F0F2F7]" : ""
          }`}
        >
          <div class="xl:text-base text-xl text-[#666666] font-medium">
            Virtual portfolio name
          </div>
          <input
            type="text"
            placeholder="Your virtual portfolio name"
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
              virtualPortfolioName ? "bg-[#F0F2F7]" : ""
            }`}
            bind:value={virtualPortfolioName}
            on:blur={() => {
              console.log("virtualPortfolioName: ", virtualPortfolioName);
            }}
          />
        </div>

        <div
          class="border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-2"
        >
          <div class="flex justify-between items-end">
            <div class="flex flex-col">
              <div class="xl:text-xl text-2xl font-medium">1. Choose coins</div>
              <div class="xl:text-base text-lg font-normal text-gray-600">
                Choose one or more to start
              </div>
            </div>
            <div class="text-right">
              <div
                class={`border bg-white focus:outline-none w-full py-[6px] px-3 rounded-lg ${
                  searchValue ? "bg-[#F0F2F7]" : ""
                }`}
              >
                <input
                  bind:value={searchValue}
                  placeholder={"Find by token name"}
                  type="text"
                  class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
                    searchValue ? "bg-[#F0F2F7]" : ""
                  }`}
                />
              </div>
            </div>
          </div>
          <div>table</div>
        </div>

        <div class="border border-[#0000001a] rounded-[20px] p-6">Step 2</div>
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
