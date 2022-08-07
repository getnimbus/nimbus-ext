/* eslint-disable no-console */
// import { onMessage, sendMessage } from "webext-bridge";
// import browser from "webextension-polyfill";
import Mark from "mark.js";
import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
// import { coinGeko } from "./views/network";

import "./views/AddressHighlight.svelte";
import "./views/TrxHighlight.svelte";
import "./views/NativeTokenHighlight.svelte";
import { escapeRegex } from "./views/utils";

const regexETHTrx = /0x[a-fA-F0-9]{64}/g; // TODO: Ignore longer address
const regexETHAddress = /0x[a-fA-F0-9]{40}/g; // TODO: Solana, Near regex

const currentUrl: string = window.location.href;
const listPage: { [key: string]: string }[] = [
  {
    name: "coinmarketcap",
    url: "https://coinmarketcap.com/community/articles",
    selector: ".hero",
  },
  {
    name: "binance",
    url: "https://www.binance.com/en/support/announcement",
    selector: "article",
  },
  {
    name: "kraken",
    url: "https://blog.kraken.com/post",
    selector: ".entry-content",
  },
  {
    name: "kucoin",
    url: "https://www.kucoin.com/news",
    selector: ".article___1avbl",
  },
  {
    name: "bitfinex",
    url: "https://www.bitfinex.com/posts",
    selector: ".announcements_page_content",
  },
  {
    name: "gemini",
    url: "https://www.gemini.com/blog",
    selector: ".inbiro",
  },
  {
    name: "coindesk",
    url: "https://www.coindesk.com/markets",
    selector: ".main-body-grid",
  },
  {
    name: "marginatm",
    url: "https://marginatm.com",
    selector: "#post-detail-content",
  },
  {
    name: "theblock",
    url: "https://www.theblock.co/post",
    selector: ".articleContent",
  },
];

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(async () => {
  // const coinList: { [key: string]: string | number }[] =
  //   (await sendMessage("coinList", { limit: 500 })) || [];

  // const nameAndSymbolList: string[] = [
  //   ...coinList.map((item: any) => item.symbol.toUpperCase()),
  //   ...coinList.map((item: any) => item.name),
  // ];

  // const regexNativeToken = new RegExp(
  //   nameAndSymbolList
  //     .map(function (w) {
  //       return escapeRegex(w);
  //     })
  //     .join("|"),
  //   "g"
  // );

  console.info("[Nimbus 🌩] Hello world from content script");

  window.onload = () => {
    console.log("Window onload");
    runMarkElement();
  };

  runMarkElement();

  function runMarkElement() {
    console.time("Start marking");

    (() => {
      console.time("Marking tx");
      const context = document;
      const instance = new Mark(context);
      instance.markRegExp(regexETHTrx, {
        element: "trx-highlight",
        className: "nimbus-ext",
        exclude: ["[data-markjs]", ".nimbus-ext", "trx-info"],
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
      instance.markRegExp(regexETHAddress, {
        element: "address-highlight",
        className: "nimbus-ext",
        exclude: ["[data-markjs]", ".nimbus-ext", "address-info"],
        // acrossElements: true,
        debug: false,
        accuracy: "exactly",
        diacritics: false,
        each(item: any) {
          // Inject address as props
          item.setAttribute("address", item.innerText);
        },
        done() {
          console.time("Marking address");
          // console.log("Done mark addresses");
        },
      });
    })();

    // (() => {
    //   const selectedPageSupport = listPage.find(
    //     (item: { [key: string]: string }) => currentUrl.includes(item.url)
    //   );

    //   const context = document.querySelector(
    //     `${selectedPageSupport?.selector}`
    //   );
    //   const instance = new Mark(context);
    //   // /0x[a-fA-F0-9]{64}/g
    //   instance.markRegExp(regexNativeToken, {
    //     // instance.markRegExp(/BTC|ETH|Bitcoin/g, {
    //     element: "native-token-highlight",
    //     className: "nimbus-ext",
    //     exclude: ["[data-markjs]", ".nimbus-ext", "native-token-info"],
    //     // acrossElements: true,
    //     debug: true,
    //     each(item: any) {
    //       const selectedItem = coinList.find(
    //         (data: { [key: string]: string | number }) =>
    //           data.symbol === item.innerText || data.name === item.innerText
    //       );

    //       // Inject address as props
    //       item.setAttribute("id", selectedItem?.id);
    //       item.setAttribute("name", item.innerText);
    //     },
    //     filter: function (textNode: any, foundTerm: string, totalCounter: any) {
    //       return true; // must return either true or false
    //     },
    //     done() {
    //       // console.log("Done mark addresses");
    //     },
    //   });
    // })();

    console.timeEnd("Start marking");
  }

  // const observer = new MutationObserver(() => runMarkElement());
  // const config = { subtree: true, childList: true };
  // observer.observe(document, config);
})();
