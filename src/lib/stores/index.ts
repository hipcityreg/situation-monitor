/**
 * Stores barrel file - re-exports all stores
 */

// i18n store
export { locale, t, getTranslation, type Locale } from '$lib/i18n';

// Settings store
export {
	settings,
	enabledPanels,
	disabledPanels,
	draggablePanels,
	type PanelSettings,
	type SettingsState
} from './settings';

// Monitors store
export {
	monitors,
	enabledMonitors,
	monitorCount,
	matchCount,
	hasMatches,
	type MonitorMatch,
	type MonitorsState
} from './monitors';

// News store
export {
	news,
	politicsNews,
	techNews,
	financeNews,
	govNews,
	aiNews,
	intelNews,
	allNewsItems,
	alerts,
	isLoading as isNewsLoading,
	hasErrors as hasNewsErrors,
	type CategoryState,
	type NewsState
} from './news';

// Markets store
export {
	markets,
	indices,
	sectors,
	commodities,
	crypto,
	isMarketsLoading,
	marketsLastUpdated,
	vix,
	type MarketsState
} from './markets';

// Refresh store
export {
	refresh,
	isRefreshing,
	currentStage,
	lastRefresh,
	autoRefreshEnabled,
	timeSinceRefresh,
	categoriesWithErrors,
	REFRESH_STAGES,
	type RefreshStage,
	type StageConfig,
	type RefreshState
} from './refresh';

// Fed store
export {
	fedIndicators,
	fedNews,
	isFedLoading,
	fedVideos,
	type FedIndicatorsState,
	type FedNewsState
} from './fed';

// Fear & Greed store
export {
	fearGreed,
	fearGreedValue,
	fearGreedClassification,
	isFearGreedLoading,
	fearGreedLastUpdated,
	type FearGreedState
} from './feargreed';

// Treasury/Yield Curve store
export {
	treasury,
	yield2Y,
	yield10Y,
	yieldSpread,
	isYieldCurveInverted,
	type TreasuryState
} from './treasury';
