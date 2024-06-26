<svelte:options tag="tab-highlight" />

<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode } from "~/store";

  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";
  import Loading from "~/components/Loading.svelte";

  const MultipleLang = {
    title: i18n("optionsPage.highlight-page-title", "Highlight"),
    content: {
      address_header_table: i18n(
        "optionsPage.accounts-page-content.address-header-table",
        "Wallet"
      ),
      label_header_table: i18n(
        "optionsPage.accounts-page-content.modal-label-highlight",
        "Highlight"
      ),
      action_header_table: i18n(
        "optionsPage.accounts-page-content.action-header-table",
        "Action"
      ),
      modal_edit: i18n("optionsPage.accounts-page-content.modal-edit", "Edit"),
      modal_delete: i18n(
        "optionsPage.accounts-page-content.modal-delete",
        "Delete"
      ),
      modal_cancel: i18n(
        "optionsPage.accounts-page-content.modal-cancel",
        "Cancel"
      ),
      modal_delete_title: i18n(
        "optionsPage.accounts-page-content.modal-delete-title",
        "Are you sure?"
      ),
      modal_delete_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-delete-highlight-sub-title",
        "Do you really want to delete this wallet highlight? This process cannot revert"
      ),
      modal_edit_title: i18n(
        "optionsPage.accounts-page-content.modal-edit-highlight-title",
        "Edit your wallet highlight"
      ),
      modal_edit_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-edit-highlight-sub-title",
        "Edit your wallet highlight will make change the highlight"
      ),
      modal_address_label: i18n(
        "optionsPage.accounts-page-content.modal-address-label",
        "Wallet"
      ),
      modal_label_label: i18n(
        "optionsPage.accounts-page-content.modal-label-label",
        "Label"
      ),
    },
  };

  let isLoading = false;
  let listAddressLabel = [];
  let selectedHighlight = {
    address: "",
    label: "",
  };
  let errorsEdit: any = {};
  let isOpenConfirmDelete = false;
  let isOpenEditModal = false;
  let label = "";

  const handleEdit = (item) => {
    selectedHighlight = item;
    label = item.label;
    isOpenEditModal = true;
  };

  const getListAddressLabel = async () => {
    const listAddressLabelRes = (
      await browser.storage.sync.get("ListAddressLabel")
    ).ListAddressLabel;
    if (listAddressLabelRes) {
      listAddressLabel = JSON.parse(listAddressLabelRes);
    }
  };

  const handleDelete = (item) => {
    browser.storage.sync.remove([item.address.toString().toLowerCase()]);
    const removeAddressLabel = listAddressLabel.filter(
      (item) =>
        item.address !== selectedHighlight.address.toString().toLowerCase()
    );
    browser.storage.sync.set({
      ListAddressLabel: JSON.stringify(removeAddressLabel),
    });
    getListAddressLabel();
    isOpenConfirmDelete = false;
  };

  const onSubmitEdit = (e) => {
    const formData = new FormData(e.target);

    const data: any = {
      address: selectedHighlight.address,
    };
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    if (
      !Object.keys(errorsEdit).some(
        (inputName) => errorsEdit[inputName]["required"]
      )
    ) {
      const foundItemEdit = listAddressLabel.find(
        (element) => element.address === selectedHighlight.address
      );

      const index = listAddressLabel.indexOf(foundItemEdit);
      if (index > -1) {
        listAddressLabel[index] = data;

        browser.storage.sync.set({
          [selectedHighlight.address.toString().toLowerCase()]: data.label,
        });

        browser.storage.sync.set({
          ListAddressLabel: JSON.stringify(listAddressLabel),
        });

        e.target.reset();
        isOpenEditModal = false;
      }
    } else {
      console.error("Invalid Form");
    }
  };

  onMount(() => {
    getListAddressLabel();
  });
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
    <div class="xl:title-3 title-1">Highlight Settings</div>
    <div class="xl:text-base text-lg text-gray-500">
      Management your highlight address wallet
    </div>
  </div>

  <div
    class={`border border_0000000d rounded-[10px] xl:overflow-hidden overflow-x-auto h-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff]"
    }`}
  >
    <table class="table-auto xl:w-full w-[1200px] h-full">
      <thead>
        <tr class="bg_f4f5f8">
          <th class="pl-3 py-3">
            <div class="text-left text-xs uppercase font-semibold">
              {MultipleLang.content.label_header_table}
            </div>
          </th>
          <th class="py-3">
            <div class="text-left text-xs uppercase font-semibold">
              {MultipleLang.content.address_header_table}
            </div>
          </th>
          <th class="pr-3 py-3">
            <div class="text-right text-xs uppercase font-semibold">
              {MultipleLang.content.action_header_table}
            </div>
          </th>
        </tr>
      </thead>
      {#if isLoading}
        <tbody>
          <tr>
            <td colspan="3">
              <div class="flex justify-center items-center h-full py-4 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if listAddressLabel && listAddressLabel.length === 0}
            <tr>
              <td colspan="3">
                <div
                  class="flex justify-center items-center h-full py-4 px-3 text-base"
                >
                  No highlight
                </div>
              </td>
            </tr>
          {:else}
            {#each listAddressLabel as item}
              <tr class="hover:bg-gray-100 transition-all">
                <td class="pl-3 py-4">
                  <div
                    class="bg-[#6AC7F533] text_27326F text-base w-max px-3 py-1 rounded-[5px]"
                  >
                    {item.label}
                  </div>
                </td>

                <td class="py-4">
                  <div class="text-left text-base flex items-start gap-2">
                    <Copy
                      address={item.address}
                      iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                      color={`${$isDarkMode ? "#fff" : "#000"}`}
                    />
                  </div>
                </td>

                <td class="pr-3 py-4">
                  <div class="flex justify-end gap-6">
                    <div
                      class="text-red-600 text-base hover:underline transition-all cursor-pointer font-semibold"
                      on:click={() => {
                        isOpenConfirmDelete = true;
                        selectedHighlight = item;
                      }}
                    >
                      {MultipleLang.content.modal_delete}
                    </div>
                    <div
                      class="text-blue-600 text-base hover:underline transition-all cursor-pointer font-semibold"
                      on:click={() => handleEdit(item)}
                    >
                      {MultipleLang.content.modal_edit}
                    </div>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      {/if}
    </table>
  </div>
</div>

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenEditModal}
  on:close={() => (isOpenEditModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="xl:title-3 title-1 font-semibold">
      {MultipleLang.content.modal_edit_title}
    </div>
    <form
      on:submit|preventDefault={onSubmitEdit}
      class="flex flex-col xl:gap-3 gap-10"
    >
      <div class="flex flex-col xl:gap-3 gap-6">
        <div class="flex flex-col gap-1">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              selectedHighlight.address && !$isDarkMode
                ? "bg-[#F0F2F7]"
                : "bg_fafafbff"
            }`}
          >
            <div
              class={`xl:text-base text-2xl font-semibold ${
                $isDarkMode ? "text-gray-400" : "text-[#666666]"
              }`}
            >
              {MultipleLang.content.modal_address_label}
            </div>
            <input
              type="text"
              id="address"
              name="address"
              placeholder={MultipleLang.content.modal_address_label}
              value={selectedHighlight.address}
              disabled
              class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
                selectedHighlight.address && !$isDarkMode
                  ? "bg-[#F0F2F7]"
                  : "bg-transparent"
              } ${
                $isDarkMode
                  ? "text-white"
                  : "text-[#5E656B] placeholder-[#5E656B]"
              }`}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              label && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
            }`}
            class:input-border-error={errorsEdit.label &&
              errorsEdit.label.required}
          >
            <div
              class={`xl:text-base text-2xl font-semibold ${
                $isDarkMode ? "text-gray-400" : "text-[#666666]"
              }`}
            >
              {MultipleLang.content.label_header_table}
            </div>
            <input
              type="text"
              id="label"
              name="label"
              placeholder={MultipleLang.content.label_header_table}
              bind:value={selectedHighlight.label}
              class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
                label && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
              } ${
                $isDarkMode
                  ? "text-white"
                  : "text-[#5E656B] placeholder-[#5E656B]"
              }`}
              on:keyup={({ target: { value } }) => (label = value)}
            />
          </div>
          {#if errorsEdit.label && errorsEdit.label.required}
            <div class="text-red-500 font-medium">
              {errorsEdit.label.msg}
            </div>
          {/if}
        </div>
      </div>
      <div class="flex justify-end lg:gap-2 gap-6">
        <div class="lg:w-[100px] w-full">
          <Button
            variant="secondary"
            on:click={() => {
              errorsEdit = {};
              isOpenEditModal = false;
            }}
          >
            {MultipleLang.content.modal_cancel}</Button
          >
        </div>
        <div class="lg:w-[100px] w-full">
          <Button type="submit">
            {MultipleLang.content.modal_edit}</Button
          >
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

<AppOverlay
  clickOutSideToClose
  isOpen={isOpenConfirmDelete}
  on:close={() => (isOpenConfirmDelete = false)}
>
  <div class="flex flex-col xl:gap-4 gap-10">
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">
        {MultipleLang.content.modal_delete_title}
      </div>
      <div class="xl:text-sm text-2xl text-gray-500">
        {MultipleLang.content.modal_delete_sub_title}
      </div>
    </div>
    <div class="flex justify-end lg:gap-2 gap-6">
      <div class="lg:w-[100px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenConfirmDelete = false;
            selectedHighlight = {};
          }}
        >
          {MultipleLang.content.modal_cancel}
        </Button>
      </div>
      <div class="lg:w-[100px] w-full">
        <Button
          variant="delete"
          on:click={() => {
            handleDelete(selectedHighlight);
          }}
        >
          {MultipleLang.content.modal_delete}
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }
  :global(body) .bg_f4f5f8 {
    background: #f4f5f8;
  }
  :global(body.dark) .bg_f4f5f8 {
    background: #131313;
  }
</style>
