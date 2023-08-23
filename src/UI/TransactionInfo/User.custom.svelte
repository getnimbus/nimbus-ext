<svelte:options tag="user-info" />

<script>
  import { shorterAddress, getLocalImg, add3Dots } from "~/utils";
  import CoinDefaultIcon from "~/entries/contentScript/assets/coin-default.svg";
  import tooltip from "~/entries/contentScript/views/tooltip";

  import Arrow from "~/assets/arrow-right.svg";

  export let name;
  export let address;
  export let avatar;
  export let id;
  export let label;
</script>

<div class="flex items-center justify-start gap-2">
  <div
    class="rounded-full flex justify-center items-center bg_fafafbff relative w-[40px] h-[40px]"
  >
    <img
      class="w-full h-full object-cover"
      src={avatar || getLocalImg(CoinDefaultIcon)}
      alt=""
    />
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
      class="no-underline text-sm font-medium"
      use:tooltip={{
        content: `<tooltip-detail text="${label ? label : address}" />`,
        allowHTML: true,
        placement: "top",
      }}
    >
      {label ? add3Dots(label, 12) : shorterAddress(address)}
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
