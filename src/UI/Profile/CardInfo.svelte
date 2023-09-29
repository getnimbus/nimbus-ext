<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

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

  let dataListNFT = [];

  $: {
    if (
      !$queryPreview.isError &&
      $queryPreview.data &&
      $queryPreview?.data !== undefined
    ) {
      console.log("queryPreview: ", $queryPreview.data.nfts);
    }
  }
</script>

<div
  class="col-span-2 flex gap-5 border rounded-xl p-2 shadow shadow-light-700"
>
  <div class="w-2/5">
    <img src="/assets/stacy_muur.jpeg" alt="NFT_Image" class=" rounded-xl" />
  </div>
  <div class="w-3/5 flex flex-col gap-5">
    <div class="font-bold">Title #1234</div>
    <div class="flex flex-col gap-4">
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

<style></style>
