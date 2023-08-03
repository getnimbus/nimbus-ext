export function calculateVolatility(prices: number[]) {
  // Step 2: Calculate Daily Returns
  const dailyReturns = [];
  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1];
    const currentPrice = prices[i];
    const dailyReturn = (currentPrice - prevPrice) / prevPrice;
    dailyReturns.push(dailyReturn);
  }

  // Step 3: Calculate Average Daily Return
  const sumReturns = dailyReturns.reduce((sum, ret) => sum + ret, 0);
  const averageDailyReturn = sumReturns / dailyReturns.length;

  // Step 4: Calculate Variance
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - averageDailyReturn, 2), 0) / dailyReturns.length;

  // Step 5: Calculate Volatility (Standard Deviation)
  const volatility = Math.sqrt(variance);

  return volatility * 100;
}


export function calculatePercentageReturns(chartData: number[]) {
  const percentageReturns = [];

  for (let i = 1; i < chartData.length; i++) {
    const prevPrice = chartData[i - 1];
    const currentPrice = chartData[i];
    const percentageReturn = (currentPrice - prevPrice) / prevPrice;
    percentageReturns.push(percentageReturn);
  }

  return percentageReturns;
}

export function calculateSharpeRatio(chartData: number[], riskFreeRate = 0) {
  const percentageReturns = calculatePercentageReturns(chartData);

  // Use the previous calculateSharpeRatio function to calculate Sharpe ratio
  // (Please make sure you have the calculateSharpeRatio function defined in your code)
  const averageReturn = percentageReturns.reduce((sum, ret) => sum + ret, 0) / percentageReturns.length;
  const variance = percentageReturns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / percentageReturns.length;
  const standardDeviation = Math.sqrt(variance);

  const sharpeRatio = (averageReturn - riskFreeRate) / standardDeviation;

  return sharpeRatio;
}

export function calculateMaxDrawdown(prices: number[]) {
  let maxDrawdown = 0;
  let peak = prices[0];

  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];
    const drawdown = (currentPrice - peak) / peak;
    maxDrawdown = Math.min(maxDrawdown, drawdown);

    if (currentPrice > peak) {
      peak = currentPrice;
    }
  }

  return maxDrawdown * 100;
}

export function calculateBeta(assetsPrices: number[], marketPrices: number[]) {
  // Step 1: Calculate the percentage returns for both assets and market
  const assetReturns = calculatePercentageReturns(assetsPrices);
  const marketReturns = calculatePercentageReturns(marketPrices);

  // Step 2: Calculate the covariance and variance of the asset and market returns
  function calculateCovariance(arr1: number[], arr2: number[]) {
    const mean1 = arr1.reduce((sum, val) => sum + val, 0) / arr1.length;
    const mean2 = arr2.reduce((sum, val) => sum + val, 0) / arr2.length;
    const covariance = arr1.reduce((sum, val, i) => sum + (val - mean1) * (arr2[i] - mean2), 0) / arr1.length;
    return covariance;
  }

  const covariance = calculateCovariance(assetReturns, marketReturns);

  function calculateVariance(arr: number[]) {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return variance;
  }

  const marketVariance = calculateVariance(marketReturns);

  // Step 3: Calculate the beta
  const beta = covariance / marketVariance;
  return beta;
}

export const getChangePercent = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return Number((((Number(current) - Number(previous)) / Number(previous)) * 100).toFixed(2));
};

export const getPostionInRage = (current: number, min: number, max: number) => {
  if (current < min) return 0;
  if (current > max) return 100;

  if ((max - min) === 0) {
    return 0;
  }

  return ((current / (max - min)) * 100) || 0;
}