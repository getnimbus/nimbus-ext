<script>
  import Button from "~/components/Button.svelte";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode, user } from "~/store";

  import Plus from "~/assets/plus.svg";
  import PlusBlack from "~/assets/plus-black.svg";

  // import { nimbus } from "~/lib/network";

  const MultipleLang = {
    title: i18n("optionsPage.tab-title-listtoken"),
    content: {},
  };

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let isOpenAddModal;
  let showDisableAddWallet;
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between">
    <div class="xl:title-3 title-1">List Token</div>
    <div class="relative xl:w-max w-[200px]">
      {#if Object.keys(userInfo).length !== 0}
        <Button variant="tertiary" on:click={() => (isOpenAddModal = true)}>
          <img src={Plus} alt="" width="12" height="12" />
          <div class="text-2xl font-medium text-white xl:text-base">
            Button text
          </div>
        </Button>
      {:else}
        <div
          class="relative"
          on:mouseenter={() => {
            showDisableAddWallet = true;
          }}
          on:mouseleave={() => {
            showDisableAddWallet = false;
          }}
        >
          <Button variant="disabled">
            <img
              src={darkMode ? PlusBlack : Plus}
              alt=""
              width="12"
              height="12"
            />
            <div
              class={`text-2xl font-medium xl:text-base ${
                darkMode ? "text-gray-400" : "text-white"
              }`}
            >
              Button text
            </div>
          </Button>
          {#if showDisableAddWallet}
            <div
              class="absolute transform -translate-x-1/2 -top-8 left-1/2 w-max"
              style="z-index: 2147483648;"
            >
              <tooltip-detail text={"Connect wallet to add account"} />
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style></style>
