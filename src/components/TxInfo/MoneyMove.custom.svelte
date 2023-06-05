<svelte:options tag="money-move" />

<script>
  import { formatCurrency, formatBalance, formatSmallBalance } from "~/utils";

  import tooltip from "~/entries/contentScript/views/tooltip";

  import "../Arrow.custom.svelte";
  import "./Entity.custom.svelte";
  import "./User.custom.svelte";

  export let data;
  export let from;
  export let to;
  export let id;
</script>

{#if data}
  <div class="flex justify-between items-center gap-3">
    <div class="w-[155px]">
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
        label={data.fromLabel}
      />
    </div>
    <div class="flex-1">
      <app-arrow>
        <div class="flex justify-center items-center gap-2">
          <div class="w-4 h-4 inline-block bg-gray-100 rounded-full">
            {#if data?.tokenLogo}
              <img
                src={data?.tokenLogo}
                alt=""
                class="w-full h-full object-cover"
              />
            {/if}
          </div>
          <div
            class="text-black text-xs font-medium"
            use:tooltip={{
              content: `<tooltip-detail text="${formatCurrency(data?.value)} ${
                data?.symbol ? data?.symbol : "N/A"
              }" />`,
              allowHTML: true,
              placement: "top",
            }}
          >
            {formatBalance(data?.value) === "NaN"
              ? formatSmallBalance(data?.value)
              : formatBalance(data?.value)}
            {data?.symbol ? data?.symbol : "N/A"}
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
    <div class="w-[155px]">
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
        label={data.toLabel}
      />
    </div>
  </div>
{/if}

<style>
</style>
