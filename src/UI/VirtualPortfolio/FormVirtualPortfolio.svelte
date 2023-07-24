<script lang="ts">
  import { coinmarketcap, nimbus } from "~/lib/network";
  import dayjs from "dayjs";
  import { i18n } from "~/lib/i18n";

  import Button from "~/components/Button.svelte";

  import Plus from "~/assets/plus.svg";

  export let handleSubmit = (data) => {};
  export let selectedWallet;
  export let selectedChain;

  const MultipleLang = {
    assets: i18n("newtabPage.assets", "Assets"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let step: "step 1" | "step 2" = "step 1";
  let searchValue = "";
  let virtualPortfolioName = "";
  let time = dayjs().format("YYYY-MM-DD");
  let listToken = [];
  let isLoadingListToken = false;

  let selectedTokenList = [];

  $: {
    if (selectedWallet && selectedChain) {
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
        listToken = response?.values.map((item) => {
          return {
            id: item[0],
            name: item[1],
            symbol: item[2],
          };
        });
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
    : listToken;
</script>

<div class="flex flex-col gap-5">
  <div
    class="flex lg:flex-row flex-col justify-between gap-4 border-b-[1px] pb-5"
  >
    <div
      class={`flex-1 flex flex-col gap-1 input-2 w-full py-[6px] px-3 ${
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
      class={`flex-1 flex flex-col gap-1 input-2 w-full py-[6px] px-3 ${
        time ? "bg-[#F0F2F7]" : ""
      }`}
    >
      <div class="xl:text-base text-xl text-[#666666] font-medium">
        Time create virtual portfolio
      </div>
      <input
        type="date"
        id="date"
        class="p-0 border-none outline-none bg-transparent focus:outline-none focus:ring-0 border-2 border-red-500"
        placeholder="Select date"
        bind:value={time}
      />
    </div>
  </div>

  <div class="flex xl:flex-row flex-col justify-between gap-6">
    <div
      class="flex-1 border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-2 relative"
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
            bind:value={searchValue}
            placeholder={"Find by token name"}
            type="text"
            class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
              searchValue ? "bg-[#F0F2F7]" : ""
            }`}
          />
        </div>
      </div>

      <div
        class="border border-[#0000000d] rounded-[10px] overflow-y-auto h-[540px]"
      >
        <table class="table-auto w-full h-full">
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
                  <tr class="group transition-all">
                    <td class="py-3 w-10 group-hover:bg-gray-100">
                      <div class="flex justify-center">
                        <input
                          type="checkbox"
                          value={data.id}
                          bind:group={selectedTokenList}
                          class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                        />
                      </div>
                    </td>

                    <td class="py-3 pr-3 group-hover:bg-gray-100">
                      <div class="text-left flex items-center gap-3">
                        <img
                          src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${data.id}.png`}
                          alt=""
                          width="30"
                          height="30"
                          class="rounded-full"
                        />
                        <div class="flex flex-col gap-1">
                          <div
                            class="text-black xl:text-sm text-xl font-medium relative"
                          >
                            {#if data.name === undefined}
                              N/A
                            {:else}
                              {data.name}
                            {/if}
                          </div>
                          <div
                            class="text-[#00000080] text-xs font-medium relative"
                          >
                            {#if data.symbol === undefined}
                              N/A
                            {:else}
                              {data.symbol}
                            {/if}
                          </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          {#if data.suggest && data.suggest.length}
                            {#each data.suggest as item}
                              <a
                                href={item.url}
                                target="_blank"
                                class="flex items-center justyfy-center px-2 py-1 text-[#27326F] text-[10px] font-medium bg-[#1e96fc33] rounded-[1000px]"
                              >
                                {item.tile}
                              </a>
                            {/each}
                          {/if}
                        </div>
                      </div>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          {/if}
        </table>
      </div>

      <div class="flex justify-end gap-2 mt-3">
        <div class="md:w-[120px] w-full">
          <Button variant="secondary" on:click={() => {}}>
            <div class="xl:text-base text-2xl font-medium">Reset</div>
          </Button>
        </div>
        <div class="md:w-[120px] w-full">
          <Button on:click={() => {}}>
            <div class="xl:text-base text-2xl font-medium">Confirm</div>
          </Button>
        </div>
      </div>
    </div>

    <div
      class="flex-1 border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-2 relative"
    >
      <div class="flex justify-between items-end">
        <div class="flex flex-col">
          <div class="xl:text-xl text-2xl font-medium">2. Coin Allocation</div>
          <div class="xl:text-base text-lg font-normal text-gray-500">
            Remaining: <span class="text-red-500">92%</span>/100%
          </div>
        </div>
        <div class="xl:text-base text-lg text-red-500 cursor-pointer">
          Clear All
        </div>
      </div>
      <Button variant={false ? "disabled" : "tertiary"} on:click={() => {}}>
        <img src={Plus} alt="" width="12" height="12" />
        <div class="xl:text-base text-2xl font-medium text-white">
          Add Coins
        </div>
      </Button>
      <div class="border border-red-500">table</div>
      <div class="flex justify-end mt-3">
        <div class="md:w-[120px] w-full">
          <Button
            on:click={() =>
              handleSubmit({
                virtualPortfolioName,
                time,
              })}
          >
            <div class="xl:text-base text-2xl font-medium">Create</div>
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
