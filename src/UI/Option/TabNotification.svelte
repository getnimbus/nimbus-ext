<svelte:options tag="tab-notification" />

<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { sendMessage } from "webext-bridge";
  import CopyToClipboard from "svelte-copy-to-clipboard";

  import type { AddressData } from "~/types/AddressData";

  import Copy from "~/components/Copy.svelte";

  const MultipleLang = {
    title: i18n("optionsPage.notification-page-title", "Notification"),
    content: {
      address_header_table: i18n(
        "optionsPage.accounts-page-content.address-header-table",
        "Wallet"
      ),
      label_header_table: i18n(
        "optionsPage.accounts-page-content.label-header-table",
        "Label"
      ),
      action_header_table: i18n(
        "optionsPage.accounts-page-content.action-header-table",
        "Action"
      ),
    },
  };

  let isLoading = false;
  let listAddress = [];

  const getListAddress = async () => {
    isLoading = true;
    try {
      const response: AddressData = await sendMessage(
        "getListAddress",
        undefined
      );
      if (response) {
        listAddress = response;
      }
    } catch (e) {
      console.log("e: ", e);
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    getListAddress();
  });
</script>

<div class="flex flex-col gap-2">
  <div class="title-3 text-gray-500 mb-2">{MultipleLang.title}</div>
  <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
    <table class="table-auto xl:w-full w-[1200px]">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th class="pl-3 py-3">
            <div class="text-left text-sm uppercase font-semibold text-black">
              {MultipleLang.content.address_header_table}
            </div>
          </th>
          <th class="py-3">
            <div class="text-left text-sm uppercase font-semibold text-black">
              {MultipleLang.content.label_header_table}
            </div>
          </th>
          <th class="pr-3 py-3">
            <div class="text-right text-sm uppercase font-semibold text-black">
              {MultipleLang.content.action_header_table}
            </div>
          </th>
        </tr>
      </thead>
      {#if isLoading}
        <tbody>
          <tr>
            <td colspan="3">
              <div class="flex justify-center items-center py-4 px-3">
                <loading-icon />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if listAddress && listAddress.length === 0}
            <tr>
              <td colspan="3">
                <div class="flex justify-center items-center py-4 px-3">
                  No address
                </div>
              </td>
            </tr>
          {:else}
            {#each listAddress as item (item.id)}
              <tr class="hover:bg-gray-100 transition-all">
                <td class="pl-3 py-4">
                  <div class="text-left flex items-center gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 7.75H3C2.59 7.75 2.25 7.41 2.25 7C2.25 6.59 2.59 6.25 3 6.25H21C21.41 6.25 21.75 6.59 21.75 7C21.75 7.41 21.41 7.75 21 7.75ZM21 12.75H3C2.59 12.75 2.25 12.41 2.25 12C2.25 11.59 2.59 11.25 3 11.25H21C21.41 11.25 21.75 11.59 21.75 12C21.75 12.41 21.41 12.75 21 12.75ZM21 17.75H3C2.59 17.75 2.25 17.41 2.25 17C2.25 16.59 2.59 16.25 3 16.25H21C21.41 16.25 21.75 16.59 21.75 17C21.75 17.41 21.41 17.75 21 17.75Z"
                        fill="#9ca3af"
                      />
                    </svg>
                    <Copy address={item.address} iconColor="#000" />
                  </div>
                </td>
                <td class="py-4">
                  <div
                    class="bg-[#6AC7F533] text-[#27326F] w-max px-3 py-1 rounded-[5px]"
                  >
                    {item.label}
                  </div>
                </td>
                <td class="pr-3 py-4">
                  <div class="flex justify-end gap-6">
                    <div
                      class="text-blue-600 hover:underline transition-all cursor-pointer font-semibold"
                    >
                      <CopyToClipboard
                        text={`/start ${item.address} ${item.label}`}
                        let:copy
                      >
                        <div on:click={copy}>Copy command</div>
                      </CopyToClipboard>
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

<style>
</style>
