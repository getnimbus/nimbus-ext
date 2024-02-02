<script lang="ts">
  import { getTooltipContent } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { isDarkMode, user } from "~/store";

  import tooltip from "~/entries/contentScript/views/tooltip";
  import { priceTable } from "~/UI/PricePackage/DataTable";
  import CompareTable from "~/UI/PricePackage/CompareTable.svelte";

  export let selectedPackage = (item) => {};

  let selectedPricePackage = "Free";
  let buyPackage = "Free";
  let interval = "month";
  let endDatePackage = "";
  let checkedTypePackage = true;

  const dateDiffInDays = (a, b) => {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("evm_token");
    },
  });

  $: {
    if (!$query.isError && $query.data !== undefined) {
      selectedPricePackage = $query.data.plan?.tier;
      buyPackage = $query.data.plan?.tier;
      interval = $query.data.plan?.interval;
      endDatePackage = $query.data.plan?.endDate;
    }
  }

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

  $: selectedTypePackage = checkedTypePackage ? "year" : "month";
</script>

<div class="flex flex-col xl:gap-4 gap-8">
  <div
    class="p-4 text-2xl text-green-600 rounded-lg xl:text-base bg-green-50"
    role="alert"
  >
    <span class="mr-2 xl:mr-1">⭐️</span> We're giving 1000 coupon codes
    <span class="font-bold">EARLY-BIRD</span>
    which get <span class="font-bold">30%</span> off for the first-time payment.
  </div>

  <div class="flex flex-col gap-10 mt-4">
    <!-- Pricing Table PC -->
    <div class="xl:block hidden rounded-[10px] border border_0000000d">
      <table class="table-auto w-full">
        <thead>
          <tr class="bg_f4f5f8">
            <th class="py-3 pl-3 rounded-tl-[10px] w-[420px]">
              <div class="flex flex-col items-start">
                <div class="text-left text-lg uppercase font-medium">Plans</div>
                <div class="text-center text-base font-medium text-[#1e96fc]">
                  {#if buyPackage !== "Free"}
                    Your <span class="uppercase"
                      >{buyPackage === "Professional"
                        ? "Alpha"
                        : buyPackage}</span
                    >
                    plan has
                    <span class="font-medium"
                      >{dateDiffInDays(new Date(), new Date(endDatePackage))} days
                      left</span
                    >
                  {:else}
                    Your plan is Free
                  {/if}
                </div>
              </div>
            </th>

            <th class="py-3 pr-3 h-full">
              <div class="text-left text-lg uppercase font-medium pb-6">
                Free
              </div>
            </th>

            <th class="py-3 pr-3">
              <div class="flex items-center gap-2 pb-6">
                <div class="text-lg uppercase font-medium">Explorer</div>
                {#if selectedTypePackage === "year"}
                  <div
                    class="text-white font-normal text-sm px-2 py-1 bg-[#10b981] rounded-lg"
                  >
                    Save 1.75 USDC
                  </div>
                {:else}
                  <div class="h-[28px]" />
                {/if}
              </div>
            </th>

            <th class="py-3 px-3 rounded-tr-[10px]">
              <div class="flex items-center gap-2 pb-6">
                <div class="text-lg uppercase font-medium">Alpha</div>
                {#if selectedTypePackage === "year"}
                  <div
                    class="text-white font-normal text-sm px-2 py-1 bg-[#10b981] rounded-lg"
                  >
                    Save 17.5 USDC
                  </div>
                {:else}
                  <div class="h-[28px]" />
                {/if}
              </div>
            </th>
          </tr>

          <tr class="bg_f4f5f8">
            <td class="py-3 pl-3 w-[420px]">
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3">
                  <label class="switch">
                    <input type="checkbox" bind:checked={checkedTypePackage} />
                    <span class="slider" />
                  </label>
                  <div class="text-base font-medium">
                    Annual Billing <span class="text-green-500">(Save 17%)</span
                    >
                  </div>
                </div>
                <div class=" min-h-[30px]"></div>
              </div>
            </td>

            <!-- Free -->
            <td class="py-3 pr-3">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <div class="text-3xl font-semibold">0 USDC</div>
                  <div class="text-base font-medium">
                    For those who starting to invest
                  </div>
                </div>

                <div class=" min-h-[30px]"></div>
              </div>
            </td>

            <!-- Explorer -->
            <td class="py-3 pr-3">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-1 text-3xl font-semibold">
                    {selectedTypePackage === "year" ? "8.25 USDC" : "9.99 USDC"}
                    <div class="text-base font-medium text-[#6b7380]">
                      /month
                    </div>
                  </div>
                  <div class="text-base font-medium">
                    Boost your return and reduce your risk
                  </div>
                </div>

                {#if Object.keys($user).length !== 0}
                  <div class="w-max flex items-center min-h-[30px]">
                    {#if selectedTypePackage === "month"}
                      <div class="font-medium text-lg">
                        {#if buyPackage === "Free"}
                          <div
                            class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                            on:click={() => {
                              selectedPackage({
                                plan: "Explorer",
                                selectedTypePackage,
                                price: 9.99,
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
                      <div class="font-medium text-lg">
                        {#if buyPackage === "Free"}
                          <div
                            class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                            on:click={() => {
                              selectedPackage({
                                plan: "Explorer",
                                selectedTypePackage,
                                price: 8.25,
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
                {/if}
              </div>
            </td>

            <!-- Professional -->
            <td class="py-3 px-3">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-1 text-3xl font-semibold">
                    {selectedTypePackage === "year"
                      ? "82.5 USDC"
                      : "99.99 USDC"}
                    <div class="text-base font-medium text-[#6b7380]">
                      /month
                    </div>
                  </div>
                  <div class="text-base font-medium">
                    Enjoy all the features without any limited
                  </div>
                </div>

                {#if Object.keys($user).length !== 0}
                  <div class="w-max flex items-center min-h-[30px]">
                    {#if selectedTypePackage === "month"}
                      <div class="font-medium text-lg">
                        {#if buyPackage === "Free"}
                          <div
                            class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                            on:click={() => {
                              selectedPackage({
                                plan: "Professional",
                                selectedTypePackage,
                                price: 99.99,
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
                      <div class="font-medium text-lg">
                        {#if buyPackage === "Free"}
                          <div
                            class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                            on:click={() => {
                              selectedPackage({
                                plan: "Professional",
                                selectedTypePackage,
                                price: 82.5,
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
                {/if}
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
        <div class="text-center text-3xl font-medium text-[#1e96fc]">
          {#if buyPackage !== "Free"}
            Your <span class="uppercase"
              >{buyPackage === "Professional" ? "Alpha" : buyPackage}</span
            >
            plan has
            <span class="font-medium"
              >{dateDiffInDays(new Date(), new Date(endDatePackage))} days left</span
            >
          {:else}
            Your plan is Free
          {/if}
        </div>

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
                <span class="text-5xl font-semibold">0 USDC</span>
                <div class="text-lg">For those who starting to invest</div>
              </div>
              <div class=" min-h-[30px]"></div>
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
                  {selectedTypePackage === "year"
                    ? "8.25 USDC"
                    : "9.99 USDC"}{" "}
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
                  <div class="font-medium text-2xl">
                    {#if buyPackage === "Free"}
                      <div
                        class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                        on:click={() => {
                          selectedPackage({
                            plan: "Explorer",
                            selectedTypePackage,
                            price: 9.99,
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
                  <div class="font-medium text-2xl">
                    {#if buyPackage === "Free"}
                      <div
                        class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                        on:click={() => {
                          selectedPackage({
                            plan: "Explorer",
                            selectedTypePackage,
                            price: 8.25,
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
                      Save 17.5 USDC
                    </span>
                  {/if}
                </div>
                <div class="text-5xl font-medium">
                  {selectedTypePackage === "year"
                    ? "82.5 USDC"
                    : "99.99 USDC"}{" "}
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
                  <div class="font-medium text-2xl w-max">
                    {#if buyPackage === "Free"}
                      <div
                        class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                        on:click={() => {
                          selectedPackage({
                            plan: "Professional",
                            selectedTypePackage,
                            price: 99.99,
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
                  <div class="font-medium text-2xl w-max">
                    {#if buyPackage === "Free"}
                      <div
                        class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                        on:click={() => {
                          selectedPackage({
                            plan: "Professional",
                            selectedTypePackage,
                            price: 82.5,
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
</div>

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
