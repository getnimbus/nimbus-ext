// import axios from "axios";
// import { setupCache } from 'axios-cache-interceptor';

// TODO: Move cache storage to webstorage

interface IOption {
  baseURL: string;
  getHeaderAuthorize: () => void
}

const createAxiosInterface = ({ baseURL, getHeaderAuthorize }: IOption) => {
  const authorization: any = getHeaderAuthorize();
  return {
    get(url: string, config?: any) {
      const apiUrl = new URL(`${baseURL}${url}`);
      if (config?.params) {
        Object.keys(config.params).forEach((key) =>
          apiUrl.searchParams.append(key, config.params[key])
        );
      }
      return fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authorization
        },
      }).then((response) =>
        response.json()
      );
    },
    post(url: string, body: any, config?: any) {
      const apiUrl = new URL(`${baseURL}${url}`);
      if (config?.params) {
        Object.keys(config.params).forEach((key) =>
          apiUrl.searchParams.append(key, config.params[key])
        );
      }
      return fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authorization
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
      return fetch(apiUrl, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authorization
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
      return fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authorization
        },
        body: JSON.stringify(body),
      }).then((response) => response.json());
    },
  };
};

export const messari = createAxiosInterface({
  baseURL: "https://data.messari.io/api/v1",
  getHeaderAuthorize: () => { }
});

export const coinGeko = createAxiosInterface({
  baseURL: "https://api.coingecko.com/api/v3",
  getHeaderAuthorize: () => { }
});

export const nimbus = createAxiosInterface({
  baseURL: "https://api.getnimbus.io",
  // baseURL: "https://api-staging.getnimbus.io",
  // baseURL: "https://nimbus-api.yellowstone-2bd26c73.eastus.azurecontainerapps.io"
  // baseURL: "https://nimbus-api.fly.dev"
  // baseURL: "https://nimbus-api-asia.wonderfulwave-5f958dca.southeastasia.azurecontainerapps.io",
  getHeaderAuthorize: () => {
    const evmToken = localStorage.getItem("evm_token");
    if (evmToken) {
      return {
        Authorization: `Bearer ${evmToken}`,
      }
    }
  }
});

export const defillama = createAxiosInterface({
  baseURL: "https://coins.llama.fi",
  getHeaderAuthorize: () => { }
});

export const coinmarketcap = createAxiosInterface({
  baseURL: "https://s3.coinmarketcap.com",
  getHeaderAuthorize: () => { }
})

export const mixpanel = createAxiosInterface({
  baseURL: "https://api.mixpanel.com",
  getHeaderAuthorize: () => { }
});

export const goplus = createAxiosInterface({
  baseURL: "https://api.gopluslabs.io/api/v1",
  getHeaderAuthorize: () => { }
});

export const nimbusApi = createAxiosInterface({
  baseURL: "https://nimbus-api-production.up.railway.app/api",
  getHeaderAuthorize: () => { }
});

export const aptos = createAxiosInterface({
  baseURL: "https://aptos-celebtron-api.getnimbus.io/api/v1",
  getHeaderAuthorize: () => { }
});
