/**
 * API barrel exports
 */

export { fetchCategoryNews, fetchAllNews } from './news';
export {
	fetchCryptoPrices,
	fetchIndices,
	fetchSectorPerformance,
	fetchCommodities,
	fetchAllMarkets,
	fetchFinnhubQuote
} from './markets';
export { fetchPolymarket, fetchWhaleTransactions, fetchGovContracts, fetchLayoffs } from './misc';
export type { Prediction, WhaleTransaction, Contract, Layoff } from './misc';
export { fetchWorldLeaders } from './leaders';
export { fetchFedIndicators, fetchFedNews, isFredConfigured } from './fred';
export type { FedIndicators, EconomicIndicator, FedNewsItem, FedNewsType } from './fred';
export {
	fetchFearGreedIndex,
	fetchFearGreedHistory,
	getFearGreedLabel,
	getFearGreedClass,
	getFearGreedStatus
} from './feargreed';
export type { FearGreedData, FearGreedResponse, FearGreedClassification } from './feargreed';
export { fetchYieldCurve, fetchYieldCurveHistory } from './treasury';
export type { TreasuryYield, YieldCurveData } from './treasury';
export {
	fetchStockQuote,
	fetchEarningsCalendar,
	calculateDaysToEarnings,
	isAlphaVantageConfigured
} from './alphavantage';
export { fetchMoveIndex, type MoveIndexData } from './moveIndex';
