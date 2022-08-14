import * as browser from "webextension-polyfill";
import { onMessage } from "webext-bridge";

browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

console.log(browser);

const fetchBasicData = async () => {
  const list = await fetch("https://api.coingecko.com/api/v3/search").then(
    (response) => response.json()
  );
  console.log(browser.storage);
  browser.storage.local
    .set({ coinList: JSON.stringify(list.coins) })
    .then(() => {
      console.log("Loaded crypto list");
    });
};

browser.runtime.onStartup.addListener(async () => {
  console.log("onStartup....");
  await fetchBasicData();
});

interface ICoinListInput {
  limit: number;
}

onMessage<ICoinListInput, any>("coinList", async ({ data: { limit } }) => {
  try {
    const data = JSON.parse(
      (await browser.storage.local.get("coinList")).coinList
    );
    return data.slice(0, limit);
  } catch (error) {
    return [];
  }
});

// Run on init
fetchBasicData();
