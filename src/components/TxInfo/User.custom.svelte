<svelte:options tag="user-info" />

<script>
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { shorterAddress } from "~/entries/contentScript/views/utils";
  import Tooltip from "../Tooltip.custom.svelte";

  export let avatar;
  export let label;
  export let address;
  export let explorer;
  export let name;
</script>

<div class="flex items-center justify-start gap-2">
  <div
    class="w-9 h-9 rounded-full overflow-hidden flex justify-center items-center bg-gray-100"
  >
    {#if avatar}
      <img class="w-6 h-6 object-cover" src={avatar} alt="avatar" />
    {/if}
  </div>
  <div class="text-xs">
    <a
      href={`${explorer}/address/${address}`}
      target="_blank"
      class="text-blue-400 no-underline"
      use:tooltip={{
        content: `<tooltip-detail address="${address}" />`,
        allowHTML: true,
        placement: "bottom",
      }}
    >
      {address && shorterAddress(address)}
    </a>
    <div>{label || name || "unknown"}</div>
  </div>
</div>
