<script lang="ts">
  import { clickOutside } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { createQuery } from "@tanstack/svelte-query";
  import { isDarkMode } from "~/store";

  import Loading from "./Loading.svelte";

  import All from "~/assets/all.svg";
  import AllWhite from "~/assets/all-white.svg";
  import UpArrow from "~/assets/up-arrow.svg";
  import Search from "~/assets/search.svg";
  import SearchBlack from "~/assets/search-black.svg";

  export let selected = null;
  export let positionSelectList = "left-0";

  const DEFAULT_COINS = [
    {
      name: "All",
      symbol: "all",
      logo: All,
    },
  ];

  let coins = DEFAULT_COINS;
  let open = false;
  let timerDebounce;
  let search = "";

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      search = value;
    }, 300);
  };

  const handleSearchTokenMobula = async (searchValue: string) => {
    const response = await nimbus.get(`/token/${searchValue}/info/mobula`);
    return response?.data?.data;
  };

  $: query = createQuery({
    queryKey: ["search-token-mobula", search],
    queryFn: () => handleSearchTokenMobula(search),
    enabled: search.length !== 0,
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      $query.data.length !== 0
    ) {
      coins = [...DEFAULT_COINS, ...$query?.data];
    }
  }

  $: {
    if (search.length === 0) {
      coins = [...DEFAULT_COINS];
    }
  }
</script>

<div class="wrapper" use:clickOutside on:click_outside={() => (open = false)}>
  <div
    class={`button xl:text-sm text-lg bg-[#1E96FC]`}
    class:active={open}
    on:click={() => (open = !open)}
  >
    {#if selected}
      <div class="flex items-center gap-2">
        <img
          src={selected.name === "All" ? AllWhite : selected.logo}
          alt=""
          class="xl:w-5 xl:h-5 w-7 h-7"
        />
        <div class="xl:text-sm text-lg name">
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
      class={`select_content content group xl:max-h-[300px] xl:w-[200px] xl:min-w-[200px] xl:max-h-[310px] max-h-[380px] md:w-[300px] md:min-w-[300px] w-[240px] min-w-[240px] mt-2 ${positionSelectList}`}
    >
      <div
        class={`flex items-center gap-2 mb-2 rounded-[1000px] px-4 ${
          $isDarkMode ? "bg-[#212121]" : "bg-[#eff0f4]"
        }`}
      >
        <img
          src={$isDarkMode ? Search : SearchBlack}
          alt=""
          class="xl:w-5 xl:h-5 w-9 h-9"
        />
        <input
          class={`flex-1 xl:py-2 py-3 xl:text-sm text-lg max-w-[100px] border-none focus:outline-none focus:ring-0 ${
            $isDarkMode ? "bg-[#212121]" : "bg-[#eff0f4]"
          }`}
          placeholder="Search"
          on:keyup={({ target: { value } }) => debounceSearch(value)}
        />
      </div>
      {#if $query.isFetching}
        <div class="h-45 flex justify-center items-center">
          <Loading />
        </div>
      {:else}
        {#each coins as item}
          <div
            class="content_item"
            class:active={item.symbol === selected?.symbol}
            id={item.symbol}
            on:click={() => {
              selected = item;
              open = false;
            }}
          >
            {#if item.logo}
              <img src={item.logo} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
            {/if}
            <div class="xl:text-sm text-lg name">
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
