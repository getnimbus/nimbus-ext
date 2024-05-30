import { toastMsg, isSuccessToast, showToast } from "~/store";

let counterToast = 5;

const trigger = () => {
  showToast.update((n) => n = true)
  counterToast = 5;
  timeout();
};

const timeout = () => {
  if (--counterToast > 0) return setTimeout(timeout, 1000);
  showToast.update((n) => n = false)
  toastMsg.update((n) => n = "")
  isSuccessToast.update((n) => n = false)
};

export const triggerToast = (msg: string, status: "success" | "fail") => {
  toastMsg.update((n) => n = msg)
  isSuccessToast.update((n) => n = (status === "success" ? true : false))
  trigger();
};

export const triggerClickOutside = (node) => {
  const handleClick = (event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent("click_outside", node));
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
};
