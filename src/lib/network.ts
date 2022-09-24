import axios from "axios";
// import { setupCache } from 'axios-cache-interceptor';

// TODO: Move cache storage to webstorage

export const messari = axios.create({
  baseURL: "https://data.messari.io/api/v1",
});

export const coinGeko = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
});

export const nimbus = axios.create({
  baseURL: "https://utils.getnimbus.xyz",
});

export const mixpanel = axios.create({
  baseURL: "https://api.mixpanel.com",
});
