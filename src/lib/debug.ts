import * as browser from "webextension-polyfill";

if (import.meta.env.DEV) {
  browser.storage.onChanged.addListener((changes) => {
    console.log("-----------------");
    console.log(Object.keys(changes));
    try {
      console.log(JSON.parse(changes?.options?.newValue));
    } catch (error) {
      console.log(changes?.options?.newValue);
    }
    console.log("-----------------");
  });
}

export default {};
