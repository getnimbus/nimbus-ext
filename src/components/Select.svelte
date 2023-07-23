<script lang="ts">
  import { wallet, chain } from "~/store";
  import UpArrow from "~/assets/up-arrow.svg";
  import All from "~/assets/all.svg";

  export let listSelect;
  export let selected;
  export let type: "chain" | "wallet" | "lang";

  let open = false;

  $: {
    if (listSelect && type === "lang") {
      selected = listSelect[0];
    }
  }

  $: selectedChain =
    (type === "chain" &&
      listSelect &&
      selected &&
      listSelect.filter((item) => item.value === selected)) ||
    [];
</script>

<div class="wrapper">
  <div
    class={`button xl:text-sm text-2xl hover:bg-[#525b8c] ${
      type === "lang" && "bg-[#1E96FC]"
    }`}
    class:active={open}
    on:click={() => (open = !open)}
  >
    <div class="flex items-center gap-2">
      {#if type === "chain" || type === "lang"}
        {#if selected?.logo || selectedChain[0]?.logo}
          <img
            src={selected?.value === "ALL" || selectedChain[0]?.value === "ALL"
              ? All
              : selected?.logo || selectedChain[0]?.logo}
            alt=""
            class="xl:w-5 xl:h-5 w-7 h-7 rounded-full"
          />
        {/if}
        <div class="text-white xl:text-sm text-2xl">
          {selected?.label || selectedChain[0]?.label}
        </div>
      {:else}
        <div class="text-white xl:text-sm text-2xl">
          Other ({listSelect.length})
        </div>
      {/if}
    </div>
    <img
      src={UpArrow}
      alt=""
      class="transform rotate-180 xl:w-3 xl:h-3 w-5 h-5"
      class:rotate-0={open}
    />
  </div>

  {#if open}
    <div
      class="content xl:max-h-[300px] xl:w-[200px] xl:min-w-[200px] xl:max-h-[310px] max-h-[380px] w-[300px] min-w-[300px] mt-2"
    >
      {#each listSelect as item}
        <div
          class="content_item"
          class:active={type !== "lang"
            ? item.value === selected
            : item.value === selected?.value}
          id={item.value}
          on:click={() => {
            if (type === "wallet") {
              wallet.update((n) => (n = item.value));
              selected = item.value;
              open = false;
            }
            if (type === "chain") {
              if (
                item.value !== "ALL" &&
                item.value !== "ETH" &&
                item.value !== "BTC" &&
                item.value !== "XDAI" &&
                item.value !== "BNB" &&
                item.value !== "MATIC" &&
                item.value !== "OP" &&
                item.value !== "AVAX"
              ) {
                open = false;
              } else {
                chain.update((n) => (n = item.value));
                selected = item.value;
                open = false;
              }
            }
            if (type === "lang") {
              selected = item;
              open = false;
            }
          }}
        >
          {#if item.logo}
            <img
              src={item.value === "ALL" ? All : item.logo}
              alt=""
              class="xl:w-5 xl:h-5 w-7 h-7 rounded-full"
            />
          {/if}
          <div
            class={`xl:text-sm text-2xl name ${
              type === "chain" &&
              item.value !== "ALL" &&
              item.value !== "ETH" &&
              item.value !== "BTC" &&
              item.value !== "XDAI" &&
              item.value !== "BNB" &&
              item.value !== "MATIC" &&
              item.value !== "OP" &&
              item.value !== "AVAX"
                ? "text-[#00000066]"
                : "text-[#000000b3]"
            }`}
          >
            {item.label}
            {#if type === "chain" && item.value !== "ALL" && item.value !== "ETH" && item.value !== "BTC" && item.value !== "XDAI" && item.value !== "BNB" && item.value !== "MATIC" && item.value !== "OP" && item.value !== "AVAX"}
              (Soon)
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
  }

  .button {
    width: max-content;
    border-radius: 1000px;
    padding: 8px 12px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .button.active {
    background: #20295b;
  }

  .content {
    overflow-y: overlay;
    position: absolute;
    right: 0;
    z-index: 2147483646;
    background: #ffffff;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .content::-webkit-scrollbar {
    display: none;
  }

  .content_item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .content_item:hover {
    background: #eff0f4;
  }

  .content_item.active {
    background: #eff0f4;
  }

  .content_item.active > .name {
    color: #1e96fc;
  }

  .content_item .name {
    font-weight: 500;
    transition: all 0.3s ease;
  }
</style>
