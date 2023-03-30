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
  await fetchOpportunities();
  await fetchOverview();
  await fetchNews();
  await fetchWalletData();
  await fetchPositionData();
});

browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
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

chrome.runtime.onInstalled.addListener((details) => {
  const reason = details.reason
  if (reason === 'install') {
    chrome.tabs.create({ url: 'src/entries/onboard/index.html' });
  }
})

chrome.runtime.setUninstallURL('https://getnimbus.io/uninstall')

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

const fetchOverview = async () => {
  try {
    const data = await nimbusApi.get("/overview").then((response) => response);
    browser.storage.local.set({ overview: JSON.stringify(data) }).then(() => {
      console.log("Loaded overview");
    });
    return data
  } catch (e) {
    console.log("error: ", e);
  }
};

const fetchOpportunities = async () => {
  try {
    const data = await nimbusApi.get("/opportunities").then((response) => response.opportunities);
    browser.storage.local.set({ opportunityList: JSON.stringify(data) }).then(() => {
      console.log("Loaded list opportunity");
    });
    return data
  } catch (e) {
    console.log("error: ", e);
  }
};

const fetchNews = async () => {
  try {
    const data = await nimbusApi.get("/news").then((response) => response.news);
    browser.storage.local.set({ newList: JSON.stringify(data) }).then(() => {
      console.log("Loaded list new");
    });
    return data
  } catch (e) {
    console.log("error: ", e);
  }
};

const fetchWalletData = async () => {
  try {
    const data = await nimbusApi.get("/holding").then((response) => response.holding);
    browser.storage.local.set({ walletData: JSON.stringify(data) }).then(() => {
      console.log("Loaded wallet data");
    });
    return data
  } catch (e) {
    console.log("error: ", e);
  }
};

const fetchPositionData = async () => {
  try {
    const data = await nimbusApi.get("/positions").then((response) => response.positions);
    browser.storage.local.set({ positionData: JSON.stringify(data) }).then(() => {
      console.log("Loaded position data");
    });
    return data
  } catch (e) {
    console.log("error: ", e);
  }
};

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

onMessage("getOverview", async () => {
  try {
    return JSON.parse((await browser.storage.local.get("overview")).overview);
  } catch (error) {
    return [];
  }
});

onMessage("getListOpportunity", async () => {
  try {
    return JSON.parse((await browser.storage.local.get("opportunityList")).opportunityList);
  } catch (error) {
    return [];
  }
});

onMessage("getListNew", async () => {
  try {
    return JSON.parse((await browser.storage.local.get("newList")).newList);
  } catch (error) {
    return [];
  }
});

onMessage("getWalletData", async () => {
  try {
    return JSON.parse((await browser.storage.local.get("walletData")).walletData);
  } catch (error) {
    return [];
  }
});

onMessage("getPositionData", async () => {
  try {
    return JSON.parse((await browser.storage.local.get("positionData")).positionData);
  } catch (error) {
    return [];
  }
});

onMessage("reloadNewTab", async () => {
  try {
    const overviewData = fetchOverview();
    const opportunityData = fetchOpportunities();
    const newsData = fetchNews();
    const walletData = fetchWalletData();
    const positionData = fetchPositionData();
    if (overviewData && opportunityData && newsData && walletData && positionData) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
})

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
        .get(`/tx/${hash}`)
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
fetchOpportunities();
fetchOverview();
fetchNews();
fetchWalletData();
fetchPositionData();
