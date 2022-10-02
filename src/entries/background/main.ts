import * as browser from "webextension-polyfill";
import { onMessage } from "webext-bridge";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { coinGeko, mixpanel, nimbus , goplus} from "../../lib/network";
import { cacheOrAPI } from "./utils";

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

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tab) => {
    browser.tabs.sendMessage(tab[0].id, { action: "toggleSidebar" });
  });
});

const fetchBasicData = async () => {
  const list = await coinGeko.get("/search").then((response) => response.data);
  browser.storage.local
    .set({ coinList: JSON.stringify(list.coins) })
    .then(() => {
      console.log("Loaded crypto list");
    });
};

const fetchConfigPages = async () => {
  const listConfigPages = await nimbus
    .get("/config/pages")
    .then((response) => response.data);
  browser.storage.local
    .set({ configPageList: JSON.stringify(listConfigPages.data) })
    .then(() => {
      console.log("Loaded config page list");
    });
};

const fetchSearchData = async (search) => {
  const list = await coinGeko
    .get(`/search?query=${search}`)
    .then((response) => response.data);
  return JSON.stringify(list.coins);
};

const fetchChartData = async (symbol) => {
  const params = {
    id: `${symbol}-chart`,
    params: {
      vs_currency: "usd",
      from: dayjs().subtract(7, "d").unix(),
      to: dayjs().unix(),
    },
  };
  const chart = await coinGeko
    .get(`/coins/${symbol}/market_chart/range`, params)
    .then((response) => response);

  browser.storage.local
    .set({ [symbol]: JSON.stringify(chart.data) })
    .then(() => {
      console.log("Loaded data chart");
    })
    .catch((error) => console.error(error));

  return JSON.stringify(chart.data);
};

const fetchTokenInfo = async (id) => {
  const [priceData, coinData] = await Promise.all([
    coinGeko
      .get(`/simple/price?ids=${id}&vs_currencies=usd`)
      .then((response) => response.data),
    coinGeko
      .get(
        `/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
      )
      .then((response) => response.data),
  ]);

  browser.storage.local
    .set({
      [JSON.stringify(id + "_info")]: JSON.stringify({
        priceData: priceData,
        coinData: coinData,
      }),
    })
    .then(() => {
      console.log("Loaded crypto info");
    });

  return JSON.stringify({ priceData: priceData, coinData: coinData });
};

const fetchPieChartData = async () => {
  // const listAddress = JSON.parse(
  //   (await browser.storage.sync.get("listAddress")).listAddress
  // );

  const data = await fetch(
    `https://utils.getnimbus.xyz/portfolio/${'0x8980dbbe60d92b53b08ff95ea1aaaabb7f665bcb'}`
  ).then((response) => response);

  browser.storage.local
    .set({ dataPieChart: JSON.stringify(data) })
    .then(() => {
      console.log("Loaded data pie chart");
    })
    .catch((error) => console.error(error));

  return JSON.stringify(data);
}

browser.runtime.onStartup.addListener(async () => {
  console.log("onStartup....");
  await fetchBasicData();
  await fetchConfigPages();
});

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
  try {
    const dataLocal = await browser.storage.local.get(symbol);
    if (!isEmpty(dataLocal[symbol]) && dataLocal.hasOwnProperty(symbol)) {
      return JSON.parse(dataLocal[symbol]);
    } else {
      console.log("LOCAL MISSED", symbol);
      return JSON.parse(await fetchChartData(symbol));
    }
  } catch (e) {
    return {};
  }
});

onMessage<IIdInput, any>("tokenInfoData", async ({ data: { id } }) => {
  try {
    const key = id + "_info";
    const dataLocal = await browser.storage.local.get(key);

    if (!isEmpty(dataLocal) && dataLocal.hasOwnProperty(id + "_info")) {
      return JSON.parse(dataLocal[key]);
    } else {
      return JSON.parse(await fetchTokenInfo(id));
    }
  } catch (e) {
    return {};
  }
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
  try {
    const dataLocal = (await browser.storage.local.get("dataPieChart")).dataPieChart
    if (dataLocal) {
      return JSON.parse(
        dataLocal
      );
    } else {
      return JSON.parse(await fetchPieChartData());
    }
  } catch (e) {
    return [];
  }
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
  try {
    const key = currentUrl + "_info";
    const dataLocal = await browser.storage.local.get(key);

    if (!isEmpty(dataLocal) && dataLocal.hasOwnProperty(currentUrl + "_info")) {
      return JSON.parse(dataLocal[key]);
    } else {
      const response = await goplus.get("/dapp_security", {
        params: {
          url: currentUrl
        }
      })

      browser.storage.local
          .set({ key: JSON.stringify(response.data) })
          .then(() => {
            console.log("Loaded check safety");
          });
      return response.data;
    }
  } catch (e) {
    return {};
  }
});

// Run on init
fetchBasicData();
fetchConfigPages();
