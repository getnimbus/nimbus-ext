import { writable } from "svelte/store";

export const isSaveAddressLabel = writable(false);
export const isOpenReport = writable(false);

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
