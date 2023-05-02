import numeral from "numeral";

export const regexList = [
  {
    name: "ETH",
    regex_address: /(\b0x[a-fA-F0-9]{40}\b)/g,
    regex_trx: /(\b0x[a-fA-F0-9]{64}\b)/g
  },
  // {
  //   name: "BTC",
  //   regex_address: /(\b(?!0x.*$)([13]|bc1)[a-zA-HJ-NP-Z0-9]{25,39}\b)/g,
  //   regex_trx: /(\b(?!0x.*$)[a-fA-F0-9]{64}\b)/g
  // },
  // {
  //   name: "Solana",
  //   regex_address: /(\b[a-zA-Z0-9]{32,44}\b)/g,
  //   regex_trx: /(\b[a-zA-Z0-9]{87,88}\b)/g
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
]

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

export const formatLongNumber = (number: number) => {
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

export const formatCurrency = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN"
    ? formatLongNumber(input)
    : numeral(input).format("0,0.0[000000]");
};

export const formatCurrencyV2 = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN"
    ? formatLongNumber(input)
    : numeral(input).format("0,0.0[00]");
};

export const formatBalance = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN" ? formatSmallBalance(input) : numeral(input).format("0,0.00")
};

export const checkFormatBalance = (input: number) => {
  return numeral(input).format("0,0.00")
}

export const formatSmallBalance = (input: number) => {
  return numeral(input).format("0.000e+0");
};

export const formatBigBalance = (input: number, isFormatPercent: boolean) => {
  if (checkFormatBalance(input) === "NaN") {
    return {
      number_format: isFormatPercent ? 0 : formatSmallBalance(input),
      number_size: ""
    }
  } else {
    const regExp = /[a-zA-Z]/g;
    const numberFormat = numeral(input).format("0.00a")
    if (regExp.test(numberFormat)) {
      return {
        number_format: Number(numberFormat.slice(0, -1)),
        number_size: numberFormat.slice("-1").toUpperCase()
      }
    } else {
      return {
        number_format: Number(numberFormat),
        number_size: ""
      }
    }
  }
}

export const shorterAddress = (string: string) => {
  return string ? string.slice(0, 6) + "..." + string.substr(-4) : string;
};

export const shorterName = (string: string) => {
  if (string?.length > 16) {
    return string.slice(0, 16) + "...";
  } else {
    return string
  }
}

export const flattenArray = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
  }, [])
}

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
}
