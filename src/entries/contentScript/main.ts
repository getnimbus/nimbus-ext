/* eslint-disable no-console */
// import { onMessage, sendMessage } from "webext-bridge";
import * as browser from "webextension-polyfill";
import Mark from "mark.js";
import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import { coinGeko } from "./views/network";
import { get } from "lodash";
import UrlPattern from "url-pattern";

import "./views/AddressHighlight.svelte";
import "./views/TrxHighlight.svelte";
import "./views/NativeTokenHighlight.svelte";
import "./views/QuickSearch.svelte";
import { escapeRegex } from "./views/utils";
import { sendMessage } from "webext-bridge";

const regexETHTrx = /0x[a-fA-F0-9]{64}/g; // TODO: Ignore longer address
const regexETHAddress = /0x[a-fA-F0-9]{40}/g; // TODO: Solana, Near regex

const listPage: { [key: string]: string | any[] }[] = [
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
  // {
  //   name: "kucoin",
  //   url: "https://www.kucoin.com/news",
  //   selector: ".article___1avbl",
  // },
  // {
  //   name: "bitfinex",
  //   url: "https://www.bitfinex.com/posts",
  //   selector: ".announcements_page_content",
  // },
  // {
  //   name: "gemini",
  //   url: "https://www.gemini.com/blog",
  //   selector: ".inbiro",
  // },
  // {
  //   name: "coindesk",
  //   url: "https://www.coindesk.com/markets",
  //   selector: ".main-body-grid",
  // },
  // {
  //   name: "marginatm",
  //   url: "https://marginatm.com",
  //   selector: "#post-detail-content",
  // },
  // {
  //   name: "theblock",
  //   url: "https://www.theblock.co/post",
  //   selector: ".articleContent",
  // },
];

const getCoinList = async () => {
  let response;
  try {
    response = await coinGeko.get("/coins/list");
  } catch (e) {
    console.error(e);
  }
  return get(response, "data") || [];
};

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(async () => {
  const coinList: { [key: string]: string | number }[] =
    (await sendMessage("coinList", { limit: 500 })) || [];

  // const coinList = (await getCoinList()) || [];

  const nameAndSymbolList: string[] = [
    ...coinList.map((item: any) => item.symbol.toUpperCase()),
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

  console.info("[Nimbus 🌩] Hello world from content script");

  runMarkElement();

  function runMarkElement() {
    console.time("Nimbus marking");

    (() => {
      console.time("Marking tx");
      const context = document;
      const instance = new Mark(context);
      instance.markRegExp(regexETHTrx, {
        element: "trx-highlight",
        className: "nimbus-ext",
        exclude: ["[data-markjs]", ".nimbus-ext", "address-info"],
        // acrossElements: true,
        debug: false,
        accuracy: "exactly",
        diacritics: false,
        each(item: any) {
          // Inject address as props
          item.setAttribute("hash", item.innerText);
        },
        done() {
          console.timeEnd("Marking tx");
          // console.log("Done mark addresses");
        },
      });
    })();

    (() => {
      console.time("Marking address");
      const context = document;
      const instance = new Mark(context);
      // /0x[a-fA-F0-9]{64}/g
      instance.markRegExp(regexETHAddress, {
        element: "address-highlight",
        className: "nimbus-ext",
        exclude: ["[data-markjs]", ".nimbus-ext", "address-info"],
        // acrossElements: true,
        debug: false,
        accuracy: "exactly",
        diacritics: false,
        each(item: any) {
          const selectedItem = coinList.find(
            (data: { [key: string]: string | number }) =>
              data.symbol === item.innerText || data.name === item.innerText
          );

          // Inject address as props
          item.setAttribute("address", item.innerText);
        },
        done() {
          console.time("Marking address");
          // console.log("Done mark addresses");
        },
      });
    })();

    (() => {
      const selectedPageFromCurrentUrl: any = listPage.find((item) => {
        return location.hostname === item.hostname;
      });
      // console.log("selectedPageFromCurrentUrl: ", selectedPageFromCurrentUrl);

      if (!selectedPageFromCurrentUrl) return;

      const patternUrl = selectedPageFromCurrentUrl.urlPattern.map((item) => {
        return new UrlPattern(item.path);
      });

      const arrayUrlDetected = patternUrl.map((item) => {
        return item.match(location.pathname);
      });
      // console.log("arrayUrlDetected: ", arrayUrlDetected);

      const urlDetected = arrayUrlDetected.some((el) => el !== null);
      // console.log("urlDetected: ", urlDetected);

      if (!urlDetected) return;

      // console.log("regexNativeToken: ", regexNativeToken);

      selectedPageFromCurrentUrl.urlPattern.forEach((item) => {
        item.selector.map((selectDOM) => {
          const context = document.querySelector(selectDOM);
          const instance = new Mark(context);
          // /0x[a-fA-F0-9]{64}/g
          instance.markRegExp(regexNativeToken, {
            // instance.markRegExp(/BTC|ETH|Bitcoin/g, {
            element: "native-token-highlight",
            className: "nimbus-ext",
            exclude: ["[data-markjs]", ".nimbus-ext", "native-token-info"],
            // acrossElements: true,
            debug: true,
            each(item: any) {
              const selectedItem = coinList.find(
                (data: { [key: string]: string | number }) =>
                  data.symbol === item.innerText || data.name === item.innerText
              );

              // Inject address as props
              item.setAttribute("id", selectedItem?.id);
              item.setAttribute("name", item.innerText);
            },
            filter: function (
              textNode: any,
              foundTerm: string,
              totalCounter: any
            ) {
              return true; // must return either true or false
            },
            done() {
              // console.log("Done mark addresses");
            },
          });
        });
      });
    })();
  }

  console.timeEnd("Nimbus marking");

  let currentUrl = window.location.href;

  const observer = new MutationObserver((e) => {
    if (window.location.href !== currentUrl) {
      console.log("URL changed");
      currentUrl = window.location.href;
      runMarkElement();
      setTimeout(() => {
        runMarkElement();
      }, 3000);
    }
  });
  observer.observe(document, { subtree: true, childList: true });

  const quickSearchEle = document.createElement("quick-search");
  document.body.appendChild(quickSearchEle);
})();
