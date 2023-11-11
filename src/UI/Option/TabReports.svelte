<script>
  import { i18n } from "~/lib/i18n";
  import Tokens from "../Reports/Tokens.svelte";
  import NFTs from "../Reports/NFTs.svelte";

  const MultipleLang = {
    title: i18n("optionsPage.report-page-title", "Report Settings"),
  };
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 border-b-[1.5px] border_0000000d pb-4">
    <div class="xl:title-3 title-1">
      {MultipleLang.title}
    </div>
    <div class="xl:text-base text-xl text-gray-500">
      Management your report spam or trash tokens/nfts
    </div>
  </div>

  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-2xl font-medium">Token List</div>
      <Tokens />
    </div>

    <div class="flex flex-col gap-2">
      <div class="xl:text-base text-2xl font-medium">NFT List</div>
      <NFTs />
    </div>
  </div>
</div>

<style></style>
