import numeral from "numeral";
import jwt_decode from "jwt-decode";
import { nimbus } from "./lib/network";
import { groupBy } from "lodash";
import confetti from "canvas-confetti";
import dayjs from "dayjs";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import Solana from "~/assets/solana.png";
import Aura from "~/assets/aura.png";
import Bitcoin from "~/assets/bitcoin.png";

import All from "~/assets/all.svg";
import Bnb from "~/assets/bnb.png";
import Ethereum from "~/assets/ethereum.png";
import Matic from "~/assets/matic.png";
import Optimism from "~/assets/optimism.png";
import Avax from "~/assets/avax.png";
import Arbitrum from "~/assets/arbitrum.png";
import Gnosis from "~/assets/gnosis.png";
import Base from "~/assets/base.svg";
import Scroll from "~/assets/scroll.png";
import ZkSync from "~/assets/zksync.png";
import Linea from "~/assets/linea.png";
import Cronos from "~/assets/cronos.png";
import Mantle from "~/assets/mantle.png";
import Algorand from "~/assets/algorand.png";

export const ETHAddressRegex = /(\b0x[a-fA-F0-9]{40}\b)/g;
export const ETHTrxRegex = /(\b0x[a-fA-F0-9]{64}\b)/g;
export const BTCAddressRegex = /(\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}\b)/g;
export const BTCTrxRegex = /(\b(?!0x.*$)[a-fA-F0-9]{64}\b)/g;
export const SOLAddressRegex = /(\b[a-zA-Z0-9]{32,44}\b)/g;
export const SOLTrxRegex = /(\b[a-zA-Z0-9]{87,88}\b)/g;

export const regexList = [
  {
    name: "ETH",
    regex_address: ETHAddressRegex,
    regex_trx: ETHTrxRegex,
  },
  {
    name: "BTC",
    regex_address: BTCAddressRegex,
    // regex_trx: BTCTrxRegex
  },
  // {
  //   name: "Solana",
  //   regex_address: SOLAddressRegex,
  //   regex_trx: SOLTrxRegex
  // },
  // {
  //   name: "NEAR",
  //   regex_address: /(\b[a-zA-Z0-9]{64}\b)/g,
  //   regex_trx: /(\b[a-zA-Z0-9]{43,44}\b)/g,
  // },
  // {
  //   name: "NEAR1",
  //   regex_address: /(\b\w+(?:\.\w+)*\.near\b)/g,
  //   regex_trx: /(\b[a-zA-Z0-9]{43,44}\b)/g,
  // }
];

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


export const categories = [
  {
    label: "Recommended",
    value: "RECOMMENDED",
  },
  {
    label: "Ventures Capital",
    value: "VENTURES_CAPITAL",
  },
  {
    label: "Smart money",
    value: "SMART_MONEY",
  },
  {
    label: "Hand-picked",
    value: "HAND_PICKED",
  },
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
    value: "all"
  },
  // {
  //   label: "Smart money",
  //   value: "smart"
  // },
  {
    label: "Fresh wallet",
    value: "fresh"
  }
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

export const dailyCheckinTypePortfolio = [
  {
    label: "Collect GM Point",
    value: "collectGMPoint",
  },
  {
    label: "History",
    value: "history",
  },
];

export const dailyCheckinRewardsTypePortfolio = [
  {
    label: "Redeem Gift",
    value: "redeemGift",
  },
  {
    label: "Your gift",
    value: "yourGift",
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

export const getAddressContext = (address: string) => {
  if (!address) {
    return undefined;
  }

  if (address.match(ETHAddressRegex)) {
    return {
      type: "EVM",
      address,
    };
  }

  if (address.match(BTCAddressRegex)) {
    return {
      type: "BTC",
      address,
    };
  }

  if (address.match(SOLAddressRegex)) {
    return {
      type: "SOL",
      address,
    };
  }

  return undefined;
};

export const chainList = [
  {
    logo: All,
    label: "All chains",
    value: "ALL",
  },
  {
    logo: Ethereum,
    label: "Ethereum",
    value: "ETH",
  },
  {
    logo: Bnb,
    label: "BNB",
    value: "BNB",
  },
  {
    logo: Matic,
    label: "Polygon",
    value: "MATIC",
  },
  {
    logo: Optimism,
    label: "Optimism",
    value: "OP",
  },
  {
    logo: Avax,
    label: "Avalanche",
    value: "AVAX",
  },
  {
    logo: Arbitrum,
    label: "Arbitrum",
    value: "ARB",
  },
  {
    logo: Base,
    label: "Base",
    value: "BASE",
  },
  {
    logo: Scroll,
    label: "Scroll",
    value: "SCROLL",
  },
  {
    logo: Gnosis,
    label: "Gnosis",
    value: "XDAI",
  },
  {
    logo: ZkSync,
    label: "ZkSync",
    value: "ZKSYNC",
  },
  {
    logo: Linea,
    label: "Linea",
    value: "LINEA",
  },
  {
    logo: Cronos,
    label: "Cronos",
    value: "CRONOS",
  },
  {
    logo: Mantle,
    label: "Mantle",
    value: "MANTLE",
  },
];

export const detectedChain = (type) => {
  let chain;
  switch (type) {
    case "BTC":
      chain = Bitcoin;
      break;
    case "ALL":
      chain = Bitcoin;
      break;
    case "AURA":
      chain = Aura;
      break;
    case "SOL":
      chain = Solana;
      break;
    case "ALGO":
      chain = Algorand;
      break;
    case "ETH":
      chain = Ethereum;
      break;
    case "XDAI":
      chain = Gnosis;
      break;
    case "BNB":
      chain = Bnb;
      break;
    case "MATIC":
      chain = Matic;
      break;
    case "OP":
      chain = Optimism;
      break;
    case "AVAX":
      chain = Avax;
      break;
    case "ARB":
      chain = Arbitrum;
      break;
    case "BASE":
      chain = Base;
      break;
    case "SCROLL":
      chain = Scroll;
      break;
    case "ZKSYNC":
      chain = ZkSync;
      break;
    case "LINEA":
      chain = Linea;
      break;
    case "CRONOS":
      chain = Cronos;
      break;
    case "MANTLE":
      chain = Mantle;
      break;
  }
  return chain;
};

export const linkExplorer = (chain, hash) => {
  let links = {
    trx: "",
    address: "",
  };
  switch (chain) {
    case "ETH":
      links = {
        trx: `https://etherscan.io/tx/${hash}`,
        address: `https://etherscan.io/address/${hash}`,
      };
      break;
    case "XDAI":
      links = {
        trx: `https://gnosisscan.io/tx/${hash}`,
        address: `https://gnosisscan.io/address/${hash}`,
      };
      break;
    case "BNB":
      links = {
        trx: `https://bscscan.com/tx/${hash}`,
        address: `https://bscscan.com/address/${hash}`,
      };
      break;
    case "MATIC":
      links = {
        trx: `https://polygonscan.com/tx/${hash}`,
        address: `https://polygonscan.com/address/${hash}`,
      };
      break;
    case "OP":
      links = {
        trx: `https://optimistic.etherscan.io/tx/${hash}`,
        address: `https://optimistic.etherscan.io/address/${hash}`,
      };
      break;
    case "AVAX":
      links = {
        trx: `https://snowtrace.io/tx/${hash}`,
        address: `https://snowtrace.io/address/${hash}`,
      };
      break;
    case "ARB":
      links = {
        trx: `https://arbiscan.io/tx/${hash}`,
        address: `https://arbiscan.io/address/${hash}`,
      };
      break;
    case "BASE":
      links = {
        trx: `https://basescan.org/tx/${hash}`,
        address: `https://basescan.org/address/${hash}`,
      };
      break;
    case "SCROLL":
      links = {
        trx: `https://blockscout.scroll.io/tx/${hash}`,
        address: `https://blockscout.scroll.io/address/${hash}`,
      };
      break;
    case "ZKSYNC":
      links = {
        trx: `https://explorer.zksync.io/tx/${hash}`,
        address: `https://explorer.zksync.io/address/${hash}`,
      };
      break;
    case "LINEA":
      links = {
        trx: `https://lineascan.build/tx/${hash}`,
        address: `https://lineascan.build/address/${hash}`,
      };
      break;
    case "CRONOS":
      links = {
        trx: `https://cronoscan.com/tx/${hash}`,
        address: `https://cronoscan.com/address/${hash}`,
      };
      break;
    case "MANTLE":
      links = {
        trx: `https://mantlescan.info/tx/${hash}`,
        address: `https://mantlescan.info/address/${hash}`,
      };
      break;
    case "SOL":
      links = {
        trx: `https://solscan.io/tx/${hash}`,
        address: `https://solscan.io/address/${hash}`,
      };
      break;
    case "ALGO":
      links = {
        trx: `https://algoexplorer.io/tx/${hash}`,
        address: `https://algoexplorer.io/address/${hash}`,
      };
      break;
    case "BTC":
      links = {
        trx: `https://www.oklink.com/btc/tx/${hash}`,
        address: `https://www.oklink.com/btc/address/${hash}`,
      };
      break;
    default:
      links = {
        trx: "",
        address: "",
      };
  }
  return links;
};

export const listProviderCEX = [
  "binance",
  "binanceus",
  "bitfinex",
  "bittrex",
  "bitvavo",
  "blockchaincom",
  "coinbase",
  "coinbasepro",
  "coindcx",
  "coinspot",
  "cointracking",
  "cryptocom",
  "gateio",
  "gemini",
  "kraken",
  "kucoin",
  "ndax",
  "newton",
  "poloniex",
  "wazirx",
  "bitmart",
  "bybit",
  "huobi",
  "mexc",
  "okx",
  "wavesexchange",
  "bitrue",
  "ascendex",
  "bitso",
  "upbit",
  "bitstamp",
];

export const listLogoCEX = [
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/89.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/24.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/311.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/521.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/294.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/70.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/37.png",
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

export const flattenArray = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(
      Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten
    );
  }, []);
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
      logo: item.logo,
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
      <div style="padding: 8px; border-radius: 8px; background: ${darkMode ? "#0f0f0f" : "#000"
    }; width: ${isMaxWidth ? "100%" : "560px"}; height: auto;">
        ${text
      ? `<div style="margin-bottom: 6px; font-size: 14px; line-height: 20px; color: #fff;">${text}</div>`
      : ""
    } 
        <div style="border-radius: 6px; width: ${width ? width : "100%"
    }; overflow: hidden">
          <video autoplay muted playsinline disablepictureinpicture loop>
            <source type="video/mp4" src="${videoUrl}" />
          </video>
        </div>
      </div>
    `;
};

export const dateDiffInDays = (a, b) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
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

export const equalizeArrayLengths = (arrA, arrB) => {
  // Calculate the minimum length of the two arrays
  const minLength = Math.min(arrA.length, arrB.length);

  // Slice both arrays to the minimum length
  const newArrayA = arrA.slice(0, minLength);
  const newArrayB = arrB.slice(0, minLength);

  return [newArrayA, newArrayB];
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

const fire = (particleRatio, opts) => {
  confetti({
    ...opts,
    origin: { y: 0.7 },
    zIndex: 100,
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

export const driverObj = driver({
  showProgress: true,
  overlayColor: "#27326f",
  onDestroyStarted: () => {
    driverObj.destroy();
    // if (!driverObj.hasNextStep() || confirm("Are you sure?")) {
    //   driverObj.destroy();
    // }
  },
  showButtons: ["next", "previous", "close"],
  steps: [
    // {
    //   element: "#view-use-wallet-or-demo",
    //   popover: {
    //     title: "Introduce App",
    //     description: "Add wallet or view Demo wallet",
    //   },
    // },
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
    // {
    //   element: "#view-closed-positions",
    //   popover: {
    //     title: "Introduce App",
    //     description: "View closed positions",
    //   },
    // },
  ],
});

export const formatTransactionTime = (date: Date) => {
  if (dayjs().diff(date, "days") >= 1) {
    return dayjs(date).format("YYYY-MM-DD, hh:mm A");
  }
  return dayjs(date).fromNow();
};

export const handleImgError = async (e, defaultImage) => {
  if (defaultImage) {
    e.target.src = defaultImage;
  }
};
