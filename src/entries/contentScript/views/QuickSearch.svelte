<svelte:options tag="quick-search" />

<script>
  import { onMount } from "svelte";
  import { coinGeko } from "../views/network";
  import { escapeRegex } from "../views/utils";
  import { get } from "lodash";
  import UrlPattern from "url-pattern";

  const listPage = [
    {
      name: "coinmarketcap",
      hostname: "coinmarketcap.com",
      urlPattern: [
        {
          selector: [".hero"],
          path: "/community/articles/:id",
        },
      ],
    },
    {
      name: "binance",
      hostname: "www.binance.com",
      urlPattern: [
        {
          selector: [".article", ".hero"],
          path: "/:lang/support/announcement/:id",
        },
      ],
    },
    {
      name: "kraken",
      hostname: "blog.kraken.com",
      urlPattern: [
        {
          selector: [".entry-content"],
          path: "/post/:id/:slug/",
        },
      ],
    },
  ];

  let coinList = [];
  let isChangeURL = false;

  onMount(() => {
    getCoinList();
  });

  const getCoinList = async () => {
    let response;
    try {
      response = await coinGeko.get("/coins/list");
    } catch (e) {
      console.error(e);
    }
    const coinList = get(response, "data");
    console.log("coinList: ", coinList);

    const nameAndSymbolList = [
      ...coinList.map((item) => item.symbol.toUpperCase()),
    ];

    const regexNativeToken = new RegExp(
      `\\b(${nameAndSymbolList
        .slice(0, 500)
        .map(function (w) {
          return escapeRegex(w);
        })
        .join("|")})\\b`,
      "g"
    );
    console.log("regexNativeToken: ", regexNativeToken);
  };

  const handleDectecUrl = () => {
    const selectedPageFromCurrentUrl = listPage.find((item) => {
      return location.hostname === item.hostname;
    });

    const patternUrl = selectedPageFromCurrentUrl.urlPattern.map((item) => {
      return new UrlPattern(item.path);
    });

    const arrayUrlDetected = patternUrl.map((item) => {
      return item.match(location.pathname);
    });

    isChangeURL = arrayUrlDetected.some((el) => el !== null);
  };

  let currentUrl = window.location.href;
  const observer = new MutationObserver((e) => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      handleDectecUrl();
      setTimeout(() => {
        handleDectecUrl();
      }, 3000);
    }
  });
  observer.observe(document, { subtree: true, childList: true });
</script>

{#if isChangeURL}
  <div class="text-lg text-red-500 fixed top-0 right-0 z-10">hello world</div>
{/if}
