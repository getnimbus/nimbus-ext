import numeral from "numeral";
import jwt_decode from "jwt-decode";
import { nimbus } from "./lib/network";
import { detectedChain } from "./lib/chains";
import { groupBy } from "lodash";
import confetti from "canvas-confetti";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const netWorthFilter = [
  {
    label: "1k - 50K",
    value: "networth > 1000 AND networth < 50000",
  },
  {
    label: "50K - 100K",
    value: "networth > 50000 AND networth < 100000",
  },
  {
    label: "> 100K",
    value: "networth > 100000",
  },
];

export const sharpeRatioFilter = [
  {
    label: "< 1",
    value: "sharpeRatio < 1",
  },
  {
    label: "> 1",
    value: "sharpeRatio > 1",
  },
  {
    label: "1 - 2",
    value: "sharpeRatio > 1 AND sharpeRatio < 2",
  },
  {
    label: "> 2",
    value: "sharpeRatio > 2",
  },
];


export const whaleCategories = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Recommended",
    value: "RECOMMENDED",
  },
  {
    label: "Ventures Capital",
    value: "VENTURES_CAPITAL",
  },
  // {
  //   label: "Smart money",
  //   value: "SMART_MONEY",
  // },
  // {
  //   label: "Hand-picked",
  //   value: "HAND_PICKED",
  // },
];

export const volatilityFilter = [
  {
    label: "0-10%",
    value: "volatility > 0 AND volatility < 10",
  },
  {
    label: "10% - 50%",
    value: "volatility > 10 AND volatility < 50",
  },
  {
    label: "> 50%",
    value: "volatility > 50",
  },
];

export const returnsFilter = [
  {
    label: "1D > 0",
    value: "change1D > 0",
  },
  {
    label: "7D > 0",
    value: "change7D > 0",
  },
  {
    label: "30D > 0",
    value: "change30D > 0",
  },
  {
    label: "1Y > 0",
    value: "change1Y > 0",
  },
];

export const typeList = [
  {
    label: "Category",
    value: "category",
  },
  {
    label: "Sector",
    value: "sector",
  },
  {
    label: "Market Cap",
    value: "rank",
  },
];

export const typeTrx = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Send",
    value: "send",
  },
  {
    label: "Receive",
    value: "receive",
  },
  {
    label: "Exchange",
    value: "exchange",
  },
];

export const typePieChart = [
  {
    label: "Tokens",
    value: "token",
  },
  {
    label: "NFTs",
    value: "nft",
  },
];

export const typeClosedHoldingTokenChart = [
  {
    label: "Value",
    value: "value",
  },
  {
    label: "Percent",
    value: "percent",
  },
];

export const filterAvgCostType = [
  {
    label: "All",
    value: "all",
  },
  // {
  //   label: "Smart money",
  //   value: "smart"
  // },
  {
    label: "Fresh wallet",
    value: "fresh",
  },
];

export const filterTokenValueType = [
  {
    label: "None",
    value: 0,
  },
  {
    label: "$1",
    value: 1,
  },
  {
    label: "$5",
    value: 5,
  },
  {
    label: "$10",
    value: 10,
  },
];

export const performanceTypeChartPortfolio = [
  {
    label: "Percent Change",
    value: "percent",
  },
  {
    label: "Net Worth",
    value: "networth",
  },
];

export const returnType = [
  {
    label: "Overview",
    value: "overview",
  },
  {
    label: "By month",
    value: "month",
  },
];

export const timeFrame = [
  {
    label: "7D",
    value: "7D",
  },
  {
    label: "30D",
    value: "30D",
  },
  {
    label: "3M",
    value: "3M",
  },
  {
    label: "1Y",
    value: "1Y",
  },
  {
    label: "ALL",
    value: "ALL",
  },
];

export const showChatAnimationVariants = {
  visible: { opacity: 1, y: 0, display: "flex" },
  hidden: { opacity: 0, y: 500, display: "none" },
};

export const showChangeLogAnimationVariants = {
  visible: { opacity: 1, y: 0, display: "flex" },
  hidden: { opacity: 0, y: -20, display: "none" },
};

export const showOverlayAnimationVariants = {
  visible: { opacity: 1, y: 0, display: "block" },
  hidden: { opacity: 0, y: -50, display: "none" },
};

export const tryCatch = (fn: (...data: any[]) => any, defaultValue: any) => {
  try {
    return fn();
  } catch (error) {
    return defaultValue;
  }
};

export const chunkArray = (array, chunkSize) => {
  let result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    let chunk = array.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
};

export const flattenArray = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(
      Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten
    );
  }, []);
};

export const equalizeArrayLengths = (arrA, arrB) => {
  // Calculate the minimum length of the two arrays
  const minLength = Math.min(arrA.length, arrB.length);

  // Slice both arrays to the minimum length
  const newArrayA = arrA.slice(0, minLength);
  const newArrayB = arrB.slice(0, minLength);

  return [newArrayA, newArrayB];
};

export const exponentialToDecimal = (exponential: number) => {
  let decimal = exponential.toString().toLowerCase();
  if (decimal.includes("e+")) {
    const exponentialSplitted = decimal.split("e+");
    let postfix = "";
    for (
      let i = 0;
      i <
      +exponentialSplitted[1] -
        (exponentialSplitted[0].includes(".")
          ? exponentialSplitted[0].split(".")[1].length
          : 0);
      i++
    ) {
      postfix += "0";
    }
    const addCommas = (text) => {
      let j = 3;
      let textLength = text.length;
      while (j < textLength) {
        text = `${text.slice(0, textLength - j)},${text.slice(
          textLength - j,
          textLength
        )}`;
        textLength++;
        j += 3 + 1;
      }
      return text;
    };
    decimal = addCommas(exponentialSplitted[0].replace(".", "") + postfix);
  }
  if (decimal.toLowerCase().includes("e-")) {
    const exponentialSplitted = decimal.split("e-");
    let prefix = "0.";
    for (let i = 0; i < +exponentialSplitted[1] - 1; i++) {
      prefix += "0";
    }
    decimal = prefix + exponentialSplitted[0].replace(".", "");
  }
  return decimal;
};

export const formatSupperSmallNumber = (number: number) => {
  if (!number.toString().includes("e-")) {
    return number;
  }
  const firstValueChar = exponentialToDecimal(number).indexOf(
    number.toString().slice(0, 1)
  );
  const zeroReplace = exponentialToDecimal(number).slice(2, firstValueChar);
  const formatNumber = exponentialToDecimal(number).replace(
    zeroReplace,
    "0..."
  );
  return formatNumber;
};

export const formatValue = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN"
    ? formatNumberSmall(input)
    : input !== 0 && input > 0 && input < 0.01
    ? "<$0.01"
    : numeral(input).format("$0,0.00");
};

export const formatCurrency = (input: number) => {
  return numeral(input).format("0,0.000000") === "NaN"
    ? formatNumberSmall(input)
    : input !== 0 && input > 0 && input < 0.01
    ? numeral(input).format("0,0.000000")
    : numeral(input).format("0,0.0000");
};

export const formatBalance = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN"
    ? formatSmallBalance(input)
    : numeral(input).format("0,0.00");
};

export const formatPercent = (input: number) => {
  return numeral(input).format("0,0.00");
};

export const formatSmallBalance = (input: number) => {
  return numeral(input).format("0.000e+0");
};

export const formatBigBalance = (input: number) => {
  if (formatPercent(input) === "NaN") {
    return {
      number_format: formatSmallBalance(input),
      number_size: "",
    };
  } else {
    const regExp = /[a-zA-Z]/g;
    const numberFormat = numeral(input).format("0.00a");
    if (regExp.test(numberFormat)) {
      return {
        number_format: Number(numberFormat.slice(0, -1)),
        number_size: numberFormat.slice(-1).toUpperCase(),
      };
    } else {
      return {
        number_format: Number(numberFormat),
        number_size: "",
      };
    }
  }
};

const formatNumberSmall = (scientificNotation) => {
  const num = parseFloat(scientificNotation);
  const eIndex = num.toString().indexOf("e");
  const exponent = parseInt(num.toString().slice(eIndex + 2), 10);
  const significand = parseFloat(
    num
      .toString()
      .slice(0, eIndex)
      .slice(0, 4)
      .split("")
      .filter((e) => {
        return e !== ".";
      })
      .join("")
  );

  if (isNaN(num)) {
    return "NaN";
  }

  let formatarr = ["0", "."];
  for (let i = 0; i < exponent - 1; i++) {
    formatarr.push("0");
  }
  const formatString = formatarr.join("").toString();
  const formattedNum = formatString + significand;
  return formattedNum;
};

export const shorterAddress = (string: string) => {
  return string ? string.slice(0, 6) + "..." + string.substr(-4) : string;
};

export const shorterName = (string: string, length: number = 10) => {
  if (string?.length > length) {
    return string.slice(0, length) + "...";
  } else {
    return string;
  }
};

export const escapeRegex = (string: string) => {
  return string.toString().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

export const getLocalImg = (src: string) => {
  return new URL(src, import.meta.url).href;
};

export const add3Dots = (string: string, limit: number) => {
  const dots = "...";
  if (string.length > limit) {
    string = string.substring(0, limit) + dots;
  }
  return string;
};

export const handleFormatDataPieChart = (data, type) => {
  const formatData = data.map((item) => {
    return {
      ...item,
      value: item?.price?.price
        ? Number(item?.amount) * Number(item?.price?.price)
        : 0,
    };
  });

  const groupData = groupBy(formatData, type);
  const typesData = Object.getOwnPropertyNames(groupData);

  const formatGroupData = typesData.map((item) => {
    return {
      logo: undefined,
      name: item,
      symbol: "",
      name_ratio: "Ratio",
      value: 0,
      name_value: "Value",
      value_value: groupData[item].reduce(
        (prev, item) => prev + Number(item.value),
        0
      ),
      name_balance: "Balance",
      value_balance: groupData[item].reduce(
        (prev, item) => prev + Number(item.amount),
        0
      ),
    };
  });

  const sumData = formatGroupData.reduce(
    (prev, item) => prev + Number(item.value_value),
    0
  );

  return formatGroupData.map((item) => {
    return {
      logo: type === "chain" ? detectedChain(item.name) : item.logo,
      name: item.name,
      symbol: "",
      name_ratio: item.name_ratio,
      value: (Number(item.value_value) / sumData) * 100,
      name_value: item.name_value,
      value_value: item.value_value,
      name_balance: item.name_balance,
      value_balance: item.value_balance,
    };
  });
};

export const handleFormatDataTable = (data, type) => {
  let formatData = data.map((item) => {
    return {
      ...item,
      value: Number(item?.amount) * Number(item?.price?.price),
      market_price: Number(item?.price?.price) || 0,
    };
  });

  let groupData = groupBy(formatData, type);
  let typesData = Object.getOwnPropertyNames(groupData);

  let formatGroupData = typesData.map((item) => {
    return {
      name: item,
      data: groupData[item],
    };
  });

  return {
    select: typesData.map((item) => {
      return {
        value: item,
        label: item,
      };
    }),
    data: formatGroupData,
  };
};

export const handleFormatDataTableBundle = (data, bundles) => {
  let formatData = data.map((item) => {
    return {
      ...item,
      value: Number(item?.amount) * Number(item?.price?.price),
      market_price: Number(item?.price?.price) || 0,
    };
  });

  const formatDataByOwner = [];
  formatData.forEach((item) => {
    item.breakdown.forEach((breakdownItem) => {
      formatDataByOwner.push({
        ...item,
        owner: breakdownItem.owner,
      });
    });
  });

  let groupData = groupBy(formatDataByOwner, "owner");

  let formatGroupData = (bundles || []).map((item) => {
    return {
      name: item.value,
      data: groupData[item.value],
    };
  });

  return {
    select: (bundles || []).map((item) => {
      return {
        value: item.value,
        label: item.label,
      };
    }),
    data: formatGroupData,
  };
};

export const correlationsMatrixColor = (value: number) => {
  if (value < -1) value = -1;
  if (value > 1) value = 1;

  const minColor = [255, 0, 0, 1];
  const maxColor = [53, 222, 59, 1];

  const opacity = (value + 1) / 2;

  const interpolatedColorMax = [maxColor[0], maxColor[1], maxColor[2], opacity];

  const interpolatedColorMin = [minColor[0], minColor[1], minColor[2], opacity];

  if (value > 0) {
    return `rgba(${interpolatedColorMax.join(", ")})`;
  }
  if (value < 0) {
    return `rgba(${interpolatedColorMin.join(", ")})`;
  }
};

export const volatilityColorChart = (value: number) => {
  let color = "#35b86d"; // green

  if (value > 5 && value <= 15) {
    color = "#a2c04c";
  }

  if (value > 15 && value <= 30) {
    color = "#d8c42f";
  }

  if (value > 30 && value <= 50) {
    color = "#fec406";
  }

  if (value > 50 && value <= 75) {
    color = "#f79e28";
  }

  if (value > 75 && value <= 100) {
    color = "#f28a30";
  }

  if (value > 100 && value <= 150) {
    color = "#e6553d";
  }

  // red
  if (value > 150) {
    color = "#e14240";
  }

  if (value === null) {
    color = "#6AC7F5";
  }

  return color;
};

export const sharpeRatioColorChart = (value: number) => {
  let color = "#e14240"; // red

  if (value > -1 && value <= 0) {
    color = "#e6553d";
  }

  if (value > -1 && value <= 0) {
    color = "#f28a30";
  }

  if (value > 0.5 && value <= 1) {
    color = "#f79e28";
  }

  if (value > 1 && value <= 1.5) {
    color = "#fec406";
  }

  if (value > 1.5 && value <= 2) {
    color = "#d8c42f";
  }

  if (value > 2 && value <= 3) {
    color = "#a2c04c";
  }

  //green
  if (value > 3) {
    color = "#35b86d";
  }

  if (value === null) {
    color = "#6AC7F5";
  }

  return color;
};

export const getTooltipContent = (
  text: string,
  videoUrl: string,
  isMaxWidth: boolean,
  darkMode: boolean,
  width?: string
) => {
  return `
      <div style="padding: 8px; border-radius: 8px; background: ${
        darkMode ? "#0f0f0f" : "#000"
      }; width: ${isMaxWidth ? "100%" : "560px"}; height: auto;">
        ${
          text
            ? `<div style="margin-bottom: 6px; font-size: 14px; line-height: 20px; color: #fff;">${text}</div>`
            : ""
        } 
        <div style="border-radius: 6px; width: ${
          width ? width : "100%"
        }; overflow: hidden">
          <video autoplay muted playsinline disablepictureinpicture loop>
            <source type="video/mp4" src="${videoUrl}" />
          </video>
        </div>
      </div>
    `;
};

export const clickOutside = (node) => {
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

export const autoFontSize = () => {
  const windowWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  if (windowWidth) {
    if (windowWidth < 768) {
      // mobile
      return 20;
    } else if (windowWidth >= 768 && windowWidth < 1024) {
      // tablet
      return 16;
    } else {
      // pc
      return 14;
    }
  }
};

export const handleImgError = async (e, defaultImage) => {
  if (defaultImage) {
    e.target.src = defaultImage;
  }
};

const fire = (particleRatio, opts) => {
  confetti({
    ...opts,
    origin: { y: 0.7 },
    zIndex: 99999,
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

export const drivePortfolio = () =>
  driver({
    showProgress: true,
    overlayColor: "#27326f",
    // onDestroyStarted: () => {
    //   if (drivePortfolio().isLastStep()) {
    //     drivePortfolio().destroy();
    //   } else {
    //     drivePortfolio().moveNext();
    //   }
    // },
    showButtons: ["next", "previous", "close"],
    steps: [
      {
        element: ".wellcome-portfolio",
        popover: {
          title: "Welcome to our portfolio tools 🤩",
          description: "Allow me to guide you through our application",
        },
      },
      {
        element: ".view-the-pnl",
        popover: {
          title: "Track your token performance 📊",
          description:
            "View your Portfolio diversify, compare your invesment with Bitcoin or Ethereum",
        },
      },
      {
        element: ".view-token-detail1",
        popover: {
          title: "Your profit and loss, in every token 💰",
          description:
            "We have the most important metrics for Investors - Profit and loss",
        },
      },
      {
        element: ".view-token-detail2",
        popover: {
          title: "Your profit and loss, in every token 💰",
          description:
            "We have the most important metrics for Investors - Profit and loss",
        },
      },
      {
        element: ".view-icon-detail",
        popover: {
          title: "Get your trading detail 🧐",
          description:
            "View your trading activities on the Price chart, get market bought distribution to make wise more",
        },
      },
      {
        element: ".view-nft-detail",
        popover: {
          title: "Not just token, we track NFT as well 🌁",
          description: "All of your NFTs, and of course, Profit and loss",
        },
      },
    ],
  });

export const handleGetAccessToken = async (code: string) => {
  const res = await nimbus
    .post("/auth", {
      code,
      direct_url: "https://app.getnimbus.io",
    })
    .then((response) => response);
  if (res.data) {
    localStorage.setItem("token", JSON.stringify(res.data));
    if (APP_TYPE.TYPE !== "EXT") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    return jwt_decode(res.data.id_token);
  }
};
