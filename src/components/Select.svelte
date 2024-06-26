<script lang="ts">
  import { triggerClickOutside } from "~/utils/functions";

  import UpArrow from "~/assets/up-arrow.svg";
  import All from "~/assets/all.svg";

  export let listSelect;
  export let selected;
  export let type: "lang";
  export let positionSelectList = "left-0";
  export let disabled = false;

  let open = false;

  $: {
    if (listSelect && type === "lang") {
      selected = listSelect[0];
    }
  }

  let selectedChain = [];
</script>

<div
  class="wrapper"
  use:triggerClickOutside
  on:click_outside={() => (open = false)}
>
  <div
    class={`button ${type === "lang" ? "bg-[#1E96FC]" : ""}`}
    class:active={open}
    on:click={() => {
      if (!disabled) {
        open = !open;
      }
    }}
  >
    <div class="flex items-center gap-2">
      {#if type === "lang"}
        {#if selected?.logo || selectedChain[0]?.logo}
          <img
            src={selected?.value === "ALL" || selectedChain[0]?.value === "ALL"
              ? All
              : selected?.logo || selectedChain[0]?.logo}
            alt=""
            class="xl:w-5 xl:h-5 w-7 h-7 rounded-full"
          />
        {/if}
        <div class="text-white xl:text-sm text-lg">
          {selected?.label || selectedChain[0]?.label}
        </div>
      {:else}
        <div class="text-white xl:text-sm text-lg">
          Other ({listSelect.length})
        </div>
      {/if}
    </div>
    <img
      src={UpArrow}
      alt=""
      class="transform rotate-180 w-3 h-3"
      class:rotate-0={open}
    />
  </div>

  {#if open}
    <div
      class={`select_content content group xl:max-h-[300px] xl:w-[200px] xl:min-w-[200px] xl:max-h-[310px] max-h-[380px] md:w-[300px] md:min-w-[300px] w-[240px] min-w-[240px] mt-2 ${positionSelectList}`}
    >
      {#each listSelect as item}
        <div
          class="content_item"
          class:active={item.value === selected}
          id={item.value}
          on:click={() => {
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
              class="w-5 h-5 rounded-full"
            />
          {/if}
          <div class="xl:text-sm text-lg name">
            {item.label}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
    width: max-content;
  }

  .button {
    width: max-content;
    border-radius: 1000px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  :global(body) .button.active {
    background: #20295b;
  }
  :global(body.dark) .button.active {
    background: #212121;
  }

  :global(body) .button:hover {
    background: #525b8c;
  }
  :global(body.dark) .button:hover {
    background: #222222;
  }

  .content {
    overflow-y: overlay;
    position: absolute;
    z-index: 8;
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
    padding: 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .content_item.active > .name {
    color: #1e96fc;
  }

  .content_item .name {
    font-weight: 500;
    transition: all 0.3s ease;
  }

  :global(body) .select_content {
    background: #ffffff;
    border: 0.5px solid transparent;
  }
  :global(body.dark) .select_content {
    background: #131313;
    border: 0.5px solid #cdcdcd59;
  }

  :global(body) .select_content .content_item.active {
    background: #eff0f4;
  }
  :global(body.dark) .select_content .content_item.active {
    background: #343434;
  }

  :global(body) .select_content .content_item:hover {
    background: #eff0f4;
  }
  :global(body.dark) .select_content .content_item:hover {
    background: #222222;
  }
</style>
