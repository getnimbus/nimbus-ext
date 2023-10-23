<script lang="ts">
  import debounce from 'lodash/debounce';

  import { clickOutside } from "~/utils";
  import All from "~/assets/all.svg";
  import UpArrow from "~/assets/up-arrow.svg";
  import { onMount } from 'svelte';
  
  const DEFAULT_COINS = [{
    name: 'All',
    logo: All
  }]

  let coins = DEFAULT_COINS;
  export let selected = null;
  export let positionSelectList = 'left-0';
  let isLoading = false
  let open = false;

  const search = debounce(async e => {
    try {
      isLoading = true
      const res = await fetch(`https://api.app-mobula.com/api/1/search?name=${e.target.value ?? ''}`);
      const { data = [] } = await res.json();
      coins = [...DEFAULT_COINS, ...data]
    } catch (error) {
      console.log(error);
    } finally{
      isLoading = false
    }
  }, 400)

  onMount(async () => {
    try {
      const res = await fetch(`https://api.app-mobula.com/api/1/search?name= `);
      const { data = [] } = await res.json();
      coins = [...DEFAULT_COINS, ...data]
    } catch (error) {
      console.log(error);
    }
  })
  console.log(coins)

</script>

<div class="wrapper" use:clickOutside on:click_outside={() => (open = false)}>
  <div
    class={`button xl:text-sm text-2xl`}
    class:active={open}
    on:click={() => (open = !open)}
  >
      {#if selected}
        <div class="flex items-center gap-2">
          <img
            src={selected.logo}
            alt=""
            class="xl:w-5 xl:h-5 w-7 h-7"
          />
          <div
            class={`xl:text-sm text-2xl name`}
          >
            {selected.name}
          </div>
        </div>
      {:else}
        <div class="flex items-center gap-2">
          Select Coin
          <img
            src={UpArrow}
            alt=""
            class="transform rotate-180 xl:w-3 xl:h-3 w-5 h-5"
            class:rotate-0={open}
          />
      </div>
      {/if}
      <img
        src={UpArrow}
        alt=""
        class="transform rotate-180 xl:w-3 xl:h-3 w-5 h-5"
        class:rotate-0={open}
      />
  </div>

  {#if open}
    <div
      class={`select_content content group xl:max-h-[300px] xl:w-[200px] xl:min-w-[200px] xl:max-h-[310px] max-h-[380px] w-[300px] min-w-[300px] mt-2 ${positionSelectList}`}
    >
      <input class="px-4 rounded-[1000px] cursor-pointer p-1 border mb-2 bg-transparent focus-visible:outline-none" placeholder="Search for Coin" on:keydown={search}/>
      {#if isLoading}
        <div class="h-45 flex justify-center items-center">
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      {:else}
        {#each coins as item}
        <div
          class="content_item"
          class:active={item.name === selected?.value}
          id={item.name}
          on:click={() => {
            selected = item;
            open = false;
          }}
        >
          {#if item.logo}
            <img
              src={item.logo}
              alt=""
              class="xl:w-5 xl:h-5 w-7 h-7"
            />
          {/if}
          <div
            class={`xl:text-sm text-2xl name`}
          >
            {item.name}
          </div>
        </div>
      {/each}
      {/if}
      
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
    z-index: 2147483646;
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
