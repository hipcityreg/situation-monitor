<script lang="ts">
	import { analyzeCorrelations } from '$lib/analysis';
	import type { Layoff } from '$lib/api';
	import type { EconomicIndicator } from '$lib/api/fred';
	import { isFredConfigured } from '$lib/api/fred';
	import { HeatmapCell, Panel } from '$lib/components/common';
	import { CACHE_TTLS } from '$lib/config/api';
	import {
		CABLE_LANDINGS,
		CHOKEPOINTS,
		CONFLICT_ZONES,
		HOTSPOTS,
		MILITARY_BASES,
		NUCLEAR_SITES,
		THREAT_COLORS,
		WEATHER_CODES
	} from '$lib/config/map';
	import {
		allNewsItems,
		commodities,
		crypto as cryptoStore,
		fedIndicators,
		indices,
		sectors,
		settings
	} from '$lib/stores';
	import type { CustomMonitor } from '$lib/types';
	import { onMount } from 'svelte';

	interface GlobeControls {
		autoRotate: boolean;
		autoRotateSpeed: number;
	}

	interface GlobeInstance {
		pointOfView(view: { lat: number; lng: number; altitude: number }, ms?: number): void;
		width(width: number): void;
		height(height: number): void;
		pointsData(data: unknown[]): GlobeInstance;
		labelsData(data: unknown[]): GlobeInstance;
		polygonsData(data: unknown[]): GlobeInstance;
		controls(): GlobeControls;
		_destructor(): void;
	}

	interface MoneyPrinterData {
		value: number;
		change: number;
		changePercent: number;
		percentOfMax: number;
	}

	interface Props {
		monitors?: CustomMonitor[];
		loading?: boolean;
		error?: string | null;
		layoffs?: Layoff[];
		printerData?: MoneyPrinterData | null;
	}

	let {
		monitors = [],
		loading = false,
		error = null,
		// layoffs = [],
		printerData = null
	}: Props = $props();

	let container: HTMLElement;
	let myGlobe: GlobeInstance | null = null;

	const INITIAL_VIEW = { lat: 30, lng: 40, altitude: 1.3 };

	interface CityConfig {
		id: string;
		name: string;
		lat: number;
		lon: number;
	}

	interface CityWeatherItem extends CityConfig {
		localTime: string;
		tempC: number | null;
		tempF: number | null;
		condition: string;
	}

	interface WeatherResult {
		tempC: number | null;
		tempF: number | null;
		condition: string;
	}

	interface CacheEntry<T> {
		data: T;
		timestamp: number;
	}

	const CITIES: CityConfig[] = [
		{ id: 'tokyo', name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
		{ id: 'syd', name: 'Sydney', lat: -33.8688, lon: 151.2093 },
		{ id: 'sg', name: 'Singapore', lat: 1.3521, lon: 103.8198 },
		{ id: 'isb', name: 'Islamabad', lat: 33.6844, lon: 73.0479 },
		{ id: 'riyadh', name: 'Riyadh', lat: 24.7136, lon: 46.6753 },
		{ id: 'berlin', name: 'Berlin', lat: 52.52, lon: 13.405 },
		{ id: 'lon', name: 'London', lat: 51.5074, lon: -0.1278 },
		{ id: 'nyc', name: 'New York', lat: 40.7128, lon: -74.006 },
		{ id: 'la', name: 'Los Angeles', lat: 34.0522, lon: -118.2437 }
	];

	const weatherCache: Record<string, CacheEntry<WeatherResult>> = {};

	let cityWeatherItems = $state<CityWeatherItem[]>([]);
	let weatherLoading = $state(false);
	let weatherError = $state<string | null>(null);

	const pointsData = $derived([
		...HOTSPOTS.map((h) => ({
			lat: h.lat,
			lng: h.lon,
			size: h.level === 'critical' ? 1.5 : 0.8,
			color: THREAT_COLORS[h.level],
			name: h.name,
			desc: `Hotspot: ${h.desc}`,
			type: 'hotspot'
		})),
		...NUCLEAR_SITES.map((n) => ({
			lat: n.lat,
			lng: n.lon,
			size: 0.6,
			color: '#ffff00',
			name: n.name,
			desc: `Nuclear: ${n.desc}`,
			type: 'nuclear'
		})),
		...MILITARY_BASES.map((m) => ({
			lat: m.lat,
			lng: m.lon,
			size: 0.6,
			color: '#ff00ff',
			name: m.name,
			desc: `Military: ${m.desc}`,
			type: 'military'
		})),
		...CHOKEPOINTS.map((c) => ({
			lat: c.lat,
			lng: c.lon,
			size: 0.6,
			color: '#00aaff',
			name: c.name,
			desc: `Chokepoint: ${c.desc}`,
			type: 'chokepoint'
		})),
		...CABLE_LANDINGS.map((c) => ({
			lat: c.lat,
			lng: c.lon,
			size: 0.4,
			color: '#aa44ff',
			name: c.name,
			desc: `Cable: ${c.desc}`,
			type: 'cable'
		})),
		...monitors
			.filter((m) => m.enabled && m.location)
			.map((m) => ({
				lat: m.location!.lat,
				lng: m.location!.lon,
				size: 1.2,
				color: m.color || '#00ffff',
				name: m.name,
				desc: `Monitor: ${m.name}`,
				type: 'monitor'
			}))
	]);

	const zonesData = $derived(
		CONFLICT_ZONES.map((zone) => ({
			type: 'Feature',
			geometry: { type: 'Polygon', coordinates: [zone.coords] },
			properties: { name: zone.name, color: zone.color }
		}))
	);

	const miniItems = $derived($sectors.items);
	const miniLoading = $derived($sectors.loading);
	const miniError = $derived($sectors.error);

	const marketItems = $derived($indices.items);
	const marketLoading = $derived($indices.loading);
	const marketError = $derived($indices.error);

	const commodityItems = $derived($commodities.items);
	const commodityLoading = $derived($commodities.loading);
	const commodityError = $derived($commodities.error);

	const cryptoItems = $derived($cryptoStore.items);
	const cryptoLoading = $derived($cryptoStore.loading);
	const cryptoError = $derived($cryptoStore.error);

	const fedState = $derived($fedIndicators);
	const fedData = $derived(fedState.data);
	const fedLoading = $derived(fedState.loading);
	const fedError = $derived(fedState.error);

const fedIndicatorsList = $derived(
	fedData ? [fedData.fedFundsRate, fedData.cpi, fedData.treasury10Y] : []
);

const analysis = $derived(analyzeCorrelations($allNewsItems));

const hasFredApiKey = isFredConfigured();

function getAnalysisStyle(item: any, type: string) {
	switch (type) {
		case 'pattern': {
			if (item.level === 'high') return { color: 'rgba(239, 68, 68, 0.18)', tag: '[High]' };
			if (item.level === 'elevated')
				return { color: 'rgba(234, 179, 8, 0.18)', tag: '[Elevated]' };
			if (item.level === 'emerging')
				return { color: 'rgba(34, 197, 94, 0.18)', tag: '[Emerging]' };
			return { color: 'rgba(255, 255, 255, 0.02)', tag: '' };
		}

		case 'momentum': {
			if (item.momentum === 'surging')
				return { color: 'rgba(239, 68, 68, 0.18)', tag: '[Surging]' };
			if (item.momentum === 'rising')
				return { color: 'rgba(234, 179, 8, 0.18)', tag: '[Rising]' };
			if (item.momentum === 'stable')
				return { color: 'rgba(34, 197, 94, 0.18)', tag: '[Stable]' };
			return { color: 'rgba(255, 255, 255, 0.02)', tag: '' };
		}

		case 'source': {
			if (item.level === 'high')
				return { color: 'rgba(239, 68, 68, 0.18)', tag: '[Widespread]' };
			if (item.level === 'elevated')
				return { color: 'rgba(234, 179, 8, 0.18)', tag: '[Growing]' };
			if (item.level === 'emerging')
				return { color: 'rgba(34, 197, 94, 0.18)', tag: '[Niche]' };
			return { color: 'rgba(255, 255, 255, 0.02)', tag: '' };
		}

		case 'predictive': {
			if (item.level === 'high')
				return { color: 'rgba(239, 68, 68, 0.18)', tag: '[High Conf]' };
			if (item.level === 'medium')
				return { color: 'rgba(234, 179, 8, 0.18)', tag: '[Med Conf]' };
			if (item.level === 'low')
				return { color: 'rgba(34, 197, 94, 0.18)', tag: '[Low Conf]' };
			return { color: 'rgba(255, 255, 255, 0.02)', tag: '' };
		}

		default:
			return { color: 'rgba(255, 255, 255, 0.02)', tag: '' };
	}
}

function getFedColor(type: string, value: number | null): string {
		if (value === null) return 'rgba(255, 255, 255, 0.05)';

		if (type === 'cpi') {
			if (value > 3.5) return '#ff0000';
			if (value > 2.5) return '#ffaa00';
			return '#00cc66';
		}

		if (type === 'fedFunds') {
			if (value > 5.0) return '#ff0000';
			if (value > 4.0) return '#ffaa00';
			return '#00cc66';
		}

		if (type === 'treasury10y') {
			if (value > 4.5) return '#ff0000';
			if (value > 4.0) return '#ffaa00';
			return '#00cc66';
		}

		if (type === 'printer') {
			if (value > 8.0) return '#ff0000';
			if (value > 7.0) return '#ffaa00';
			return '#00cc66';
		}

		return '#00cc66';
	}

	function getFedStatusLabel(type: string, value: number | null): string {
		if (value === null) return 'N/A';

		if (type === 'cpi') {
			if (value > 3.5) return 'High Inflation';
			if (value > 2.5) return 'Elevated';
			return 'Target';
		}

		if (type === 'fedFunds') {
			if (value > 5.0) return 'Very Restrictive';
			if (value > 4.0) return 'Restrictive';
			return 'Supportive';
		}

		if (type === 'treasury10y') {
			if (value > 4.5) return 'High Yield';
			if (value > 4.0) return 'Elevated';
			return 'Normal';
		}

		if (type === 'printer') {
			if (value > 8.0) return 'Very High';
			if (value > 7.0) return 'Elevated';
			return 'Normal';
		}

		return '';
	}

	// function getPatternColor(level: string): string {
	// 	if (level === 'high') return '#ff0000';
	// 	if (level === 'elevated') return '#ffaa00';
	// 	return '#00cc66';
	// }

	function getDirectionArrow(delta: number): string {
		if (delta > 0) return '↑';
		if (delta < 0) return '↓';
		return '→';
	}

	function truncate(text: string, max: number): string {
		if (!text) return '';
		return text.length > max ? `${text.slice(0, max)}…` : text;
	}

	function getLocalTime(lon: number): string {
		const now = new Date();
		const utcHours = now.getUTCHours();
		const utcMinutes = now.getUTCMinutes();
		const offsetHours = Math.round(lon / 15);
		let localHours = (utcHours + offsetHours + 24) % 24;
		const ampm = localHours >= 12 ? 'PM' : 'AM';
		localHours = localHours % 12 || 12;
		return `${localHours}:${utcMinutes.toString().padStart(2, '0')} ${ampm}`;
	}

	function getCachedWeather(key: string): WeatherResult | null {
		const entry = weatherCache[key];
		if (!entry) return null;
		if (Date.now() - entry.timestamp > CACHE_TTLS.weather) {
			delete weatherCache[key];
			return null;
		}
		return entry.data;
	}

	function setCachedWeather(key: string, data: WeatherResult): void {
		weatherCache[key] = { data, timestamp: Date.now() };
	}

	function formatFedValue(indicator: EconomicIndicator): string {
		if (indicator.value === null) return '--';
		return `${indicator.value.toFixed(2)}${indicator.unit}`;
	}

	function formatPrinterValue(data: MoneyPrinterData | null): string {
		if (!data) return '--';
		return `${data.value.toFixed(2)}T`;
	}

	async function getWeather(lat: number, lon: number): Promise<WeatherResult | null> {
		const key = `weather_${lat}_${lon}`;
		const cached = getCachedWeather(key);
		if (cached) return cached;

		try {
			const res = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
			);
			const data = await res.json();
			const rawTemp = data.current?.temperature_2m;
			const tempC =
				typeof rawTemp === 'number' && !Number.isNaN(rawTemp) ? Math.round(rawTemp) : null;
			const tempF = tempC !== null ? Math.round((tempC * 9) / 5 + 32) : null;
			const code = data.current?.weather_code;
			const condition =
				typeof code === 'number' && WEATHER_CODES[code] ? WEATHER_CODES[code] : '—';
			const result: WeatherResult = { tempC, tempF, condition };
			setCachedWeather(key, result);
			return result;
		} catch {
			return null;
		}
	}

	async function loadCityWeather(): Promise<void> {
		weatherLoading = true;
		weatherError = null;

		try {
			const items = await Promise.all(
				CITIES.map(async (city) => {
					const localTime = getLocalTime(city.lon);
					const weather = await getWeather(city.lat, city.lon);
					return {
						...city,
						localTime,
						tempC: weather?.tempC ?? null,
						tempF: weather?.tempF ?? null,
						condition: weather?.condition ?? '—'
					};
				})
			);
			cityWeatherItems = items;
		} catch {
			weatherError = 'Weather unavailable';
		} finally {
			weatherLoading = false;
		}
	}

	function resetView() {
		if (myGlobe) {
			myGlobe.pointOfView(INITIAL_VIEW, 1500);
		}
	}

	onMount(() => {
		let resizeObserver: ResizeObserver;

		(async () => {
			if (typeof window === 'undefined') return;

			const module = await import('globe.gl');
			const Globe = module.default;

			const globeInstance = new Globe(container)
				.globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
				.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
				.backgroundColor('rgba(0,0,0,0)')
				.atmosphereColor('lightskyblue')
				.atmosphereAltitude(0.15)
				.pointsData(pointsData)
				.pointAltitude(0.02)
				.pointColor('color')
				.pointRadius('size')
				.pointLabel('desc')
				.labelsData(pointsData)
				.labelLat('lat')
				.labelLng('lng')
				.labelText('name')
				.labelSize((d: any) => (d.type === 'hotspot' ? 1.5 : 1.0))
				.labelDotRadius(0.3)
				.labelColor(() => '#ffffff')
				.labelResolution(2)
				.labelAltitude(0.05)
				.polygonsData(zonesData)
				.polygonGeoJsonGeometry((d: any) => d.geometry)
				.polygonCapColor((d: any) => d.properties.color)
				.polygonSideColor(() => 'rgba(0, 100, 0, 0.05)')
				.polygonStrokeColor(() => '#111')
				.polygonAltitude(0.01)
				.polygonLabel((d: any) => `<b>${d.properties.name}</b>`);

			const controls = globeInstance.controls();
			controls.autoRotate = true;
			controls.autoRotateSpeed = 0.5;

			myGlobe = globeInstance;

			myGlobe.pointOfView(INITIAL_VIEW);

			if (container && myGlobe) {
				myGlobe.width(container.clientWidth);
				myGlobe.height(container.clientHeight);
			}

			resizeObserver = new ResizeObserver((entries) => {
				const { width, height } = entries[0].contentRect;
				if (myGlobe) {
					myGlobe.width(width);
					myGlobe.height(height);
				}
			});
			resizeObserver.observe(container);
		})();

		loadCityWeather();

		return () => {
			if (resizeObserver) resizeObserver.disconnect();
			if (myGlobe) myGlobe._destructor();
		};
	});

	$effect(() => {
		if (myGlobe && pointsData) {
			myGlobe.pointsData(pointsData);
			myGlobe.labelsData(pointsData);
		}
		if (myGlobe && zonesData) {
			myGlobe.polygonsData(zonesData);
		}
	});
</script>

<Panel id="map" title="Global Situation (3D)" {loading} {error}>
	<div class="globe-wrapper">
		<div class="globe-main">
			<div class="globe-container" bind:this={container}></div>

			<div class="globe-controls">
				<button class="control-btn" onclick={resetView}>⟲ Reset View</button>
			</div>

			<!-- VERTICAL LEGEND -->
			<div class="globe-legend">
				<div class="legend-item"><span class="dot critical"></span> Critical</div>
				<div class="legend-item"><span class="dot conflict"></span> Conflict Zone</div>
				<div class="legend-item"><span class="dot nuclear"></span> Nuclear</div>
				<div class="legend-item"><span class="dot military"></span> Military</div>
				<div class="legend-item"><span class="dot chokepoint"></span> Chokepoint</div>
				<div class="legend-item"><span class="dot cable"></span> Submarine Cable</div>
				<div class="legend-item"><span class="dot monitor"></span> My Monitor</div>
			</div>
		</div>

		<div class="globe-mini-dashboard">
			<!-- ROW 1: WEATHER -->
			<div class="mini-row">
				<div class="mini-title">Time & Weather</div>
				{#if weatherError}
					<div class="mini-state mini-error">{weatherError}</div>
				{:else if weatherLoading && cityWeatherItems.length === 0}
					<div class="mini-state">Loading weather...</div>
				{:else if cityWeatherItems.length === 0}
					<div class="mini-state">No weather data</div>
				{:else}
					<div class="mini-weather-row">
						{#each cityWeatherItems as city (city.id)}
							<div class="mini-weather-cell">
								<div class="city-header">
									<span class="city-name">{city.name}</span>
									<span class="city-time">{city.localTime}</span>
								</div>
								<div class="city-meta">
									<span class="city-temp">
										{#if $settings.tempUnit === 'c'}
											{#if city.tempC !== null}
												{city.tempC}°C
											{:else}
												—
											{/if}
										{:else}
											{#if city.tempF !== null}
												{city.tempF}°F
											{:else}
												—
											{/if}
										{/if}
									</span>
									<span class="city-condition">{city.condition}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- ROW 2: SECTOR HEATMAP (Stacked) -->
			<div class="mini-row">
				<div class="mini-title">Sector Heatmap</div>
				{#if miniError}
					<div class="mini-state mini-error">{miniError}</div>
				{:else if miniLoading}
					<div class="mini-state">Loading sectors...</div>
				{:else if miniItems.length === 0}
					<div class="mini-state">No sector data available</div>
				{:else}
					<div class="mini-heatmap-row">
						{#each miniItems as sector (sector.symbol)}
							<HeatmapCell {sector} />
						{/each}
					</div>
				{/if}
			</div>

			<!-- ROW 3: MARKETS (Side-by-Side) -->
			<div class="mini-row">
				<div class="mini-title">Markets</div>
				{#if marketError}
					<div class="mini-state mini-error">{marketError}</div>
				{:else if marketLoading}
					<div class="mini-state">Loading markets...</div>
				{:else if marketItems.length === 0}
					<div class="mini-state">No market data</div>
				{:else}
					<!-- Added 'horizontal-layout' class -->
					<div class="mini-heatmap-row horizontal-layout">
						{#each marketItems as item (item.symbol)}
							<HeatmapCell
								sector={{
									symbol: item.symbol,
									name: item.name,
									price: item.price,
									change: item.change,
									changePercent: item.changePercent
								}}
							/>
						{/each}
					</div>
				{/if}
			</div>

			<!-- ROW 4: CRYPTO (Side-by-Side) -->
			<div class="mini-row">
				<div class="mini-title">Crypto</div>
				{#if cryptoError}
					<div class="mini-state mini-error">{cryptoError}</div>
				{:else if cryptoLoading}
					<div class="mini-state">Loading crypto...</div>
				{:else if cryptoItems.length === 0}
					<div class="mini-state">No crypto data</div>
				{:else}
					<!-- Added 'horizontal-layout' class -->
					<div class="mini-heatmap-row horizontal-layout">
						{#each cryptoItems as coin (coin.id)}
							<HeatmapCell
								sector={{
									symbol: coin.symbol.toUpperCase(),
									name: coin.name,
									price: coin.current_price,
									change: coin.price_change_24h,
									changePercent: coin.price_change_percentage_24h
								}}
							/>
						{/each}
					</div>
				{/if}
			</div>

			<!-- ROW 5: COMMODITIES (Side-by-Side) -->
			<div class="mini-row">
				<div class="mini-title">Commodities</div>
				{#if commodityError}
					<div class="mini-state mini-error">{commodityError}</div>
				{:else if commodityLoading}
					<div class="mini-state">Loading commodities...</div>
				{:else if commodityItems.length === 0}
					<div class="mini-state">No commodities data</div>
				{:else}
					<!-- Added 'horizontal-layout' class -->
					<div class="mini-heatmap-row horizontal-layout">
						{#each commodityItems as item (item.symbol)}
							<HeatmapCell
								sector={{
									symbol: item.symbol,
									name: item.name,
									price: item.price,
									change: item.change,
									changePercent: item.changePercent
								}}
							/>
						{/each}
					</div>
				{/if}
			</div>

			<!-- ROW 6: FEDERAL RESERVE -->
			<div class="mini-row">
				<div class="mini-title">Federal Reserve</div>
				{#if !hasFredApiKey}
					<div class="mini-state">Add FRED API key for Fed data</div>
				{:else if fedError}
					<div class="mini-state mini-error">{fedError}</div>
				{:else if fedLoading && fedIndicatorsList.length === 0 && !printerData}
					<div class="mini-state">Loading Fed data...</div>
				{:else if fedIndicatorsList.length === 0 && !printerData}
					<div class="mini-state">No Fed data available</div>
				{:else}
					<div class="mini-fed-row">
						{#if fedData}
							<div
								class="mini-fed-cell"
								style={`background: ${getFedColor('fedFunds', fedData.fedFundsRate.value)}`}
							>
								<span class="mini-fed-label">
									Fed Funds Rate
									<span class="mini-fed-tag">
										{getFedStatusLabel('fedFunds', fedData.fedFundsRate.value)}
									</span>
								</span>
								<span class="mini-fed-value">{formatFedValue(fedData.fedFundsRate)}</span>
							</div>
							<div
								class="mini-fed-cell"
								style={`background: ${getFedColor('cpi', fedData.cpi.value)}`}
							>
								<span class="mini-fed-label">
									CPI Inflation
									<span class="mini-fed-tag">
										{getFedStatusLabel('cpi', fedData.cpi.value)}
									</span>
								</span>
								<span class="mini-fed-value">{formatFedValue(fedData.cpi)}</span>
							</div>
							<div
								class="mini-fed-cell"
								style={`background: ${getFedColor('treasury10y', fedData.treasury10Y.value)}`}
							>
								<span class="mini-fed-label">
									10Y Treasury
									<span class="mini-fed-tag">
										{getFedStatusLabel('treasury10y', fedData.treasury10Y.value)}
									</span>
								</span>
								<span class="mini-fed-value">{formatFedValue(fedData.treasury10Y)}</span>
							</div>
						{/if}
						{#if printerData}
							<div
								class="mini-fed-cell mini-fed-printer"
								style={`background: ${getFedColor('printer', printerData.value)}`}
							>
								<span class="mini-fed-label">
									Money Printer
									<span class="mini-fed-tag">
										{getFedStatusLabel('printer', printerData.value)}
									</span>
								</span>
								<span class="mini-fed-value">{formatPrinterValue(printerData)}</span>
							</div>
						{/if}
					</div>
				{/if}
			</div>

		{#if analysis && analysis.emergingPatterns.length > 0}
			<div class="mini-row">
				<div class="mini-title">Emerging Patterns</div>
				<div class="mini-heatmap-row">
					{#each analysis.emergingPatterns.slice(0, 6) as pattern (pattern.id)}
						{@const style = getAnalysisStyle(pattern, 'pattern')}
						<div class="mini-analysis-cell" style={`background: ${style.color}`}>
							<span class="mini-analysis-label">
								{pattern.name}
								{#if style.tag}
									<span class="mini-fed-tag">{style.tag}</span>
								{/if}
							</span>
							<span class="mini-analysis-value">{pattern.count}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if analysis && analysis.momentumSignals.length > 0}
			<div class="mini-row">
				<div class="mini-title">Momentum Signals</div>
				<div class="mini-heatmap-row">
					{#each analysis.momentumSignals.slice(0, 6) as signal (signal.id)}
						{@const style = getAnalysisStyle(signal, 'momentum')}
						<div class="mini-analysis-cell" style={`background: ${style.color}`}>
							<span class="mini-analysis-label">
								{signal.name}
								{#if style.tag}
									<span class="mini-fed-tag">{style.tag}</span>
								{/if}
							</span>
							<span class="mini-analysis-value">
								{getDirectionArrow(signal.delta)} {signal.current}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if analysis && analysis.crossSourceCorrelations.length > 0}
			<div class="mini-row">
				<div class="mini-title">Cross-Source Links</div>
				<div class="mini-heatmap-row">
					{#each analysis.crossSourceCorrelations.slice(0, 6) as link (link.id)}
						{@const style = getAnalysisStyle(link, 'source')}
						<div class="mini-analysis-cell" style={`background: ${style.color}`}>
							<span class="mini-analysis-label">
								{link.name}
								{#if style.tag}
									<span class="mini-fed-tag">{style.tag}</span>
								{/if}
							</span>
							<span class="mini-analysis-value">({link.sourceCount})</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if analysis && analysis.predictiveSignals.length > 0}
			<div class="mini-row">
				<div class="mini-title">Predictive Signals</div>
				<div class="mini-heatmap-row">
					{#each analysis.predictiveSignals.slice(0, 6) as signal (signal.id)}
						{@const style = getAnalysisStyle(signal, 'predictive')}
						<div class="mini-analysis-cell" style={`background: ${style.color}`}>
							<span class="mini-analysis-label">
								{truncate(signal.prediction, 40)}
								{#if style.tag}
									<span class="mini-fed-tag">{style.tag}</span>
								{/if}
							</span>
							<span class="mini-analysis-value">
								Conf: {Math.round(signal.confidence)}%
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		</div>
	</div>
</Panel>

<style>
	.globe-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.globe-main {
		position: relative;
		width: 100%;
		height: 518px;
		background: var(--bg);
		border-radius: 4px;
		overflow: hidden;
	}

.globe-mini-dashboard {
	padding-top: 0.3rem;
	padding-bottom: 0.3rem;
}

	.globe-container {
		width: 100%;
		height: 100%;
	}

	/* --- LEGEND --- */
	.globe-legend {
		position: absolute;
		bottom: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.75);
		padding: 6px 8px;
		border-radius: 4px;
		font-size: 0.6rem;
		color: #ccc;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		gap: 3px; 
		z-index: 10;
	}

	.globe-controls {
		position: absolute;
		bottom: 10px;
		left: 10px;
		z-index: 10;
	}

	.control-btn {
		background: rgba(30, 30, 30, 0.8);
		color: #fff;
		border: 1px solid #444;
		border-radius: 4px;
		padding: 6px 12px;
		font-size: 0.75rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.control-btn:hover {
		background: rgba(60, 60, 60, 0.9);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		display: inline-block;
	}

	/* Dot colors */
	.dot.critical { background: #ff0000; }
	.dot.conflict { background: #ff4444; opacity: 0.6; }
	.dot.nuclear { background: #ffff00; }
	.dot.military { background: #ff00ff; }
	.dot.chokepoint { background: #00aaff; }
	.dot.cable { background: #aa44ff; }
	.dot.monitor { background: #00ffff; }

	.mini-state {
		font-size: 0.65rem;
		color: var(--text-secondary);
	}

	.mini-error {
		color: var(--danger);
	}

	.mini-row {
		display: flex;
		align-items: stretch;
		gap: 0.5rem;
	margin-bottom: 0.3rem;
	}

	.mini-title {
		font-size: 0.72rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		white-space: nowrap;
		display: flex;
		align-items: center;
		width: 120px;
		flex-shrink: 0;
	}

	/* --- ROW SCROLL/WRAP CONFIG --- */
	.mini-weather-row,
	.mini-heatmap-row,
	.mini-fed-row {
		display: flex;
		flex: 1;
		gap: 0.25rem;
		overflow-x: auto; 
		padding-bottom: 0.1rem;
		scrollbar-width: none;
	}
	.mini-weather-row::-webkit-scrollbar,
	.mini-heatmap-row::-webkit-scrollbar,
	.mini-fed-row::-webkit-scrollbar {
		display: none;
	}

	/* --- 1. SHARED STRUCTURE (Height & Layout) --- */
	.mini-weather-cell,
	.mini-heatmap-row :global(.heatmap-cell) {
		height: 44px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		border-radius: 4px;
	}

	/* --- 2. BACKGROUNDS FOR NON-COLORED CELLS ONLY --- */
	/* We apply the gray background ONLY to weather and Fed.
	   We DO NOT apply it to heatmap-cell, so it keeps its green/red color. */
	.mini-weather-cell,
	.mini-fed-cell {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
	}

	/* --- WEATHER SPECIFICS --- */
	.mini-weather-cell {
		flex: 1 0 110px;
		min-width: 110px;
		padding: 0 0.5rem;
		gap: 0.15rem;
		font-size: 0.65rem;
	}

	/* --- HEATMAP SPECIFICS --- */
	/* Default (Stacked) */
	.mini-heatmap-row :global(.heatmap-cell) {
		flex: 1 1 85px; 
		min-width: 85px;
		/* Background is handled by the component (green/red classes) */
	}

	/* Horizontal Layout Override (Markets/Crypto) */
	.horizontal-layout :global(.heatmap-cell) {
		flex-direction: row !important;
		justify-content: space-between !important;
		align-items: center !important;
		padding: 0 1rem !important;
	}
	
	.horizontal-layout :global(.sector-change) {
		margin-top: 0 !important;
	}

	/* --- FED SPECIFICS --- */
	.mini-fed-cell {
		flex: 1 1 140px;
		min-width: 140px;
		height: 44px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 0 0.5rem;
		font-size: 0.65rem;
		border-radius: 4px;
		white-space: nowrap;
	}

	.mini-analysis-cell {
		flex: 1 1 160px;
		min-width: 140px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0.5rem;
		border-radius: 4px;
		border: 1px solid var(--border);
		font-size: 0.65rem;
		color: #ffffff;
		white-space: nowrap;
	}

	.mini-analysis-label {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.mini-analysis-value {
		font-weight: 700;
		margin-left: 0.25rem;
	}

	.mini-fed-tag {
		display: inline-block;
		margin-left: 0.25rem;
		padding: 0.05rem 0.25rem;
		border-radius: 999px;
		font-size: 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		color: #ffffff;
		text-transform: none;
	}

	/* Text Styles */
	.city-header, .city-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.25rem;
	}

	.city-name {
		font-weight: 600;
		color: var(--text-primary);
	}

	.city-time {
		font-size: 0.6rem;
		color: var(--text-secondary);
	}

	.city-temp {
		font-size: 0.75rem;
		font-weight: 700;
	}

	.city-condition {
		font-size: 0.6rem;
		color: var(--text-secondary);
		text-align: right;
	}

	.mini-fed-label {
		font-size: 0.6rem;
		color: #ffffff;
		text-transform: uppercase;
	}

	.mini-fed-value {
		font-size: 0.75rem;
		font-weight: 700;
		color: #ffffff;
	}

	:global([data-theme='light']) .mini-analysis-cell {
		color: #111827;
	}

	:global([data-theme='light']) .mini-fed-label {
		color: #111827;
	}

	:global([data-theme='light']) .mini-fed-value {
		color: #111827;
	}

	:global([data-theme='light']) .mini-fed-tag {
		background: rgba(255, 255, 255, 0.8);
		color: #111827;
	}

	@media (max-width: 768px) {
		.mini-row {
			flex-direction: column;
			align-items: flex-start;
		}
		
		.mini-title {
			width: 100%;
			margin-bottom: 0.25rem;
		}

		.mini-heatmap-row :global(.heatmap-cell),
		.mini-weather-cell,
		.mini-fed-cell {
			flex: 0 0 130px;
		}
	}

	@media (min-width: 900px) {
		.globe-wrapper {
			flex-direction: row;
		}

		.globe-main {
			flex: 0 0 25%;
			max-width: 25%;
		}

		.globe-mini-dashboard {
			flex: 1;
			padding: 0 0 0 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		.mini-weather-row,
		.mini-heatmap-row,
		.mini-fed-row {
			flex-wrap: nowrap; 
			overflow-x: auto;
		}
	}
</style>
