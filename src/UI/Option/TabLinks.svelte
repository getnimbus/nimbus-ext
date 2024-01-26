<script lang="ts">
  import { i18n } from "~/lib/i18n";

  import Google from "../SocialLinks/Google.svelte";
  import Solana from "../MainWalletLinks/Solana.svelte";
  import Evm from "../MainWalletLinks/Evm.svelte";

  const MultipleLang = {
    title: i18n("optionsPage.links-page-title", "Link Settings"),
  };
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
    <div class="xl:title-3 title-1">
      {MultipleLang.title}
    </div>
    <div class="xl:text-base text-xl text-gray-500">
      Management your main wallet or social accounts
    </div>
  </div>

  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-2xl font-medium">
        Link your social accounts
      </div>
      <div class="flex flex-col gap-3">
        <Google />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-2xl font-medium">
        Connect you main wallet
      </div>
      <div class="flex flex-col gap-3">
        <Evm />
        <Solana />
      </div>
    </div>
  </div>
</div>

<style></style>
