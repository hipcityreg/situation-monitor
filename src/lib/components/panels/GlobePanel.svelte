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

	// Globe data points
	const pointsData = $derived(() => {
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
	});

	// Arc data for conflict zones / connections
	const arcsData = $derived(() => {
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
	});

	// Rings data for pulsing effect
	const ringsData = $derived(() => {
		return HOTSPOTS.filter((h) => h.level === 'critical').map((h) => ({
			lat: h.lat,
			lng: h.lon,
			maxR: 3,
			propagationSpeed: 2,
			repeatPeriod: 1000,
			color: THREAT_COLORS[h.level]
		}));
	});

	async function initGlobe() {
		if (typeof window === 'undefined') return;

		const GlobeModule = await import('globe.gl');
		const Globe = GlobeModule.default;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		globe = (Globe as any)()
			.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
			.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
			.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
			.showAtmosphere(true)
			.atmosphereColor('#06b6d4')
			.atmosphereAltitude(0.25)
			// Points
			.pointsData(pointsData())
			.pointAltitude('size')
			.pointColor('color')
			.pointRadius(0.3)
			.pointsMerge(false)
			// Labels
			.labelsData(
				HOTSPOTS.filter((h) => h.level === 'critical' || h.level === 'high').map((h) => ({
					lat: h.lat,
					lng: h.lon,
					text: h.name,
					color: THREAT_COLORS[h.level],
					size: 0.8
				}))
			)
			.labelText('text')
			.labelSize('size')
			.labelColor('color')
			.labelDotRadius(0.3)
			.labelAltitude(0.01)
			// Arcs
			.arcsData(arcsData())
			.arcColor('color')
			.arcDashLength(0.4)
			.arcDashGap(0.2)
			.arcDashAnimateTime(2000)
			.arcStroke(0.5)
			// Rings
			.ringsData(ringsData())
			.ringColor('color')
			.ringMaxRadius('maxR')
			.ringPropagationSpeed('propagationSpeed')
			.ringRepeatPeriod('repeatPeriod');

		// Set initial view
		globe.pointOfView({ lat: 30, lng: 0, altitude: 2.5 });

		// Enable auto-rotation
		globe.controls().autoRotate = true;
		globe.controls().autoRotateSpeed = 0.3;
		globe.controls().enableZoom = true;

		// Mount to container
		globe(globeContainer);

		// Responsive sizing
		function handleResize() {
			if (globeContainer && globe) {
				globe.width(globeContainer.clientWidth);
				globe.height(globeContainer.clientHeight);
			}
		}

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}

	// Update globe data when monitors change
	$effect(() => {
		if (globe) {
			globe.pointsData(pointsData());
		}
	});

	onMount(() => {
		initGlobe();
	});

	onDestroy(() => {
		if (globe) {
			globe._destructor?.();
		}
	});
</script>

<div class="globe-container" bind:this={globeContainer}>
	<!-- Globe renders here -->
</div>

<style>
	.globe-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
		position: relative;
		background: var(--bg-globe, #020305);
		overflow: hidden;
	}

	.globe-container :global(canvas) {
		cursor: grab;
	}

	.globe-container :global(canvas:active) {
		cursor: grabbing;
	}
</style>
