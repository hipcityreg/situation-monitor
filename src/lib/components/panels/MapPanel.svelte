<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import {
		HOTSPOTS,
		CONFLICT_ZONES,
		CHOKEPOINTS,
		CABLE_LANDINGS,
		NUCLEAR_SITES,
		MILITARY_BASES,
		OCEANS,
		SANCTIONED_COUNTRY_IDS,
		THREAT_COLORS,
		WEATHER_CODES
	} from '$lib/config/map';
	import { CACHE_TTLS } from '$lib/config/api';
	import type { CustomMonitor } from '$lib/types';

	interface Props {
		monitors?: CustomMonitor[];
		loading?: boolean;
		error?: string | null;
	}

	let { monitors = [], loading = false, error = null }: Props = $props();

	let mapContainer: HTMLDivElement;
	// D3 objects - initialized in initMap, null before initialization
	// Using 'any' for D3 objects as they're dynamically imported and have complex generic types
	/* eslint-disable @typescript-eslint/no-explicit-any */
	let d3Module: typeof import('d3') | null = null;
	let svg: any = null;
	let mapGroup: any = null;
	let projection: any = null;
	let path: any = null;
	let zoom: any = null;
	/* eslint-enable @typescript-eslint/no-explicit-any */

	const WIDTH = 800;
	const HEIGHT = 400;

	// Star path for military bases
	const STAR_PATH_D = 'M0,-5 L1.5,-1.5 L5,-1.5 L2.5,1 L3.5,5 L0,2.5 L-3.5,5 L-2.5,1 L-5,-1.5 L-1.5,-1.5 Z';

	// Tooltip state
	let tooltipContent = $state<{
		title: string;
		color: string;
		lines: string[];
	} | null>(null);
	let tooltipPosition = $state({ left: 0, top: 0 });
	let tooltipVisible = $state(false);

	// Data cache for tooltips with TTL support
	interface CacheEntry<T> {
		data: T;
		timestamp: number;
	}
	const dataCache: Record<string, CacheEntry<unknown>> = {};

	function getCachedData<T>(key: string): T | null {
		const entry = dataCache[key] as CacheEntry<T> | undefined;
		if (!entry) return null;
		// Check if cache entry has expired
		if (Date.now() - entry.timestamp > CACHE_TTLS.weather) {
			delete dataCache[key];
			return null;
		}
		return entry.data;
	}

	function setCachedData<T>(key: string, data: T): void {
		dataCache[key] = { data, timestamp: Date.now() };
	}

	// Get local time at longitude
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

	// Weather result type
	interface WeatherResult {
		temp: number | null;
		wind: number | null;
		condition: string;
	}

	// Fetch weather from Open-Meteo with TTL-based caching
	async function getWeather(lat: number, lon: number): Promise<WeatherResult | null> {
		const key = `weather_${lat}_${lon}`;
		const cached = getCachedData<WeatherResult>(key);
		if (cached) return cached;

		try {
			const res = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`
			);
			const data = await res.json();
			const temp = data.current?.temperature_2m;
			const tempF = temp ? Math.round((temp * 9) / 5 + 32) : null;
			const wind = data.current?.wind_speed_10m;
			const code = data.current?.weather_code;
			const result: WeatherResult = {
				temp: tempF,
				wind: wind ? Math.round(wind) : null,
				condition: WEATHER_CODES[code] || '—'
			};
			setCachedData(key, result);
			return result;
		} catch {
			return null;
		}
	}

	// Enable zoom/pan behavior on the map
	function enableZoom(): void {
		if (!svg || !zoom) return;
		svg.call(zoom);
	}

	// Calculate day/night terminator points
	function calculateTerminator(): [number, number][] {
		const now = new Date();
		const dayOfYear = Math.floor(
			(now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
		);
		const declination = -23.45 * Math.cos(((360 / 365) * (dayOfYear + 10) * Math.PI) / 180);
		const hourAngle = (now.getUTCHours() + now.getUTCMinutes() / 60) * 15 - 180;

		const terminatorPoints: [number, number][] = [];
		for (let lat = -90; lat <= 90; lat += 2) {
			const tanDec = Math.tan((declination * Math.PI) / 180);
			const tanLat = Math.tan((lat * Math.PI) / 180);
			let lon = -hourAngle + (Math.acos(-tanDec * tanLat) * 180) / Math.PI;
			if (isNaN(lon)) lon = lat * declination > 0 ? -hourAngle + 180 : -hourAngle;
			terminatorPoints.push([lon, lat]);
		}
		for (let lat = 90; lat >= -90; lat -= 2) {
			const tanDec = Math.tan((declination * Math.PI) / 180);
			const tanLat = Math.tan((lat * Math.PI) / 180);
			let lon = -hourAngle - (Math.acos(-tanDec * tanLat) * 180) / Math.PI;
			if (isNaN(lon)) lon = lat * declination > 0 ? -hourAngle - 180 : -hourAngle;
			terminatorPoints.push([lon, lat]);
		}
		return terminatorPoints;
	}

	// Show tooltip using state (safe rendering)
	function showTooltip(
		event: MouseEvent,
		title: string,
		color: string,
		lines: string[] = []
	): void {
		if (!mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		tooltipContent = { title, color, lines };
		tooltipPosition = {
			left: event.clientX - rect.left + 15,
			top: event.clientY - rect.top - 10
		};
		tooltipVisible = true;
	}

	// Move tooltip
	function moveTooltip(event: MouseEvent): void {
		if (!mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		tooltipPosition = {
			left: event.clientX - rect.left + 15,
			top: event.clientY - rect.top - 10
		};
	}

	// Hide tooltip
	function hideTooltip(): void {
		tooltipVisible = false;
		tooltipContent = null;
	}

	// Build enhanced tooltip with weather
	async function showEnhancedTooltip(
		event: MouseEvent,
		_name: string,
		lat: number,
		lon: number,
		desc: string,
		color: string
	): Promise<void> {
		const localTime = getLocalTime(lon);
		const lines = [`🕐 Local: ${localTime}`];
		showTooltip(event, desc, color, lines);

		// Fetch weather asynchronously
		const weather = await getWeather(lat, lon);
		if (weather && tooltipVisible) {
			tooltipContent = {
				title: desc,
				color,
				lines: [
					`🕐 Local: ${localTime}`,
					`${weather.condition} ${weather.temp}°F, ${weather.wind}mph`
				]
			};
		}
	}

	// Initialize map
	async function initMap(): Promise<void> {
		const d3 = await import('d3');
		d3Module = d3;
		const topojson = await import('topojson-client');

		const svgEl = mapContainer.querySelector('svg');
		if (!svgEl) return;

		svg = d3.select(svgEl);
		svg.attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

		mapGroup = svg.append('g').attr('id', 'mapGroup');

		// Setup zoom - disable scroll wheel, allow touch pinch and buttons
		zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([1, 6])
			.filter((event) => {
				// Block scroll wheel zoom (wheel events)
				if (event.type === 'wheel') return false;
				// Allow touch events (pinch zoom on mobile)
				if (event.type.startsWith('touch')) return true;
				// Allow mouse drag for panning
				if (event.type === 'mousedown' || event.type === 'mousemove') return true;
				// Block double-click zoom
				if (event.type === 'dblclick') return false;
				// Allow other events (programmatic zoom from buttons)
				return true;
			})
			.on('zoom', (event) => {
				mapGroup.attr('transform', event.transform.toString());
				const k = event.transform.k;
				// Helper for leader line path
				const getLeaderPath = (x: number, y: number, k: number, pos: string = 'bottom-right') => {
					// Base segments for 5px horiz, 5px diag, 5px horiz
					const seg1 = 5 / k;
					const diagX = 5 / k;
					const diagY = 8 / k;
					const seg2 = 5 / k;
					const offX = 5 / k; // gap from icon (reduced)

					// 1 = x direction (1 right, -1 left)
					// 2 = y direction (1 down, -1 up)
					const dirX = pos.includes('left') ? -1 : 1;
					const dirY = pos.includes('top') ? -1 : 1;

					// Start point: x + (offX * dirX), y
					const x1 = x + (offX * dirX);
					const y1 = y;
					
					// Seg 1: horizontal
					const x2 = x1 + (seg1 * dirX);
					const y2 = y1;
					
					// Seg 2: diagonal
					const x3 = x2 + (diagX * dirX);
					const y3 = y2 + (diagY * dirY);
					
					// Seg 3: horizontal
					const x4 = x3 + (seg2 * dirX);
					const y4 = y3;

					return `M${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4}`;
				};

				// Helper for text alignment
				const getTextPos = (x: number, y: number, k: number, pos: string = 'bottom-right') => {
					// Total X offset = 5 + 5 + 5 + 5 + 2 = 22
					const totalX = 22 / k;
					// Total Y offset = 8 + 3 = 11 (approx)
					// The diagonal drop is 8. The font offset (alignment baseline) needs tuning.
					// If 'top', we are above y.
					const totalY = 11 / k;

					const dirX = pos.includes('left') ? -1 : 1;
					const dirY = pos.includes('top') ? -1 : 1;

					return {
						x: x + (totalX * dirX), 
						y: y + ((pos.includes('top') ? 8/k : totalY) * dirY), // slightly different vertical alignment for top vs bottom
						anchor: pos.includes('left') ? 'end' : 'start'
					};
				};
				
				// Scale text and lines
				mapGroup.selectAll('.leader-line')
					.attr('d', (d: any) => getLeaderPath(d.x, d.y, k, d.pos))
					.attr('stroke-width', 0.5 / k);

				mapGroup.selectAll('.text-ocean').attr('font-size', `${10 / k}px`);
				
				// Update text positions dynamic to quadrant
				[
					'.text-chokepoint', 
					'.text-hotspot', 
					'text.monitor-marker',
					'.text-military-base' // Include military base text if we add it
				].forEach(selector => {
					mapGroup.selectAll(selector)
						.attr('font-size', (d: any) => d?.fontSize ? `${d.fontSize/k}px` : `${8/k}px`)
						.each(function(d: any) {
							if (!d) return;
							const pos = getTextPos(d.x, d.y, k, d.pos);
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							(d3Module as any).select(this)
								.attr('x', pos.x)
								.attr('y', pos.y)
								.attr('text-anchor', pos.anchor);
						});
				});
				
				// Scale icons/markers
				mapGroup.selectAll('.icon-chokepoint-rect').attr('width', 8 / k).attr('height', 8 / k).attr('x', (d: any) => d.x - 4/k).attr('y', (d: any) => d.y - 4/k);
				mapGroup.selectAll('.icon-cable-landing').attr('r', 3 / k).attr('stroke-width', 1.5 / k);
				mapGroup.selectAll('.icon-nuclear-site').attr('r', 2 / k);
				mapGroup.selectAll('.icon-nuclear-ring').attr('r', 5 / k).attr('stroke-width', 1 / k);
				mapGroup.selectAll('.icon-hotspot-pulse').attr('r', 6 / k); 
				mapGroup.selectAll('.icon-hotspot-inner').attr('r', 3 / k);
				mapGroup.selectAll('.icon-monitor-marker').attr('r', 5 / k).attr('stroke-width', 2 / k);
				mapGroup.selectAll('.icon-military-base').attr('transform', (d: any) => `translate(${d.x},${d.y}) scale(${1/k})`);
				
				// Scale country borders
				mapGroup.selectAll('path.country').attr('stroke-width', 0.5 / k);
			});

		enableZoom();

		// Setup projection
		projection = d3
			.geoEquirectangular()
			.scale(130)
			.center([0, 20])
			.translate([WIDTH / 2, HEIGHT / 2 - 30]);

		path = d3.geoPath().projection(projection);

		// Load world data
		try {
			const response = await fetch(
				'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
			);
			const world = await response.json();
			const countries = topojson.feature(
				world,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				world.objects.countries as any
			) as unknown as GeoJSON.FeatureCollection;

			// Draw countries
			mapGroup
				.selectAll('path.country')
				.data(countries.features)
				.enter()
				.append('path')
				.attr('class', 'country')
				.attr('d', path as unknown as string)
				.attr('fill', (d: GeoJSON.Feature) =>
					SANCTIONED_COUNTRY_IDS.includes(+(d.id || 0)) ? '#2a1a1a' : '#0f3028'
				)
				.attr('stroke', (d: GeoJSON.Feature) =>
					SANCTIONED_COUNTRY_IDS.includes(+(d.id || 0)) ? '#4a2020' : '#1a5040'
				)
				.attr('stroke-width', 0.5);

			// Draw graticule
			const graticule = d3.geoGraticule().step([30, 30]);
			mapGroup
				.append('path')
				.datum(graticule)
				.attr('d', path as unknown as string)
				.attr('fill', 'none')
				.attr('stroke', '#1a3830')
				.attr('stroke-width', 0.3)
				.attr('stroke-dasharray', '2,2');

			// Draw ocean labels
			OCEANS.forEach((o) => {
				const [x, y] = projection([o.lon, o.lat]) || [0, 0];
				if (x && y) {
					mapGroup
						.append('text')
						.attr('x', x)
						.attr('y', y)
						.attr('fill', '#1a4a40')
						.attr('class', 'text-ocean')
						.attr('font-size', '10px')
						.attr('font-family', 'monospace')
						.attr('text-anchor', 'middle')
						.attr('opacity', 0.6)
						.text(o.name);
				}
			});

			// Draw day/night terminator
			const terminatorPoints = calculateTerminator();
			mapGroup
				.append('path')
				.datum({ type: 'Polygon', coordinates: [terminatorPoints] } as GeoJSON.Polygon)
				.attr('d', path as unknown as string)
				.attr('fill', 'rgba(0,0,0,0.3)')
				.attr('stroke', 'none');

			// Draw conflict zones
			CONFLICT_ZONES.forEach((zone) => {
				mapGroup
					.append('path')
					.datum({ type: 'Polygon', coordinates: [zone.coords] } as GeoJSON.Polygon)
					.attr('d', path as unknown as string)
					.attr('fill', zone.color)
					.attr('fill-opacity', 0.15)
					.attr('stroke', zone.color)
					.attr('stroke-width', 0.5)
					.attr('stroke-opacity', 0.4);
			});

			// Draw chokepoints
			CHOKEPOINTS.forEach((cp) => {
				const [x, y] = projection([cp.lon, cp.lat]) || [0, 0];
				if (x && y) {
					mapGroup
						.append('rect')
						.attr('class', 'icon-chokepoint-rect')
						.datum({x, y}) // Store original position for recounting x/y on zoom
						.attr('x', x - 4)
						.attr('y', y - 4)
						.attr('width', 8)
						.attr('height', 8)
						.attr('fill', '#00aaff')
						.attr('opacity', 0.8)
						.attr('transform', `rotate(45,${x},${y})`);
					// Leader line
					const pos = cp.labelPosition || 'bottom-right';
					mapGroup
						.append('path')
						.datum({x, y, pos}) // Bind pos
						.attr('class', 'leader-line')
						.attr('stroke', '#00aaff')
						.attr('fill', 'none')
						.attr('stroke-width', 0.5)
						.attr('opacity', 0.6)
						.attr('d', `M${x + 8},${y} L${x + 18},${y} L${x + 23},${y + 8} L${x + 28},${y + 8}`); // Initial draw will be fixed by first zoom event or we could calc here.
						// Note: The periodic zoom handler will snap this to correct D immediately.

					mapGroup
						.append('text')
						.datum({x, y, pos, fontSize: 7})
						.attr('x', x + 30) 
						.attr('y', y + 11)
						.attr('fill', '#00aaff')
						.attr('class', 'text-chokepoint')
						.attr('font-size', '7px')
						.attr('font-family', 'monospace')
						.text(cp.name);
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 10)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, `⬥ ${cp.desc}`, '#00aaff'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw cable landings
			CABLE_LANDINGS.forEach((cl) => {
				const [x, y] = projection([cl.lon, cl.lat]) || [0, 0];
				if (x && y) {
					mapGroup
						.append('circle')
						.attr('class', 'icon-cable-landing')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 3)
						.attr('fill', 'none')
						.attr('stroke', '#aa44ff')
						.attr('stroke-width', 1.5);
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 10)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, `◎ ${cl.desc}`, '#aa44ff'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw nuclear sites
			NUCLEAR_SITES.forEach((ns) => {
				const [x, y] = projection([ns.lon, ns.lat]) || [0, 0];
				if (x && y) {
					mapGroup
						.append('circle')
						.attr('class', 'icon-nuclear-site')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 2)
						.attr('fill', '#ffff00');
					mapGroup
						.append('circle')
						.attr('class', 'icon-nuclear-ring')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 5)
						.attr('fill', 'none')
						.attr('stroke', '#ffff00')
						.attr('stroke-width', 1)
						.attr('stroke-dasharray', '3,3');
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 10)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, `☢ ${ns.desc}`, '#ffff00'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw military bases
			MILITARY_BASES.forEach((mb) => {
				const [x, y] = projection([mb.lon, mb.lat]) || [0, 0];
				if (x && y) {
					mapGroup.append('path')
						.datum({x, y})
						.attr('d', STAR_PATH_D)
						.attr('class', 'icon-military-base')
						.attr('transform', `translate(${x},${y})`)
						.attr('fill', '#ff00ff')
						.attr('opacity', 0.8);
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 10)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, `★ ${mb.desc}`, '#ff00ff'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw hotspots
			HOTSPOTS.forEach((h) => {
				const [x, y] = projection([h.lon, h.lat]) || [0, 0];
				if (x && y) {
					const color = THREAT_COLORS[h.level];
					// Pulsing circle
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 6)
						.attr('fill', color)
						.attr('fill-opacity', 0.3)
						.attr('class', 'pulse icon-hotspot-pulse');
					// Inner dot
					mapGroup.append('circle')
						.attr('class', 'icon-hotspot-inner')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 3)
						.attr('fill', color);
					// Leader line
					const pos = h.labelPosition || 'bottom-right';
					mapGroup
						.append('path')
						.datum({x, y, pos})
						.attr('class', 'leader-line')
						.attr('stroke', color)
						.attr('fill', 'none')
						.attr('stroke-width', 0.5)
						.attr('opacity', 0.6)
						.attr('d', 'M0,0'); // Let zoom handler calc

					// Label
					mapGroup
						.append('text')
						.datum({x, y, pos, fontSize: 8})
						.attr('x', 0)
						.attr('y', 0)
						.attr('fill', color)
						.attr('class', 'text-hotspot')
						.attr('font-size', '8px')
						.attr('font-family', 'monospace')
						.text(h.name);
					// Hit area
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 12)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) =>
							showEnhancedTooltip(event, h.name, h.lat, h.lon, h.desc, color)
						)
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw custom monitors with locations
			drawMonitors();
		} catch (err) {
			console.error('Failed to load map data:', err);
		}
	}

	// Draw custom monitor locations
	function drawMonitors(): void {
		if (!mapGroup || !projection || !d3Module || !svg) return;

		const t = d3Module.zoomTransform(svg.node());
		const k = t.k || 1;

		// Remove existing monitor markers
		mapGroup.selectAll('.monitor-marker').remove();

		monitors
			.filter((m) => m.enabled && m.location)
			.forEach((m) => {
				if (!m.location) return;
				const [x, y] = projection([m.location.lon, m.location.lat]) || [0, 0];
				if (x && y) {
					const color = m.color || '#00ffff';
					mapGroup
						.append('circle')
						.attr('class', 'monitor-marker icon-monitor-marker')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 5 / k)
						.attr('fill', color)
						.attr('fill-opacity', 0.6)
						.attr('stroke', color)
						.attr('stroke-width', 2 / k);
					const pos = m.labelPosition || 'bottom-right';
					mapGroup
						.append('path')
						.datum({x, y, pos})
						.attr('class', 'leader-line')
						.attr('stroke', color)
						.attr('fill', 'none')
						.attr('stroke-width', 0.5 / k)
						.attr('opacity', 0.6)
						.attr('d', 'M0,0');

					mapGroup
						.append('text')
						.datum({x, y, pos, fontSize: 8})
						.attr('class', 'monitor-marker')
						.attr('x', 0)
						.attr('y', 0)
						.attr('fill', color)
						.attr('font-size', `${8 / k}px`)
						.attr('font-family', 'monospace')
						.text(m.name);
					mapGroup
						.append('circle')
						.attr('class', 'monitor-marker')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 10)
						.attr('fill', 'transparent')
						.on('mouseenter', (event: MouseEvent) =>
							showTooltip(event, `📡 ${m.name}`, color, [
								m.location?.name || '',
								m.keywords.join(', ')
							])
						)
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});
	}

	// Zoom controls
	function zoomIn(): void {
		if (!svg || !zoom) return;
		svg.transition().duration(300).call(zoom.scaleBy, 1.5);
	}

	function zoomOut(): void {
		if (!svg || !zoom) return;
		svg
			.transition()
			.duration(300)
			.call(zoom.scaleBy, 1 / 1.5);
	}

	function resetZoom(): void {
		if (!svg || !zoom || !d3Module) return;
		svg.transition().duration(300).call(zoom.transform, d3Module.zoomIdentity);
	}

	// Reactively update monitors when they change
	$effect(() => {
		// Track monitors changes
		const _monitorsRef = monitors;
		if (_monitorsRef && mapGroup && projection) {
			drawMonitors();
		}
	});

	onMount(() => {
		initMap();
	});
</script>

<Panel id="map" title="Global Situation" {loading} {error}>
	<div class="map-container" bind:this={mapContainer}>
		<svg class="map-svg"></svg>
		{#if tooltipVisible && tooltipContent}
			<div
				class="map-tooltip"
				style="left: {tooltipPosition.left}px; top: {tooltipPosition.top}px;"
			>
				<strong style="color: {tooltipContent.color}">{tooltipContent.title}</strong>
				{#each tooltipContent.lines as line}
					<br /><span class="tooltip-line">{line}</span>
				{/each}
			</div>
		{/if}
		<div class="zoom-controls">
			<button class="zoom-btn" onclick={zoomIn} title="Zoom in">+</button>
			<button class="zoom-btn" onclick={zoomOut} title="Zoom out">−</button>
			<button class="zoom-btn" onclick={resetZoom} title="Reset">⟲</button>
		</div>
		<div class="map-legend">
			<div class="legend-item">
				<span class="legend-dot high"></span> High
			</div>
			<div class="legend-item">
				<span class="legend-dot elevated"></span> Elevated
			</div>
			<div class="legend-item">
				<span class="legend-dot low"></span> Low
			</div>
		</div>
	</div>
</Panel>

<style>
	.map-container {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 1;
		background: #0a0f0d;
		border-radius: 4px;
		overflow: hidden;
	}

	.map-svg {
		width: 100%;
		height: 100%;
	}

	.map-tooltip {
		position: absolute;
		background: rgba(10, 10, 10, 0.95);
		border: 1px solid #333;
		border-radius: 4px;
		padding: 0.5rem;
		font-size: 0.65rem;
		color: #ddd;
		max-width: 250px;
		pointer-events: none;
		z-index: 100;
	}

	.tooltip-line {
		opacity: 0.7;
	}

	.zoom-controls {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.zoom-btn {
		width: 2.75rem;
		height: 2.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(20, 20, 20, 0.9);
		border: 1px solid #333;
		border-radius: 4px;
		color: #aaa;
		font-size: 1rem;
		cursor: pointer;
	}

	.zoom-btn:hover {
		background: rgba(40, 40, 40, 0.9);
		color: #fff;
	}

	.map-legend {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		background: rgba(10, 10, 10, 0.8);
		padding: 0.3rem 0.5rem;
		border-radius: 4px;
		font-size: 0.55rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		color: #888;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.legend-dot.high {
		background: #ff4444;
	}

	.legend-dot.elevated {
		background: #ffcc00;
	}

	.legend-dot.low {
		background: #00ff88;
	}

	/* Pulse animation for hotspots */
	:global(.pulse) {
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			r: 6;
			opacity: 0.3;
		}
		50% {
			r: 10;
			opacity: 0.1;
		}
	}

	:global(.hotspot-hit) {
		cursor: pointer;
	}

	/* Hide zoom controls on mobile where touch zoom is available */
	@media (max-width: 768px) {
		.zoom-controls {
			display: flex;
		}
	}
</style>
