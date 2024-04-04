<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import "flowbite/dist/flowbite.css";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { isDarkMode } from "~/store";
  import { i18n } from "~/lib/i18n";

  import Mixpanel from "~/components/Mixpanel.svelte";
  import Icon from "~/UI/Option/Icon.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TabHighlight from "~/UI/Option/TabHighlight.svelte";
  import TabSettings from "~/UI/Option/TabSettings.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  const listSideBar = [
    {
      label: i18n("optionsPage.tab-title-highlight", "Highlight"),
      value: "highlight",
      type: "Highlight",
    },
    // {
    //   label: i18n("optionsPage.tab-title-settings", "Settings"),
    //   value: "settings",
    //   type: "Settings",
    // },
  ];

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    },
  });

  let activeTabValue = "highlight";

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParams = urlParams.get("tab");
    if (tabParams) {
      activeTabValue = tabParams;
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?tab=${tabParams}`
      );
    } else {
      activeTabValue = "highlight";
      window.history.replaceState(
        null,
        "",
        window.location.pathname + "?tab=highlight"
      );
    }

    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      window.document.body.classList.add("dark");
      isDarkMode.update((n) => (n = true));
    } else {
      window.document.body.classList.remove("dark");
      isDarkMode.update((n) => (n = false));
    }
  });

  const handleClick = (e, tabValue) => {
    e.preventDefault();
    activeTabValue = tabValue;
    window.history.replaceState(
      null,
      "",
      window.location.pathname + `?tab=${tabValue}`
    );
  };
</script>

<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <Mixpanel>
      <div
        class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 grid xl:grid-cols-6 grid-cols-1 gap-6"
      >
        <div class="col-span-1 flex flex-col items-center">
          <img
            src={$isDarkMode ? LogoWhite : Logo}
            alt="logo"
            loading="lazy"
            decoding="async"
            class="mb-4 mx-auto"
            width={150}
          />
          <div class="w-full flex flex-col gap-4">
            {#each listSideBar as item}
              <div
                on:click={(e) => handleClick(e, item.value)}
                class={`flex items-center gap-2 rounded-[10px] py-2 px-3 cursor-pointer transition-all ${
                  activeTabValue === item.value
                    ? "text-blue-500 bg-gray-200"
                    : $isDarkMode
                      ? "text-white hover:bg-gray-100"
                      : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Icon
                  type={item.type}
                  active={activeTabValue === item.value ? true : false}
                />
                <div>{item.label}</div>
              </div>
            {/each}
          </div>
        </div>

        <div class="xl:col-span-5 col-span-1">
          {#if activeTabValue === "highlight"}
            <TabHighlight />
            <!-- {:else if activeTabValue === "settings"}
              <TabSettings /> -->
          {/if}
        </div>
      </div>
    </Mixpanel>
  </QueryClientProvider>
</ErrorBoundary>

<style global windi:preflights:global windi:safelist:global>
  :global(body) {
    background: #fff;
    color: black;
    transition: background-color 0.3s;
  }
  :global(body.dark) {
    background: #161616;
    color: #fff;
  }

  :global(body) .footer {
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 40px;
  }
  :global(body.dark) .footer {
    background: #080808;
    box-shadow: rgba(0, 0, 0, 1) 0px 0px 5px;
  }

  :global(body) .bg_f4f5f8 {
    background: #f4f5f8;
  }
  :global(body.dark) .bg_f4f5f8 {
    background: #000;
  }

  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #00000033;
  }

  :global(body) .text_00000080 {
    color: #00000080;
  }
  :global(body.dark) .text_00000080 {
    color: #d1d5db;
  }

  :global(body) .text_27326F {
    color: #27326f;
  }
  :global(body.dark) .text_27326F {
    color: #3b82f6;
  }

  :global(body) .text_00000099 {
    color: #00000099;
  }
  :global(body.dark) .text_00000099 {
    color: #ccc;
  }

  :global(body) .text_00000066 {
    color: #00000099;
  }
  :global(body.dark) .text_00000066 {
    color: #cdcdcd;
  }

  :global(body) .border_0000001a {
    border-color: #0000001a;
  }
  :global(body.dark) .border_0000001a {
    border-color: #cdcdcd59;
  }

  :global(body) .border_0000000d {
    border-color: #0000000d;
  }
  :global(body.dark) .border_0000000d {
    border-color: #cdcdcd26;
  }
</style>
