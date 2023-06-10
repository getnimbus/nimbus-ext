<script lang="ts">
  export let data;
</script>

<div
  class="border border-[#0000000d] rounded-[10px] px-1 pt-1 pb-3 flex flex-col gap-2"
>
  <div class="rounded-[10px] overflow-hidden h-[200px]">
    <img src={data.image_url} alt="" class="w-full h-full object-cover" />
  </div>
  <div class="flex flex-col gap-1">
    <div class="flex gap-1 items-center">
      <div class="text-sm font-bold">{data.name}</div>
      <div class="text-sm font-bold">#{data.item_id}</div>
    </div>
    <div class="flex gap-1 items-center">
      <div class="text-sm font-semibold">Inscription</div>
      <div class="text-sm font-semibold">#{data.inscription_number}</div>
    </div>
    <div class="flex gap-2 items-center">
      <div class="text-sm font-semibold">Rarity badge:</div>
      <div>{data.rarity_badge}</div>
    </div>
    <div class="text-xs font-normal text-[#616b84]">
      Est. value : {data.est_value} BTC
    </div>
  </div>
</div>

<style>
</style>
