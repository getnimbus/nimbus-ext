import { sendMessage } from "webext-bridge";

export const track = (type: string, payload?: Record<string, any>) => {
  try {
    sendMessage("trackEvent", { type, payload });
  } catch (error) {
    console.error(error);
  }
};
