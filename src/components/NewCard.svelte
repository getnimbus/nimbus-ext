<script>
  import { add3Dots } from "~/utils";
  export let data;
</script>

<div class="flex gap-6">
  <div class="w-[250px] h-[160px] overflow-hidden rounded-[10px]">
    <img class="w-full h-full object-cover" src={data.img} alt={data.title} />
  </div>
  <div class="flex-1 flex flex-col justify-between">
    <div class="flex flex-col gap-4">
      <a
        href={data.url}
        target="_blank"
        class="text-xl font-bold cursor-pointer"
      >
        {data.title}
      </a>
      <div class="text-sm font-normal text-[#00000099]">
        {add3Dots(data.description, 80)}
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        {#each data.tokens as token}
          <div
            class="flex items-center justyfy-center gap-2 px-2 py-1 text-base text-black bg-[#efaac433] rounded-[10px]"
          >
            <img src={token.logo} alt={token.symbol} width="16" height="16" />
            {token.name} ({token.symbol})
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
</style>
