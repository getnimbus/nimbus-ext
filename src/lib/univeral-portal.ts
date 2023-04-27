const IS_EXT = APP_TYPE.TYPE !== 'WEB';
import { sendMessage, onMessage } from "webext-bridge";
import * as browser from "webextension-polyfill";
import nanoId from 'nanoid';
import { EventEmitter } from "./eventEmitter";

export const universalEvent = new EventEmitter();

export const sendMsg = (name: string, data: any) => {
  if (IS_EXT) {
    return sendMessage(name, data);
  }

  return universalEvent.dispatchEvent(new CustomEvent('name', data));
}

export const getStorageLocal = async (key: string) => {
  if (IS_EXT) {
    return (await browser.storage.local.get(key))[key]
  }
  // Web
}

export const setStorageLocal = async (key: string, value: string) => {
  if (IS_EXT) {
    return await browser.storage.local
      .set({
        [key]: value,
      })
  }
}

export const getStorageSync = async (key: string) => {
  if (IS_EXT) {
    return (await browser.storage.sync.get(key))[key];
  }

  // Web
}

export const setStorageSync = async (key: string, value: string) => {
  if (IS_EXT) {
    return await browser.storage.sync
      .set({
        [key]: value,
      })
  }
}