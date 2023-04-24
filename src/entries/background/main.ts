import * as browser from "webextension-polyfill";
import { onMessage } from "webext-bridge";
import dayjs from "dayjs";
import _, { isEmpty } from "lodash";
import { coinGeko, mixpanel, nimbus, goplus, nimbusApi } from "../../lib/network";
import { cacheOrAPI } from "./utils";
import type { JsonValue, JsonObject } from "type-fest";
import langEN from "../../_locales/en/messages.json";
import langVI from "../../_locales/vi/messages.json";

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
  browser.tabs.query({ active: true, currentWindow: true }).then((tab) => {
    browser.tabs.sendMessage(tab[0].id, { action: "toggleSidebar" });
  });
});

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed");
  const reason = details.reason
  if (reason === 'install') {
    chrome.tabs.create({ url: 'src/entries/onboard/index.html' });
    chrome.storage.sync.set({ defaultnewtab: true });
  }
})

browser.runtime.setUninstallURL('https://getnimbus.io/uninstall')

chrome.storage.sync.get("defaultnewtab", function (storage) {
  if (storage.defaultnewtab === false) {
    chrome.tabs.update({
      url: "chrome-search://local-ntp/local-ntp.html"
    })
  }
})

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

interface IAddressInput extends JsonObject {
  address: string;
}

interface ICoinListInput extends JsonObject {
  limit: number;
}

interface ISearchInput extends JsonObject {
  search: string;
}

interface ITrxHashInput extends JsonObject {
  hash: string
}

interface ISymbolInput extends JsonObject {
  symbol: string;
}

interface IIdInput extends JsonObject {
  id: string;
}

interface IUrl extends JsonObject {
  currentUrl: string;
}

interface II18nMsg extends JsonObject {
  key: string;
  lang?: "vi" | "en";
  defaultText?: string;
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

onMessage("configPageList", async () => {
  try {
    return JSON.parse(
      (await browser.storage.local.get("configPageList")).configPageList
    );
  } catch (error) {
    return [];
  }
});

onMessage("getListTerm", async () => {
  try {
    return JSON.parse((await browser.storage.local.get("termList")).termList);
  } catch (error) {
    return [];
  }
});

onMessage<IAddressInput, any>("getPreview", async ({ data: { address } }) => {
  try {
    return await nimbus.get(`/address/${address}/preview`).then((response) => response.data);
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getSync", async ({ data: { address } }) => {
  try {
    return await nimbus.post(`/address/${address}/sync`, {}).then((response) => response);
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getSyncStatus", async ({ data: { address } }) => {
  try {
    return await nimbus.get(`/address/${address}/sync-status`).then((response) => response);
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getOverview", async ({ data: { address, reload = false } }) => {
  try {
    const key = address + "_overview";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/address/${address}/overview`).then((response) => {
          return {
            result: response.data,
            address: address
          }
        });
      },
      { defaultValue: null, ttl: 60, reload }
    );
    return res
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getPositions", async ({ data: { address, reload } }) => {
  try {
    const key = address + "_positions";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/address/${address}/positions`).then((response) => {
          return {
            result: response.data.positions,
            address: address
          }
        });
      },
      { defaultValue: null, ttl: 60, disabled: reload }
    );
    return res
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getHolding", async ({ data: { address, reload } }) => {
  try {
    const key = address + "_holding";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/address/${address}/holding`).then((response) => {
          return {
            result: response.data,
            address: address
          }
        });
      },
      { defaultValue: null, ttl: 60, disabled: reload }
    );
    return res
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getNews", async ({ data: { address, reload } }) => {
  try {
    const key = address + "_news";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/news/${address}`).then((response) => {
          return {
            result: response.data.news,
            address: address
          }
        });
      },
      { defaultValue: null, ttl: 5 * 60, disabled: reload }
    );
    return res
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getOpportunities", async ({ data: { address } }) => {
  try {
    const res = await cacheOrAPI(
      "opportunities", // TODO: Update to address after change
      () => {
        // return nimbusApi.get("/opportunities").then((response) => response.opportunities);

        return [{ "logo": "https://portfolio.nansen.ai/static/images/logos/pancakeswap.png", "content": "You can join IFO in <strong>PancakeSwap</strong> to get NIS tokens on March 21th, 2023", "updatedAt": "2023-04-22T15:47:59.018Z" }, { "logo": "https://portfolio.nansen.ai/static/images/logos/venus.png", "content": "Lock your VSX on <strong>Venus</strong> to get 14% APY", "updatedAt": "2023-04-22T15:47:59.018Z" }, { "logo": "https://portfolio.nansen.ai/static/images/logos/aave.png", "content": "You can lend your <strong>LINK</strong> on <strong>AAVE</strong> to get 12.76% APY", "updatedAt": "2023-04-22T15:47:59.018Z" }]
      },
      { defaultValue: [] }
    );
    return res
    // return await nimbusApi.get("/opportunities").then((response) => response.opportunities);
  } catch (error) {
    return {};
  }
});

onMessage<ISearchInput, any>("getSearchData", async ({ data: { search } }) => {
  try {
    const data = JSON.parse(
      (await browser.storage.local.get("coinList")).coinList
    );
    const searchLowerCase = search.toLowerCase().trim();
    const dataSearchResult = data.filter((item) => {
      return (
        item.id.toLowerCase().includes(searchLowerCase) ||
        item.name.toLowerCase().includes(searchLowerCase) ||
        item.symbol.toLowerCase().includes(searchLowerCase)
      );
    });
    return dataSearchResult.slice(0, 5);
  } catch (e) {
    return [];
  }
});

onMessage<ITrxHashInput, any>("TrxHashInfo", async ({ data: { hash } }) => {
  return await cacheOrAPI(
    hash,
    () => {
      return nimbus
        .get(`/tx/receipt/${hash}`)
        .then((response) => response.data);
    },
    { defaultValue: null }
  );
})

onMessage<ISymbolInput, any>("chartDataLocal", async ({ data: { symbol } }) => {
  try {
    const dataLocal = await browser.storage.local.get(symbol);
    if (!isEmpty(dataLocal[symbol]) && dataLocal.hasOwnProperty(symbol)) {
      return JSON.parse(dataLocal[symbol]);
    }
  } catch (e) {
    return {};
  }
});

onMessage<ISymbolInput, any>("chartData", async ({ data: { symbol } }) => {
  try {
    const resCoingeko = await cacheOrAPI(
      symbol,
      () => {
        return coinGeko
          .get(`/coins/${symbol}/market_chart/range`, {
            params: {
              vs_currency: "usd",
              from: dayjs().subtract(7, "d").unix(),
              to: dayjs().unix(),
            }
          })
          .then((response) => {
            return response
          })
      },
      { defaultValue: null }
    );

    if (!resCoingeko) {
      const res = await cacheOrAPI(
        symbol,
        () => {
          return nimbus
            .get(`/token/price-history/${symbol}`)
            .then((response) => {
              return response.data
            });
        }, {
        defaultValue: null
      })
      if (res) {
        return res
      }
      return {}
    }
    return resCoingeko
  } catch (error) {
    console.log("error: ", error)
    return {}
  }
});

onMessage<IIdInput, any>("tokenInfoData", async ({ data: { id } }) => {
  const key = id + "_info";
  return await cacheOrAPI(
    key,
    async () => {
      const tokenData = await nimbus
        .get(`/token/${id}`)
        .then((response) => response.data);
      return tokenData;
    },
    { defaultValue: {} }
  );
});

onMessage<any, any>("getListAddress", async () => {
  try {
    return JSON.parse(
      (await browser.storage.sync.get("listAddress")).listAddress
    );
  } catch (error) {
    return [];
  }
});

onMessage<any, any>("trackEvent", async ({ data: { type, payload } }) => {
  try {
    return await mixpanel.post(
      "/track",
      [
        {
          event: type,
          properties: {
            ...payload,
            // distinct_id: // TODO: Save an unique user id
            token: "d56364b743cd70634fe5bea51e1d7e1c",
          },
        },
      ],
      {
        params: {
          verbose: 1,
          ip: 1,
        },
      }
    );
  } catch (e) {
    console.log(e);
    return false;
  }
});

onMessage<IUrl, any>("checkSafety", async ({ data: { currentUrl } }) => {
  const key = currentUrl + "_info";
  return await cacheOrAPI(
    key,
    () => {
      return goplus.get(`/dapp_security?url=${currentUrl}`);
    },
    { defaultValue: null }
  );
});

onMessage<any, any>("checkSafetyAddress", async ({ data: { address, chainId } }) => {
  const key = address + "_info";
  return await cacheOrAPI(
    key,
    () => {
      return goplus.get(`/address_security/${address}?chain_id=${chainId}`);
    },
    { defaultValue: null }
  );
});

onMessage<II18nMsg, "i18n">(
  "i18n",
  async ({ data: { key, lang = "en", defaultText } }) => {
    if (lang === "vi") {
      return _.get(langVI, key, defaultText);
    }
    return _.get(langEN, key, defaultText);
  }
);

// Run on init
fetchBasicData();
fetchConfigPages();
fetchListTerm();
