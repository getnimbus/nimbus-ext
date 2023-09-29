<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { user, isDarkMode } from "~/store";

  import AppOverlay from "~/components/Overlay.svelte";

  export let isEdit;
  export let selectProfileNFT;

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let isOpenModalSelectNFT = false;

  const getPreview = async () => {
    const test = "0x8980dbbe60d92b53b08ff95ea1aaaabb7f665bcb";
    const response = await nimbus
      .get(`/address/${test}/preview?chain=ALL`)
      .then((response) => response.data);
    return response;
  };

  $: queryPreview = createQuery({
    queryKey: ["preview"],
    queryFn: () => getPreview(),
    staleTime: Infinity,
    enabled: Object.keys(userInfo).length !== 0,
  });

  let selectedNFT = {};
</script>

<div
  class="col-span-2 flex items-center gap-5 px-4 py-2 rounded-xl border border_0000001a"
>
  <div class="w-2/5 relative">
    <img src="/assets/stacy_muur.jpeg" alt="NFT_Image" class="rounded-xl" />
    {#if isEdit}
      <div
        class={`absolute top-0 left-0 rounded-xl w-full h-full flex flex-col items-center justify-center ${
          darkMode ? "bg-[#222222e6]" : "bg-white/90"
        } z-30 backdrop-blur-md`}
      >
        <div
          class="text-2xl font-semibold text-blue-600 transition-all cursor-pointer hover:underline dark:text-blue-500 xl:text-base"
          on:click={() => (isOpenModalSelectNFT = true)}
        >
          Change
        </div>
      </div>
    {/if}
  </div>
  <div class="flex-1 flex flex-col gap-5">
    <div class="font-medium xl:text-lg text-2xl">Title #1234</div>
    <div class="flex flex-col gap-3 xl:text-base text-xl">
      <span class="flex justify-between">
        <span class="text-gray-400">title</span>
        <span>content</span>
      </span>
      <span class="flex justify-between">
        <span class="text-gray-400">title</span>
        <span>content</span>
      </span>
      <span class="flex justify-between">
        <span class="text-gray-400">title</span>
        <span>content</span>
      </span>
    </div>
  </div>
</div>

<!-- Modal select NFT profile -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModalSelectNFT}
  on:close={() => {
    isOpenModalSelectNFT = false;
  }}
>
  <div class="flex flex-col gap-4">
    <div class="xl:title-3 title-1 font-semibold">
      Select your NFT to set your Profile
    </div>
    <div class="overflow-y-auto h-[563px] grid grid-cols-3 gap-6">
      {#each $queryPreview?.data?.nfts as item}
        <div
          class="rounded-xl border border_0000001a overflow-hidden h-[260px]"
          on:click={() => {
            selectedNFT = item;
            selectProfileNFT = item;
            isOpenModalSelectNFT = true;
          }}
        >
          <img
            src={item?.imageUrl ||
              "https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"}
            alt=""
            class="w-full h-full object-contain"
          />
        </div>
      {/each}
    </div>
  </div>
</AppOverlay>

<style></style>
