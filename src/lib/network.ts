// import axios from "axios";
// import { setupCache } from 'axios-cache-interceptor';

// TODO: Move cache storage to webstorage

interface IOption {
  baseURL: string;
}

const createAxiosInterface = ({ baseURL }: IOption) => {
  return {
    get(url: string, config?: any) {
      return fetch(`${baseURL}${url}`, config).then((response) =>
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
        body: JSON.stringify(body),
      }).then((response) => response.json());
    },
  };
};

export const messari = createAxiosInterface({
  baseURL: "https://data.messari.io/api/v1",
});

export const coinGeko = createAxiosInterface({
  baseURL: "https://api.coingecko.com/api/v3",
});

export const nimbus = createAxiosInterface({
  baseURL: "https://api.getnimbus.io",
});

export const mixpanel = createAxiosInterface({
  baseURL: "https://api.mixpanel.com",
});

export const goplus = createAxiosInterface({
  baseURL: "https://api.gopluslabs.io/api/v1",
});

export const nimbusApi = createAxiosInterface({
  baseURL: "https://nimbus-api-production.up.railway.app/api",
});
