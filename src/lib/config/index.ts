/**
 * Configuration exports
 */

// Panel configuration
export {
	PANELS,
	NON_DRAGGABLE_PANELS,
	MAP_ZOOM_MIN,
	MAP_ZOOM_MAX,
	MAP_ZOOM_STEP,
	type PanelConfig,
	type PanelId
} from './panels';

// Feed configuration
export { FEEDS, INTEL_SOURCES, type FeedSource, type IntelSource } from './feeds';

// Keyword configuration
export {
	ALERT_KEYWORDS,
	REGION_KEYWORDS,
	TOPIC_KEYWORDS,
	containsAlertKeyword,
	detectRegion,
	detectTopics,
	type AlertKeyword
} from './keywords';

// Market configuration
export {
	SECTORS,
	COMMODITIES,
	INDICES,
	CRYPTO,
	type SectorConfig,
	type CommodityConfig
} from './markets';

// Analysis configuration
export {
	CORRELATION_TOPICS,
	NARRATIVE_PATTERNS,
	SOURCE_TYPES,
	PERSON_PATTERNS,
	type CorrelationTopic,
	type NarrativePattern,
	type SourceTypes,
	type PersonPattern
} from './analysis';

// Map configuration
export {
	HOTSPOTS,
	CONFLICT_ZONES,
	CHOKEPOINTS,
	CABLE_LANDINGS,
	NUCLEAR_SITES,
	MILITARY_BASES,
	OCEANS,
	SANCTIONED_COUNTRY_IDS,
	THREAT_COLORS,
	WEATHER_CODES,
	type Hotspot,
	type ConflictZone,
	type Chokepoint,
	type CableLanding,
	type NuclearSite,
	type MilitaryBase,
	type Ocean
} from './map';

// Preset configuration
export {
	PRESETS,
	PRESET_ORDER,
	ONBOARDING_STORAGE_KEY,
	PRESET_STORAGE_KEY,
	type Preset
} from './presets';

// API configuration
export {
	CORS_PROXY_URL,
	API_DELAYS,
	CACHE_TTLS,
	DEBUG,
	logger,
	FINNHUB_API_KEY,
	FINNHUB_BASE_URL
} from './api';

// World leaders configuration
export { WORLD_LEADERS } from './leaders';
