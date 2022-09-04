// import mixpanel from "mixpanel-browser";
import { jitsuClient } from "@jitsu/sdk-js";

let tracker = null;

export const track = (type: string, payload?: Record<string, any>) => {
  try {
    if (!tracker) {
      tracker = jitsuClient({
        key: "js.euvzy95jhm8wnhp33dito.pfaiagd2zlpte6kcw9qu2k",
      });
    }

    return tracker.track(type, payload);
  } catch (error) {
    console.log(`Error traking data`);
    console.log(error);
  }
};
