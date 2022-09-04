/* eslint-disable no-console */
import Mark from "mark.js";
import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";

import "./views/AddressHighlight.svelte";
import "./views/TrxHighlight.svelte";
import "./views/QuickSearch.svelte";
import { sendMessage } from "webext-bridge";
import { track } from "~/lib/data-tracking";

const regexETHTrx = /0x[a-fA-F0-9]{64}/g; // TODO: Ignore longer address
const regexETHAddress = /0x[a-fA-F0-9]{40}/g; // TODO: Solana, Near regex

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(async () => {
  const coinList: { [key: string]: string | number }[] =
    (await sendMessage("coinList", { limit: 500 })) || [];

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
  }

  console.timeEnd("Nimbus marking");

  const quickSearchEle = document.createElement("quick-search");
  document.body.appendChild(quickSearchEle);
})();
