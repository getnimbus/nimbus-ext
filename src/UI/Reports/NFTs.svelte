<script lang="ts">
  import { i18n } from "~/lib/i18n";
  import { isDarkMode, user } from "~/store";
  import { nimbus } from "~/lib/network";
  import { triggerToast } from "~/utils/functions";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import Button from "~/components/Button.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Loading from "~/components/Loading.svelte";
  import Copy from "~/components/Copy.svelte";

  const MultipleLang = {
    content: {
      chain_header_table: i18n(
        "optionsPage.token-tab-content.chain-header-table",
        "Chain"
      ),
      contract_address_header_table: i18n(
        "optionsPage.contract-address-tab-content.contract-address-header-table",
        "Collection ID"
      ),
      assets_header_table: i18n(
        "optionsPage.assets-page-content.assets-header-table",
        "Collection"
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

  const queryClient = useQueryClient();

  const handleDataReportNft = async () => {
    const response: any = await nimbus.get("/holding-nft/trash?type=nft");
    return response.data;
  };

  $: query = createQuery({
    queryKey: ["nft-report"],
    queryFn: () => handleDataReportNft(),
    staleTime: Infinity,
    retry: false,
    enabled: $user && Object.keys($user)?.length !== 0,
  });

  const handleDeleteReportNft = async () => {
    isLoadingDelete = true;
    try {
      await nimbus.delete("/holding-nft/trash/revert", selectedItemDelete);
      queryClient.refetchQueries(["nft-report"]);
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
      triggerToast("Successfully delete your token report!", "success");
    } catch (e) {
      console.error("e: ", e);
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
      triggerToast(
        "Something wrong when delete your token. Please try again!",
        "fail"
      );
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
          <div class="font-medium uppercase text-xs text-left">
            {MultipleLang.content.assets_header_table}
          </div>
        </th>

        <th class="py-3">
          <div class="font-medium uppercase text-xs text-left">
            {MultipleLang.content.contract_address_header_table}
          </div>
        </th>

        <th class="py-3">
          <div class="font-medium text-right uppercase text-xs">
            {MultipleLang.content.chain_header_table}
          </div>
        </th>

        <th class="py-3 pr-3">
          <div class="font-medium text-right uppercase text-xs">
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
        {#if ($query.data && $query.data?.length === 0) || $query.isError}
          <tr>
            <td colspan="4">
              <div
                class="flex items-center justify-center h-full px-3 py-4 text-base"
              >
                No report nft collection
              </div>
            </td>
          </tr>
        {:else}
          {#each $query.data as item}
            <tr class="group transition-all">
              <td
                class={`pl-3 py-3 ${
                  $isDarkMode
                    ? "group-hover:bg-[#000]"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <div class="xl:text-base text-2xl">
                  {item.contractName}
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
                      type: "nft",
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
    <div class="flex items-center justify-center h-full px-3 py-4">
      Please connect wallet
    </div>
  {:else if $query.isLoading}
    <div class="flex items-center justify-center h-full px-3 py-4">
      <Loading />
    </div>
  {:else}
    <div class="flex flex-col">
      {#if ($query.data && $query.data?.length === 0) || $query.isError}
        <div
          class="flex items-center justify-center h-full px-3 py-4 text-base"
        >
          No report nft collection
        </div>
      {:else}
        {#each $query.data as item}
          <div
            class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-2"
          >
            <div class="flex justify-between items-start">
              <div class="text-sm font-medium flex justify-end gap-1">
                <div class="text-sm">
                  {item.contractName}
                </div>
              </div>
              <div
                class="text-sm font-semibold text-red-600 transition-all cursor-pointer hover:underline dark:text-red-500 text-right"
                on:click={() => {
                  selectedItemDelete = {
                    chain: item.chain,
                    contractAddress: item.contractAddress,
                    type: "nft",
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
              <div class="text-sm text-left">
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
          on:click={handleDeleteReportNft}
        >
          {MultipleLang.content.modal_delete}
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

<style windi:preflights:global windi:safelist:global></style>
