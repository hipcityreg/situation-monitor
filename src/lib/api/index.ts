/**
 * API barrel exports
 */

export { fetchCategoryNews, fetchAllNews, fetchLocalNews, type LocalNewsFilter } from './news';
export {
	fetchCryptoPrices,
	fetchIndices,
	fetchSectorPerformance,
	fetchCommodities,
	fetchAllMarkets
} from './markets';
export { fetchPolymarket, fetchWhaleTransactions, fetchGovContracts, fetchLayoffs } from './misc';
export type { Prediction, WhaleTransaction, Contract, Layoff } from './misc';
export { fetchWorldLeaders } from './leaders';
