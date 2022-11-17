import _ from "lodash";
import * as browser from "webextension-polyfill";
import langEN from "../_locales/en/messages.json";
import langVI from "../_locales/vi/messages.json";

type LANG = "vi" | "en";
let currentLang: LANG = "en";

browser.storage.onChanged.addListener((changes) => {
  if (changes?.options?.newValue?.lang) {
    currentLang = changes?.options?.newValue?.lang || currentLang;
  }
});

export const setLang = async (lang: LANG) => {
  currentLang = lang;
  await browser.storage.sync.set({
    options: {
      lang,
    },
  });
};

export const i18n = (
  key: string,
  defaultText?: string,
  value?: Record<string, string>
) => {
  const lang = currentLang;
  let langText: string =
    lang === "vi"
      ? _.get(langVI, key, defaultText)
      : _.get(langEN, key, defaultText);

  if (value) {
    Object.keys(value).forEach((key) => {
      langText = langText.replace(`{${key}}`, value[key]);
    });
  }

  return langText;
};
