<svelte:options tag="user-info" />

<script>
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { shorterAddress, getLocalImg, getTokenLogo } from "../../utils";

  import Arrow from "../../assets/arrow-right.svg";

  export let name;
  export let address;
  export let avatar;
  export let label = "";
  export let explorer;
  export let id = 1;
</script>

<div class="flex items-center justify-start gap-2">
  <div
    class={`rounded-full flex justify-center items-center bg-gray-100 relative ${
      name === "Sender" || name === "Receiver"
        ? "w-[40px] h-[40px]"
        : "w-[32px] h-[32px]"
    }`}
  >
    {#if avatar}
      {#if name === "Sender" || name === "Receiver"}
        <img
          class="w-full h-full object-cover"
          src={avatar}
          alt={name || address}
        />
      {:else}
        <img
          class="w-full h-full object-cover"
          src={avatar || getTokenLogo(address, id)}
          alt={name || address}
        />
      {/if}
    {/if}
    {#if name === "Sender" || name === "Receiver"}
      <div
        class={`absolute bottom-0 right-0 border w-[18px] h-[18px] rounded-full flex items-center justify-center ${
          name === "Sender" ? "bg-[#00A878]" : "bg-[#1E96FC]"
        }`}
      >
        <img
          src={getLocalImg(Arrow)}
          alt=""
          class={`${name === "Sender" ? "" : "transform rotate-180"}`}
        />
      </div>
    {/if}
  </div>
  <div class="flex flex-col">
    <a
      href={`https://etherscan.io/address/${address}`}
      target="_blank"
      class="no-underline text-sm text-black font-medium"
      use:tooltip={{
        content: `<tooltip-detail address="${address}" />`,
        allowHTML: true,
        placement: "top",
      }}
    >
      {address && shorterAddress(address)}
    </a>
    {#if name === "Sender" || name === "Receiver"}
      <div class="text-sm text-[#5E656B] font-normal">
        {label || name || "unknown"}
      </div>
    {/if}
  </div>
</div>

<style>
  .border {
    border: 2px solid white;
  }
</style>
