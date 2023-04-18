<script>
  import UpArrow from "~/assets/up-arrow.svg";
  import All from "~/assets/all.svg";

  export let listSelect;
  export let selected;
  export let isSelectWallet = false;
  export let isOptionsPage = false;
  export let isWalletSelect = false;

  let open = false;
</script>

<div class="wrapper">
  <div
    class={`button ${
      isOptionsPage
        ? !isSelectWallet
          ? "bg-[#1E96FC]"
          : ""
        : "hover:bg-[#525b8c]"
    }`}
    class:active={open}
    on:click={() => (open = !open)}
  >
    <div class="label_container">
      {#if !isSelectWallet}
        <img
          src={selected.value === "all" ? All : selected.logo}
          alt="logo"
          width="18"
          height="18"
        />
        <div class="label">{selected.label}</div>
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
    <div class="content" class:right-0={!isOptionsPage}>
      {#each listSelect as item}
        <div
          class="content_item"
          class:active={item.value === selected.value}
          id={item.value}
          on:click={() => {
            if (
              item.value !== "all" &&
              item.value !== "eth" &&
              !isOptionsPage
            ) {
              open = false;
              return;
            }
            selected = item;
            open = false;
          }}
        >
          {#if !isWalletSelect}
            <img
              src={item.value === "all" ? All : item.logo}
              alt="logo"
              width="18"
              height="18"
            />
          {/if}
          <div
            class={`name ${
              item.value !== "all" && item.value !== "eth" && !isOptionsPage
                ? "text-[#00000066]"
                : "text-[#000000b3]"
            }`}
          >
            {item.label}
            {#if item.value !== "all" && item.value !== "eth" && !isOptionsPage}
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
    animation: growDown 300ms ease-in-out forwards;
    transform-origin: top center;
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

  @keyframes growDown {
    0% {
      transform: scaleY(0);
    }
    80% {
      transform: scaleY(1.05);
    }
    100% {
      transform: scaleY(1);
    }
  }
</style>
