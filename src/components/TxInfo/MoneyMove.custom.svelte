<svelte:options tag="money-move" />

<script>
  import { formatCurrency } from "~/utils";

  import "../Arrow.custom.svelte";
  import "./Entity.custom.svelte";
  import "./User.custom.svelte";

  export let data;
  export let from;
  export let to;
  export let id;
</script>

{#if data}
  <div class="flex justify-between items-center gap-10">
    <div class="w-max">
      <user-info
        name={from &&
        to &&
        data?.from &&
        data.from.toLowerCase() === from.toLowerCase()
          ? "Sender"
          : data?.from.toLowerCase() === to.toLowerCase()
          ? "Receiver"
          : data?.from}
        avatar={data.from_logo}
        address={data.from}
        {id}
      />
    </div>
    <div class="flex-1">
      <app-arrow>
        <div class="flex justify-center items-center gap-2">
          <div class="w-4 h-4 inline-block bg-gray-100 rounded-full -mt-1">
            {#if data?.tokenLogo}
              <img
                src={data?.tokenLogo}
                alt=""
                class="w-full h-full object-cover"
              />
            {/if}
          </div>
          <div class="text-black text-xs font-medium">
            {formatCurrency(data?.value)}
            {data?.symbol}
          </div>
        </div>
        <div class="absolute left-0 right-0 -bottom-6 flex justify-center">
          <div
            class="text-[#27326F] text-xs font-medium py-[2px] px-1 bg-[#A795FD33] rounded-[5px] w-max"
          >
            {data?.type}
          </div>
        </div>
      </app-arrow>
    </div>
    <div class="w-max">
      <user-info
        name={from &&
        to &&
        data?.to &&
        data.to.toLowerCase() === from.toLowerCase()
          ? "Sender"
          : data?.to.toLowerCase() === to.toLowerCase()
          ? "Receiver"
          : data?.to}
        avatar={data.to_logo}
        address={data.to}
        {id}
      />
    </div>
  </div>
{/if}

<style>
</style>
