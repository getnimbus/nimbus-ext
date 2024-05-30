import * as browser from "webextension-polyfill";

import { coinGeko, mixpanel, nimbus, goplus, nimbusApi } from "../../lib/network";

const fetchBasicData = async () => {
  const list = await coinGeko.get("/search");
  browser.storage.local
    .set({ coinList: JSON.stringify(list.coins) })
    .then(() => {
      console.log("Loaded crypto list");
    });
};

const fetchConfigPages = async () => {
  const listConfigPages = await nimbus.get("/config/pages");
  browser.storage.local
    .set({ configPageList: JSON.stringify(listConfigPages.data) })
    .then(() => {
      console.log("Loaded config page list");
    });
};

const fetchListTerm = async () => {
  const listTerm = await nimbus.get("/terms").then((response) => response.data);
  browser.storage.local.set({ termList: JSON.stringify(listTerm) }).then(() => {
    console.log("Loaded list term");
  });
};

browser.runtime.onStartup.addListener(async () => {
  console.log("onStartup....");
  await fetchBasicData();
  await fetchConfigPages();
  await fetchListTerm();
});

browser.commands.onCommand.addListener((command) => {
  if (command === "open-quick-search") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tab) => {
      browser.tabs.sendMessage(tab[0].id, { action: "toggleSidebar" });
    });
  }
});

browser.action.onClicked.addListener(() => {
  browser.tabs.create({ url: "https://app.getnimbus.io/" });
});

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed");
  const reason = details.reason
  if (reason === 'install') {
    browser.tabs.create({ url: 'src/entries/onboard/index.html' });
    browser.storage.sync.set({ defaultnewtab: true });
  }
})

browser.runtime.setUninstallURL('https://getnimbus.io/uninstall');

// Run on init
fetchBasicData();
fetchConfigPages();
fetchListTerm();