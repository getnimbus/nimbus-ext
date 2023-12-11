import { writable } from "svelte/store";

export const isSaveAddressLabel = writable(false);
// export const isOpenReport = writable(false);
export const user = writable({});
export const wallet = writable("");
export const chain = writable("ALL");
export const typeWallet = writable("");
export const selectedPackage = writable("FREE");
export const isDarkMode = writable(false);
export const isShowHeaderMobile = writable(false);
export const selectedBundle = writable({});
export const isHidePortfolio = writable(false);
export const triggerConnectWallet = writable(false);
export const triggerSync = writable(false);
export const userId = writable("");
export const userPublicAddress = writable("");
export const triggerUpdateBundle = writable(false);

// let isFirstTime = true;
// isOpenReport.subscribe((value) => {
//   if (!isFirstTime && APP_TYPE.TYPE === 'WEB') {
//     window.postMessage({
//       target: 'FeaturebaseWidget',
//       data: { action: 'toggleWidget' },
//     })
//     return;
//   }

//   isFirstTime = false;
// })
