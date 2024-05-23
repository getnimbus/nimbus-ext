import numeral from "numeral";
import { detectedChain } from "./lib/chains";
import { groupBy } from "lodash";
import dayjs from "dayjs";

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
    return flat?.concat(
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
      ? numeral(input).format("$0,0.000000")
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
      logo:
        type === "chain"
          ? item.name === "CEX"
            ? item.logo
            : detectedChain(item.name)?.logo
          : item.logo,
      name:
        type === "chain"
          ? item.name === "CEX"
            ? "CEX"
            : detectedChain(item.name)?.name
          : item.name,
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
  let formatData = (data || [])?.map((item) => {
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

export const autoFontSize = () => {
  const windowWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  if (windowWidth) {
    if (windowWidth < 768) {
      // mobile
      return 12;
    } else if (windowWidth >= 768 && windowWidth < 1024) {
      // tablet
      return 13;
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

export function filterDuplicates(arr) {
  const seen = new Set();
  return arr.filter((obj) => {
    const stringifiedObj = JSON.stringify(obj);
    if (seen.has(stringifiedObj)) {
      return false;
    } else {
      seen.add(stringifiedObj);
      return true;
    }
  });
}

export function formatActiveTime(timestamp) {
  const currentTime = dayjs();
  const activityTime = dayjs(timestamp);

  const minutesDiff = currentTime.diff(activityTime, "minute");
  const hoursDiff = currentTime.diff(activityTime, "hour");
  const daysDiff = currentTime.diff(activityTime, "day");
  const monthsDiff = currentTime.diff(activityTime, "month");

  if (minutesDiff < 60) {
    return `${minutesDiff} ${minutesDiff === 1 ? "minute" : "minutes"} ago`;
  } else if (hoursDiff < 24) {
    return `${hoursDiff} ${hoursDiff === 1 ? "hour" : "hours"} ago`;
  } else if (daysDiff < 30) {
    return `${daysDiff} ${daysDiff === 1 ? "day" : "days"} ago`;
  } else if (monthsDiff < 12) {
    return `${monthsDiff} ${monthsDiff === 1 ? "month" : "months"} ago`;
  } else {
    return "More than a year ago";
  }
}

export function formatAHT(timestamp) {
  const currentTime = dayjs();
  const activityTime = dayjs(Number(currentTime) - timestamp);

  const minutesDiff = currentTime.diff(activityTime, "minute");
  const hoursDiff = currentTime.diff(activityTime, "hour");
  const daysDiff = currentTime.diff(activityTime, "day");
  const monthsDiff = currentTime.diff(activityTime, "month");

  if (minutesDiff < 60) {
    return `${minutesDiff}m`;
  } else if (hoursDiff < 24) {
    return `${hoursDiff}h`;
  } else if (daysDiff < 30) {
    return `${daysDiff}d`;
  } else if (monthsDiff < 12) {
    return `${monthsDiff}mo`;
  } else {
    return "More than a year";
  }
}

export const formatHeaderTokenHistoryCSV = {
  trx_hash: "Transaction Hash",
  trx_link: "Transaction Link",
  value: "Value",
  time: "Time",
  fee: "Fee",
  amount_in: "Amount In",
  amount_out: "Amount Out",
  token_address_in: "Token Address In",
  token_in_symbol: "Token Symbol In",
  token_address_out: "Token Address Out",
  token_out_symbol: "Token Symbol Out",
};

export const handleFormatIdBlockChain = (id) => {
  switch (id) {
    case 1:
      return "ETH";
    case 42161:
      return "ARB";
    case 10:
      return "OP";
    case 137:
      return "MATIC";
    case 56:
      return "BNB";
    case 324:
      return "ZKSYNC";
    case 8453:
      return "BASE";
    case 43114:
      return "AVAX";
    case 1101:
      return "POLYGON_ZKEVM";
    case 59144:
      return "LINEA";
    case 100:
      return "XDAI";
    case 250:
      return "FANTOM";
    case 1285:
      return "MOVR";
    case 1284:
      return "GLMR";
    case 1313161554:
      return "AURORA";
    case 1151111081099710:
      return "SOL";
    case 1088:
      return "METIS";
    default:
      return "";
  }
};
