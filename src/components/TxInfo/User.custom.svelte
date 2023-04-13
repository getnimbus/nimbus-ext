<svelte:options tag="user-info" />

<script>
  import { shorterAddress, getLocalImg } from "../../utils";

  import tooltip from "~/entries/contentScript/views/tooltip";

  import Arrow from "../../assets/arrow-right.svg";

  export let name;
  export let address;
  export let avatar;
  export let id;
</script>

<div class="flex items-center justify-start gap-2">
  <div
    class="rounded-full flex justify-center items-center bg-gray-100 relative w-[40px] h-[40px]"
  >
    {#if avatar}
      <img class="w-full h-full object-cover" src={avatar} alt="" />
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
        content: `<tooltip-detail text="${address}" />`,
        allowHTML: true,
        placement: "top",
      }}
    >
      {address && shorterAddress(address)}
    </a>
    <div class="text-sm text-[#5E656B] font-normal">
      {#if name === "Sender" || name === "Receiver"}
        {name}
      {/if}
    </div>
  </div>
</div>

<style>
  .border {
    border: 2px solid white;
  }
</style>
