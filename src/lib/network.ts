// import axios from "axios";
// import { setupCache } from 'axios-cache-interceptor';

// TODO: Move cache storage to webstorage

interface IOption {
  baseURL: string;
  getHeaderAuthorize: () => void;
}

interface IReqOption {
  params?: Record<string, any>;
}

const createAxiosInterface = ({ baseURL, getHeaderAuthorize }: IOption) => {
  return {
    get<T>(url: string, config?: IReqOption): Promise<T> {
      const apiUrl = new URL(`${baseURL}${url}`);
      if (config?.params) {
        Object.keys(config.params)
          .filter((_) => _)
          .forEach((key) =>
            apiUrl.searchParams.append(key, config.params[key])
          );
      }
      const authorization: any = getHeaderAuthorize();
      return fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authorization,
        },
      }).then(async (response) => {
        if (response.status === 403) {
          throw new Error(await response.json());
        }
        return await response.json();
      });
    },
    post<T>(url: string, body: any, config?: IReqOption): Promise<T> {
      const apiUrl = new URL(`${baseURL}${url}`);
      if (config?.params) {
        Object.keys(config.params)
          .filter((_) => _)
          .forEach((key) =>
            apiUrl.searchParams.append(key, config.params[key])
          );
      }
      const authorization: any = getHeaderAuthorize();
      return fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authorization,
        },
        body: JSON.stringify(body),
      }).then((response) => response.json());
    },
    put(url: string, body: any, config?: any) {
      const apiUrl = new URL(`${baseURL}${url}`);
      if (config?.params) {
        Object.keys(config.params).forEach((key) =>
          apiUrl.searchParams.append(key, config.params[key])
        );
      }
      const authorization: any = getHeaderAuthorize();
      return fetch(apiUrl, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authorization,
        },
        body: JSON.stringify(body),
      }).then((response) => response.json());
    },
    delete(url: string, body: any, config?: any) {
      const apiUrl = new URL(`${baseURL}${url}`);
      if (config?.params) {
        Object.keys(config.params).forEach((key) =>
          apiUrl.searchParams.append(key, config.params[key])
        );
      }
      const authorization: any = getHeaderAuthorize();
      return fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authorization,
        },
        body: JSON.stringify(body),
      }).then((response) => response.json());
    },
  };
};

export const messari = createAxiosInterface({
  baseURL: "https://data.messari.io/api/v1",
  getHeaderAuthorize: () => { },
});

export const coinGeko = createAxiosInterface({
  baseURL: "https://api.coingecko.com/api/v3",
  getHeaderAuthorize: () => { },
});

export const API_URL = import.meta.env.VITE_API_URL || "https://api-staging.getnimbus.io";

export const nimbus = createAxiosInterface({
  baseURL: API_URL,
  getHeaderAuthorize: () => {
    if (APP_TYPE.TYPE === "WEB") {
      const solanaToken = localStorage.getItem("solana_token");
      const evmToken = localStorage.getItem("evm_token");
      if (evmToken || solanaToken) {
        return {
          Authorization: `${evmToken || solanaToken}`,
        };
      }
    }
  },
});

export const defillama = createAxiosInterface({
  baseURL: "https://coins.llama.fi",
  getHeaderAuthorize: () => { },
});

export const coinmarketcap = createAxiosInterface({
  baseURL: "https://s3.coinmarketcap.com",
  getHeaderAuthorize: () => { },
});

export const mixpanel = createAxiosInterface({
  baseURL: "https://api.mixpanel.com",
  getHeaderAuthorize: () => { },
});

export const goplus = createAxiosInterface({
  baseURL: "https://api.gopluslabs.io/api/v1",
  getHeaderAuthorize: () => { },
});

export const nimbusApi = createAxiosInterface({
  baseURL: "https://nimbus-api-production.up.railway.app/api",
  getHeaderAuthorize: () => { },
});

export const aptos = createAxiosInterface({
  baseURL: "https://aptos-celebtron-api.getnimbus.io/api/v1",
  getHeaderAuthorize: () => { },
});

export const sniperlabs = createAxiosInterface({
  baseURL: "https://q911c3yhyc.execute-api.us-east-1.amazonaws.com/prod",
  getHeaderAuthorize: () => { },
});