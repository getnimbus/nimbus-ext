import * as browser from "webextension-polyfill";
import { onMessage } from "webext-bridge";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { coinGeko, mixpanel, nimbus, goplus } from "../../lib/network";
import { cacheOrAPI } from "./utils";

browser.runtime.onStartup.addListener(async () => {
  console.log("onStartup....");
  await fetchBasicData();
  await fetchConfigPages();
  await fetchListTerm();
});

browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

browser.commands.onCommand.addListener((command) => {
  if (command === "open-quick-search") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tab) => {
      // let tabSelected = tab[0]
      // if (tabSelected) {
      //   browser.tabs.sendMessage(tabSelected[0].id, { action: "toggleSidebar" })
      // } else {
      //   console.log("no active tab")
      // }
      browser.tabs.sendMessage(tab[0].id, { action: "toggleSidebar" });
    });
  }
});

browser.action.onClicked.addListener(() => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tab) => {
    browser.tabs.sendMessage(tab[0].id, { action: "toggleSidebar" });
  });
});

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

const fetchSearchData = async (search) => {
  // TODO: Make me as local search
  const list = await coinGeko.get(`/search?query=${search}`);
  return JSON.stringify(list.coins);
};

const fetchListTerm = async () => {
  const listTerm = await nimbus
    .get("/terms")
    .then((response) => response.data);
  browser.storage.local
    .set({ termList: JSON.stringify(listTerm) })
    .then(() => {
      console.log("Loaded list term");
    });
}

interface ICoinListInput {
  limit: number;
}

interface ISearchInput {
  search: string;
}

interface ISymbolInput {
  symbol: string;
}

interface IIdInput {
  id: string;
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
    return JSON.parse(
      (await browser.storage.local.get("termList")).termList
    );
  } catch (error) {
    return [];
  }
});

onMessage<ISearchInput, any>("getSearchData", async ({ data: { search } }) => {
  try {
    const data = JSON.parse(await fetchSearchData(search));
    return data.slice(0, 5);
  } catch (e) {
    return [];
  }
});

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
  return await cacheOrAPI(
    symbol,
    () => {
      return nimbus
        .get(`/price-history/${symbol}`)
        .then((response) => response.data);
    },
    { defaultValue: null }
  );
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
      // const [priceData, coinData] = await Promise.all([
      //   coinGeko
      //     .get(`/simple/price?ids=${id}&vs_currencies=usd`)
      //     .then((response) => response.data),
      //   coinGeko
      //     .get(
      //       `/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
      //     )
      //     .then((response) => response.data),
      // ]);
      // return { priceData: priceData, coinData: coinData };
    },
    { defaultValue: {} }
  );
});

onMessage("getListAddress", async () => {
  try {
    return JSON.parse(
      (await browser.storage.sync.get("listAddress")).listAddress
    );
  } catch (error) {
    return [];
  }
});

onMessage("getPieChartData", async () => {
  return await cacheOrAPI(
    "dataPieChart",
    () => {
      // const listAddress = JSON.parse(
      //   (await browser.storage.sync.get("listAddress")).listAddress
      // );
      return nimbus.get(`/portfolio/${"0x8980dbbe60d92b53b08ff95ea1aaaabb7f665bcb"}`);
    },
    { defaultValue: [] }
  );
});

onMessage("trackEvent", async ({ data: { type, payload } }) => {
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

onMessage<any, any>("checkSafety", async ({ data: { currentUrl } }) => {
  const key = currentUrl + "_info";
  return await cacheOrAPI(
    key,
    () => {
      return goplus.get("/dapp_security", {
        params: {
          url: currentUrl,
        },
      });
    },
    { defaultValue: null }
  );
});

// Run on init
fetchBasicData();
fetchConfigPages();
fetchListTerm();
