<script lang="ts">
  import {
    user,
    typeWallet,
    isDarkMode,
    isShowModalNftList,
    isShowModalNftDeList,
    listingNft,
    selectedNftContractAddress,
  } from "~/store";

  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Image from "~/components/Image.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let item;
  export let nativeToken;
  export let marketPrice;
  export let floorPrice;

  $: profitAndLoss =
    Number(item?.price || 0) === 0
      ? 0
      : Number(floorPrice) - Number(item?.price);

  $: profitAndLossPercent =
    Math.abs(Number(item?.price || 0)) === 0
      ? 0
      : (profitAndLoss * marketPrice) / Math.abs(Number(item?.cost));
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 w-[220px] ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="flex items-center gap-4">
      <div class="flex-1 xl:text-sm text-2xl font-medium">
        {item?.name ? item?.name : "N/A"}
      </div>
      <div class="w-12 h-12 rounded-md border border-gray-300 overflow-hidden">
        <Image
          logo={item?.imageUrl}
          defaultLogo="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text_00000099 font-medium flex flex-col items-end gap-1"
    >
      <div class="w-max flex items-center gap-1">
        <TooltipNumber number={Number(item?.price || 0)} type="balance" />
        <div>{nativeToken?.symbol || ""}</div>
      </div>
      <div class="w-max">
        <TooltipNumber number={Number(item?.cost || 0)} type="value" />
      </div>
    </div>
  </td>

  {#if $user && Object.keys($user).length !== 0}
    <td
      class={`py-3 ${
        $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
      } ${
        $typeWallet === "SOL" ||
        ($typeWallet === "BUNDLE" && nativeToken?.symbol === "SOL")
          ? ""
          : "pr-3"
      }`}
    >
      <div
        class="flex items-center justify-end gap-1 xl:text-sm text-2xl font-medium"
      >
        <div class="flex flex-col">
          <div
            class={`flex justify-end gap-1 ${
              profitAndLoss !== 0
                ? profitAndLoss >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber number={Math.abs(profitAndLoss)} type="balance" />
            <div>
              {nativeToken?.symbol || ""}
            </div>
          </div>

          <div
            class={`flex justify-end ${
              profitAndLoss !== 0
                ? profitAndLoss >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber
              number={Math.abs(profitAndLoss) * marketPrice}
              type="value"
            />
          </div>

          <div class="flex items-center justify-end gap-1">
            <div
              class={`flex items-center ${
                profitAndLossPercent !== 0
                  ? profitAndLossPercent >= 0
                    ? "text-[#00A878]"
                    : "text-red-500"
                  : "text_00000099"
              }`}
            >
              <TooltipNumber
                number={Math.abs(profitAndLossPercent) * 100}
                type={Math.abs(Number(profitAndLossPercent)) > 100
                  ? "balance"
                  : "percent"}
              />
              <span>%</span>
            </div>
            {#if profitAndLossPercent !== 0}
              <img
                src={profitAndLossPercent >= 0 ? TrendUp : TrendDown}
                alt="trend"
                class="mb-1"
              />
            {/if}
          </div>
        </div>
      </div>
    </td>

    {#if $typeWallet === "SOL" || ($typeWallet === "BUNDLE" && nativeToken?.symbol === "SOL")}
      <td
        class={`py-3 pr-3 ${
          $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
        }`}
      >
        <div class="flex items-center justify-end">
          {#if item?.listing}
            <div
              class="text-2xl font-semibold text-red-600 transition-all cursor-pointer hover:underline xl:text-base"
              on:click={() => {
                selectedNftContractAddress.update(
                  (n) => (n = item?.contractAddress)
                );
                listingNft.update((n) => (n = item?.listing));
                isShowModalNftDeList.update((n) => (n = true));
              }}
            >
              De-list
            </div>
          {:else}
            <div
              class="text-2xl font-semibold text-blue-600 transition-all cursor-pointer hover:underline xl:text-base"
              on:click={() => {
                selectedNftContractAddress.update(
                  (n) => (n = item?.contractAddress)
                );
                isShowModalNftList.update((n) => (n = true));
              }}
            >
              List
            </div>
          {/if}
        </div>
      </td>
    {/if}
  {:else}
    <td class="py-3 pr-3">
      <div
        class="flex items-center justify-end gap-1 xl:text-sm text-2xl font-medium"
      >
        <div class="flex flex-col">
          <div
            class={`flex justify-end gap-1 ${
              profitAndLoss !== 0
                ? profitAndLoss >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber number={Math.abs(profitAndLoss)} type="balance" />
            <div>
              {nativeToken?.symbol || ""}
            </div>
          </div>

          <div
            class={`flex justify-end ${
              profitAndLoss !== 0
                ? profitAndLoss >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber
              number={Math.abs(profitAndLoss) * marketPrice}
              type="value"
            />
          </div>

          <div class="flex items-center justify-end gap-1">
            <div
              class={`flex items-center ${
                profitAndLossPercent !== 0
                  ? profitAndLossPercent >= 0
                    ? "text-[#00A878]"
                    : "text-red-500"
                  : "text_00000099"
              }`}
            >
              <TooltipNumber
                number={Math.abs(profitAndLossPercent) * 100}
                type={Math.abs(Number(profitAndLossPercent)) > 100
                  ? "balance"
                  : "percent"}
              />
              <span>%</span>
            </div>
            {#if profitAndLossPercent !== 0}
              <img
                src={profitAndLossPercent >= 0 ? TrendUp : TrendDown}
                alt="trend"
                class="mb-1"
              />
            {/if}
          </div>
        </div>
      </div>
    </td>
  {/if}
</tr>

<style>
</style>
