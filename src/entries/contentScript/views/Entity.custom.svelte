<svelte:options tag="entity-info" />

<script>
  import tooltip from "../../../lib/tooltip";
  import { shorterAddress } from "~/utils/index";

  export let name;
  export let address;
  export let logo;
  export let id;
  export let explorer;
</script>

<div class="flex flex-col items-center text-xs">
  <div
    class="w-9 h-9 rounded-full overflow-hidden flex justify-center items-center bg-gray-100"
  >
    {#if logo || (address && id)}
      <img class="w-6 h-6 object-cover" src={logo} alt={name || address} />
    {/if}
  </div>
  <a
    href={`${explorer}/address/${address}`}
    target="_blank"
    class="mt-1 text-blue-400 no-underline"
    use:tooltip={{
      content: `<tooltip-detail text="${address}" />`,
      allowHTML: true,
      placement: "top",
    }}
  >
    {`${name || (address && shorterAddress(address))}`}
  </a>
</div>

<style></style>
