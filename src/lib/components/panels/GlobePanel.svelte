<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		HOTSPOTS,
		CHOKEPOINTS,
		CABLE_LANDINGS,
		NUCLEAR_SITES,
		MILITARY_BASES,
		THREAT_COLORS
	} from '$lib/config/map';
	import type { CustomMonitor } from '$lib/types';

	interface Props {
		monitors?: CustomMonitor[];
	}

	let { monitors = [] }: Props = $props();

	let globeContainer: HTMLDivElement;
	let globe: any = null;
	let resizeObserver: ResizeObserver | null = null;
	let isInitialized = $state(false);
	let initError = $state<string | null>(null);
	let showArcs = $state(true);
	let isHovering = $state(false);
	let legendExpanded = $state(false);

	// Tooltip state
	let tooltipVisible = $state(false);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipData = $state<{
		label: string;
		type: string;
		desc?: string;
		level?: string;
	} | null>(null);

	// Point data interface for tooltip
	interface PointData {
		lat: number;
		lng: number;
		size: number;
		color: string;
		label: string;
		type: string;
		desc?: string;
		level?: string;
	}

	// Get points data
	function getPointsData(): PointData[] {
		const points: PointData[] = [];

		// Add hotspots
		HOTSPOTS.forEach((h) => {
			points.push({
				lat: h.lat,
				lng: h.lon,
				size: h.level === 'critical' ? 0.8 : h.level === 'high' ? 0.6 : 0.4,
				color: THREAT_COLORS[h.level],
				label: h.name,
				type: 'hotspot',
				desc: h.desc,
				level: h.level
			});
		});

		// Add chokepoints
		CHOKEPOINTS.forEach((cp) => {
			points.push({
				lat: cp.lat,
				lng: cp.lon,
				size: 0.3,
				color: '#00aaff',
				label: cp.name,
				type: 'chokepoint',
				desc: cp.desc
			});
		});

		// Add cable landings
		CABLE_LANDINGS.forEach((cl) => {
			points.push({
				lat: cl.lat,
				lng: cl.lon,
				size: 0.25,
				color: '#aa44ff',
				label: cl.name,
				type: 'cable',
				desc: cl.desc
			});
		});

		// Add nuclear sites
		NUCLEAR_SITES.forEach((ns) => {
			points.push({
				lat: ns.lat,
				lng: ns.lon,
				size: 0.35,
				color: '#ffff00',
				label: ns.name,
				type: 'nuclear',
				desc: ns.desc
			});
		});

		// Add military bases
		MILITARY_BASES.forEach((mb) => {
			points.push({
				lat: mb.lat,
				lng: mb.lon,
				size: 0.4,
				color: '#ff00ff',
				label: mb.name,
				type: 'military',
				desc: mb.desc
			});
		});

		// Add custom monitors
		monitors
			.filter((m) => m.enabled && m.location)
			.forEach((m) => {
				if (m.location) {
					points.push({
						lat: m.location.lat,
						lng: m.location.lon,
						size: 0.5,
						color: m.color || '#00ffff',
						label: m.name,
						type: 'monitor',
						desc: `Custom monitor: ${m.keywords?.join(', ') || 'No keywords'}`
					});
				}
			});

		return points;
	}

	// Get arc data for conflict zones / connections - showing intel flow between high-threat areas
	function getArcsData() {
		if (!showArcs) return [];

		const arcs: Array<{
			startLat: number;
			startLng: number;
			endLat: number;
			endLng: number;
			color: string;
		}> = [];

		// Create meaningful arcs between geopolitically connected hotspots
		// These represent intel/influence corridors between high-threat areas
		const arcConnections = [
			// Russia-Ukraine corridor
			{ from: 'Moscow', to: 'Kyiv', color: 'rgba(239, 68, 68, 0.4)' },
			// Middle East tensions
			{ from: 'Tehran', to: 'Tel Aviv', color: 'rgba(239, 68, 68, 0.5)' },
			// Taiwan Strait tensions
			{ from: 'Beijing', to: 'Taipei', color: 'rgba(251, 191, 36, 0.4)' },
			// North Korea threat
			{ from: 'Pyongyang', to: 'Tokyo', color: 'rgba(251, 191, 36, 0.4)' },
		];

		const hotspotMap = new Map(HOTSPOTS.map(h => [h.name, h]));

		arcConnections.forEach(conn => {
			const from = hotspotMap.get(conn.from);
			const to = hotspotMap.get(conn.to);
			if (from && to) {
				arcs.push({
					startLat: from.lat,
					startLng: from.lon,
					endLat: to.lat,
					endLng: to.lon,
					color: conn.color
				});
			}
		});

		return arcs;
	}

	// Get rings data for pulsing effect
	function getRingsData() {
		return HOTSPOTS.filter((h) => h.level === 'critical').map((h) => ({
			lat: h.lat,
			lng: h.lon,
			maxR: 3,
			propagationSpeed: 2,
			repeatPeriod: 1000,
			color: THREAT_COLORS[h.level]
		}));
	}

	// Get labels data
	function getLabelsData() {
		return HOTSPOTS.filter((h) => h.level === 'critical' || h.level === 'high').map((h) => ({
			lat: h.lat,
			lng: h.lon,
			text: h.name,
			color: THREAT_COLORS[h.level],
			size: 0.8
		}));
	}

	// Handle point hover for tooltip - pauses rotation for better interaction
	function handlePointHover(point: PointData | null, _prevPoint: PointData | null) {
		if (point) {
			tooltipData = {
				label: point.label,
				type: point.type,
				desc: point.desc,
				level: point.level
			};
			tooltipVisible = true;
			isHovering = true;
			// Pause auto-rotation when hovering over a point
			pauseRotation();
		} else {
			tooltipVisible = false;
			isHovering = false;
			// Resume rotation after a short delay
			setTimeout(() => {
				if (!isHovering) resumeRotation();
			}, 500);
		}
	}

	// Handle point click - locks the tooltip and pauses rotation
	function handlePointClick(point: PointData | null) {
		if (point) {
			tooltipData = {
				label: point.label,
				type: point.type,
				desc: point.desc,
				level: point.level
			};
			tooltipVisible = true;
			// Keep rotation paused on click
			pauseRotation();
		}
	}

	// Pause globe auto-rotation
	function pauseRotation() {
		if (globe) {
			const controls = globe.controls();
			if (controls) {
				controls.autoRotate = false;
			}
		}
	}

	// Resume globe auto-rotation
	function resumeRotation() {
		if (globe) {
			const controls = globe.controls();
			if (controls) {
				controls.autoRotate = true;
			}
		}
	}

	// Handle container mouse enter/leave for rotation control
	function handleContainerEnter() {
		// Slow down rotation when mouse enters
		if (globe) {
			const controls = globe.controls();
			if (controls) {
				controls.autoRotateSpeed = 0.1;
			}
		}
	}

	function handleContainerLeave() {
		// Resume normal rotation when mouse leaves
		if (globe) {
			const controls = globe.controls();
			if (controls) {
				controls.autoRotate = true;
				controls.autoRotateSpeed = 0.3;
			}
		}
		tooltipVisible = false;
		isHovering = false;
	}

	// Toggle arcs visibility
	function toggleArcs() {
		showArcs = !showArcs;
		if (globe && isInitialized) {
			globe.arcsData(getArcsData());
		}
	}

	// Handle mouse move to position tooltip
	function handleMouseMove(event: MouseEvent) {
		if (tooltipVisible && globeContainer) {
			const rect = globeContainer.getBoundingClientRect();
			tooltipX = event.clientX - rect.left + 15;
			tooltipY = event.clientY - rect.top + 15;

			// Prevent tooltip from going off-screen
			const tooltipWidth = 280;
			const tooltipHeight = 100;
			if (tooltipX + tooltipWidth > rect.width) {
				tooltipX = event.clientX - rect.left - tooltipWidth - 15;
			}
			if (tooltipY + tooltipHeight > rect.height) {
				tooltipY = event.clientY - rect.top - tooltipHeight - 15;
			}
		}
	}

	// Get type label for display
	function getTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			hotspot: 'GEOPOLITICAL HOTSPOT',
			chokepoint: 'SHIPPING CHOKEPOINT',
			cable: 'UNDERSEA CABLE',
			nuclear: 'NUCLEAR SITE',
			military: 'MILITARY BASE',
			monitor: 'CUSTOM MONITOR'
		};
		return labels[type] || type.toUpperCase();
	}

	async function initGlobe() {
		if (typeof window === 'undefined' || !globeContainer) return;

		// Wait for container to have dimensions
		const width = globeContainer.clientWidth;
		const height = globeContainer.clientHeight;

		if (width === 0 || height === 0) {
			// Container not ready, wait and retry
			await new Promise((resolve) => setTimeout(resolve, 100));
			return initGlobe();
		}

		try {
			const GlobeModule = await import('globe.gl');
			const Globe = GlobeModule.default;

			// Create globe instance with explicit dimensions and high-quality rendering
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			globe = (Globe as any)()
				.width(width)
				.height(height)
				.backgroundColor('rgba(2, 3, 5, 1)')
				// High quality night earth texture with city lights
				.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
				.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
				// Enhanced atmosphere for better visual appeal
				.showAtmosphere(true)
				.atmosphereColor('rgba(6, 182, 212, 0.35)')
				.atmosphereAltitude(0.15)
				// Show subtle graticules (lat/lon grid)
				.showGraticules(true)
				// Points - improved visibility and size
				.pointsData(getPointsData())
				.pointAltitude((d: PointData) => d.size * 0.03)
				.pointColor('color')
				.pointRadius(0.5)
				.pointsMerge(false)
				.pointResolution(12)
				// Point interaction - hover and click
				.onPointHover(handlePointHover)
				.onPointClick(handlePointClick)
				// Labels - only show for critical/high to reduce clutter
				.labelsData(getLabelsData())
				.labelText('text')
				.labelSize('size')
				.labelColor('color')
				.labelDotRadius(0.4)
				.labelAltitude(0.015)
				.labelResolution(3)
				// Arcs - tension corridors between hotspots (more subtle)
				.arcsData(getArcsData())
				.arcColor('color')
				.arcDashLength(0.5)
				.arcDashGap(0.25)
				.arcDashAnimateTime(2500)
				.arcStroke(0.4)
				.arcAltitude(0.12)
				.arcAltitudeAutoScale(0.25)
				// Rings - pulsing effect on critical hotspots
				.ringsData(getRingsData())
				.ringColor('color')
				.ringMaxRadius('maxR')
				.ringPropagationSpeed('propagationSpeed')
				.ringRepeatPeriod('repeatPeriod');

			// Mount to container
			globe(globeContainer);

			// Set initial view after mounting - show a good overview
			globe.pointOfView({ lat: 25, lng: 10, altitude: 2.2 });

			// Enhance WebGL renderer settings for better quality
			const renderer = globe.renderer();
			if (renderer) {
				renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
				renderer.antialias = true;
			}

			// Enhance the scene lighting for better visual quality
			const scene = globe.scene();
			if (scene) {
				// The globe.gl library sets up lighting, we can enhance it
				scene.traverse((obj: any) => {
					if (obj.type === 'AmbientLight') {
						obj.intensity = 0.8;
					}
					if (obj.type === 'DirectionalLight') {
						obj.intensity = 0.6;
					}
				});
			}

			// Enable auto-rotation with slower speed for better interaction
			const controls = globe.controls();
			if (controls) {
				controls.autoRotate = true;
				controls.autoRotateSpeed = 0.15; // Even slower default rotation for better UX
				controls.enableZoom = true;
				controls.minDistance = 101;
				controls.maxDistance = 400;
				controls.enableDamping = true;
				controls.dampingFactor = 0.08;
				controls.rotateSpeed = 0.8;
				controls.zoomSpeed = 0.8;
			}

			isInitialized = true;
		} catch (error) {
			console.error('Failed to initialize globe:', error);
			initError = 'Failed to load 3D globe. WebGL may not be supported.';
		}
	}

	function handleResize(entries: ResizeObserverEntry[]) {
		if (!globe || !isInitialized) return;

		for (const entry of entries) {
			const { width, height } = entry.contentRect;
			if (width > 0 && height > 0) {
				globe.width(width).height(height);
			}
		}
	}

	// Update globe data when monitors change
	$effect(() => {
		if (globe && isInitialized) {
			globe.pointsData(getPointsData());
		}
	});

	onMount(() => {
		// Use ResizeObserver for better dimension tracking
		resizeObserver = new ResizeObserver(handleResize);
		resizeObserver.observe(globeContainer);

		// Initialize globe with a small delay to ensure container has dimensions
		requestAnimationFrame(() => {
			initGlobe();
		});
	});

	onDestroy(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
		if (globe) {
			globe._destructor?.();
		}
	});
</script>

<div
	class="globe-container"
	bind:this={globeContainer}
	onmousemove={handleMouseMove}
	onmouseenter={handleContainerEnter}
	onmouseleave={handleContainerLeave}
	role="application"
	aria-label="Interactive 3D globe showing global hotspots and regions"
>
	{#if !isInitialized && !initError}
		<div class="globe-loading">
			<div class="loading-spinner"></div>
			<span class="loading-text">INITIALIZING GLOBE</span>
		</div>
	{/if}
	{#if initError}
		<div class="globe-error">
			<span class="error-icon">⚠</span>
			<span class="error-text">{initError}</span>
		</div>
	{/if}

	<!-- Globe Controls -->
	{#if isInitialized}
		<div class="globe-controls">
			<button
				class="control-btn"
				class:active={showArcs}
				onclick={toggleArcs}
				title={showArcs ? 'Hide tension corridors' : 'Show tension corridors'}
			>
				<span class="control-icon">⌇</span>
			</button>
			<button
				class="control-btn"
				onclick={() => resumeRotation()}
				title="Resume rotation"
			>
				<span class="control-icon">↻</span>
			</button>
			<button
				class="control-btn"
				onclick={() => pauseRotation()}
				title="Pause rotation"
			>
				<span class="control-icon">⏸</span>
			</button>
		</div>
	{/if}

	<!-- Globe Legend -->
	{#if isInitialized}
		<div class="globe-legend" class:expanded={legendExpanded}>
			<button class="legend-toggle" onclick={() => legendExpanded = !legendExpanded}>
				<span class="legend-toggle-text">LEGEND</span>
				<span class="legend-toggle-icon">{legendExpanded ? '▼' : '▲'}</span>
			</button>
			{#if legendExpanded}
				<div class="legend-content">
					<div class="legend-section">
						<span class="legend-section-title">THREAT LEVELS</span>
						<div class="legend-items">
							<div class="legend-item">
								<span class="legend-dot critical"></span>
								<span class="legend-label">Critical</span>
							</div>
							<div class="legend-item">
								<span class="legend-dot high"></span>
								<span class="legend-label">High</span>
							</div>
							<div class="legend-item">
								<span class="legend-dot elevated"></span>
								<span class="legend-label">Elevated</span>
							</div>
							<div class="legend-item">
								<span class="legend-dot low"></span>
								<span class="legend-label">Low</span>
							</div>
						</div>
					</div>
					<div class="legend-section">
						<span class="legend-section-title">MARKERS</span>
						<div class="legend-items">
							<div class="legend-item">
								<span class="legend-marker chokepoint"></span>
								<span class="legend-label">Chokepoint</span>
							</div>
							<div class="legend-item">
								<span class="legend-marker cable"></span>
								<span class="legend-label">Cable Landing</span>
							</div>
							<div class="legend-item">
								<span class="legend-marker nuclear"></span>
								<span class="legend-label">Nuclear Site</span>
							</div>
							<div class="legend-item">
								<span class="legend-marker military"></span>
								<span class="legend-label">Military Base</span>
							</div>
						</div>
					</div>
					<div class="legend-section">
						<span class="legend-section-title">FEATURES</span>
						<div class="legend-items">
							<div class="legend-item">
								<span class="legend-arc"></span>
								<span class="legend-label">Tension Corridor</span>
							</div>
							<div class="legend-item">
								<span class="legend-ring"></span>
								<span class="legend-label">Critical Alert Ring</span>
							</div>
						</div>
					</div>
					<div class="legend-hint">
						Hover over markers for details. Click to lock tooltip. Drag to rotate.
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Interactive Tooltip -->
	{#if tooltipVisible && tooltipData}
		<div
			class="globe-tooltip"
			style="left: {tooltipX}px; top: {tooltipY}px;"
		>
			<div class="tooltip-header">
				<span class="tooltip-type" class:critical={tooltipData.level === 'critical'} class:high={tooltipData.level === 'high'} class:elevated={tooltipData.level === 'elevated'}>
					{getTypeLabel(tooltipData.type)}
				</span>
				{#if tooltipData.level}
					<span class="tooltip-level" class:critical={tooltipData.level === 'critical'} class:high={tooltipData.level === 'high'} class:elevated={tooltipData.level === 'elevated'}>
						{tooltipData.level.toUpperCase()}
					</span>
				{/if}
			</div>
			<div class="tooltip-name">{tooltipData.label}</div>
			{#if tooltipData.desc}
				<div class="tooltip-desc">{tooltipData.desc}</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.globe-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
		position: relative;
		background: radial-gradient(ellipse at center, #0a0f1a 0%, #020305 70%);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 2px;
	}

	/* Subtle vignette effect */
	.globe-container::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.4) 100%);
		z-index: 1;
	}

	.globe-container :global(canvas) {
		cursor: grab;
		position: absolute;
		top: 0;
		left: 0;
	}

	.globe-container :global(canvas:active) {
		cursor: grabbing;
	}

	.globe-loading,
	.globe-error {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		z-index: 5;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 2px solid rgb(51 65 85);
		border-top-color: rgb(34 211 238);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text,
	.error-text {
		font-size: 0.625rem;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		letter-spacing: 0.15em;
		color: rgb(148 163 184);
		text-transform: uppercase;
	}

	.error-icon {
		font-size: 2rem;
		color: rgb(251 191 36);
	}

	.error-text {
		color: rgb(251 191 36);
		max-width: 200px;
		text-align: center;
	}

	/* Globe Tooltip Styles - following Aegis design system */
	.globe-tooltip {
		position: absolute;
		z-index: 100;
		background: rgb(15 23 42 / 0.95);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgb(51 65 85 / 0.5);
		border-radius: 2px;
		padding: 0.75rem;
		max-width: 280px;
		min-width: 180px;
		pointer-events: none;
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
	}

	/* Tech corners for tooltip */
	.globe-tooltip::before,
	.globe-tooltip::after {
		content: '';
		position: absolute;
		width: 6px;
		height: 6px;
		pointer-events: none;
	}

	.globe-tooltip::before {
		top: 0;
		left: 0;
		border-top: 2px solid rgb(6 182 212 / 0.5);
		border-left: 2px solid rgb(6 182 212 / 0.5);
	}

	.globe-tooltip::after {
		top: 0;
		right: 0;
		border-top: 2px solid rgb(6 182 212 / 0.5);
		border-right: 2px solid rgb(6 182 212 / 0.5);
	}

	.tooltip-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.375rem;
	}

	.tooltip-type {
		font-size: 0.5625rem; /* 9px - text-nano */
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		letter-spacing: 0.1em;
		color: rgb(148 163 184); /* slate-400 */
		text-transform: uppercase;
	}

	.tooltip-type.critical {
		color: rgb(239 68 68); /* red-500 */
	}

	.tooltip-type.high {
		color: rgb(251 191 36); /* amber-400 */
	}

	.tooltip-type.elevated {
		color: rgb(34 211 238); /* cyan-400 */
	}

	.tooltip-level {
		font-size: 0.5625rem; /* 9px */
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.375rem;
		border-radius: 2px;
		text-transform: uppercase;
		background: rgb(100 116 139 / 0.2);
		color: rgb(148 163 184);
		border: 1px solid rgb(71 85 105 / 0.5);
	}

	.tooltip-level.critical {
		background: rgb(69 10 10 / 0.5);
		color: rgb(239 68 68);
		border-color: rgb(127 29 29 / 0.5);
	}

	.tooltip-level.high {
		background: rgb(69 26 3 / 0.5);
		color: rgb(251 191 36);
		border-color: rgb(146 64 14 / 0.5);
	}

	.tooltip-level.elevated {
		background: rgb(22 78 99 / 0.5);
		color: rgb(34 211 238);
		border-color: rgb(8 145 178 / 0.5);
	}

	.tooltip-name {
		font-size: 0.75rem; /* 12px - text-xs */
		font-weight: 700;
		color: white;
		margin-bottom: 0.25rem;
	}

	.tooltip-desc {
		font-size: 0.625rem; /* 10px */
		color: rgb(203 213 225); /* slate-300 */
		line-height: 1.4;
		border-top: 1px solid rgb(51 65 85 / 0.5);
		padding-top: 0.375rem;
		margin-top: 0.25rem;
	}

	/* Globe Controls */
	.globe-controls {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		z-index: 20;
	}

	.control-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(15 23 42 / 0.8);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgb(51 65 85 / 0.5);
		border-radius: 2px;
		color: rgb(148 163 184);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.control-btn:hover {
		background: rgb(51 65 85 / 0.8);
		border-color: rgb(34 211 238 / 0.5);
		color: rgb(34 211 238);
	}

	.control-btn.active {
		background: rgb(22 78 99 / 0.5);
		border-color: rgb(34 211 238 / 0.5);
		color: rgb(34 211 238);
	}

	.control-icon {
		font-size: 0.875rem;
	}

	/* Globe Legend */
	.globe-legend {
		position: absolute;
		bottom: 0.75rem;
		left: 0.75rem;
		z-index: 20;
		background: rgb(15 23 42 / 0.9);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgb(51 65 85 / 0.5);
		border-radius: 2px;
		min-width: 140px;
		max-width: 200px;
	}

	.legend-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.625rem;
		background: transparent;
		border: none;
		color: rgb(148 163 184);
		cursor: pointer;
		transition: color 0.15s ease;
	}

	.legend-toggle:hover {
		color: rgb(34 211 238);
	}

	.legend-toggle-text {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.legend-toggle-icon {
		font-size: 0.5rem;
	}

	.legend-content {
		padding: 0 0.625rem 0.625rem;
		border-top: 1px solid rgb(51 65 85 / 0.3);
	}

	.legend-section {
		margin-top: 0.5rem;
	}

	.legend-section-title {
		display: block;
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: rgb(100 116 139);
		text-transform: uppercase;
		margin-bottom: 0.375rem;
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-dot.critical {
		background: #ff0000;
		box-shadow: 0 0 6px #ff0000;
	}

	.legend-dot.high {
		background: #ff4444;
		box-shadow: 0 0 6px #ff4444;
	}

	.legend-dot.elevated {
		background: #ffcc00;
		box-shadow: 0 0 6px #ffcc00;
	}

	.legend-dot.low {
		background: #00ff88;
		box-shadow: 0 0 6px #00ff88;
	}

	.legend-marker {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-marker.chokepoint {
		background: #00aaff;
	}

	.legend-marker.cable {
		background: #aa44ff;
	}

	.legend-marker.nuclear {
		background: #ffff00;
	}

	.legend-marker.military {
		background: #ff00ff;
	}

	.legend-arc {
		width: 16px;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.6), transparent);
		border-radius: 1px;
		flex-shrink: 0;
	}

	.legend-ring {
		width: 12px;
		height: 12px;
		border: 2px solid rgba(255, 0, 0, 0.6);
		border-radius: 50%;
		flex-shrink: 0;
		animation: legend-pulse 1.5s ease-in-out infinite;
	}

	@keyframes legend-pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.9);
		}
	}

	.legend-label {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: rgb(203 213 225);
		white-space: nowrap;
	}

	.legend-hint {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid rgb(51 65 85 / 0.3);
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: rgb(100 116 139);
		line-height: 1.4;
	}

	/* Responsive adjustments for legend */
	@media (max-width: 480px) {
		.globe-legend {
			min-width: 120px;
			max-width: 160px;
		}

		.legend-label {
			font-size: 0.5rem;
		}
	}
</style>
