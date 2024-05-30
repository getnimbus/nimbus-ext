/* eslint-disable no-console */
import Mark from "mark.js";
import "@webcomponents/webcomponentsjs/webcomponents-bundle.js";
import _ from "lodash";
import * as browser from "webextension-polyfill";
import { regexList } from "../../lib/chains";

import "~/components/custom/AddressSpreadText.custom.svelte";
import "~/components/custom/AptosTrxHighlight.custom.svelte";
import "~/components/custom/AptosTrxInfo.custom.svelte";
import "~/components/custom/QuickSearch.custom.svelte";
import "~/components/custom/AddressHighlight.custom.svelte"
import "~/components/custom/AddressInfo.custom.svelte";
import "~/components/custom/TrxHighlight.custom.svelte";
import "~/components/custom/TrxInfo.custom.svelte";

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(async () => {
  console.info("[Nimbus 🌩] Make Web3 simple for everyone");

  function areSiblingsInArray(spansArray) {
    const length = spansArray.length;
    for (let i = 0; i < length - 1; i++) {
      for (let j = i + 1; j < length; j++) {
        if (spansArray[i].parentNode === spansArray[j].parentNode) {
          return [spansArray[i], spansArray[j]];
        }
      }
    }
    return null;
  }

  function mergeSiblingText(span1, span2) {
    return span1.textContent.trim() + span2.textContent.trim();
  }

  function runMarkElement() {
    console.time("Nimbus marking");

    (() => {
      if (location.origin !== "https://explorer.aptoslabs.com" && location.origin !== "https://aptoscan.com") {
        return;
      }
      console.time("Marking version");
      const context = document;
      const instance = new Mark(context);

      const versionRegex = /^\s*\d{9}\s*$/g

      instance.markRegExp(versionRegex, {
        element: "aptos-trx-highlight",
        className: "nimbus-ext",
        exclude: ["[data-markjs]", ".nimbus-ext"],
        // acrossElements: true,
        debug: false,
        accuracy: "exactly",
        diacritics: false,
        each(item: any) {
          // Inject address as props
          item.setAttribute("id", item.innerText);
        },
        done() {
          console.timeEnd("Marking version");
        },
      });
    })();

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
      console.time("Marking address separated by 2 element");
      const spansArray = document.querySelectorAll('span');
      const siblingPair = areSiblingsInArray(spansArray);
      if (siblingPair) {
        const [span1, span2] = siblingPair;
        const parentNode = span1.parentNode

        const parentHref = regexList.map((regex) => {
          if (regex.regex_address) {
            const regexMatch = parentNode.href?.match(regex.regex_address);
            if (regexMatch === null || regexMatch === undefined) {
              return null
            } else {
              return regexMatch
            }
          }
        })

        const checkParentHref = parentHref.every(_.isNull);
        if (checkParentHref) {
          return
        }

        const address = mergeSiblingText(span1, span2);

        // combine 2 span detected into 1
        const parent = span1.parentNode;
        const mergedSpan = document.createElement('span');
        mergedSpan.textContent = address;
        parent.insertBefore(mergedSpan, span1);
        parent.removeChild(span1);
        parent.removeChild(span2);

        // detect if that span was address
        const spanElement = new Mark(parent);
        regexList.map((regex) => {
          if (regex.regex_address) {
            spanElement.markRegExp(regex.regex_address, {
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
                // console.timeEnd("Marking address");
                // console.log("Done mark addresses");
              },
            })
          }
        })
      } else {
        console.error('There are no spans that are siblings.');
      }
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
    setTimeout(() => {
      runMarkElement();
    }, 1000);
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
