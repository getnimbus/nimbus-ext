<script lang="ts">
  import { useNavigate } from "svelte-navigator";
  import { shorterName, detectedChain } from "~/utils";
  import { typeWallet, isDarkMode } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import "~/components/Tooltip.custom.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import OverlaySidebar from "./OverlaySidebar.svelte";
  import NftDetailSidebar from "~/UI/NFTDetail/NFTDetailSidebar.svelte";
  import Copy from "~/components/Copy.svelte";
  import Image from "~/components/Image.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "./Button.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
  export let selectedWallet;
  export let index;
  export let lastIndex: boolean = false;

  const navigate = useNavigate();

  const MultipleLang = {
    content: {
      modal_cancel: i18n(
        "optionsPage.accounts-page-content.modal-cancel",
        "Cancel"
      ),
      modal_submitreport: i18n(
        "optionsPage.accounts-page-content.modal-submitreport",
        "Report"
      ),
    },
  };

  const reasonReport = [
    {
      id: "trash",
      content: "This token is trash 🗑️",
    },
    {
      id: "scam",
      content: "This token is the scam 🤬",
    },
    {
      id: "hate",
      content: "I hate this token 😠",
    },
  ];

  let showTooltipListNFT = false;
  let isShowTooltipName = false;

  let showSideNftDetail = false;

  let selectedNftCollectionId;
  let selectedNftCollectionChain;

  let isShowReportTable = false;
  let isOldToken = false;
  let reportReasonList = [];
  let isLoadingReportTrashCoin = false;

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
    isSuccessToast = false;
  };

  const closeSideNFTDetail = (event) => {
    if (event.key === "Escape") {
      showSideNftDetail = false;
    }
  };

  const handleReportTrashCoin = async () => {
    isLoadingReportTrashCoin = true;
    try {
      let reason = "";

      if (document.getElementById("trash").checked) {
        reason += "Trash Token, ";
      }

      if (document.getElementById("hate").checked) {
        reason += "Hate Token, ";
      }

      if (document.getElementById("scam").checked) {
        reason += "Scam Token, ";
      }

      if (document.getElementById("outdated").checked) {
        reason += document.getElementById("reason").value;
      }

      const formData = {
        chain: document.getElementById("chain").value,
        contractAddress: document.getElementById("contract_address").value,
        reason: reason,
        contractName: data.name,
        contractTickerSymbol: data.symbol,
        logoUrl: data.logo,
      };
      await nimbus.post("/holding/trash/report", formData);
      isLoadingReportTrashCoin = false;
      toastMsg = "We will update after 2 minutes.";
      isSuccessToast = true;
    } catch (error) {
      isLoadingReportTrashCoin = false;
      toastMsg = "Something wrong when report token. Please try again!";
      isSuccessToast = false;
      console.error("error:", error);
    } finally {
      isShowReportTable = false;
      trigger();
    }
  };

  $: totalCost = data?.tokens?.reduce(
    (prev, item) => prev + Number(item.cost),
    0
  );

  $: totalNativeTokenPrice = data?.tokens?.reduce(
    (prev, item) => prev + Number(item.price),
    0
  );

  $: profitAndLoss =
    totalNativeTokenPrice === 0
      ? 0
      : data?.current_native_token - (totalNativeTokenPrice || 0);

  $: profitAndLossPercent =
    totalNativeTokenPrice === 0
      ? 0
      : (profitAndLoss * data?.marketPrice) / Math.abs(totalCost);

  $: {
    if (!showSideNftDetail) {
      selectedNftCollectionId = undefined;
      selectedNftCollectionChain = undefined;
    }
  }
</script>

<svelte:window on:keydown={closeSideNFTDetail} />

<tr
  class={`group transition-all cursor-pointer ${
    index === 0 && "view-nft-detail"
  } `}
  on:click={() => {
    showSideNftDetail = true;
    selectedNftCollectionId = data?.collectionId;
    selectedNftCollectionChain = data?.nativeToken?.symbol;
    mixpanel.track("nft_detail_page", {
      address: selectedWallet,
      collection_type: data.collectionId,
    });
  }}
>
  <td
    class={`pl-3 py-3 xl:static xl:bg-transparent sticky left-0 z-10 w-[220px] ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
    style={`${lastIndex ? "border-bottom-left-radius: 10px;" : ""}`}
  >
    <div class="relative flex flex-col gap-1">
      <div
        class="xl:text-sm text-2xl font-medium flex justify-start relative"
        on:mouseover={() => {
          isShowTooltipName = true;
        }}
        on:mouseleave={() => (isShowTooltipName = false)}
      >
        {data?.collection?.name
          ? data?.collection?.name.length > 24
            ? shorterName(data?.collection?.name, 20)
            : data?.collection?.name
          : "N/A"}
        {#if isShowTooltipName && data?.collection?.name?.length > 24}
          <div class="absolute -top-8 left-0" style="z-index: 2147483648;">
            <tooltip-detail text={data?.collection?.name} />
          </div>
        {/if}
      </div>
      {#if ($typeWallet === "EVM" || $typeWallet === "BUNDLE") && data?.nativeToken?.symbol !== "CEX"}
        <img
          src={detectedChain(data?.nativeToken?.symbol)}
          alt=""
          width="20"
          height="20"
          class="rounded-full"
        />
      {/if}
    </div>
  </td>

  <td
    class={`py-3 xl:static xl:bg-transparent sticky left-[220px] z-10 w-[200px] ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="relative">
      <div
        class="flex justify-start w-max"
        on:mouseenter={() => (showTooltipListNFT = true)}
        on:mouseleave={() => (showTooltipListNFT = false)}
      >
        {#if data?.tokens?.length > 5}
          {#each data?.tokens.slice(0, 4) as token, index}
            <div
              class={`xl:w-9 xl:h-9 w-12 h-12 rounded-md border border-gray-300 overflow-hidden ${
                index > 0 && "-ml-2"
              }`}
            >
              <Image
                logo={token?.imageUrl}
                defaultLogo="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
              />
            </div>
          {/each}
          <div class="relative xl:w-9 xl:h-9 w-12 h-12">
            <div
              class="xl:w-9 xl:h-9 w-12 h-12 rounded-md border border-gray-300 overflow-hidden -ml-2"
            >
              <Image
                logo={data?.tokens[4].imageUrl}
                defaultLogo="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
              />
            </div>
            <div
              class="absolute top-0 -left-2 w-full h-full bg-[#00000066] text-white text-center flex justify-center items-center pb-2 rounded-md"
            >
              ...
            </div>
          </div>
          {#if showTooltipListNFT && data?.tokens?.length > 5}
            <div class="absolute -top-7 left-0" style="z-index: 2147483648;">
              <tooltip-detail
                text={`${data?.tokens?.length} NFTs on collection ${data?.collection?.name}`}
              />
            </div>
          {/if}
        {:else}
          {#each data?.tokens as token, index}
            <div
              class={`xl:w-9 xl:h-9 w-12 h-12 rounded-md border border-gray-300 overflow-hidden ${
                index > 0 && "-ml-2"
              }`}
            >
              <Image
                logo={token?.imageUrl}
                defaultLogo="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
              />
            </div>
          {/each}
        {/if}
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
        <TooltipNumber number={Number(data?.floorPrice)} type="balance" />
        <div>{data?.nativeToken?.symbol || ""}</div>
      </div>
      <div class="w-max">
        <TooltipNumber
          number={Number(data?.floorPrice) * data?.marketPrice}
          type="value"
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
        <TooltipNumber number={totalNativeTokenPrice} type="balance" />
        <div>
          {data?.nativeToken?.symbol || ""}
        </div>
      </div>
      <div class="w-max">
        <TooltipNumber number={totalCost} type="value" />
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
        <TooltipNumber
          number={Number(data?.current_native_token)}
          type="balance"
        />
        <div>
          {data?.nativeToken?.symbol || ""}
        </div>
      </div>
      <TooltipNumber
        number={Number(data?.current_native_token) * data?.marketPrice}
        type="value"
      />
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
    style={`${lastIndex ? "border-bottom-right-radius: 10px;" : ""}`}
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
            {data?.nativeToken?.symbol || ""}
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
            number={Math.abs(profitAndLoss) * data?.marketPrice}
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
</tr>

<!-- Modal report spam/trash token  -->
<AppOverlay
  clickOutSideToClose
  isOpen={isShowReportTable}
  on:close={() => {
    isShowReportTable = false;
    isOldToken = false;
  }}
>
  <div class="flex flex-col gap-4">
    <div class="font-medium xl:title-3 title-1">Blacklist Token</div>
    <form
      on:submit|preventDefault={handleReportTrashCoin}
      class="flex flex-col gap-10 xl:gap-3"
    >
      <div class="flex flex-col gap-6 xl:gap-3">
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
        >
          <div
            class={`xl:text-base text-2xl font-medium ${
              $isDarkMode ? "text-gray-400" : "text-[#666666]"
            }`}
          >
            Chain
          </div>
          <input
            type="text"
            id="chain"
            name="chain"
            value={data.chain}
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
              !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            } ${
              $isDarkMode
                ? "text-white"
                : "text-[#5E656B] placeholder-[#5E656B]"
            }`}
            disabled
          />
        </div>

        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
        >
          <div
            class={`xl:text-base text-2xl font-medium ${
              $isDarkMode ? "text-gray-400" : "text-[#666666]"
            }`}
          >
            Contract Address
          </div>
          <input
            type="text"
            id="contract_address"
            name="contract_address"
            value={data.contractAddress}
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
              !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            } ${
              $isDarkMode
                ? "text-white"
                : "text-[#5E656B] placeholder-[#5E656B]"
            }`}
            disabled
          />
        </div>

        <div
          class={`flex flex-col gap-3 input-2 input-border w-full py-[8px] px-3 ${
            (reportReasonList.length !== 0 || isOldToken) && !$isDarkMode
              ? "bg-[#F0F2F7]"
              : "bg_fafafbff"
          }`}
        >
          <div class="xl:text-base text-2xl text-[#666666] font-medium">
            Reason
          </div>

          {#each reasonReport as item}
            <div class="flex items-center gap-2 cursor-pointer w-max">
              <input
                type="checkbox"
                name={item.id}
                id={item.id}
                value={item.id}
                bind:group={reportReasonList}
                class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
              />
              <label
                for={item.id}
                class="xl:text-sm text-2xl font-normal text-[#5E656B] cursor-pointer"
              >
                {item.content}
              </label>
            </div>
          {/each}

          <div class="flex items-center gap-2 cursor-pointer w-max">
            <input
              type="checkbox"
              name="outdated"
              id="outdated"
              class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
              on:change={(e) => {
                isOldToken = e.target.checked;
              }}
            />
            <label
              for="outdated"
              class="xl:text-sm text-2xl font-normal text-[#5E656B] cursor-pointer"
            >
              The token is outdate
            </label>
          </div>

          {#if isOldToken}
            <textarea
              placeholder="Please type info about that token"
              rows="5"
              id="reason"
              name="reason"
              class={`mb-2 p-0 input-2 input-border w-full py-[6px] px-3 focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
                !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
              } ${
                $isDarkMode
                  ? "text-white"
                  : "text-[#5E656B] placeholder-[#5E656B]"
              }`}
            />
          {/if}
        </div>

        <div class="flex justify-end gap-6 lg:gap-2">
          <div class="xl:w-[120px] w-full">
            <Button
              variant="secondary"
              on:click={() => {
                isShowReportTable = false;
                isOldToken = false;
              }}
            >
              {MultipleLang.content.modal_cancel}</Button
            >
          </div>
          <div class="xl:w-[120px] w-full">
            <Button
              type="submit"
              variant="tertiary"
              isLoading={isLoadingReportTrashCoin}
              disabled={isLoadingReportTrashCoin}
            >
              {MultipleLang.content.modal_submitreport}</Button
            >
          </div>
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

<!-- Sidebar NFT Detail -->
<OverlaySidebar isOpen={showSideNftDetail}>
  <div class="flex justify-between items-start">
    <div
      class="xl:text-5xl text-6xl text-gray-500 cursor-pointer"
      on:click|stopPropagation={() => {
        showSideNftDetail = false;
      }}
    >
      &times;
    </div>
    <div class="flex flex-col items-end">
      <div class="xl:text-3xl text-4xl font-semibold">
        {data?.collection?.name || "-"}
      </div>
      <div class="text-3xl xl:text-xl">
        <Copy
          address={data?.tokens[0]?.contractAddress}
          isShorten
          iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
          color={`${$isDarkMode ? "#fff" : "#000"}`}
        />
      </div>
    </div>
  </div>
  <NftDetailSidebar
    {selectedNftCollectionId}
    {selectedNftCollectionChain}
    collectionId={data.collectionId}
    addressWallet={selectedWallet}
  />
</OverlaySidebar>

{#if showToast}
  <div class="fixed z-30 w-full top-3 right-3">
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

<style windi:preflights:global windi:safelist:global>
</style>
