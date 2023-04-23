import * as browser from "webextension-polyfill";
import { isEmpty } from "lodash";
import dayjs from "dayjs";

export const cacheOrAPI = async (
  key: string,
  apiCall: Function,
  { ttl = 5 * 60, defaultValue = null, disabled = false, swr = false }: { ttl?: number; defaultValue?: any, disabled?: boolean, swr?: boolean }
) => {
  try {
    const dataLocal = await browser.storage.local.get(key);
    if (disabled) {
      console.log(`${key} DISABLED`);
    }

    let cachedData = defaultValue;
    let isExpired = false;
    if (!disabled && !isEmpty(dataLocal[key]) && dataLocal.hasOwnProperty(key)) {
      const parsedData = JSON.parse(dataLocal[key]);
      if (swr) {
        console.log(`${key} STALE HIT`);
        cachedData = JSON.parse(dataLocal[key])?.result || defaultValue;
      } else {
        if (
          dayjs().subtract(ttl, "second").toDate() <
          new Date(parsedData?.createdAt)
        ) {
          console.log(`${key} HIT`);
          return JSON.parse(dataLocal[key])?.result || defaultValue;
        }

        await browser.storage.local.remove(key);
      }

      if (dayjs().subtract(ttl, "second").toDate() > new Date(parsedData?.createdAt)) {
        isExpired = true;
        console.log(`${key} EXPIRED`);
      }
    }

    if (swr && !disabled) {
      apiCall().then(result => {
        browser.storage.local
          .set({
            [key]: JSON.stringify({
              result,
              createdAt: new Date(),
            }),
          })
          .then(() => {
            console.log(`Saved ${key} to cache. Revalidate`);
          });
      })
      return cachedData;
    }

    const result = await apiCall();
    browser.storage.local
      .set({
        [key]: JSON.stringify({
          result,
          createdAt: new Date(),
        }),
      })
      .then(() => {
        console.log(`Saved ${key} to cache. Async`);
      });
    return result;
  } catch (e) {
    return typeof defaultValue !== "undefined" ? defaultValue : e;
  }
};

export const wait = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
