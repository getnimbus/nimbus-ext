<script lang="ts">
  import { i18n } from "~/lib/i18n";
  import { isDarkMode, user } from "~/store";
  import { nimbus } from "~/lib/network";
  import { Toast } from "flowbite-svelte";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { shorterName } from "~/utils";

  import Image from "~/components/Image.svelte";
  import Button from "~/components/Button.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Loading from "~/components/Loading.svelte";
  import Copy from "~/components/Copy.svelte";
  import Tooltip from "~/components/Tooltip.svelte";

  import defaultToken from "~/assets/defaultToken.png";

  const MultipleLang = {
    content: {
      chain_header_table: i18n(
        "optionsPage.token-tab-content.chain-header-table",
        "Chain"
      ),
      contract_address_header_table: i18n(
        "optionsPage.contract-address-tab-content.contract-address-header-table",
        "Contract Address"
      ),
      assets_header_table: i18n(
        "optionsPage.assets-page-content.assets-header-table",
        "Assets"
      ),
      action_header_table: i18n(
        "optionsPage.assets-page-content.action-header-table",
        "Action"
      ),
      modal_cancel: i18n(
        "optionsPage.assets-page-content.modal-cancel",
        "Cancel"
      ),
      modal_delete: i18n(
        "optionsPage.assets-page-content.modal-delete",
        "Delete"
      ),
      modal_delete_title: i18n(
        "optionsPage.assets-page-content.modal-delete-title",
        "Are you sure?"
      ),
      modal_delete_sub_title: i18n(
        "optionsPage.assets-page-content.modal-token-delete-sub-title",
        "Do you really want to delete this token report?"
      ),
    },
  };

  let selectedItemDelete;
  let isOpenConfirmDelete = false;
  let isLoadingDelete = false;

  let show = false;
  let counter = 3;
  let toastMsg = "";
  let isSuccess = false;

  let selectedItemIndex = -1;
  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;

  const queryClient = useQueryClient();

  const trigger = () => {
    show = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    show = false;
    toastMsg = "";
    isSuccess = false;
  };

  const handleDataReportToken = async () => {
    const response = await nimbus.get("/holding/trash?type=token");
    return response.data;
  };

  $: query = createQuery({
    queryKey: ["token-report"],
    queryFn: () => handleDataReportToken(),
    staleTime: Infinity,
    retry: false,
    enabled: $user && Object.keys($user).length !== 0,
    onError(err) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("solana_token");
      localStorage.removeItem("sui_token");
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  const handleDeleteReportToken = async () => {
    isLoadingDelete = true;
    try {
      await nimbus.delete("/holding/trash/revert", selectedItemDelete);
      queryClient.refetchQueries(["token-report"]);
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
      toastMsg = "Successfully delete your token report!";
      isSuccess = true;
      trigger();
    } catch (e) {
      console.error("e: ", e);
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
      toastMsg = "Something wrong when delete your token. Please try again!";
      isSuccess = false;
      trigger();
    }
  };
</script>

<!-- Desktop View -->
<div
  class={`xl:block hidden border border_0000000d rounded-[10px] overflow-x-auto h-full ${
    $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
  }`}
>
  <table class="table-auto xl:w-full w-[1800px] h-full">
    <thead>
      <tr class="bg_f4f5f8">
        <th class="py-3 pl-3">
          <div class="text-xl font-semibold uppercase xl:text-xs text-left">
            {MultipleLang.content.assets_header_table}
          </div>
        </th>

        <th class="py-3">
          <div class="text-xl font-semibold uppercase xl:text-xs text-left">
            {MultipleLang.content.contract_address_header_table}
          </div>
        </th>

        <th class="py-3">
          <div class="text-xl font-semibold text-right uppercase xl:text-xs">
            {MultipleLang.content.chain_header_table}
          </div>
        </th>

        <th class="py-3 pr-3">
          <div class="text-xl font-semibold text-right uppercase xl:text-xs">
            {MultipleLang.content.action_header_table}
          </div>
        </th>
      </tr>
    </thead>

    {#if $query.isError}
      <tbody>
        <tr>
          <td colspan="4">
            <div class="flex items-center justify-center h-full px-3 py-4">
              Please connect wallet
            </div>
          </td>
        </tr>
      </tbody>
    {:else if $query.isLoading}
      <tbody>
        <tr>
          <td colspan="4">
            <div class="flex items-center justify-center h-full px-3 py-4">
              <Loading />
            </div>
          </td>
        </tr>
      </tbody>
    {:else}
      <tbody>
        {#if ($query.data && $query.data.length === 0) || $query.isError}
          <tr>
            <td colspan="4">
              <div
                class="flex items-center justify-center h-full px-3 py-4 text-base"
              >
                No report tokens
              </div>
            </td>
          </tr>
        {:else}
          {#each $query.data as item, index}
            <tr class="group transition-all">
              <td
                class={`pl-3 py-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div class="flex items-center justify-start gap-2">
                  <div class="w-6 h-6 rounded-full overflow-hidden">
                    <Image logo={item?.logoUrl} defaultLogo={defaultToken} />
                  </div>
                  <div class="flex flex-col">
                    <div
                      class="relative font-medium text-base"
                      on:mouseover={() => {
                        selectedItemIndex = index;
                        isShowTooltipName = true;
                      }}
                      on:mouseleave={() => {
                        selectedItemIndex = -1;
                        isShowTooltipName = false;
                      }}
                    >
                      {#if item.contractName === undefined}
                        N/A
                      {:else}
                        {item.contractName.length > 20
                          ? shorterName(item.contractName, 20)
                          : item.contractName}
                      {/if}
                      {#if isShowTooltipName && selectedItemIndex === index && item.contractName.length > 20}
                        <div
                          class="absolute left-0 -top-8"
                          style="z-index: 2147483648;"
                        >
                          <Tooltip text={item.contractName} />
                        </div>
                      {/if}
                    </div>
                    <div
                      class="relative font-medium text_00000080 text-xs"
                      on:mouseover={() => {
                        selectedItemIndex = index;
                        isShowTooltipSymbol = true;
                      }}
                      on:mouseleave={() => {
                        selectedItemIndex = -1;
                        isShowTooltipSymbol = false;
                      }}
                    >
                      {#if item.contractTickerSymbol === undefined}
                        N/A
                      {:else}
                        {shorterName(item.contractTickerSymbol, 20)}
                      {/if}
                      {#if isShowTooltipSymbol && selectedItemIndex === index && item.contractTickerSymbol.length > 20}
                        <div
                          class="absolute left-0 -top-8"
                          style="z-index: 2147483648;"
                        >
                          <Tooltip text={item.contractTickerSymbol} />
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </td>

              <td
                class={`py-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div class="xl:text-base text-2xl text-left">
                  {item.contractAddress}
                </div>
              </td>

              <td
                class={`py-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div class="xl:text-base text-2xl text-right">
                  {item.chain}
                </div>
              </td>

              <td
                class={`py-3 pr-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div
                  class="xl:text-base text-2xl font-semibold text-red-600 transition-all cursor-pointer hover:underline dark:text-red-500 text-right"
                  on:click={() => {
                    selectedItemDelete = {
                      chain: item.chain,
                      contractAddress: item.contractAddress,
                      type: "token",
                    };
                    isOpenConfirmDelete = true;
                  }}
                >
                  {MultipleLang.content.modal_delete}
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    {/if}
  </table>
</div>

<!-- Mobile View -->
<div class="xl:hidden block">
  {#if $query.isError}
    <div class="flex items-center justify-center h-full px-3 py-4 text-base">
      Please connect wallet
    </div>
  {:else if $query.isLoading}
    <div class="flex items-center justify-center h-full px-3 py-4">
      <Loading />
    </div>
  {:else}
    <div class="flex flex-col">
      {#if ($query.data && $query.data.length === 0) || $query.isError}
        <div
          class="flex items-center justify-center h-full px-3 py-4 text-base"
        >
          No report tokens
        </div>
      {:else}
        {#each $query.data as item}
          <div
            class="flex flex-col gap-4 py-2 border-b-[1px] border_0000000d last:border-none"
          >
            <div class="flex justify-between items-start">
              <div class="text-sm font-medium flex justify-end gap-1">
                <div class="flex items-center justify-start gap-2">
                  <div class="w-6 h-6 rounded-full overflow-hidden">
                    <Image logo={item?.logoUrl} defaultLogo={defaultToken} />
                  </div>
                  <div class="flex flex-col">
                    <div
                      class="relative font-medium text-base"
                      on:mouseover={() => {
                        selectedItemIndex = index;
                        isShowTooltipName = true;
                      }}
                      on:mouseleave={() => {
                        selectedItemIndex = -1;
                        isShowTooltipName = false;
                      }}
                    >
                      {#if item.contractName === undefined}
                        N/A
                      {:else}
                        {item.contractName.length > 20
                          ? shorterName(item.contractName, 20)
                          : item.contractName}
                      {/if}
                      {#if isShowTooltipName && selectedItemIndex === index && item.contractName.length > 20}
                        <div
                          class="absolute left-0 -top-8"
                          style="z-index: 2147483648;"
                        >
                          <Tooltip text={item.contractName} />
                        </div>
                      {/if}
                    </div>
                    <div
                      class="relative font-medium text_00000080 text-xs"
                      on:mouseover={() => {
                        selectedItemIndex = index;
                        isShowTooltipSymbol = true;
                      }}
                      on:mouseleave={() => {
                        selectedItemIndex = -1;
                        isShowTooltipSymbol = false;
                      }}
                    >
                      {#if item.contractTickerSymbol === undefined}
                        N/A
                      {:else}
                        {shorterName(item.contractTickerSymbol, 20)}
                      {/if}
                      {#if isShowTooltipSymbol && selectedItemIndex === index && item.contractTickerSymbol.length > 20}
                        <div
                          class="absolute left-0 -top-8"
                          style="z-index: 2147483648;"
                        >
                          <Tooltip text={item.contractTickerSymbol} />
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="text-sm font-semibold text-red-600 transition-all cursor-pointer hover:underline dark:text-red-500 text-right"
                on:click={() => {
                  selectedItemDelete = {
                    chain: item.chain,
                    contractAddress: item.contractAddress,
                    type: "token",
                  };
                  isOpenConfirmDelete = true;
                }}
              >
                {MultipleLang.content.modal_delete}
              </div>
            </div>

            <div class="flex justify-between items-start">
              <div class="text-right text-sm uppercase font-medium">
                {MultipleLang.content.contract_address_header_table}
              </div>
              <div class="text-sm text_00000099">
                <Copy
                  address={item?.contractAddress}
                  textTooltip="Copy address to clipboard"
                  iconColor={$isDarkMode ? "#fff" : "#000"}
                  color={$isDarkMode ? "#ccc" : "#00000099"}
                  isShorten={true}
                  isLink={true}
                  link={`/?type=EVM&chain=ALL&address=${item?.contractAddress}`}
                />
              </div>
            </div>

            <div class="flex justify-between items-start">
              <div class="text-right text-sm uppercase font-medium">
                {MultipleLang.content.chain_header_table}
              </div>
              <div class="text-sm text_00000099">
                {item.chain}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenConfirmDelete}
  on:close={() => (isOpenConfirmDelete = false)}
>
  <div class="flex flex-col gap-4 xl:mt-0 mt-4">
    <div class="flex flex-col items-start gap-1">
      <div class="font-semibold title-3">
        {MultipleLang.content.modal_delete_title}
      </div>
      <div class="text-gray-500 text-sm">
        {MultipleLang.content.modal_delete_sub_title}
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <div class="w-[120px]">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenConfirmDelete = false;
          }}
        >
          {MultipleLang.content.modal_cancel}
        </Button>
      </div>
      <div class="w-[120px]">
        <Button
          isLoading={isLoadingDelete}
          disabled={isLoadingDelete}
          variant="delete"
          on:click={handleDeleteReportToken}
        >
          {MultipleLang.content.modal_delete}
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

{#if show}
  <div class="fixed z-50 w-full top-3 right-3" style="z-index: 2147483648;">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccess ? "green" : "red"}
      bind:open={show}
    >
      <svelte:fragment slot="icon">
        {#if isSuccess}
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

<style></style>
