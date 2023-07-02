import * as browser from "webextension-polyfill";
import { onMessage } from "webext-bridge";
import dayjs from "dayjs";
import _, { isEmpty } from "lodash";
import { coinGeko, mixpanel, nimbus, goplus, nimbusApi, aptos } from "../../lib/network";
import { cacheOrAPI } from "./utils";
import type { JsonValue, JsonObject } from "type-fest";
import langEN from "../../_locales/en/messages.json";
import langVI from "../../_locales/vi/messages.json";

interface IAddressInput extends JsonObject {
  address: string;
  chain: string;
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

onMessage<IAddressInput, any>("getSectorGrowth", async ({ data: { address, chain } }) => {
  try {
    return nimbus.get(`/analysis/${address}/sector-growth?chain=${chain}&fromDate=${""}&toDate=${""}`).then((response) => {
      return {
        result: response.data,
        address: address
      }
    });
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getTotalGasFee", async ({ data: { address, chain } }) => {
  try {
    return nimbus.get(`/analysis/${address}/gas-used?chain=${chain}&fromDate=${""}&toDate=${""}`).then((response) => {
      return {
        result: response.data,
        address: address
      }
    });
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getInflowOutflow", async ({ data: { address, chain } }) => {
  try {
    return nimbus.get(`/analysis/${address}/inflow-outflow?chain=${chain}&fromDate=${""}&toDate=${""}`).then((response) => {
      return {
        result: response.data,
        address: address
      }
    });
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getTotalValueHistory", async ({ data: { address, chain } }) => {
  try {
    return nimbus.get(`/analysis/${address}/holding-history?chain=${chain}&fromDate=${""}&toDate=${""}`).then((response) => {
      return {
        result: response.data,
        address: address
      }
    });
  } catch (error) {
    return {};
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

onMessage<IAddressInput, any>("getAnalytic", async ({ data: { address, chain } }) => {
  try {
    return await nimbus.get(`/analysis/${address}/historical?chain=${chain}`).then((response) => response.data);
  } catch (error) {
    return [];
  }
});

onMessage<IAddressInput, any>("getPreview", async ({ data: { address, chain } }) => {
  try {
    return await nimbus.get(`/address/${address}/preview?chain=${chain}`).then((response) => response.data);
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getSync", async ({ data: { address, chain } }) => {
  try {
    return await nimbus.post(`/address/${address}/sync?chain=${chain}`, {}).then((response) => response);
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getSyncStatus", async ({ data: { address, chain }, ...rest }) => {
  try {
    return await nimbus.get(`/address/${address}/sync-status?chain=${chain}`).then((response) => response);
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getOverview", async ({ data: { address, chain, reload = false } }) => {
  try {
    const key = address + chain + "_overview";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/address/${address}/overview?chain=${chain}`).then((response) => {
          return {
            result: response.data,
            address: address
          }
        });
      },
      { defaultValue: null, ttl: 1, reload }
    );
    return res
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getPositions", async ({ data: { address, chain, reload } }) => {
  try {
    const key = address + chain + "_positions";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/address/${address}/positions?chain=${chain}`).then((response) => {
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

onMessage<IAddressInput, any>("getHoldingToken", async ({ data: { address, chain, reload } }) => {
  try {
    const key = address + chain + "_holding_token";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/address/${address}/holding?chain=${chain}`).then((response) => {
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

onMessage<IAddressInput, any>("getHoldingNFT", async ({ data: { address, chain, reload } }) => {
  try {
    const key = address + chain + "_holding_nft";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/address/${address}/nft-holding?chain=${chain}`).then((response) => {
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

onMessage<IAddressInput, any>("getNews", async ({ data: { address, chain, reload } }) => {
  try {
    const key = address + chain + "_news";
    const res = await cacheOrAPI(
      key,
      () => {
        return nimbus.get(`/news/${address}?chain=${chain}`).then((response) => {
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

onMessage<IAddressInput, any>("getTrxHistory", async ({ data: { address, chain, pageToken } }) => {
  try {
    const res = await nimbus.get(`/address/${address}/history?chain=${chain}&pageToken=${pageToken}`).then((response) => {
      return {
        result: response.data,
        address: address
      }
    });
    return res
  } catch (error) {
    return {};
  }
});

onMessage<IAddressInput, any>("getOpportunities", async ({ data: { address, chain } }) => {
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

onMessage<ITrxHashInput, any>("TrxHashExplain", async ({ data: { hash } }) => {
  const key = hash + "_explain";
  return await cacheOrAPI(
    key,
    () => {
      return nimbus
        .get(`/tx/explain/${hash}`)
        .then((response) => response.data);
    },
    { defaultValue: null }
  );
})

onMessage<IIdInput, any>("AptosTrxExplain", async ({ data: { id } }) => {
  const key = id + "_aptos_trx_explain";
  return await cacheOrAPI(
    key,
    () => {
      return aptos
        .get(`/tx_explain/${id}`)
        .then((response) => response);
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

onMessage<any, any>("checkSafety", async ({ data: { currentUrl } }) => {
  const key = currentUrl + "_info";
  return await cacheOrAPI(
    key,
    () => {
      return goplus.get(`/dapp_security?url=${currentUrl}`);
    },
    { defaultValue: null }
  );
});

onMessage<any, any>("checkSafetyAddress", async ({ data: { address, id } }) => {
  const key = address + "_info";
  return await cacheOrAPI(
    key,
    () => {
      return goplus.get(`/address_security/${address}?chain_id=${id}`);
    },
    { defaultValue: null }
  );
});

onMessage<any, any>("checkSafetyToken", async ({ data: { address, id } }) => {
  const key = address + "_token_info";
  return await cacheOrAPI(
    key,
    () => {
      return goplus.get(`/token_security/${id}?contract_addresses=${address}`);
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
