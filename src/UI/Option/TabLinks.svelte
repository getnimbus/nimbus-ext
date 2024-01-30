<script lang="ts">
  import { onMount } from "svelte";
  import { user } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { i18n } from "~/lib/i18n";

  import Google from "../SocialLinks/Google.svelte";
  import Solana from "../MainWalletLinks/Solana.svelte";
  import Evm from "../MainWalletLinks/Evm.svelte";

  const MultipleLang = {
    title: i18n("optionsPage.links-page-title", "Link Settings"),
  };

  let uid = "";
  let linksData = [];

  onMount(() => {
    uid = localStorage.getItem("public_address");
  });

  const getLinks = async (id: string) => {
    const response: any = await nimbus.get(`/accounts/link?id=${id}`);
    return response?.data;
  };

  $: queryLinks = createQuery({
    queryKey: ["links", uid],
    queryFn: () => getLinks(uid),
    staleTime: Infinity,
    retry: false,
    enabled: $user && Object.keys($user).length !== 0 && uid !== "",
  });

  $: {
    if (!$queryLinks.isError && $queryLinks.data !== undefined) {
      linksData = $queryLinks.data[0];
    }
  }

  $: console.log("HELLO: ", linksData);
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
        <Google data={linksData} {uid} />
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

<style windi:preflights:global windi:safelist:global>
</style>
