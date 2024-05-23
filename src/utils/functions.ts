import confetti from "canvas-confetti";
import { wait } from "~/entries/background/utils";
import { toastMsg, isSuccessToast, showToast, bonusScore, openScreenBonusScore } from "~/store";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const triggerBonusScore = async (score: number, delay: number) => {
  openScreenBonusScore.update((n) => n = true);
  bonusScore.update((n) => n = score);
  triggerFirework();
  await wait(delay);
  openScreenBonusScore.update((n) => n = false);
  bonusScore.update((n) => n = 0);
};

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

const fire = (particleRatio, opts) => {
  confetti({
    ...opts,
    origin: { y: 0.7 },
    zIndex: 2147483649,
    particleCount: Math.floor(200 * particleRatio),
  });
};

export const triggerFirework = () => {
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export const triggerDrivePortfolio: any = () =>
  driver({
    showProgress: true,
    overlayColor: "#27326f",
    // onDestroyStarted: () => {
    //   if (triggerDrivePortfolio().isLastStep()) {
    //     triggerDrivePortfolio().destroy();
    //   } else {
    //     triggerDrivePortfolio().moveNext();
    //   }
    // },
    showButtons: ["next", "previous", "close"],
    steps: [
      {
        element: ".wellcome-portfolio",
        popover: {
          title: "Welcome to our portfolio tools 🤩",
          description: "Allow me to guide you to easily access our application with the following main functions",
        },
      },
      {
        element: "#view-the-holding-token",
        popover: {
          title: "Show all Tokens you are holding 🟡",
          description: "Tracking all your Tokens right here",
        },
      },
      {
        element: "#view-the-nft",
        popover: {
          title: "Show all NFTs you are holding 🖼️",
          description: "Tracking all your NFTs right here",
        },
      },
      {
        element: "#view-the-defi",
        popover: {
          title: "Show all DeFi Positions you have 💵",
          description: "Tracking all your DeFi Positions right here",
        },
      },
      {
        element: "#view-the-points-airdrop",
        popover: {
          title: "Show all Airdrops and Points you have 📦",
          description:
            "Tracking all your Airdrops and Points you got right here",
        },
      },
      {
        element: "#view-the-summary",
        popover: {
          title: "See our Summary about your portfolio 📊",
          description: "We give you the overview about your portfolio",
        },
      },
      {
        element: ".view-the-chart-overview",
        popover: {
          title: "Track your portfolio Performance and Allocation 📊",
          description:
            "View your Portfolio diversify, compare your investment with Bitcoin or Ethereum",
        },
      },
      {
        element: ".view-pnl",
        popover: {
          title: "Your profit and loss, in every asset 💰",
          description:
            "With Profit and Loss Calculation, you have the power to make smarter investment choices",
        },
      },
    ],
  });
