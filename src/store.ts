import { writable } from "svelte/store";

export const isSaveAddressLabel = writable(false);
export const isOpenReport = writable(false);
export const user = writable({});
export const wallet = writable("");
export const chain = writable("ALL");

let isFirstTime = true;
isOpenReport.subscribe((value) => {
  if (!isFirstTime && APP_TYPE.TYPE === 'WEB') {
    window.postMessage({
      target: 'FeaturebaseWidget',
      data: { action: 'toggleWidget' },
    })
    return;
  }

  isFirstTime = false;
})
