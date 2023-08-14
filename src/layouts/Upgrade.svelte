<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { onMount } from "svelte";

  import PricePackage from "~/UI/PricePagake/PricePackage.svelte";
  import Button from "~/components/Button.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  import Bnb from "~/assets/bnb.png";
  import Ethereum from "~/assets/ethereum.png";
  import Matic from "~/assets/matic.png";
  import Solana from "~/assets/solana.png";

  const listChain = [
    {
      logo: Solana,
      label: "Solana",
      value: "sol",
    },
    // {
    //   logo: Ethereum,
    //   label: "Ethereum",
    //   value: "eth",
    // },
    // {
    //   logo: Bnb,
    //   label: "Binance",
    //   value: "bsc",
    // },
    // {
    //   logo: Matic,
    //   label: "Polygon",
    //   value: "pol",
    // },
  ];

  let isLoadingBuy = false;
  let selectedPackage;
  let selectedExplorer;
  let selectedProfessional;
  let listPackageData = [];

  const handleSelectedPackage = (item) => {
    selectedPackage = item;
  };

  const getListPackage = async () => {
    try {
      const response = await nimbus.get("/v2/payments/subscription");
      if (response && response?.data) {
        // listPackageData = [
        //   {
        //     created: "2023-08-11T04:34:50.685Z",
        //     description: "To win the market",
        //     id: "product_9628d26e3219405dac33381eeed2fa8b",
        //     images: [],
        //     meta: {},
        //     name: "Professional",
        //     prices: [
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-11T09:56:34.842Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_sol_pro_month",
        //         meta: {},
        //         name: null,
        //         network: "sol",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "month",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "perUnit",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "9900000",
        //         unitAmountDecimal: 99,
        //         updated: "2023-08-11T09:56:34.842Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-11T09:56:34.842Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_sol_pro_year",
        //         meta: {},
        //         name: null,
        //         network: "sol",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "year",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "perUnit",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "9900000",
        //         unitAmountDecimal: 990,
        //         updated: "2023-08-11T09:56:34.842Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-11T09:56:34.842Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_eth_pro_month",
        //         meta: {},
        //         name: null,
        //         network: "eth",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "month",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "perUnit",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "9900000",
        //         unitAmountDecimal: 99,
        //         updated: "2023-08-11T09:56:34.842Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-11T09:56:34.842Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_eth_pro_year",
        //         meta: {},
        //         name: null,
        //         network: "eth",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "year",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "perUnit",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "9900000",
        //         unitAmountDecimal: 990,
        //         updated: "2023-08-11T09:56:34.842Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-11T09:56:34.842Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_bsc_pro_month",
        //         meta: {},
        //         name: null,
        //         network: "bsc",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "month",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "perUnit",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "9900000",
        //         unitAmountDecimal: 99,
        //         updated: "2023-08-11T09:56:34.842Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-11T09:56:34.842Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_bsc_pro_year",
        //         meta: {},
        //         name: null,
        //         network: "bsc",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "year",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "perUnit",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "9900000",
        //         unitAmountDecimal: 990,
        //         updated: "2023-08-11T09:56:34.842Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-11T09:56:34.842Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_pol_pro_month",
        //         meta: {},
        //         name: null,
        //         network: "pol",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "month",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "perUnit",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "9900000",
        //         unitAmountDecimal: 99,
        //         updated: "2023-08-11T09:56:34.842Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-11T09:56:34.842Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_pol_pro_year",
        //         meta: {},
        //         name: null,
        //         network: "pol",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "year",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "perUnit",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "9900000",
        //         unitAmountDecimal: 990,
        //         updated: "2023-08-11T09:56:34.842Z",
        //       },
        //     ],
        //     tags: [],
        //     updated: "2023-08-11T04:34:50.685Z",
        //   },
        //   {
        //     created: "2023-08-09T07:47:13.106Z",
        //     description: "We help optimize your portfolio",
        //     id: "product_9e87b125b078415eb4859306f753919f",
        //     images: [],
        //     meta: {},
        //     name: "Explorer",
        //     prices: [
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-09T07:49:55.443Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_sol_exp_month",
        //         meta: {},
        //         name: null,
        //         network: "sol",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "month",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "licensed",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "1000000",
        //         unitAmountDecimal: 30,
        //         updated: "2023-08-09T07:49:55.443Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-09T07:49:55.443Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_sol_exp_year",
        //         meta: {},
        //         name: null,
        //         network: "sol",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "year",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "licensed",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "1000000",
        //         unitAmountDecimal: 300,
        //         updated: "2023-08-09T07:49:55.443Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-09T07:49:55.443Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_eth_exp_month",
        //         meta: {},
        //         name: null,
        //         network: "eth",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "month",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "licensed",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "1000000",
        //         unitAmountDecimal: 30,
        //         updated: "2023-08-09T07:49:55.443Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-09T07:49:55.443Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_eth_exp_year",
        //         meta: {},
        //         name: null,
        //         network: "eth",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "year",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "licensed",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "1000000",
        //         unitAmountDecimal: 300,
        //         updated: "2023-08-09T07:49:55.443Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-09T07:49:55.443Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_bsc_exp_month",
        //         meta: {},
        //         name: null,
        //         network: "bsc",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "month",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "licensed",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "1000000",
        //         unitAmountDecimal: 30,
        //         updated: "2023-08-09T07:49:55.443Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-09T07:49:55.443Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_bsc_exp_year",
        //         meta: {},
        //         name: null,
        //         network: "bsc",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "year",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "licensed",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "1000000",
        //         unitAmountDecimal: 300,
        //         updated: "2023-08-09T07:49:55.443Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-09T07:49:55.443Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_pol_exp_month",
        //         meta: {},
        //         name: null,
        //         network: "pol",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "month",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "licensed",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "1000000",
        //         unitAmountDecimal: 30,
        //         updated: "2023-08-09T07:49:55.443Z",
        //       },
        //       {
        //         active: true,
        //         billingScheme: "perUnit",
        //         created: "2023-08-09T07:49:55.443Z",
        //         currency: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        //         description: null,
        //         id: "price_pol_exp_year",
        //         meta: {},
        //         name: null,
        //         network: "pol",
        //         product: null,
        //         recurring: {
        //           defaultLength: 1,
        //           interval: "year",
        //           intervalCount: 1,
        //           type: "delegated",
        //           usageAggregation: "sum",
        //           usageType: "licensed",
        //         },
        //         taxBehavior: "exclusive",
        //         tierType: null,
        //         tiers: [],
        //         type: "recurring",
        //         unitAmount: "1000000",
        //         unitAmountDecimal: 300,
        //         updated: "2023-08-09T07:49:55.443Z",
        //       },
        //     ],
        //     tags: [],
        //     updated: "2023-08-09T07:47:13.106Z",
        //   },
        // ];
        listPackageData = response?.data?.data?.products;

        selectedExplorer = listPackageData.find(
          (item) => item.name === "Explorer"
        );
        selectedProfessional = listPackageData.find(
          (item) => item.name === "Professional"
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  onMount(() => {
    getListPackage();
  });

  const handleBuy = async (chainValue: string) => {
    isLoadingBuy = true;
    try {
      const selectedPackageData = listPackageData.find(
        (item) => item.name === selectedPackage.name
      );

      const selectedPackageDataPrice = selectedPackageData.prices.find(
        (item) =>
          item.recurring.interval === selectedPackage.selectedTypePackage &&
          item.network === chainValue
      );

      const response = await nimbus.post("/v2/payments/create-session", {
        priceId: selectedPackageDataPrice.id,
      });
      if (response && response?.data) {
        isLoadingBuy = false;
        window.location.replace(response?.data?.url);
      }
    } catch (e) {
      console.error(e);
      isLoadingBuy = false;
    }
  };
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] py-8 flex flex-col gap-2"
  >
    <div class="xl:text-5xl text-7xl text-black font-semibold text-center">
      Upgrade Plan
    </div>
    {#if selectedPackage && Object.keys(selectedPackage).length !== 0}
      <div class="flex flex-col justify-center min-h-[700px]">
        <div class="flex flex-col items-center gap-1">
          <div class="flex items-center gap-1 xl:text-lg text-xl">
            You're going to upgrade to plan <span class="font-semibold"
              >{selectedPackage.name}</span
            >
            with
            <span class="flex items-end gap-2 font-semibold">
              <span>{selectedPackage.price}</span><span
                class="xl:text-lg text-xl text-gray-400 mb-[2px]"
                >/{selectedPackage.selectedTypePackage}</span
              >
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-3 items-center mt-5">
          <div class="my-3 xl:text-base text-lg">
            Choose your prefer payment method
          </div>
          {#each listChain as chain}
            <div class="w-62 xl:text-lg text-xl">
              <Button
                variant="secondary"
                isLoading={isLoadingBuy}
                on:click={() => handleBuy(chain.value)}
              >
                <img src={chain.logo} class="w-5 h-5 rounded-full" />
                {chain.label}</Button
              >
            </div>
          {/each}
          <div
            class="text-[#1E96FC] font-semibold xl:text-lg text-xl cursor-pointer flex items-center gap-2 mt-2"
            on:click={() => {
              selectedPackage = undefined;
            }}
          >
            <div class="transform -rotate-180">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="#1E96FC"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                  fill=""
                /></svg
              >
            </div>
            Choose other Plan
          </div>
        </div>
        <div class="text-center text-gray-500 xl:text-sm text-lg mt-8">
          If missing your prefer payment method, please contact Telegram
          <strong>@thanhle27</strong> for support
        </div>
      </div>
    {:else}
      <PricePackage
        selectedPackage={handleSelectedPackage}
        {selectedExplorer}
        {selectedProfessional}
      />
    {/if}
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
