<script lang="ts">
  import { getTooltipContent, dateDiffInDays } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { isDarkMode, user, wallet, chain, typeWallet } from "~/store";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { priceTable } from "~/UI/PricePackage/DataTable";

  import tooltip from "~/entries/contentScript/views/tooltip";
  import Button from "~/components/Button.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import CompareTable from "~/UI/PricePackage/CompareTable.svelte";

  export let selectedPackage = (item) => {};

  const queryClient = useQueryClient();

  let selectedPricePackage = "Free";
  let buyPackage = "Free";
  let interval = "month";
  let isNewUser = false;
  let endDatePackage = "";
  let isSubscription = false;
  let isOpenConfirmCancel = false;
  let isLoadingCancel = false;

  let isLoadingSubmitCoupleCode = false;
  let code = "";

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  let checkedTypePackage = true;
  $: selectedTypePackage = checkedTypePackage ? "year" : "month";

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

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    return response?.data;
  };

  $: query = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
      wallet.update((n) => (n = ""));
      chain.update((n) => (n = ""));
      typeWallet.update((n) => (n = ""));
      queryClient.invalidateQueries(["list-address"]);
    },
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      selectedPricePackage = $query.data.plan?.tier;
      buyPackage = $query.data.plan?.tier;
      interval = $query.data.plan?.interval;
      endDatePackage = $query.data.plan?.endDate;
      isSubscription = $query.data.plan?.subscription;
      isNewUser = $query.data.plan?.isNewUser;
    }
  }

  const handleCancelSubscription = async () => {
    isLoadingCancel = true;
    try {
      await nimbus.get("/v2/payments/subscriptions/cancel");
      isOpenConfirmCancel = false;
      isLoadingCancel = false;
      queryClient.invalidateQueries(["users-me"]);
    } catch (e) {
      console.error("error: ", e);
      isLoadingCancel = false;
    }
  };

  const onSubmitCoupleCode = async (e) => {
    isLoadingSubmitCoupleCode = true;
    const formData = new FormData(e.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    try {
      const response = await nimbus.post("/v2/payments/redeem-code", {
        code: data.code,
      });
      if (response?.error) {
        toastMsg = response?.error;
        isSuccessToast = false;
      } else {
        queryClient.invalidateQueries(["users-me"]);
        toastMsg = "Apply your couple code success!";
        isSuccessToast = true;
      }
      isLoadingSubmitCoupleCode = false;
      trigger();
    } catch (e) {
      console.error(e);
      isLoadingSubmitCoupleCode = false;
      toastMsg =
        "There are some error when apply your couple code. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };

  const compareResult = (item: any) => {
    if (item.state === "available") {
      return "✅";
    } else if (item.state === "unavailable") {
      return "⛔";
    } else {
      return "⚠️";
    }
  };

  $: detailPackage = (item: any) => {
    const contentData =
      selectedPricePackage === "Free"
        ? item.content.free
        : selectedPricePackage === "Explorer"
        ? item.content.explorer
        : item.content.alpha;

    return `
      <div class="text-xl">
        ${contentData.description}
        <span class="w-4 h-4 ml-1">
          ${compareResult(contentData)}
        </span>
      </div>
    `;
  };
</script>

<div class="flex flex-col xl:gap-4 gap-8">
  <div
    class="p-4 text-2xl text-green-600 rounded-lg xl:text-base bg-green-50"
    role="alert"
  >
    <span class="mr-2 xl:mr-1">⭐️</span> We're giving 1000 coupon codes
    <span class="font-bold">EARLY-BIRD</span>
    which get <span class="font-bold">30%</span> off for the first-time payment
    and
    <span class="font-bold">10% off lifetime</span> payments.
  </div>

  <div class="flex flex-col gap-20 mt-4">
    <!-- Pricing Table PC -->
    <div class="xl:block hidden rounded-[10px] border border_0000000d">
      <table class="table-auto w-full">
        <thead>
          <tr class="bg_f4f5f8">
            <th class="py-3 pl-3 rounded-tl-[10px] w-[420px]">
              <div class="text-left text-lg uppercase font-medium">Plans</div>
            </th>

            <th class="py-3 pr-3">
              <div class="text-left text-lg uppercase font-medium">Free</div>
            </th>

            <th class="py-3 pr-3">
              <div class="flex items-center gap-2">
                <div class="text-lg uppercase font-medium">Explorer</div>
                {#if selectedTypePackage === "year"}
                  <div
                    class="text-white font-normal text-sm px-2 py-1 bg-[#10b981] rounded-lg"
                  >
                    Save $17.5
                  </div>
                {:else}
                  <div class="h-[28px]" />
                {/if}
              </div>
            </th>

            <th class="py-3 px-3 rounded-tr-[10px]">
              <div class="flex items-center gap-2">
                <div class="text-lg uppercase font-medium">Alpha</div>
                {#if selectedTypePackage === "year"}
                  <div
                    class="text-white font-normal text-sm px-2 py-1 bg-[#10b981] rounded-lg"
                  >
                    Save $17.5
                  </div>
                {:else}
                  <div class="h-[28px]" />
                {/if}
              </div>
            </th>
          </tr>

          <tr class="bg_f4f5f8">
            <td class="py-3 pl-3 w-[420px]">
              <div class="flex items-center gap-3">
                <label class="switch">
                  <input type="checkbox" bind:checked={checkedTypePackage} />
                  <span class="slider" />
                </label>
                <div class="text-base font-medium">
                  Annual Billing <span class="text-green-500">(Save 17%)</span>
                </div>
              </div>
            </td>

            <!-- Free -->
            <td class="py-3 pr-3">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <div class="text-3xl font-semibold">$0</div>
                  <div class="text-base font-medium">
                    For those who starting to invest
                  </div>
                </div>
                <div class="w-max flex items-center min-h-[30px]">
                  <div
                    class={`text-center text-base font-medium text-[#1e96fc] ${
                      buyPackage === "Free"
                        ? "opacity-100 block"
                        : "opacity-0 hidden"
                    }`}
                  >
                    Current Plan
                  </div>
                  <!-- <div class="font-medium text-lg">
                    <div
                      class={`flex items-center gap-2 text-[#1E96FC] ${
                        buyPackage?.length !== 0 && buyPackage !== "Free"
                          ? "opacity-100 cursor-pointer"
                          : "opacity-0 cursor-default"
                      }`}
                      on:click={() => {
                        if (
                          buyPackage === "Explorer" ||
                          buyPackage === "Professional"
                        ) {
                          console.log("downgrade to Free");
                        }
                      }}
                    >
                      Downgrade
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="#1E96FC"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                          fill=""
                        />
                      </svg>
                    </div>
                  </div> -->
                </div>
              </div>
            </td>

            <!-- Explorer -->
            <td class="py-3 pr-3">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-1 text-3xl font-semibold">
                    {selectedTypePackage === "year" ? "$8.25" : "$9.99"}
                    <div class="text-base font-medium text-[#6b7380]">
                      /month
                    </div>
                  </div>
                  <div class="text-base font-medium">
                    Boost your return and reduce your risk
                  </div>
                </div>

                <div class="w-max flex items-center min-h-[30px]">
                  {#if selectedTypePackage === "month"}
                    <div
                      class={`text-base font-medium text-[#1e96fc] ${
                        buyPackage === "Explorer" && interval === "month"
                          ? "opacity-100 block"
                          : "opacity-0 hidden"
                      }`}
                    >
                      Current Plan have
                      <span class="font-medium"
                        >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                        left</span
                      >
                    </div>

                    <!-- <div
                      class={`flex justify-between items-center text-[#1E96FC] font-medium text-lg ${
                        buyPackage === "Free"
                          ? "opacity-100"
                          : buyPackage === "Explorer" && interval === "month"
                          ? "opacity-0 cursor-default"
                          : "opacity-100"
                      }`}
                    >
                      {#if (buyPackage === "Explorer" && interval === "year") || buyPackage === "Free" || buyPackage === "Professional"}
                        <div
                          class="flex items-center gap-2 cursor-pointer"
                          on:click={() => {
                            if (buyPackage === "Professional") {
                              console.log("downgrade to Explorer");
                            } else {
                              selectedPackage({
                                plan: "Explorer",
                                selectedTypePackage,
                                price: "$30",
                                isNewUser: undefined,
                              });
                            }
                          }}
                        >
                          {#if buyPackage === "Professional"}
                            Downgrade
                          {:else}
                            Upgrade
                          {/if}
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
                        {#if isNewUser}
                          <div
                            class="text-base font-normal underline cursor-pointer xl:text-sm"
                            on:click={() => {
                              if (buyPackage === "Professional") {
                                console.log("downgrade to Explorer");
                              } else {
                                selectedPackage({
                                  plan: "Explorer",
                                  selectedTypePackage,
                                  price: "$30",
                                  isNewUser,
                                });
                              }
                            }}
                          >
                            Or 30 days Trial
                          </div>
                        {/if}
                      {/if}
                    </div> -->

                    <!-- remove me -->
                    <!-- <div class="font-medium text-lg">
                      {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "month")}
                        {#if buyPackage === "Free"}
                          <div
                            class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                            on:click={() => {
                              selectedPackage({
                                plan: "Explorer",
                                selectedTypePackage,
                                price: "$30",
                                isNewUser: undefined,
                              });
                            }}
                          >
                            Upgrade
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
                        {:else}
                          <div>
                            {#if isSubscription}
                              <div
                                class="text-red-500 cursor-pointer"
                                on:click={() => (isOpenConfirmCancel = true)}
                              >
                                Cancel
                              </div>
                            {/if}
                          </div>
                        {/if}
                      {:else}
                        <div class="opacity-0">
                          {#if isSubscription}
                            remove me
                          {/if}
                        </div>
                      {/if}
                    </div> -->

                    <!-- remove me (flow manual) -->
                    <div class="font-medium text-lg">
                      {#if buyPackage === "Free"}
                        <div
                          class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                          on:click={() => {
                            selectedPackage({
                              plan: "Explorer",
                              selectedTypePackage,
                              price: 9.99,
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
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
                      {/if}
                    </div>
                  {/if}

                  {#if selectedTypePackage === "year"}
                    <div
                      class={`text-base font-medium text-[#1e96fc] ${
                        buyPackage === "Explorer" && interval === "year"
                          ? "opacity-100 block"
                          : "opacity-0 hidden"
                      }`}
                    >
                      Current Plan have
                      <span class="font-medium"
                        >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                        left</span
                      >
                    </div>

                    <!-- <div
                      class={`flex justify-between items-center text-[#1E96FC] font-medium text-lg ${
                        buyPackage === "Free"
                          ? "opacity-100"
                          : buyPackage === "Explorer" && interval === "year"
                          ? "opacity-0 cursor-default"
                          : "opacity-100"
                      }`}
                    >
                      {#if (buyPackage === "Explorer" && interval === "month") || buyPackage === "Free" || buyPackage === "Professional"}
                        <div
                          class="flex items-center gap-2 cursor-pointer"
                          on:click={() => {
                            if (buyPackage === "Professional") {
                              console.log("downgrade to Explorer");
                            } else {
                              selectedPackage({
                                plan: "Explorer",
                                selectedTypePackage,
                                price: "$25",
                                isNewUser: undefined,
                              });
                            }
                          }}
                        >
                          {#if buyPackage === "Professional"}
                            Downgrade
                          {:else}
                            Upgrade
                          {/if}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="#1E96FC"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                              fill=""
                            />
                          </svg>
                        </div>
                        {#if isNewUser}
                          <div
                            class="text-base font-normal underline cursor-pointer xl:text-sm"
                            on:click={() => {
                              if (buyPackage === "Professional") {
                                console.log("downgrade to Explorer");
                              } else {
                                selectedPackage({
                                  plan: "Explorer",
                                  selectedTypePackage,
                                  price: "$25",
                                  isNewUser,
                                });
                              }
                            }}
                          >
                            Or 30 days Trial
                          </div>
                        {/if}
                      {/if}
                    </div> -->

                    <!-- remove me -->
                    <!-- <div class="font-medium text-lg">
                      {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "year")}
                        {#if buyPackage === "Free"}
                          <div
                            class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                            on:click={() => {
                              selectedPackage({
                                plan: "Explorer",
                                selectedTypePackage,
                                price: "$25",
                                isNewUser: undefined,
                              });
                            }}
                          >
                            Upgrade
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="#1E96FC"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                                fill=""
                              />
                            </svg>
                          </div>
                        {:else}
                          <div>
                            {#if isSubscription}
                              <div
                                class="text-red-500 cursor-pointer"
                                on:click={() => (isOpenConfirmCancel = true)}
                              >
                                Cancel
                              </div>
                            {/if}
                          </div>
                        {/if}
                      {:else}
                        <div class="opacity-0">
                          {#if isSubscription}
                            remove me
                          {/if}
                        </div>
                      {/if}
                    </div> -->

                    <!-- remove me (flow manual) -->
                    <div class="font-medium text-lg">
                      {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "month") || (buyPackage === "Professional" && interval === "month")}
                        <div
                          class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                          on:click={() => {
                            selectedPackage({
                              plan: "Explorer",
                              selectedTypePackage,
                              price: 8.25,
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
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
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            </td>

            <!-- Professional -->
            <td class="py-3 px-3">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-1 text-3xl font-semibold">
                    {selectedTypePackage === "year" ? "$82.5" : "$99.99"}
                    <div class="text-base font-medium text-[#6b7380]">
                      /month
                    </div>
                  </div>
                  <div class="text-base font-medium">
                    Enjoy all the features without any limited
                  </div>
                </div>

                <div class="w-max flex items-center min-h-[30px]">
                  {#if selectedTypePackage === "month"}
                    <div
                      class={`text-base font-medium text-[#1e96fc] ${
                        buyPackage === "Professional" && interval === "month"
                          ? "opacity-100 block"
                          : "opacity-0 hidden"
                      }`}
                    >
                      Current Plan have
                      <span class="font-medium"
                        >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                        left</span
                      >
                    </div>

                    <!-- <div
                      class={`flex justify-between items-center text-[#1E96FC] font-medium text-lg ${
                        buyPackage === "Free" || buyPackage === "Explorer"
                          ? "opacity-100"
                          : buyPackage === "Professional" &&
                            interval === "month"
                          ? "opacity-0 cursor-default"
                          : "opacity-100"
                      }`}
                    >
                      {#if (buyPackage === "Professional" && interval === "year") || buyPackage === "Free" || buyPackage === "Explorer"}
                        <div
                          class="flex items-center gap-2 cursor-pointer"
                          on:click={() => {
                            if (
                              buyPackage === "Professional" &&
                              interval === "year"
                            ) {
                              console.log("downgrade to Professional");
                              return;
                            }
                            selectedPackage({
                              plan: "Professional",
                              selectedTypePackage,
                              price: "$99",
                              isNewUser: undefined,
                            });
                          }}
                        >
                          {#if buyPackage === "Professional" && interval === "year"}
                            Downgrade
                          {:else}
                            Upgrade
                          {/if}
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
                        {#if isNewUser}
                          <div
                            class="text-base font-normal underline cursor-pointer xl:text-sm"
                            on:click={() => {
                              if (buyPackage === "Professional") {
                                return;
                              }
                              selectedPackage({
                                plan: "Professional",
                                selectedTypePackage,
                                price: "$99",
                                isNewUser,
                              });
                            }}
                          >
                            Or 30 days Trial
                          </div>
                        {/if}
                      {/if}
                    </div> -->

                    <!-- remove me -->
                    <!-- <div class="font-medium text-lg">
                      {#if buyPackage === "Free" || (buyPackage === "Professional" && interval === "month")}
                        {#if buyPackage === "Free"}
                          <div
                            class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                            on:click={() => {
                              selectedPackage({
                                plan: "Professional",
                                selectedTypePackage,
                                price: "$99",
                                isNewUser: undefined,
                              });
                            }}
                          >
                            Upgrade
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="#1E96FC"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                                fill=""
                              />
                            </svg>
                          </div>
                        {:else}
                          <div>
                            {#if isSubscription}
                              <div
                                class="text-red-500 cursor-pointer"
                                on:click={() => (isOpenConfirmCancel = true)}
                              >
                                Cancel
                              </div>
                            {/if}
                          </div>
                        {/if}
                      {:else}
                        <div class="opacity-0">
                          {#if isSubscription}
                            remove me
                          {/if}
                        </div>
                      {/if}
                    </div> -->

                    <!-- remove me (flow manual) -->
                    <div class="font-medium text-lg">
                      {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "month")}
                        <div
                          class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                          on:click={() => {
                            selectedPackage({
                              plan: "Professional",
                              selectedTypePackage,
                              price: 99.99,
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
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
                      {/if}
                    </div>
                  {/if}

                  {#if selectedTypePackage === "year"}
                    <div
                      class={`text-base font-medium text-[#1e96fc] ${
                        buyPackage === "Professional" && interval === "year"
                          ? "opacity-100 block"
                          : "opacity-0 hidden"
                      }`}
                    >
                      Current Plan have
                      <span class="font-medium"
                        >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                        left</span
                      >
                    </div>

                    <!-- <div
                      class={`flex justify-between items-center text-[#1E96FC] font-medium text-lg ${
                        buyPackage === "Free" || buyPackage === "Explorer"
                          ? "opacity-100"
                          : buyPackage === "Professional" && interval === "year"
                          ? "opacity-0 cursor-default"
                          : "opacity-100"
                      }`}
                    >
                      {#if (buyPackage === "Professional" && interval === "month") || buyPackage === "Free" || buyPackage === "Explorer"}
                        <div
                          class="flex items-center gap-2 cursor-pointer"
                          on:click={() => {
                            selectedPackage({
                              plan: "Professional",
                              selectedTypePackage,
                              price: "$82.5",
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="#1E96FC"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                              fill=""
                            />
                          </svg>
                        </div>
                        {#if isNewUser}
                          <div
                            class="text-base font-normal underline cursor-pointer xl:text-sm"
                            on:click={() => {
                              if (buyPackage === "Professional") {
                                return;
                              }
                              selectedPackage({
                                plan: "Professional",
                                selectedTypePackage,
                                price: "$82.5",
                                isNewUser,
                              });
                            }}
                          >
                            Or 30 days Trial
                          </div>
                        {/if}
                      {/if}
                    </div> -->

                    <!-- remove me -->
                    <!-- <div class="font-medium text-lg">
                      {#if buyPackage === "Free" || (buyPackage === "Professional" && interval === "year")}
                        {#if buyPackage === "Free"}
                          <div
                            class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                            on:click={() => {
                              selectedPackage({
                                plan: "Professional",
                                selectedTypePackage,
                                price: "$82.5",
                                isNewUser: undefined,
                              });
                            }}
                          >
                            Upgrade
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="#1E96FC"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                                fill=""
                              />
                            </svg>
                          </div>
                        {:else}
                          <div>
                            {#if isSubscription}
                              <div
                                class="text-red-500 cursor-pointer"
                                on:click={() => (isOpenConfirmCancel = true)}
                              >
                                Cancel
                              </div>
                            {/if}
                          </div>
                        {/if}
                      {:else}
                        <div class="opacity-0">
                          {#if isSubscription}
                            remove me
                          {/if}
                        </div>
                      {/if}
                    </div> -->

                    <!-- remove me (flow manual) -->
                    <div class="font-medium text-lg">
                      {#if buyPackage === "Free" || (buyPackage === "Professional" && interval === "month") || (buyPackage === "Explorer" && interval === "month") || (buyPackage === "Explorer" && interval === "year")}
                        <div
                          class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                          on:click={() => {
                            selectedPackage({
                              plan: "Professional",
                              selectedTypePackage,
                              price: 82.5,
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
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
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            </td>
          </tr>
        </thead>

        <tbody>
          {#each priceTable as item}
            {#if item.featureStatus === "main"}
              <tr class={`${$isDarkMode ? "bg-[#1C1C1C]" : "bg-gray-50"}`}>
                <th colspan="8" class="py-3 pl-3">
                  <div class="text-lg text-left font-medium">
                    {item.title}
                  </div>
                </th>
              </tr>
            {/if}
            {#if item.featureStatus === "part"}
              <tr class="group transition-all">
                <td
                  class={`py-3 pl-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="text-base w-max">
                    {#if item.tippy.used}
                      <div
                        use:tooltip={{
                          content: getTooltipContent(
                            item.tippy.title,
                            item.tippy.content,
                            false,
                            $isDarkMode
                          ),
                          allowHTML: true,
                          placement: "top",
                          interactive: true,
                        }}
                        class="underline-dashed"
                      >
                        {item.title}
                      </div>
                    {:else}
                      {item.title}
                    {/if}
                  </div>
                </td>

                <td
                  class={`py-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="text-base">
                    <span class="w-4 h-4 mr-1">
                      {compareResult(item.content.free)}
                    </span>{" "}
                    {item.content.free.description}
                  </div>
                </td>

                <td
                  class={`py-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="text-base">
                    <span class="w-4 h-4 mr-1">
                      {compareResult(item.content.explorer)}
                    </span>{" "}
                    {item.content.explorer.description}
                  </div>
                </td>

                <td
                  class={`py-3 pr-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="text-base">
                    <span class="w-4 h-4 mr-1">
                      {compareResult(item.content.alpha)}
                    </span>{" "}
                    {item.content.alpha.description}
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pricing Table Tablet/Mobile -->
    <div class="xl:hidden flex flex-col items-center gap-8">
      <div class="flex flex-col gap-8">
        <div class="flex items-center justify-center gap-3">
          <label class="switch">
            <input type="checkbox" bind:checked={checkedTypePackage} />
            <span class="slider" />
          </label>
          <div class="text-2xl font-medium">
            Annual Billing <span class="text-green-500">(Save 17%)</span>
          </div>
        </div>

        <div class="flex gap-5">
          <div
            class={`uppercase py-3 px-4 text-3xl font-medium rounded-2xl cursor-pointer ${
              selectedPricePackage === "Free" && !$isDarkMode
                ? "bg-blue-100 text-primary"
                : selectedPricePackage === "Free" && $isDarkMode
                ? "bg-gray-500 text-white"
                : $isDarkMode
                ? "text-white"
                : "text-black"
            }`}
            on:click={() => {
              selectedPricePackage = "Free";
            }}
          >
            Free
          </div>

          <div
            class={`uppercase py-3 px-4 text-3xl font-medium rounded-2xl cursor-pointer ${
              selectedPricePackage === "Explorer" && !$isDarkMode
                ? "bg-blue-100 text-primary"
                : selectedPricePackage === "Explorer" && $isDarkMode
                ? "bg-gray-500 text-white"
                : $isDarkMode
                ? "text-white"
                : "text-black"
            }`}
            on:click={() => {
              selectedPricePackage = "Explorer";
            }}
          >
            Explorer
          </div>

          <div
            class={`uppercase py-3 px-4 text-3xl font-medium rounded-2xl cursor-pointer ${
              selectedPricePackage === "Professional" && !$isDarkMode
                ? "bg-blue-100 text-primary"
                : selectedPricePackage === "Professional" && $isDarkMode
                ? "bg-gray-500 text-white"
                : $isDarkMode
                ? "text-white"
                : "text-black"
            }`}
            on:click={() => {
              selectedPricePackage = "Professional";
            }}
          >
            Alpha
          </div>
        </div>

        <div class="flex items-center justify-center">
          {#if selectedPricePackage === "Free"}
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2 justify-center items-center">
                <div class="text-2xl font-medium uppercase">Free</div>
                <span class="text-5xl font-semibold">$0</span>
                <div class="text-lg">For those who starting to invest</div>
              </div>
              <div class="flex justify-center min-h-[30px]">
                <div
                  class={`text-2xl font-medium text-[#1e96fc] ${
                    buyPackage === "Free"
                      ? "opacity-100 block"
                      : "opacity-0 hidden"
                  }`}
                >
                  Current Plan
                </div>
                <!-- <div class="font-medium text-2xl">
                  <div
                    class={`flex items-center gap-2 text-[#1E96FC] ${
                      buyPackage?.length !== 0 && buyPackage !== "Free"
                        ? "opacity-100 cursor-pointer"
                        : "opacity-0 cursor-default"
                    }`}
                    on:click={() => {
                      if (
                        buyPackage === "Explorer" ||
                        buyPackage === "Professional"
                      ) {
                        console.log("downgrade to Free");
                      }
                    }}
                  >
                    Downgrade
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 14 14"
                      fill="#1E96FC"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                        fill=""
                      />
                    </svg>
                  </div>
                </div> -->
              </div>
            </div>
          {/if}

          {#if selectedPricePackage === "Explorer"}
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2 justify-center items-center">
                <div class="text-2xl font-medium uppercase">
                  Explorer{" "}
                  {#if selectedTypePackage === "year"}
                    <span
                      class="text-white px-2 py-1 font-normal text-lg ml-3 bg-[#10b981] rounded-lg"
                    >
                      Save $1.75
                    </span>
                  {/if}
                </div>
                <div class="text-5xl font-medium">
                  {selectedTypePackage === "year" ? "$8.25" : "$9.99"}{" "}
                  <span class="text-[#6b7380] text-lg font-medium">
                    /month
                  </span>
                </div>
                <div class="text-xl">
                  Boost your return and reduce your risk
                </div>
              </div>
              <div class="flex justify-center min-h-[30px]">
                {#if selectedTypePackage === "month"}
                  <div
                    class={`text-2xl font-medium text-[#1e96fc] ${
                      buyPackage === "Explorer" && interval === "month"
                        ? "opacity-100 block"
                        : "opacity-0 hidden"
                    }`}
                  >
                    Current Plan have
                    <span class="font-medium"
                      >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                      left</span
                    >
                  </div>

                  <!-- <div
                    class={`flex justify-between items-center text-[#1E96FC] font-medium text-2xl ${
                      buyPackage === "Free"
                        ? "opacity-100"
                        : buyPackage === "Explorer" && interval === "month"
                        ? "opacity-0 cursor-default"
                        : "opacity-100"
                    }`}
                  >
                    {#if (buyPackage === "Explorer" && interval === "year") || buyPackage === "Free" || buyPackage === "Professional"}
                      <div
                        class="flex items-center gap-2 cursor-pointer"
                        on:click={() => {
                          if (buyPackage === "Professional") {
                            console.log("downgrade to Explorer");
                          } else {
                            selectedPackage({
                              plan: "Explorer",
                              selectedTypePackage,
                              price: "$30",
                              isNewUser: undefined,
                            });
                          }
                        }}
                      >
                        {#if buyPackage === "Professional"}
                          Downgrade
                        {:else}
                          Upgrade
                        {/if}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 14 14"
                          fill="#1E96FC"
                          xmlns="http://www.w3.org/2000/svg"
                          ><path
                            d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                            fill=""
                          /></svg
                        >
                      </div>
                      {#if isNewUser}
                        <div
                          class="text-base font-normal underline cursor-pointer xl:text-sm"
                          on:click={() => {
                            if (buyPackage === "Professional") {
                              console.log("downgrade to Explorer");
                            } else {
                              selectedPackage({
                                plan: "Explorer",
                                selectedTypePackage,
                                price: "$30",
                                isNewUser,
                              });
                            }
                          }}
                        >
                          Or 30 days Trial
                        </div>
                      {/if}
                    {/if}
                  </div> -->

                  <!-- remove me -->
                  <!-- <div class="font-medium text-2xl">
                    {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "month")}
                      {#if buyPackage === "Free"}
                        <div
                          class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                          on:click={() => {
                            selectedPackage({
                              plan: "Explorer",
                              selectedTypePackage,
                              price: "$30",
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 14 14"
                            fill="#1E96FC"
                            xmlns="http://www.w3.org/2000/svg"
                            ><path
                              d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                              fill=""
                            /></svg
                          >
                        </div>
                      {:else}
                        <div>
                          {#if isSubscription}
                            <div
                              class="text-red-500 cursor-pointer"
                              on:click={() => (isOpenConfirmCancel = true)}
                            >
                              Cancel
                            </div>
                          {/if}
                        </div>
                      {/if}
                    {:else}
                      <div class="opacity-0">
                        {#if isSubscription}
                          remove me
                        {/if}
                      </div>
                    {/if}
                  </div> -->

                  <!-- remove me (flow manual) -->
                  <div class="font-medium text-2xl">
                    {#if buyPackage === "Free"}
                      <div
                        class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                        on:click={() => {
                          selectedPackage({
                            plan: "Explorer",
                            selectedTypePackage,
                            price: 9.99,
                            isNewUser: undefined,
                          });
                        }}
                      >
                        Upgrade
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 14 14"
                          fill="#1E96FC"
                          xmlns="http://www.w3.org/2000/svg"
                          ><path
                            d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                            fill=""
                          /></svg
                        >
                      </div>
                    {/if}
                  </div>
                {/if}

                {#if selectedTypePackage === "year"}
                  <div
                    class={`text-2xl font-medium text-[#1e96fc] ${
                      buyPackage === "Explorer" && interval === "year"
                        ? "opacity-100 block"
                        : "opacity-0 hidden"
                    }`}
                  >
                    Current Plan have
                    <span class="font-medium"
                      >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                      left</span
                    >
                  </div>

                  <!-- <div
                    class={`flex justify-between items-center text-[#1E96FC] font-medium text-2xl ${
                      buyPackage === "Free"
                        ? "opacity-100"
                        : buyPackage === "Explorer" && interval === "year"
                        ? "opacity-0 cursor-default"
                        : "opacity-100"
                    }`}
                  >
                    {#if (buyPackage === "Explorer" && interval === "month") || buyPackage === "Free" || buyPackage === "Professional"}
                      <div
                        class="flex items-center gap-2 cursor-pointer"
                        on:click={() => {
                          if (buyPackage === "Professional") {
                            console.log("downgrade to Explorer");
                          } else {
                            selectedPackage({
                              plan: "Explorer",
                              selectedTypePackage,
                              price: "$25",
                              isNewUser: undefined,
                            });
                          }
                        }}
                      >
                        {#if buyPackage === "Professional"}
                          Downgrade
                        {:else}
                          Upgrade
                        {/if}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 14 14"
                          fill="#1E96FC"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                            fill=""
                          />
                        </svg>
                      </div>
                      {#if isNewUser}
                        <div
                          class="text-base font-normal underline cursor-pointer xl:text-sm"
                          on:click={() => {
                            if (buyPackage === "Professional") {
                              console.log("downgrade to Explorer");
                            } else {
                              selectedPackage({
                                plan: "Explorer",
                                selectedTypePackage,
                                price: "$25",
                                isNewUser,
                              });
                            }
                          }}
                        >
                          Or 30 days Trial
                        </div>
                      {/if}
                    {/if}
                  </div> -->

                  <!-- remove me -->
                  <!-- <div class="font-medium text-2xl">
                    {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "year")}
                      {#if buyPackage === "Free"}
                        <div
                          class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                          on:click={() => {
                            selectedPackage({
                              plan: "Explorer",
                              selectedTypePackage,
                              price: "$25",
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 14 14"
                            fill="#1E96FC"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                              fill=""
                            />
                          </svg>
                        </div>
                      {:else}
                        <div>
                          {#if isSubscription}
                            <div
                              class="text-red-500 cursor-pointer"
                              on:click={() => (isOpenConfirmCancel = true)}
                            >
                              Cancel
                            </div>
                          {/if}
                        </div>
                      {/if}
                    {:else}
                      <div class="opacity-0">
                        {#if isSubscription}
                          remove me
                        {/if}
                      </div>
                    {/if}
                  </div> -->

                  <!-- remove me (flow manual) -->
                  <div class="font-medium text-2xl">
                    {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "month") || (buyPackage === "Professional" && interval === "month")}
                      <div
                        class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                        on:click={() => {
                          selectedPackage({
                            plan: "Explorer",
                            selectedTypePackage,
                            price: 8.25,
                            isNewUser: undefined,
                          });
                        }}
                      >
                        Upgrade
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 14 14"
                          fill="#1E96FC"
                          xmlns="http://www.w3.org/2000/svg"
                          ><path
                            d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                            fill=""
                          /></svg
                        >
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          {#if selectedPricePackage === "Professional"}
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2 justify-center items-center">
                <div class="text-2xl font-medium uppercase">
                  Alpha{" "}
                  {#if selectedTypePackage === "year"}
                    <span
                      class="text-white px-2 py-1 font-normal text-lg ml-3 bg-[#10b981] rounded-lg"
                    >
                      Save $17.5
                    </span>
                  {/if}
                </div>
                <div class="text-5xl font-medium">
                  {selectedTypePackage === "year" ? "$82.5" : "$99.99"}{" "}
                  <span class="text-[#6b7380] text-lg font-medium">
                    /month
                  </span>
                </div>
                <div class="text-xl">
                  Enjoy all the features without any limited
                </div>
              </div>
              <div class="flex justify-center min-h-[30px]">
                {#if selectedTypePackage === "month"}
                  <div
                    class={`text-2xl font-medium text-[#1e96fc] ${
                      buyPackage === "Professional" && interval === "month"
                        ? "opacity-100 block"
                        : "opacity-0 hidden"
                    }`}
                  >
                    Current Plan have
                    <span class="font-medium"
                      >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                      left</span
                    >
                  </div>

                  <!-- <div
                    class={`flex justify-between items-center text-[#1E96FC] font-medium text-2xl ${
                      buyPackage === "Free" || buyPackage === "Explorer"
                        ? "opacity-100"
                        : buyPackage === "Professional" && interval === "month"
                        ? "opacity-0 cursor-default"
                        : "opacity-100"
                    }`}
                  >
                    {#if (buyPackage === "Professional" && interval === "year") || buyPackage === "Free" || buyPackage === "Explorer"}
                      <div
                        class="flex items-center gap-2 cursor-pointer"
                        on:click={() => {
                          if (
                            buyPackage === "Professional" &&
                            interval === "year"
                          ) {
                            console.log("downgrade to Professional");
                            return;
                          }
                          selectedPackage({
                            plan: "Professional",
                            selectedTypePackage,
                            price: "$99",
                            isNewUser: undefined,
                          });
                        }}
                      >
                        {#if buyPackage === "Professional" && interval === "year"}
                          Downgrade
                        {:else}
                          Upgrade
                        {/if}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 14 14"
                          fill="#1E96FC"
                          xmlns="http://www.w3.org/2000/svg"
                          ><path
                            d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                            fill=""
                          /></svg
                        >
                      </div>
                      {#if isNewUser}
                        <div
                          class="text-base font-normal underline cursor-pointer xl:text-sm"
                          on:click={() => {
                            if (buyPackage === "Professional") {
                              return;
                            }
                            selectedPackage({
                              plan: "Professional",
                              selectedTypePackage,
                              price: "$99",
                              isNewUser,
                            });
                          }}
                        >
                          Or 30 days Trial
                        </div>
                      {/if}
                    {/if}
                  </div> -->

                  <!-- remove me -->
                  <!-- <div class="font-medium text-2xl w-max">
                    {#if buyPackage === "Free" || (buyPackage === "Professional" && interval === "month")}
                      {#if buyPackage === "Free"}
                        <div
                          class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                          on:click={() => {
                            selectedPackage({
                              plan: "Professional",
                              selectedTypePackage,
                              price: "$99",
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 14 14"
                            fill="#1E96FC"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                              fill=""
                            />
                          </svg>
                        </div>
                      {:else}
                        <div>
                          {#if isSubscription}
                            <div
                              class="text-red-500 cursor-pointer"
                              on:click={() => (isOpenConfirmCancel = true)}
                            >
                              Cancel
                            </div>
                          {/if}
                        </div>
                      {/if}
                    {:else}
                      <div class="opacity-0">
                        {#if isSubscription}
                          remove me
                        {/if}
                      </div>
                    {/if}
                  </div> -->

                  <!-- remove me (flow manual) -->
                  <div class="font-medium text-2xl w-max">
                    {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "month")}
                      <div
                        class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                        on:click={() => {
                          selectedPackage({
                            plan: "Professional",
                            selectedTypePackage,
                            price: 99.99,
                            isNewUser: undefined,
                          });
                        }}
                      >
                        Upgrade
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 14 14"
                          fill="#1E96FC"
                          xmlns="http://www.w3.org/2000/svg"
                          ><path
                            d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                            fill=""
                          /></svg
                        >
                      </div>
                    {/if}
                  </div>
                {/if}

                {#if selectedTypePackage === "year"}
                  <div
                    class={`text-2xl font-medium text-[#1e96fc] ${
                      buyPackage === "Professional" && interval === "year"
                        ? "opacity-100 block"
                        : "opacity-0 hidden"
                    }`}
                  >
                    Current Plan have
                    <span class="font-medium"
                      >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                      left</span
                    >
                  </div>

                  <!-- <div
                    class={`flex justify-between items-center text-[#1E96FC] font-medium text-2xl ${
                      buyPackage === "Free" || buyPackage === "Explorer"
                        ? "opacity-100"
                        : buyPackage === "Professional" && interval === "year"
                        ? "opacity-0 cursor-default"
                        : "opacity-100"
                    }`}
                  >
                    {#if (buyPackage === "Professional" && interval === "month") || buyPackage === "Free" || buyPackage === "Explorer"}
                      <div
                        class="flex items-center gap-2 cursor-pointer"
                        on:click={() => {
                          selectedPackage({
                            plan: "Professional",
                            selectedTypePackage,
                            price: "$82.5",
                            isNewUser: undefined,
                          });
                        }}
                      >
                        Upgrade
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 14 14"
                          fill="#1E96FC"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                            fill=""
                          />
                        </svg>
                      </div>
                      {#if isNewUser}
                        <div
                          class="text-base font-normal underline cursor-pointer xl:text-sm"
                          on:click={() => {
                            if (buyPackage === "Professional") {
                              return;
                            }
                            selectedPackage({
                              plan: "Professional",
                              selectedTypePackage,
                              price: "$82.5",
                              isNewUser,
                            });
                          }}
                        >
                          Or 30 days Trial
                        </div>
                      {/if}
                    {/if}
                  </div> -->

                  <!-- remove me -->
                  <!-- <div class="font-medium text-2xl w-max">
                    {#if buyPackage === "Free" || (buyPackage === "Professional" && interval === "year")}
                      {#if buyPackage === "Free"}
                        <div
                          class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                          on:click={() => {
                            selectedPackage({
                              plan: "Professional",
                              selectedTypePackage,
                              price: "$82.5",
                              isNewUser: undefined,
                            });
                          }}
                        >
                          Upgrade
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 14 14"
                            fill="#1E96FC"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                              fill=""
                            />
                          </svg>
                        </div>
                      {:else}
                        <div>
                          {#if isSubscription}
                            <div
                              class="text-red-500 cursor-pointer"
                              on:click={() => (isOpenConfirmCancel = true)}
                            >
                              Cancel
                            </div>
                          {/if}
                        </div>
                      {/if}
                    {:else}
                      <div class="opacity-0">
                        {#if isSubscription}
                          remove me
                        {/if}
                      </div>
                    {/if}
                  </div> -->

                  <!-- remove me (flow manual) -->
                  <div class="font-medium text-2xl w-max">
                    {#if buyPackage === "Free" || (buyPackage === "Professional" && interval === "month") || (buyPackage === "Explorer" && interval === "month") || (buyPackage === "Explorer" && interval === "year")}
                      <div
                        class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                        on:click={() => {
                          selectedPackage({
                            plan: "Professional",
                            selectedTypePackage,
                            price: 82.5,
                            isNewUser: undefined,
                          });
                        }}
                      >
                        Upgrade
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 14 14"
                          fill="#1E96FC"
                          xmlns="http://www.w3.org/2000/svg"
                          ><path
                            d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                            fill=""
                          /></svg
                        >
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="w-full rounded-[10px] border border_0000000d">
        <table class="w-full table-auto">
          <tbody>
            {#each priceTable as item}
              {#if item.featureStatus === "main"}
                <tr class={`${$isDarkMode ? "bg-[#1C1C1C]" : "bg-gray-50"}`}>
                  <td colspan="8" class="py-4 px-3">
                    <div class="text-2xl text-left font-medium">
                      {item.title}
                    </div>
                  </td>
                </tr>
              {/if}
              {#if item.featureStatus === "part"}
                <tr class="group transition-all">
                  <td
                    class={`py-4 px-3 ${
                      $isDarkMode
                        ? "group-hover:bg-[#000]"
                        : "group-hover:bg-gray-100"
                    }`}
                  >
                    <div class="text-xl w-max">
                      {#if item.tippy.used}
                        <div
                          use:tooltip={{
                            content: getTooltipContent(
                              item.tippy.title,
                              item.tippy.content,
                              false,
                              $isDarkMode
                            ),
                            allowHTML: true,
                            placement: "top",
                            interactive: true,
                          }}
                          class="underline-dashed"
                        >
                          {item.title}
                        </div>
                      {:else}
                        {item.title}
                      {/if}
                    </div>
                  </td>

                  <td
                    class={`py-4 pr-6 flex justify-end ${
                      $isDarkMode
                        ? "group-hover:bg-[#000]"
                        : "group-hover:bg-gray-100"
                    }`}
                  >
                    {@html detailPackage(item)}
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <CompareTable />
  </div>

  <div class="flex flex-col gap-3 justify-center items-center mt-4">
    <div class="xl:text-base text-2xl font-normal">
      Enter your couple code to redeem exclusive access
    </div>
    <form
      on:submit|preventDefault={onSubmitCoupleCode}
      class="flex items-center gap-3"
    >
      <div
        class={`input-2 input-border w-full xl:py-[6px] py-3 px-3 ${
          code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
        }`}
      >
        <input
          type="text"
          id="code"
          name="code"
          required
          placeholder="Couple code"
          value=""
          class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
            code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
          } ${
            $isDarkMode ? "text-white" : "text-[#5E656B] placeholder-[#5E656B]"
          }`}
          on:keyup={({ target: { value } }) => (code = value)}
        />
      </div>
      <div class="w-[120px]">
        <Button
          type="submit"
          isLoading={isLoadingSubmitCoupleCode}
          disabled={isLoadingSubmitCoupleCode}
        >
          Apply
        </Button>
      </div>
    </form>
  </div>
</div>

<!-- Modal confirm cancel package -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenConfirmCancel}
  on:close={() => (isOpenConfirmCancel = false)}
>
  <div class="flex flex-col xl:gap-4 gap-10">
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">Are you sure?</div>
      <div class="xl:text-sm text-2xl text-gray-500">
        Your <span class="uppercase font-medium">{buyPackage}</span>
        Plan have
        <span class="font-medium">
          {dateDiffInDays(new Date(), new Date(endDatePackage))} days left.
        </span>
        Do you really want to cancel? This process cannot revert
      </div>
    </div>
    <div class="flex justify-end lg:gap-2 gap-6">
      <div class="lg:w-[120px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenConfirmCancel = false;
          }}
        >
          Cancel
        </Button>
      </div>
      <div class="lg:w-[120px] w-full">
        <Button
          variant="delete"
          isLoading={isLoadingCancel}
          on:click={handleCancelSubscription}
        >
          Submit
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

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
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
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

  .underline-dashed {
    text-decoration: underline 1.5px dotted;
    text-underline-offset: 3px;
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
