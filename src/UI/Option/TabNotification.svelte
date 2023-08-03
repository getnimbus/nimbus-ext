<svelte:options tag="tab-notification" />

<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import CopyToClipboard from "svelte-copy-to-clipboard";

  import "~/components/Loading.custom.svelte";
  import Copy from "~/components/Copy.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";

  import FollowWhale from "~/assets/whale-tracking.gif";

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
  let isOpenFollowWhaleModal = false;
  let showCommandTooltip = false;
  let selectedWallet;

  const getListAddress = async () => {
    isLoading = true;
    try {
      const response: any = await nimbus.get("/accounts/list");
      if (response && response?.data) {
        const structWalletData = response?.data.map((item) => {
          return {
            position: item.position,
            id: item.id,
            type: item.type,
            label: item.label,
            address: item.type === "CEX" ? item.id : item.accountId,
          };
        });
        listAddress = structWalletData;
        isLoading = false;
      } else {
        isLoading = false;
      }
    } catch (e) {
      console.log("e: ", e);
      isLoading = false;
    }
  };

  onMount(() => {
    getListAddress();
  });
</script>

<div class="flex flex-col gap-2">
  <div class="xl:title-3 title-1 text-gray-500 mb-2">{MultipleLang.title}</div>
  <div class="border border-[#0000000d] rounded-[10px] overflow-x-auto">
    <table class="table-auto xl:w-full w-[1200px]">
      <thead>
        <tr class="bg-[#f4f5f8]">
          <th class="pl-3 py-3">
            <div
              class="text-left xl:text-sm text-lg uppercase font-semibold text-black"
            >
              {MultipleLang.content.address_header_table}
            </div>
          </th>
          <th class="py-3">
            <div
              class="text-left xl:text-sm text-lg uppercase font-semibold text-black"
            >
              {MultipleLang.content.label_header_table}
            </div>
          </th>
          <th class="pr-3 py-3">
            <div
              class="text-right xl:text-sm text-lg uppercase font-semibold text-black"
            >
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
                  <div class="text-left xl:text-base text-xl">
                    <Copy address={item.address} iconColor="#000" />
                  </div>
                </td>
                <td class="py-4">
                  <div
                    class="bg-[#6AC7F533] text-[#27326F] w-max px-3 py-1 rounded-[5px] xl:text-base text-xl"
                  >
                    {item.label}
                  </div>
                </td>
                <td class="pr-3 py-4">
                  <div class="flex justify-end gap-6">
                    <div
                      class="text-blue-600 hover:underline xl:text-base text-2xl transition-all cursor-pointer font-semibold"
                      on:click={() => {
                        selectedWallet = item.address;
                        isOpenFollowWhaleModal = true;
                      }}
                    >
                      Turn on
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
  isOpen={isOpenFollowWhaleModal}
  on:close={() => (isOpenFollowWhaleModal = false)}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <div class="xl:text-base text-2xl">
        Go to <a
          href="https://t.me/GetNimbusBot"
          target="_blank"
          class="text-blue-500">https://t.me/GetNimbusBot</a
        >
      </div>
      <div class="xl:text-base text-2xl">Use the command as follow video</div>
    </div>
    <div class="xl:h-[350px] h-[650px]">
      <img src={FollowWhale} alt="" class="w-full h-full" />
    </div>
    <div
      class="relative w-full flex justify-end"
      on:mouseenter={() => {
        showCommandTooltip = true;
      }}
      on:mouseleave={() => {
        showCommandTooltip = false;
      }}
    >
      <CopyToClipboard
        text={`/portfolio ${selectedWallet} ${
          listAddress.filter((item) => item.address === selectedWallet)[0].label
        }`}
        let:copy
      >
        <div class="w-max">
          <Button
            on:click={() => {
              copy();
              isOpenFollowWhaleModal = false;
              showCommandTooltip = false;
            }}>Copy command</Button
          >
        </div>
      </CopyToClipboard>
      {#if showCommandTooltip}
        <div
          class="absolute -top-8 left-1/2 transform -translate-x-1/2"
          style="z-index: 2147483648;"
        >
          <tooltip-detail
            text={`/portfolio ${selectedWallet} ${
              listAddress.filter((item) => item.address === selectedWallet)[0]
                .label
            }`}
          />
        </div>
      {/if}
    </div>
  </div>
</AppOverlay>

<style>
</style>
