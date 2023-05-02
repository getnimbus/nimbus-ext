import { writable } from "svelte/store";

export const isSaveAddressLabel = writable(false);
export const isOpenReport = writable(false);

isOpenReport.subscribe((value) => {
  if (APP_TYPE.TYPE === 'WEB') {
    window.postMessage({
      target: 'FeaturebaseWidget',
      data: { action: 'toggleWidget' },
    })
    return;
  }
})
