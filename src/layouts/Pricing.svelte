<script></script>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-7">
  <!-- Free -->
  <div class="flex flex-col gap-1">
    <div
      class={`text-center xl:text-sm text-base font-medium text-[#1e96fc] ${
        buyPackage === "Free" ? "opacity-100" : "opacity-0"
      }`}
    >
      Current Plan
    </div>
    <div
      class={`flex-1 border rounded-xl flex flex-col gap-4 p-4 ${
        buyPackage === "Free" ? "border-[#1e96fc]" : "border_0000001a"
      }`}
    >
      <div class="font-medium text-4xl xl:text-3xl">
        0$<span class="text-2xl xl:text-xl ml-1 text-gray-400 mb-[2px]"
          >/month</span
        >
      </div>
      <div>
        <div class="flex flex-col border-b-[1px] border_0000001a pb-4">
          <div class="font-medium text-3xl xl:text-xl">FREE</div>
          <div class="text-gray-500 text-2xl xl:text-lg">
            For those who starting to invest
          </div>
        </div>
        <div class="flex flex-col items-start gap-2 mt-4">
          <div
            class="underline cursor-pointer text-xl xl:text-base decoration-dotted"
            use:tooltip={{
              content: getTooltipContent(
                "Get latest market information and real-time market update",
                RealtimeVideo,
                false,
                $isDarkMode
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Real-time market update
          </div>
          <div class="text-xl xl:text-base">
            <span class="font-bold">3</span> tracked Wallets
          </div>
          <div class="text-xl xl:text-base">
            <span class="font-bold">$2 000</span> total net worth
          </div>
          <div
            class="underline cursor-pointer text-xl xl:text-base decoration-dotted"
            use:tooltip={{
              content: getTooltipContent(
                "Get up to 1000+ yield farming opportunities to boost your earning",
                YieldFarmingVideo,
                false,
                $isDarkMode
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Yield farming opportunities (Limited)
          </div>
          <div class="text-xl xl:text-base">Whales screeners</div>
          <div class="text-gray-400 text-xl xl:text-base">
            Custom token category
          </div>
          <div class="text-gray-400 text-xl xl:text-base">Risks analysis</div>
          <div class="text-gray-400 text-xl xl:text-base">Returns analysis</div>
          <div class="text-gray-400 text-xl xl:text-base">
            Risks & Returns analysis
          </div>
          <div class="text-gray-400 text-xl xl:text-base">
            Rebalance Strategy
          </div>
          <div class="text-gray-400 text-xl xl:text-base">
            Token Correlations matrix (soon)
          </div>
          <div class="text-gray-400 text-xl xl:text-base">
            Professional community
          </div>
          <!-- <div
              class={`flex items-center gap-2 mt-2 text-[#1E96FC] font-medium mt-5 xl:text-lg text-xl ${
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
                ><path
                  d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                  fill=""
                /></svg
              >
            </div> -->
        </div>
      </div>
    </div>
  </div>

  {#if selectedTypePackage === "month"}
    <!-- Explorer -->
    <div class="flex flex-col gap-1">
      <div
        class={`text-center xl:text-sm text-base font-medium text-[#1e96fc] ${
          buyPackage === "Explorer" && interval === "month"
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        Current Plan have
        <span class="font-medium"
          >{dateDiffInDays(new Date(), new Date(endDatePackage))} days left</span
        >
      </div>
      <div
        class={`flex-1 border rounded-xl flex flex-col gap-4 p-4 relative ${
          buyPackage === "Explorer" && interval === "month"
            ? "border-[#1e96fc]"
            : "border_0000001a"
        }`}
      >
        <div
          class="absolute top-6 right-0 rounded-tl-full rounded-bl-full bg-[#1E96FC] font-medium text-white xl:text-xs text-xl uppercase py-1 px-3"
        >
          popular
        </div>
        <ExplorerPlan {selectedTypePackage}>
          <!-- <div
              slot="button"
              class={`flex justify-between items-center w-full mt-2 text-[#1E96FC] font-medium mt-5 xl:text-lg text-xl ${
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
          <!-- <div slot="button" class="font-medium mt-5 xl:text-lg text-xl">
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
          <div slot="button" class="font-medium mt-5 xl:text-lg text-xl">
            {#if buyPackage === "Free"}
              <div
                class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                on:click={() => {
                  selectedPackage({
                    plan: "Explorer",
                    selectedTypePackage,
                    price: "$9.99",
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
        </ExplorerPlan>
      </div>
    </div>

    <!-- Professional -->
    <div class="flex flex-col gap-1">
      <div
        class={`text-center xl:text-sm text-base font-medium text-[#1e96fc] ${
          buyPackage === "Professional" && interval === "month"
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        Current Plan have
        <span class="font-medium"
          >{dateDiffInDays(new Date(), new Date(endDatePackage))} days left</span
        >
      </div>
      <div
        class={`flex-1 border rounded-xl flex flex-col gap-4 p-4 ${
          buyPackage === "Professional" && interval === "month"
            ? "border-[#1e96fc]"
            : "border_0000001a"
        }`}
      >
        <ProfessionalPlan {selectedTypePackage}>
          <!-- <div
              slot="button"
              class={`flex justify-between items-center w-full mt-2 text-[#1E96FC] font-medium mt-5 xl:text-lg text-xl ${
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
                    if (buyPackage === "Professional" && interval === "year") {
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
          <!-- <div slot="button" class="font-medium mt-5 xl:text-lg text-xl">
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
          <div slot="button" class="font-medium mt-5 xl:text-lg text-xl">
            {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "month")}
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
                  ><path
                    d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                    fill=""
                  /></svg
                >
              </div>
            {/if}
          </div>
        </ProfessionalPlan>
      </div>
    </div>
  {/if}

  {#if selectedTypePackage === "year"}
    <!-- Explorer -->
    <div class="flex flex-col gap-1">
      <div
        class={`text-center xl:text-sm text-base font-medium text-[#1e96fc] ${
          buyPackage === "Explorer" && interval === "year"
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        Current Plan have
        <span class="font-medium"
          >{dateDiffInDays(new Date(), new Date(endDatePackage))} days left</span
        >
      </div>
      <div
        class={`flex-1 border rounded-xl flex flex-col gap-4 p-4 relative ${
          buyPackage === "Explorer" && interval === "year"
            ? "border-[#1e96fc]"
            : "border_0000001a"
        }`}
      >
        <div
          class="absolute top-6 right-0 rounded-tl-full rounded-bl-full bg-[#1E96FC] font-medium text-white xl:text-xs text-xl uppercase py-1 px-3"
        >
          popular
        </div>
        <ExplorerPlan {selectedTypePackage}>
          <!-- <div
              slot="button"
              class={`flex justify-between items-center w-full mt-2 text-[#1E96FC] font-medium mt-5 xl:text-lg text-xl ${
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
          <!-- <div slot="button" class="font-medium mt-5 xl:text-lg text-xl">
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
          <div slot="button" class="font-medium mt-5 xl:text-lg text-xl">
            {#if buyPackage === "Free" || (buyPackage === "Explorer" && interval === "month") || (buyPackage === "Professional" && interval === "month")}
              <div
                class="flex items-center gap-2 cursor-pointer text-[#1E96FC]"
                on:click={() => {
                  selectedPackage({
                    plan: "Explorer",
                    selectedTypePackage,
                    price: "$8.25",
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
        </ExplorerPlan>
      </div>
    </div>

    <!-- Professional -->
    <div class="flex flex-col gap-1">
      <div
        class={`text-center xl:text-sm text-base font-medium text-[#1e96fc] ${
          buyPackage === "Professional" && interval === "year"
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        Current Plan have
        <span class="font-medium"
          >{dateDiffInDays(new Date(), new Date(endDatePackage))} days left</span
        >
      </div>
      <div
        class={`flex-1 border rounded-xl flex flex-col gap-4 p-4 ${
          buyPackage === "Professional" && interval === "year"
            ? "border-[#1e96fc]"
            : "border_0000001a"
        }`}
      >
        <ProfessionalPlan {selectedTypePackage}>
          <!-- <div
              slot="button"
              class={`flex justify-between items-center w-full mt-2 text-[#1E96FC] font-medium mt-5 xl:text-lg text-xl ${
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
          <!-- <div slot="button" class="font-medium mt-5 xl:text-lg text-xl">
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
          <div slot="button" class="font-medium mt-5 xl:text-lg text-xl">
            {#if buyPackage === "Free" || (buyPackage === "Professional" && interval === "month") || (buyPackage === "Explorer" && interval === "month") || (buyPackage === "Explorer" && interval === "year")}
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
                  ><path
                    d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                    fill=""
                  /></svg
                >
              </div>
            {/if}
          </div>
        </ProfessionalPlan>
      </div>
    </div>
  {/if}
</div>

<style></style>
