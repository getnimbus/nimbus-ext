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
    type === "chain" &&
    listSelect &&
    selected &&
    listSelect.filter((item) => item.value === selected);
</script>

<div class="wrapper">
  <div
    class={`button hover:bg-[#525b8c] ${type === "lang" && "bg-[#1E96FC]"}`}
    class:active={open}
    on:click={() => (open = !open)}
  >
    <div class="label_container">
      {#if type === "chain" || type === "lang"}
        <img
          src={selected.value === "ALL" || selectedChain[0]?.value === "ALL"
            ? All
            : selected.logo || selectedChain[0]?.logo}
          alt="logo"
          width="18"
          height="18"
        />
        <div class="label">{selected.label || selectedChain[0]?.label}</div>
      {:else}
        <div class="label">Other ({listSelect.length})</div>
      {/if}
    </div>
    <img
      src={UpArrow}
      alt=""
      class="transform rotate-180"
      class:rotate-0={open}
    />
  </div>

  {#if open}
    <div class="content" class:right-0={type !== "lang"}>
      {#each listSelect as item}
        <div
          class="content_item"
          class:active={type !== "lang"
            ? item.value === selected
            : item.value === selected.value}
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
                item.value !== "GNOSIS"
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
          <img
            src={item.value === "ALL" ? All : item.logo}
            alt="logo"
            width="18"
            height="18"
          />
          <div
            class={`name ${
              type === "chain" &&
              item.value !== "ALL" &&
              item.value !== "ETH" &&
              item.value !== "BTC" &&
              item.value !== "GNOSIS"
                ? "text-[#00000066]"
                : "text-[#000000b3]"
            }`}
          >
            {item.label}
            {#if type === "chain" && item.value !== "ALL" && item.value !== "ETH" && item.value !== "BTC" && item.value !== "GNOSIS"}
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
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
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

  .button .label_container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .button .label_container .label {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: white;
  }

  .content {
    min-width: 190px;
    width: 190px;
    max-height: 400px;
    overflow-y: overlay;
    position: absolute;
    z-index: 2147483646;
    margin-top: 5.5px;
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
    font-size: 14px;
    line-height: 17px;
    transition: all 0.3s ease;
  }
</style>
