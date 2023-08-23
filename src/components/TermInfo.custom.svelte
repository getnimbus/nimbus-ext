<svelte:options tag="term-info" />

<script lang="ts">
  export let data;
  let showTooltipGotoDetailTerm = false;
</script>

<reset-style>
  <div class="p-4 bg-white rounded-[10px]">
    <div class="flex items-center gap-2">
      <a href={data?.url} class="text-xl font-medium no-underline">
        {data?.term}
      </a>
      <a
        href={data?.url}
        target="_blank"
        class="h-5 w-5 relative"
        on:mouseenter={() => (showTooltipGotoDetailTerm = true)}
        on:mouseleave={() => (showTooltipGotoDetailTerm = false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-full h-full object-contain text-[#212121]"
        >
          <path
            fill-rule="evenodd"
            d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
            clip-rule="evenodd"
          />
          <path
            fill-rule="evenodd"
            d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
            clip-rule="evenodd"
          />
        </svg>
        {#if showTooltipGotoDetailTerm}
          <div
            class="absolute -top-7 left-1/2 transform -translate-x-1/2"
            style="z-index: 2147483648;"
          >
            <tooltip-detail text={"Go to term detail"} />
          </div>
        {/if}
      </a>
    </div>
    {#if data?.img !== null}
      <div class="w-full h-[300px] border rounded overflow-hidden">
        <img src={data?.img} alt="img" class="w-full h-full object-contain" />
      </div>
    {/if}
    <div class="text-sm font-normal text_00000099 mt-[10px]">
      {data?.define}
    </div>
  </div>
</reset-style>

<style></style>
