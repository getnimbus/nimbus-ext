import { writable } from "svelte/store";

export const isSaveAddressLabel = writable(false);
export const isDarkMode = writable(false);
export const isHidePortfolio = writable(false);
export const realtimePrice = writable({});
export let showToast = writable(false);
export let isSuccessToast = writable(false);
export let toastMsg = writable("");
