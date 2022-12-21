
// calculate window-day simple moving average for prices arr
function simpleMovingAverage(prices, window, n = Infinity) {
    if (!prices || prices.length < window) {
        return [];
    }
    let index = window - 1;
    const length = prices.length + 1;
    const simpleMovingAverages = [];
    let numberOfSMAsCalculated = 0;
    while (++index < length && numberOfSMAsCalculated++ < n) {
        const windowSlice = prices.slice(index - window, index)
        const sum = windowSlice.reduce((prev, curr) => prev + curr, 0);
        simpleMovingAverages.push(sum / window);
    }
    return simpleMovingAverages;
}

// calculate window-day exponential moving average for prices arr
function exponentialMovingAverage(prices, window) {
    if (!prices || prices.length < window) {
        return [];
    }
    let index = window - 1;
    let previousEmaIndex = 0;
    const length = prices.length + 1;
    const smoothingFactor = 2 / (window + 1);
    const exponentialMovingAverages = [];
    const [sma] = simpleMovingAverage(prices, window, 1);
    exponentialMovingAverages.push(sma);
    while (++index < length) {
        const value = prices[index];
        const previousEma = exponentialMovingAverages[previousEmaIndex++];
        const currentEma = (value - previousEma) * smoothingFactor + previousEma;
        exponentialMovingAverages.push(currentEma);
    }
    return exponentialMovingAverages;
}

export { simpleMovingAverage, exponentialMovingAverage }