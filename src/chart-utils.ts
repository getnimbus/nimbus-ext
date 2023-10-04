export function calculateVolatility(prices: number[]) {
  const averageReturn =
    prices.reduce((sum, returnVal) => sum + returnVal, 0) / prices.length;
  const squaredDifferences = prices.map((returnVal) =>
    Math.pow(returnVal - averageReturn, 2)
  );
  const variance =
    squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) /
    (prices.length - 1);
  const stdDeviation = Math.sqrt(variance);

  // Calculate the volatility as a percentage
  const volatilityPercent = (stdDeviation / averageReturn) * 100;

  return volatilityPercent;
}

export function calculatePercentageReturns(chartData: number[]) {
  const percentageReturns = [];

  for (let i = 1; i < chartData.length; i++) {
    const prevPrice = Number(chartData[i - 1]);
    const currentPrice = Number(chartData[i]);
    const percentageReturn = (currentPrice - prevPrice) / prevPrice;
    percentageReturns.push(percentageReturn || 0);
  }

  return percentageReturns;
}

export function calculateSharpeRatio(chartData: number[], riskFreeRate = 0) {
  // Calculate the average return
  const averageReturn =
    chartData.reduce((sum, returnVal) => sum + returnVal, 0) / chartData.length;

  // Calculate the standard deviation of chartData
  const squaredDifferences = chartData.map((returnVal) =>
    Math.pow(returnVal - averageReturn, 2)
  );
  const variance =
    squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) /
    chartData.length;
  const stdDeviation = Math.sqrt(variance);

  // Calculate the Sharpe Ratio
  const sharpeRatio = averageReturn / stdDeviation;

  return sharpeRatio;
}

export function calculateBeta(assetsPrices: number[], marketPrices: number[]) {
  // Step 1: Calculate the percentage returns for both assets and market
  const assetReturns = calculatePercentageReturns(assetsPrices);
  const marketReturns = calculatePercentageReturns(marketPrices);

  // Step 2: Calculate the covariance and variance of the asset and market returns
  function calculateCovariance(arr1: number[], arr2: number[]) {
    const mean1 = arr1.reduce((sum, val) => sum + val, 0) / arr1.length;
    const mean2 = arr2.reduce((sum, val) => sum + val, 0) / arr2.length;
    const covariance =
      arr1.reduce((sum, val, i) => sum + (val - mean1) * (arr2[i] - mean2), 0) /
      arr1.length;
    return covariance;
  }

  const covariance = calculateCovariance(assetReturns, marketReturns);

  function calculateVariance(arr: number[]) {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const variance =
      arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return variance;
  }

  const marketVariance = calculateVariance(marketReturns);

  // Step 3: Calculate the beta
  const beta = covariance / marketVariance;
  return beta;
}

export const getChangePercent = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return Number(
    (
      ((Number(current) - Number(previous)) / Math.abs(Number(previous))) *
      100
    ).toFixed(2)
  );
};

export const getChangeFromPercent = (current: number, percent: number) => {
  return (100 * Number(current)) / (Number(percent) + 100);
};

export const getPostionInRange = (
  current: number,
  min: number,
  max: number
) => {
  if (current < min) return 0;
  if (current > max) return 100;

  if (max - min === 0) {
    return 0;
  }

  return (current / (max - min)) * 100 || 0;
};
