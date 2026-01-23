<script lang="ts">
	import type { Layoff } from '$lib/api';
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
	import { commodities, crypto as cryptoStore, indices, sectors, settings } from '$lib/stores';
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

interface Props {
		monitors?: CustomMonitor[];
		loading?: boolean;
		error?: string | null;
		layoffs?: Layoff[];
	}

	let { monitors = [], loading = false, error = null, layoffs = [] }: Props = $props();

	let container: HTMLElement;
	let myGlobe: GlobeInstance | null = null;

	const INITIAL_VIEW = { lat: 30, lng: 50, altitude: 0.9 };

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
		{ id: 'la', name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
		// { id: 'sp', name: 'Sao Paulo', lat: -23.55, lon: -46.6333 }
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

			<div class="mini-row">
				<div class="mini-title">Markets</div>
				{#if marketError}
					<div class="mini-state mini-error">{marketError}</div>
				{:else if marketLoading}
					<div class="mini-state">Loading markets...</div>
				{:else if marketItems.length === 0}
					<div class="mini-state">No market data</div>
				{:else}
					<div class="mini-heatmap-row">
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

			<div class="mini-row">
				<div class="mini-title">Crypto</div>
				{#if cryptoError}
					<div class="mini-state mini-error">{cryptoError}</div>
				{:else if cryptoLoading}
					<div class="mini-state">Loading crypto...</div>
				{:else if cryptoItems.length === 0}
					<div class="mini-state">No crypto data</div>
				{:else}
					<div class="mini-heatmap-row">
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

			<div class="mini-row">
				<div class="mini-title">Commodities / VIX</div>
				{#if commodityError}
					<div class="mini-state mini-error">{commodityError}</div>
				{:else if commodityLoading}
					<div class="mini-state">Loading commodities...</div>
				{:else if commodityItems.length === 0}
					<div class="mini-state">No commodities data</div>
				{:else}
					<div class="mini-heatmap-row">
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

			<div class="mini-row">
				<div class="mini-title">Layoffs Tracker</div>
				{#if !layoffs || layoffs.length === 0}
					<div class="mini-state">No recent layoffs data</div>
				{:else}
					<div class="mini-layoffs-row">
						{#each layoffs.slice(0, 6) as layoff, i (layoff.company + i)}
							<div class="mini-layoff-cell">
								<div class="mini-layoff-header">
									<span class="mini-layoff-company">{layoff.company}</span>
									<span class="mini-layoff-count">
										{layoff.count.toLocaleString()} jobs
									</span>
								</div>
								<div class="mini-layoff-meta">
									<span class="mini-layoff-title">{layoff.title}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
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
		height: 400px;
		background: var(--bg);
		border-radius: 4px;
		overflow: hidden;
	}

	.globe-container {
		width: 100%;
		height: 100%;
	}

	/* --- UPDATED LEGEND STYLING --- */
	.globe-legend {
		position: absolute;
		bottom: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.75); /* Slightly darker for contrast */
		padding: 6px 8px;
		border-radius: 4px;
		font-size: 0.6rem; /* Smaller font as requested */
		color: #ccc;
		pointer-events: none;
		/* Reverted to vertical stack */
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
		width: 6px; /* Smaller dots to match font */
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
		gap: 0.4rem;
		margin-bottom: 0.25rem;
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

	/* --- ROW STYLING --- */
	.mini-weather-row,
	.mini-heatmap-row,
	.mini-layoffs-row {
		display: flex;
		flex: 1;
		gap: 0.25rem;
		overflow-x: auto; 
		padding-bottom: 0.1rem;
		scrollbar-width: none; /* Hide scrollbar Firefox */
	}
	/* Hide scrollbar Chrome/Safari */
	.mini-weather-row::-webkit-scrollbar,
	.mini-heatmap-row::-webkit-scrollbar,
	.mini-layoffs-row::-webkit-scrollbar {
		display: none;
	}

	/* --- WEATHER CELLS --- */
	.mini-weather-cell {
		flex: 1 0 110px;
		min-width: 110px;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.15rem;
		font-size: 0.65rem;
	}

	/* --- HEATMAP/MARKET/CRYPTO CELLS --- */
	.mini-heatmap-row :global(.heatmap-cell) {
		/* UPDATED: Reduced min-width to 85px to fit 12 sectors on one line */
		flex: 1 1 85px; 
		min-width: 85px;
		height: auto;
		min-height: 42px;
	}

	.mini-heatmap-row :global(.sector-name) {
		font-size: 0.7rem;
	}

	.mini-heatmap-row :global(.sector-change) {
		font-size: 0.65rem;
	}

	/* --- LAYOFF CELLS --- */
	.mini-layoff-cell {
		flex: 1 1 140px; 
		min-width: 140px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		padding: 0.35rem 0.5rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.1rem;
		font-size: 0.65rem;
	}

	.city-header, .city-meta, .mini-layoff-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.25rem;
	}

	.city-name, .mini-layoff-company {
		font-weight: 600;
		color: var(--text-primary);
	}

	.city-time, .mini-layoff-meta {
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

	.mini-layoff-count {
		font-size: 0.6rem;
		color: var(--danger);
		font-weight: 600;
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
		.mini-layoff-cell {
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
			padding-left: 0.75rem;
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		/* UPDATED: Forced nowrap to keep single rows */
		.mini-weather-row,
		.mini-heatmap-row,
		.mini-layoffs-row {
			flex-wrap: nowrap; 
			overflow-x: auto; /* Enable scroll if screen is too small */
		}
	}
</style>
