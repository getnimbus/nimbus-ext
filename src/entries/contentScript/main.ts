/* eslint-disable no-console */
// import { onMessage, sendMessage } from "webext-bridge";
// import browser from "webextension-polyfill";
import Mark from "mark.js";
import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import { coinGeko } from "./views/network";
import { get } from "lodash";
import UrlPattern from "url-pattern";

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
    url: "articles",
    selector: ".hero",
    hostname: "coinmarketcap.com"
  },
  {
    name: "binance",
    url: "announcement",
    selector: "article",
    hostname: "www.binance.com"
  },
  {
    name: "kraken",
    url: "post",
    selector: ".entry-content",
    hostname: "blog.kraken.com"
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
  const data = get(response, "data") || [];
  return [
    ...data.map((item: any) => item.symbol.toUpperCase()),
    ...data.map((item: any) => item.name),
  ];
};

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(async () => {
  // const coinList: { [key: string]: string | number }[] =
  //   (await sendMessage("coinList", { limit: 500 })) || [];

  const coinList = (await getCoinList()) || [];

  // const nameAndSymbolList: string[] = [
  //   ...coinList.map((item: any) => item.symbol.toUpperCase()),
  //   ...coinList.map((item: any) => item.name),
  // ];

  // console.log("nameAndSymbolList: ", nameAndSymbolList);

  const regexNativeToken = new RegExp(
    coinList
      .map(function (w) {
        return escapeRegex(w);
      })
      .join("|"),
    "g"
  );

  console.info("[Nimbus 🌩] Hello world from content script");

  function runMarkElement() {
    (() => {
      const context = document;
      const instance = new Mark(context);
      instance.markRegExp(regexETHTrx, {
        element: "trx-highlight",
        className: "nimbus-ext",
        exclude: ["[data-markjs]", ".nimbus-ext", "trx-info"],
        // acrossElements: true,
        debug: true,
        each(item: any) {
          // Inject address as props
          item.setAttribute("hash", item.innerText);
        },
        done() {
          // console.log("Done mark addresses");
        },
      });
    })();

    (() => {
      const context = document;
      const instance = new Mark(context);
      instance.markRegExp(regexETHTrx, {
        element: "trx-highlight",
        className: "nimbus-ext",
        exclude: ["[data-markjs]", ".nimbus-ext", "trx-info"],
        // acrossElements: true,
        debug: true,
        each(item: any) {
          // Inject address as props
          item.setAttribute("hash", item.innerText);
        },
        done() {
          // console.log("Done mark addresses");
        },
      });
    })();

    (() => {
      const context = document;
      const instance = new Mark(context);
      instance.markRegExp(regexETHAddress, {
        element: "address-highlight",
        className: "nimbus-ext",
        exclude: ["[data-markjs]", ".nimbus-ext", "address-info"],
        // acrossElements: true,
        debug: true,
        each(item: any) {
          // Inject address as props
          item.setAttribute("address", item.innerText);
        },
        done() {
          // console.log("Done mark addresses");
        },
      });
    })();

    (() => {
      // const selectedPageSupport = listPage.find(
      //   (item: { [key: string]: string }) => currentUrl.includes(item.url)
      // );

      const selectedPageSupport = listPage.find(
        (item: { [key: string]: string }) => {
          const regex = new RegExp(`^\/${item.url}\/(.*)$`)
          const pattern = new UrlPattern(regex);

          const matchCurrentUrl = currentUrl.match(item.url)

          const structUrlMatch = matchCurrentUrl && "/" + matchCurrentUrl[0]

          const indexOfSelectedStringUrl = currentUrl.indexOf(structUrlMatch)
          const conditionalUrlRegex = indexOfSelectedStringUrl !== -1 && currentUrl.slice(indexOfSelectedStringUrl)

          const hostname = location.hostname;

          return matchCurrentUrl && matchCurrentUrl[0] === item.url && pattern.match(conditionalUrlRegex) !== null && hostname === item.hostname
        }
      );

      console.log("selectedPageSupport: ", selectedPageSupport)

      const context = document.querySelector(
        `${selectedPageSupport?.selector}`
      );
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
        filter: function (textNode: any, foundTerm: string, totalCounter: any) {
          return true; // must return either true or false
        },
        done() {
          // console.log("Done mark addresses");
        },
      });
    })();
  }

  window.onload = () => {
    runMarkElement();
  };

  const observer = new MutationObserver(() => runMarkElement());
  const config = { subtree: true, childList: true };
  observer.observe(document, config);
})();
