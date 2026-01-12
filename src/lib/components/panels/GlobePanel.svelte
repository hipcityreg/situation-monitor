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

	// Get points data
	function getPointsData() {
		const points: Array<{
			lat: number;
			lng: number;
			size: number;
			color: string;
			label: string;
			type: string;
		}> = [];

		// Add hotspots
		HOTSPOTS.forEach((h) => {
			points.push({
				lat: h.lat,
				lng: h.lon,
				size: h.level === 'critical' ? 0.8 : h.level === 'high' ? 0.6 : 0.4,
				color: THREAT_COLORS[h.level],
				label: h.name,
				type: 'hotspot'
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
				type: 'chokepoint'
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
				type: 'cable'
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
				type: 'nuclear'
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
				type: 'military'
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
						type: 'monitor'
					});
				}
			});

		return points;
	}

	// Get arc data for conflict zones / connections
	function getArcsData() {
		const arcs: Array<{
			startLat: number;
			startLng: number;
			endLat: number;
			endLng: number;
			color: string;
		}> = [];

		// Create arcs between hotspots to show connections
		const criticalHotspots = HOTSPOTS.filter(
			(h) => h.level === 'critical' || h.level === 'high'
		);
		for (let i = 0; i < criticalHotspots.length - 1; i++) {
			arcs.push({
				startLat: criticalHotspots[i].lat,
				startLng: criticalHotspots[i].lon,
				endLat: criticalHotspots[i + 1].lat,
				endLng: criticalHotspots[i + 1].lon,
				color: '#ef444480'
			});
		}

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

			// Create globe instance with explicit dimensions
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			globe = (Globe as any)()
				.width(width)
				.height(height)
				.backgroundColor('#020305')
				.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
				.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
				.showAtmosphere(true)
				.atmosphereColor('#06b6d4')
				.atmosphereAltitude(0.25)
				// Points
				.pointsData(getPointsData())
				.pointAltitude('size')
				.pointColor('color')
				.pointRadius(0.3)
				.pointsMerge(false)
				// Labels
				.labelsData(getLabelsData())
				.labelText('text')
				.labelSize('size')
				.labelColor('color')
				.labelDotRadius(0.3)
				.labelAltitude(0.01)
				// Arcs
				.arcsData(getArcsData())
				.arcColor('color')
				.arcDashLength(0.4)
				.arcDashGap(0.2)
				.arcDashAnimateTime(2000)
				.arcStroke(0.5)
				// Rings
				.ringsData(getRingsData())
				.ringColor('color')
				.ringMaxRadius('maxR')
				.ringPropagationSpeed('propagationSpeed')
				.ringRepeatPeriod('repeatPeriod');

			// Mount to container
			globe(globeContainer);

			// Set initial view after mounting
			globe.pointOfView({ lat: 30, lng: 0, altitude: 2.5 });

			// Enable auto-rotation
			const controls = globe.controls();
			if (controls) {
				controls.autoRotate = true;
				controls.autoRotateSpeed = 0.3;
				controls.enableZoom = true;
				controls.minDistance = 101;
				controls.maxDistance = 500;
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

<div class="globe-container" bind:this={globeContainer}>
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
</div>

<style>
	.globe-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
		position: relative;
		background: #020305;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
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
</style>
