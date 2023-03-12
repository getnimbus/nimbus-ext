<script>
  import UpArrow from "~/assets/up-arrow.svg";

  export let chainList;
  let selectedItem = chainList[0];
  let open = false;
</script>

<div class="wrapper">
  <div class="button" on:click={() => (open = !open)}>
    <div class="label_container">
      <img src={selectedItem.logo} alt="logo" width="18" height="18" />
      <div class="label">{selectedItem.label}</div>
    </div>
    <img
      src={UpArrow}
      alt=""
      class="transform rotate-180"
      class:rotate-0={open}
    />
  </div>

  {#if open}
    <div class="content">
      {#each chainList as chain}
        <div
          class="content_item"
          class:active={chain.value === selectedItem.value}
          id={chain.value}
          on:click={() => {
            selectedItem = chain;
            open = false;
          }}
        >
          <img src={chain.logo} alt="logo" width="18" height="18" />
          <div class="name">{chain.label}</div>
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
    min-width: 154px;
    width: 154px;
    border-radius: 1000px;
    background: #20295b;
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
  }

  .button .label_container {
    display: flex;
    align-items: center;
    gap: 8px;

    white-space: nowrap;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .button .label_container .label {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: white;

    white-space: nowrap;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .content {
    min-width: 190px;
    width: 190px;
    max-height: 400px;
    overflow-y: overlay;
    position: absolute;
    right: 0;
    z-index: 2147483647;
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
    color: rgba(0, 0, 0, 0.7);
    transition: all 0.3s ease;
  }
</style>
