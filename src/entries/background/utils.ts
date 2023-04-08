import * as browser from "webextension-polyfill";
import { isEmpty } from "lodash";
import dayjs from "dayjs";

export const cacheOrAPI = async (
  key: string,
  apiCall: Function,
  { ttl = 5 * 60, defaultValue = null, disabled = false }: { ttl?: number; defaultValue?: any, disabled?: boolean }
) => {
  try {
    const dataLocal = await browser.storage.local.get(key);
    if (disabled) {
      console.log(`${key} DISABLED`);
    }
    if (!disabled && !isEmpty(dataLocal[key]) && dataLocal.hasOwnProperty(key)) {
      const parsedData = JSON.parse(dataLocal[key]);
      if (
        dayjs().subtract(ttl, "second").toDate() <
        new Date(parsedData?.createdAt)
      ) {
        console.log(`${key} HIT`);
        return JSON.parse(dataLocal[key])?.result || defaultValue;
      }
      await browser.storage.local.remove(key);
      console.log(`${key} EXPIRED`);
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
        console.log(`Saved ${key} to cache`);
      });
    return result;
  } catch (e) {
    return typeof defaultValue !== "undefined" ? defaultValue : e;
  }
};
