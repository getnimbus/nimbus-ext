<script lang="ts">
  import { typePackage } from "~/utils";
  import { AnimateSharedLayout, Motion } from "svelte-motion";

  export let selectedPackage = (item) => {};
  export let selectedExplorer;
  export let selectedProfessional;

  let selectedTypePackage: "month" | "yearn" = "month";
</script>

<div class="flex flex-col gap-4 mt-5">
  <div class="flex items-center justify-center gap-2">
    <AnimateSharedLayout>
      {#each typePackage as type}
        <div
          class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
          on:click={() => (selectedTypePackage = type.value)}
        >
          <div
            class={`relative z-20 ${
              selectedTypePackage === type.value && "text-white"
            }`}
          >
            {type.label}
          </div>
          {#if type.value === selectedTypePackage}
            <Motion
              let:motion
              layoutId="active-pill"
              transition={{ type: "spring", duration: 0.6 }}
            >
              <div
                class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                use:motion
              />
            </Motion>
          {/if}
        </div>
      {/each}
    </AnimateSharedLayout>
  </div>
  <div class="grid grid-cols-3 gap-7">
    <div class="border border-[#0000001a] rounded-xl flex flex-col gap-4 p-4">
      <div class="text-3xl font-semibold">Trial</div>
      <div>
        <div class="flex flex-col border-b-[1px] border-[#0000001a] pb-4">
          <div class="text-xl font-medium">Trial</div>
          <div class="text-lg text-gray-500">
            For those who starting to invest
          </div>
        </div>
        <div class="mt-4 flex flex-col gap-2">
          <div class="text-base text-black">Real-time market update</div>
          <div class="text-base text-black">
            <span class="font-bold">3</span> Wallets
          </div>
          <div class="text-base text-black">
            <span class="font-bold">$2 000</span> total net worth
          </div>
          <div class="text-base text-gray-400">Advantage metrics</div>
          <div class="text-base text-gray-400">Rebalance Strategy</div>
          <div class="text-base text-gray-400">Professional community</div>

          <div
            class="flex items-center gap-2 mt-2 text-[#006bff] font-semibold text-lg cursor-pointer"
            on:click={() => {
              selectedPackage({
                name: "FREE",
                price: 0,
              });
            }}
          >
            Try FREE
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="#006bff"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                fill=""
              /></svg
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Explorer -->
    <div
      class="border border-[#0000001a] rounded-xl flex flex-col gap-4 p-4 relative"
    >
      <div
        class="absolute top-6 right-0 rounded-tl-full rounded-bl-full bg-[#006bff] font-medium text-white text-xs uppercase py-1 px-3"
      >
        popular
      </div>
      <div class="text-3xl font-semibold flex items-end gap-2">
        <span
          >{selectedTypePackage === "month"
            ? `$${
                selectedExplorer?.prices.find(
                  (item) => item.recurring.interval === "month"
                )?.unitAmountDecimal
              }`
            : `$${
                selectedExplorer?.prices.find(
                  (item) => item.recurring.interval === "year"
                )?.unitAmountDecimal / 12
              }`}</span
        ><span class="text-xl text-gray-400 mb-[2px]"
          >/{selectedTypePackage === "month" ? "month" : "year"}</span
        >
      </div>
      <div>
        <div class="flex flex-col border-b-[1px] border-[#0000001a] pb-4">
          <div class="text-xl font-medium">EXPLORER</div>
          <div class="text-lg text-gray-500">
            We help optimize your portfolio
          </div>
        </div>
        <div class="mt-4 flex flex-col gap-2">
          <div class="text-base text-black">Real-time market update</div>
          <div class="text-base text-black">
            <span class="font-bold">7</span> Wallets
          </div>
          <div class="text-base text-black">
            <span class="font-bold">$50 000</span> total net worth
          </div>
          <div class="text-base text-black">Advantage metrics</div>
          <div class="text-base text-black">Rebalance Strategy</div>
          <div class="text-base text-gray-400">Professional community</div>

          <div
            class="flex items-center gap-2 mt-2 text-[#006bff] font-semibold text-lg cursor-pointer"
            on:click={() => {
              selectedPackage({
                name: "Explorer",
                price:
                  selectedTypePackage === "month"
                    ? `$${
                        selectedExplorer?.prices.find(
                          (item) => item.recurring.interval === "month"
                        )?.unitAmountDecimal
                      }`
                    : `$${
                        selectedExplorer?.prices.find(
                          (item) => item.recurring.interval === "year"
                        )?.unitAmountDecimal / 12
                      }`,
                selectedTypePackage,
              });
            }}
          >
            Get the Plan
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="#006bff"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                fill=""
              /></svg
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Professional -->
    <div class="border border-[#0000001a] rounded-xl flex flex-col gap-4 p-4">
      <div class="text-3xl font-semibold flex items-end gap-2">
        <span
          >{selectedTypePackage === "month"
            ? `$${
                selectedProfessional?.prices.find(
                  (item) => item.recurring.interval === "month"
                )?.unitAmountDecimal
              }`
            : `$${
                selectedProfessional?.prices.find(
                  (item) => item.recurring.interval === "year"
                )?.unitAmountDecimal / 12
              }`}</span
        ><span class="text-xl text-gray-400 mb-[2px]"
          >/{selectedTypePackage === "month" ? "month" : "year"}</span
        >
      </div>
      <div>
        <div class="flex flex-col border-b-[1px] border-[#0000001a] pb-4">
          <div class="text-xl font-medium">PROFESSIONAL</div>
          <div class="text-lg text-gray-500">To win the market</div>
        </div>
        <div class="mt-4 flex flex-col gap-2">
          <div class="text-base text-black">Real-time market update</div>
          <div class="text-base text-black">
            <span class="font-bold">Unlimited</span> Wallets
          </div>
          <div class="text-base text-black">
            <span class="font-bold">Unlimited</span> total net worth
          </div>
          <div class="text-base text-black">Advantage metrics</div>
          <div class="text-base text-black">Rebalance Strategy</div>
          <div class="text-base text-black">Professional community</div>

          <div
            class="flex items-center gap-2 mt-2 text-[#006bff] font-semibold text-lg cursor-pointer"
            on:click={() => {
              selectedPackage({
                name: "Professional",
                price:
                  selectedTypePackage === "month"
                    ? `$${
                        selectedProfessional?.prices.find(
                          (item) => item.recurring.interval === "month"
                        )?.unitAmountDecimal
                      }`
                    : `$${
                        selectedProfessional?.prices.find(
                          (item) => item.recurring.interval === "year"
                        )?.unitAmountDecimal / 12
                      }`,
                selectedTypePackage,
              });
            }}
          >
            Get the Plan
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="#006bff"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                fill=""
              /></svg
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
