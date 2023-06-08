/* eslint-disable no-console */
import Mark from "mark.js";
import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";

import "./views/AddressHighlight.custom.svelte";
import "./views/AddressInfo.custom.svelte";
import "./views/AddressSpreadText.custom.svelte";
import "./views/TrxHighlight.custom.svelte";
import "./views/QuickSearch.custom.svelte";
import { sendMessage } from "webext-bridge";
import { track } from "~/lib/data-tracking";
import * as dg from "~/lib/debug";
import * as browser from "webextension-polyfill";
import { regexList } from "../../utils";

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(async () => {
  console.info("[Nimbus 🌩] Make Web3 simple for everyone");

  function runMarkElement() {
    console.time("Nimbus marking");

    (() => {
      console.time("Marking tx");
      const context = document;
      const instance = new Mark(context);
      regexList.map((regex) => {
        if (regex.regex_trx) {
          instance.markRegExp(regex.regex_trx, {
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
              item.setAttribute("name", regex.name);
            },
            done() {
              console.timeEnd("Marking tx");
              // console.log("Done mark addresses");
            },
          });
        }
      })
    })();

    (() => {
      console.time("Marking address");
      const context = document;
      const instance = new Mark(context);
      regexList.map((regex) => {
        if (regex.regex_address) {
          instance.markRegExp(regex.regex_address, {
            element: "address-highlight",
            className: "nimbus-ext",
            exclude: [
              "[data-markjs]",
              ".nimbus-ext",
              "address-info",
              "address-spreadtext",
            ],
            // acrossElements: true,
            debug: false,
            accuracy: "exactly",
            diacritics: false,
            each(item: any) {
              // Inject address as props
              item.setAttribute("address", item.innerText);
              item.setAttribute("name", regex.name)
            },
            done() {
              console.timeEnd("Marking address");
              // console.log("Done mark addresses");
            },
          })
        }
      })
    })();
  }

  if (window.location.origin !== "https://app.getnimbus.io") {
    runMarkElement();
  }

  console.timeEnd("Nimbus marking");
  let quickSearchEle = document.createElement("quick-search");
  document.body.appendChild(quickSearchEle);

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      document.body.removeChild(quickSearchEle);
      quickSearchEle = document.createElement("quick-search");
      document.body.appendChild(quickSearchEle);
      console.log("Change Lang!");
    }
  });
})();
