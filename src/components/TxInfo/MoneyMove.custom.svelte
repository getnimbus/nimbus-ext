<svelte:options tag="money-move" />

<script>
  import numeral from "numeral";

  import "../Arrow.custom.svelte";
  import "./Entity.custom.svelte";

  export let data;
  export let id;
  export let explorer;
  export let from;
  export let to;

  $: getAddressLabel = (address, label) => {
    if (address === from) {
      return "Sender";
    }
    if (address === to) {
      return "Receiver";
    }
    return label;
  };
</script>

{#if data}
  <div class="flex justify-between gap-1 text-xs">
    <div class="flex-1">
      <entity-info
        name={getAddressLabel(data.from, data.from_address_label)}
        address={data.from}
        logo={data.from_address_logo}
        {id}
        {explorer}
      />
    </div>
    <div class="text-center w-44">
      <app-arrow>
        <div class="flex justify-center items-center space-x-2 mb-1">
          <div class="flex items-center gap-1 font-bold">
            <div>
              {#if numeral(data.realValue).format("0,0.0000") !== "NaN"}
                {numeral(data.realValue).format("0,0.0000")}
              {:else}
                infinity
              {/if}
            </div>
            <div>
              {data.meta.sender_contract_ticker_symbol ||
                data.meta[0].sender_contract_ticker_symbol}
            </div>
          </div>
          <img
            class="inline-block w-4 h-4"
            src={data.meta.sender_logo_url || data.meta[0].sender_logo_url}
            alt={data.meta.sender_contract_ticker_symbol ||
              data.meta[0].sender_contract_ticker_symbol}
          />
        </div>
        <div class="absolute left-0 right-0 mt-1 font-bold">{data.name}</div>
      </app-arrow>
    </div>
    <div class="flex-1">
      <entity-info
        name={getAddressLabel(data.to, data.to_address_label)}
        address={data.to}
        logo={data.to_address_logo}
        {id}
        {explorer}
      />
    </div>
  </div>
{/if}
