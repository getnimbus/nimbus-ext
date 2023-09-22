<script>
  import Button from "~/components/Button.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode, user } from "~/store";

  import Plus from "~/assets/plus.svg";
  import PlusBlack from "~/assets/plus-black.svg";

  import { nimbus } from "~/lib/network";
  import { detectedChain } from "~/utils";
  import { Toast } from "flowbite-svelte";
  import Loading from "~/components/Loading.svelte";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  const MultipleLang = {
    title: i18n("optionsPage.tab-title-listtoken"),
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

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let dataTokenReport = [];
  let isOpenAddModal;
  let selectedItemDelete;
  let isOpenConfirmDelete = false;

  let show = false;
  let counter = 3;
  let toastMsg = "";
  let isSuccess = false;

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

  let isLoadingDelete = false;

  const queryClient = useQueryClient();

  const handleDataReportToken = async () => {
    const response = await nimbus.get("/holding/trash");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response.data;
  };

  const query = createQuery({
    queryKey: ["token-report"],
    queryFn: () => handleDataReportToken(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  const handleDeleteReportToken = async () => {
    isLoadingDelete = true;
    try {
      await nimbus.delete("/holding/trash/revert", selectedItemDelete);
      queryClient.invalidateQueries(["token-report"]);
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

  $: {
    if (!$query.isError && $query.data !== undefined) {
      dataTokenReport = $query.data;
    }
  }

  // $: console.log("dataTokenReport : ", dataTokenReport);
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between">
    <div class="xl:title-3 title-1">List Token</div>
    <div class="relative xl:w-max w-[200px]" />
  </div>
  <div class="border border_0000000d rounded-[10px] overflow-x-auto">
    <table class="table-auto xl:w-full w-[1800px]">
      <thead>
        <tr class="bg_f4f5f8">
          <th class="py-3 pl-3">
            <div class="text-xl font-semibold uppercase xl:text-xs text-left">
              {MultipleLang.content.assets_header_table}
            </div>
          </th>
          <th class="py-3 font-semibold uppercase xl:text-xs text-left">
            <div>
              {MultipleLang.content.contract_address_header_table}
            </div>
          </th>
          <th class="py-3">
            <div class="text-xl font-semibold uppercase xl:text-xs text-right">
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

      {#if $query.isFetching}
        <tbody>
          <tr>
            <td colspan="3">
              <div class="flex items-center justify-center px-3 py-4">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        {#each dataTokenReport as item}
          <tbody>
            <tr
              class="cursor-pointer xl:text-base text-2xl py-1 px-3 rounded-[100px]"
            >
              <td class={`pl-3 py-4`}>
                <div class="flex items-center justify-start">
                  <img
                    src={item.logoUrl}
                    alt=""
                    width="40"
                    height="40"
                    class="rounded-full mr-4"
                    on:error={(e) => {
                      e.target.src =
                        "https://raw.githubusercontent.com/getnimbus/assets/main/token.png";
                    }}
                  />
                  <div class="font-medium">
                    {item.contractName}
                  </div>
                </div>
              </td>
              <td class="py-4">
                <div>
                  {item.contractAddress}
                </div>
              </td>
              <td class="py-4">
                <div class="text-right font-medium">
                  {item.chain}
                </div>
              </td>
              <td class="py-4 pr-3 flex justify-end">
                <div
                  class="text-2xl font-semibold text-red-600 transition-all cursor-pointer hover:underline dark:text-red-500 xl:text-base py-2"
                  on:click={() => {
                    selectedItemDelete = item;
                    isOpenConfirmDelete = true;
                  }}
                >
                  {MultipleLang.content.modal_delete}
                </div>
              </td>
            </tr>
          </tbody>
        {/each}
      {/if}
    </table>
  </div>
</div>

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenConfirmDelete}
  on:close={() => (isOpenConfirmDelete = false)}
>
  <div class="flex flex-col gap-10 xl:gap-4">
    <div class="flex flex-col items-start gap-1">
      <div class="font-semibold xl:title-3 title-1">
        {MultipleLang.content.modal_delete_title}
      </div>
      <div class="text-2xl text-gray-500 xl:text-sm">
        {MultipleLang.content.modal_delete_sub_title}
      </div>
    </div>
    <div class="flex justify-end gap-6 lg:gap-2">
      <div class="lg:w-[120px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenConfirmDelete = false;
          }}
        >
          {MultipleLang.content.modal_cancel}
        </Button>
      </div>
      <div class="lg:w-[120px] w-full">
        <Button
          isLoading={isLoadingDelete}
          variant="delete"
          on:click={() => {
            handleDeleteReportToken();
            isOpenConfirmDelete = false;
          }}
        >
          {MultipleLang.content.modal_delete}
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

{#if show}
  <div class="fixed z-10 w-full top-3 right-3">
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
