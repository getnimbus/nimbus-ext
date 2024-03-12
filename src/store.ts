import { writable } from "svelte/store";

export const isSaveAddressLabel = writable(false);
// export const isOpenReport = writable(false);
export const user = writable({});
export const wallet = writable("");
export const chain = writable("ALL");
export const typeWallet = writable("");
export const selectedPackage = writable("FREE");
export const tab = writable("token");
export const isDarkMode = writable(false);
export const isShowHeaderMobile = writable(false);
export const selectedBundle = writable({});
export const isHidePortfolio = writable(false);
export const triggerConnectWallet = writable(false);
export const triggerModalAddAddress = writable(false);
export const triggerSync = writable(false);
export const userId = writable("");
export const userPublicAddress = writable("");
export const userSocialPublicAddress = writable("");
export const triggerUpdateBundle = writable(false);
export const detectParams = writable(window.location.pathname);
export const realtimePrice = writable({});
export const totalPositions = writable(0);
export const totalAssets = writable(0);
export const unrealizedProfit = writable(0);
export const realizedProfit = writable(0);
export const pastProfit = writable(0);
export const suiWalletInstance = writable(null);

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
