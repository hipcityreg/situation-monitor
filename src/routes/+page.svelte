<script lang="ts">
	import { onMount } from 'svelte';
	import { Header } from '$lib/components/layout';
	import { SettingsModal, MonitorFormModal, OnboardingModal } from '$lib/components/modals';
	import {
		NewsPanel,
		MarketsPanel,
		HeatmapPanel,
		CommoditiesPanel,
		CryptoPanel,
		MainCharPanel,
		CorrelationPanel,
		NarrativePanel,
		MonitorsPanel,
		MapPanel,
		GlobePanel,
		WhalePanel,
		PolymarketPanel,
		ContractsPanel,
		LayoffsPanel,
		IntelPanel,
		SituationPanel,
		WorldLeadersPanel,
		PrinterPanel
	} from '$lib/components/panels';
	import { news, markets, monitors, settings, refresh, allNewsItems } from '$lib/stores';
	import {
		fetchAllNews,
		fetchAllMarkets,
		fetchPolymarket,
		fetchWhaleTransactions,
		fetchGovContracts,
		fetchLayoffs,
		fetchWorldLeaders
	} from '$lib/api';
	import type { Prediction, WhaleTransaction, Contract, Layoff } from '$lib/api';
	import type { CustomMonitor, WorldLeader } from '$lib/types';
	import type { PanelId } from '$lib/config';
	import { HOTSPOTS } from '$lib/config/map';

	// Modal state
	let settingsOpen = $state(false);
	let monitorFormOpen = $state(false);
	let onboardingOpen = $state(false);
	let editingMonitor = $state<CustomMonitor | null>(null);

	// Misc panel data
	let predictions = $state<Prediction[]>([]);
	let whales = $state<WhaleTransaction[]>([]);
	let contracts = $state<Contract[]>([]);
	let layoffs = $state<Layoff[]>([]);
	let leaders = $state<WorldLeader[]>([]);
	let leadersLoading = $state(false);

	// Data fetching
	async function loadNews() {
		const categories = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'] as const;
		categories.forEach((cat) => news.setLoading(cat, true));

		try {
			const data = await fetchAllNews();
			Object.entries(data).forEach(([category, items]) => {
				news.setItems(category as keyof typeof data, items);
			});
		} catch (error) {
			categories.forEach((cat) => news.setError(cat, String(error)));
		}
	}

	async function loadMarkets() {
		try {
			const data = await fetchAllMarkets();
			markets.setIndices(data.indices);
			markets.setSectors(data.sectors);
			markets.setCommodities(data.commodities);
			markets.setCrypto(data.crypto);
		} catch (error) {
			console.error('Failed to load markets:', error);
		}
	}

	async function loadMiscData() {
		try {
			const [predictionsData, whalesData, contractsData, layoffsData] = await Promise.all([
				fetchPolymarket(),
				fetchWhaleTransactions(),
				fetchGovContracts(),
				fetchLayoffs()
			]);
			predictions = predictionsData;
			whales = whalesData;
			contracts = contractsData;
			layoffs = layoffsData;
		} catch (error) {
			console.error('Failed to load misc data:', error);
		}
	}

	async function loadWorldLeaders() {
		if (!isPanelVisible('leaders')) return;
		leadersLoading = true;
		try {
			leaders = await fetchWorldLeaders();
		} catch (error) {
			console.error('Failed to load world leaders:', error);
		} finally {
			leadersLoading = false;
		}
	}

	async function handleRefresh() {
		refresh.startRefresh();
		try {
			await Promise.all([loadNews(), loadMarkets()]);
			refresh.endRefresh();
		} catch (error) {
			refresh.endRefresh([String(error)]);
		}
	}

	function handleCreateMonitor() {
		editingMonitor = null;
		monitorFormOpen = true;
	}

	function handleEditMonitor(monitor: CustomMonitor) {
		editingMonitor = monitor;
		monitorFormOpen = true;
	}

	function handleDeleteMonitor(id: string) {
		monitors.deleteMonitor(id);
	}

	function handleToggleMonitor(id: string) {
		monitors.toggleMonitor(id);
	}

	function isPanelVisible(id: PanelId): boolean {
		return $settings.enabled[id] !== false;
	}

	function handleSelectPreset(presetId: string) {
		settings.applyPreset(presetId);
		onboardingOpen = false;
		handleRefresh();
	}

	function handleReconfigure() {
		settingsOpen = false;
		settings.resetOnboarding();
		onboardingOpen = true;
	}

	onMount(() => {
		if (!settings.isOnboardingComplete()) {
			onboardingOpen = true;
		}

		async function initialLoad() {
			refresh.startRefresh();
			try {
				await Promise.all([loadNews(), loadMarkets(), loadMiscData(), loadWorldLeaders()]);
				refresh.endRefresh();
			} catch (error) {
				refresh.endRefresh([String(error)]);
			}
		}
		initialLoad();
		refresh.setupAutoRefresh(handleRefresh);

		return () => {
			refresh.stopAutoRefresh();
		};
	});
</script>

<svelte:head>
	<title>Situation Monitor</title>
	<meta name="description" content="Real-time global situation monitoring dashboard" />
</svelte:head>

<div class="app">
	<!-- Visual Effects Overlays -->
	<div class="vignette-overlay"></div>
	<div class="noise-overlay"></div>
	<div class="gradient-overlay"></div>

	<Header onSettingsClick={() => (settingsOpen = true)} />

	<main class="main-layout">
		<!-- Left Panel Column -->
		<aside class="panel-column left-column">
			<div class="column-scroll">
				<!-- Intelligence & News -->
				{#if isPanelVisible('politics')}
					<NewsPanel category="politics" panelId="politics" title="Politics" />
				{/if}

				{#if isPanelVisible('tech')}
					<NewsPanel category="tech" panelId="tech" title="Tech" />
				{/if}

				{#if isPanelVisible('finance')}
					<NewsPanel category="finance" panelId="finance" title="Finance" />
				{/if}

				{#if isPanelVisible('intel')}
					<IntelPanel />
				{/if}

				{#if isPanelVisible('correlation')}
					<CorrelationPanel news={$allNewsItems} />
				{/if}

				{#if isPanelVisible('narrative')}
					<NarrativePanel news={$allNewsItems} />
				{/if}
			</div>
		</aside>

		<!-- Center Globe Column -->
		<div class="globe-column">
			<!-- Globe as main centerpiece -->
			{#if isPanelVisible('map')}
				<div class="globe-wrapper">
					<GlobePanel monitors={$monitors.monitors} />

					<!-- Globe overlay controls and info -->
					<div class="globe-info-overlay">
						<div class="globe-title">
							<span class="title-icon">◆</span>
							<span class="title-text">GLOBAL OVERVIEW</span>
						</div>
					</div>

					<!-- Alert overlay at bottom -->
					<div class="alert-overlay">
						<div class="alert-content">
							<span class="alert-text">MONITORING {HOTSPOTS.length} ACTIVE REGIONS</span>
						</div>
						<div class="accent-line"></div>
					</div>
				</div>
			{:else}
				<!-- Fallback to 2D map if globe is disabled -->
				<div class="map-wrapper">
					<MapPanel monitors={$monitors.monitors} />
				</div>
			{/if}

			<!-- Sub-panels below globe -->
			<div class="sub-panels">
				{#if isPanelVisible('mainchar')}
					<MainCharPanel />
				{/if}
			</div>
		</div>

		<!-- Right Panel Column -->
		<aside class="panel-column right-column">
			<div class="column-scroll">
				<!-- Markets & Data -->
				{#if isPanelVisible('markets')}
					<MarketsPanel />
				{/if}

				{#if isPanelVisible('heatmap')}
					<HeatmapPanel />
				{/if}

				{#if isPanelVisible('crypto')}
					<CryptoPanel />
				{/if}

				{#if isPanelVisible('commodities')}
					<CommoditiesPanel />
				{/if}

				{#if isPanelVisible('whales')}
					<WhalePanel {whales} />
				{/if}

				{#if isPanelVisible('polymarket')}
					<PolymarketPanel {predictions} />
				{/if}

				{#if isPanelVisible('contracts')}
					<ContractsPanel {contracts} />
				{/if}

				{#if isPanelVisible('layoffs')}
					<LayoffsPanel {layoffs} />
				{/if}
			</div>
		</aside>
	</main>

	<!-- Bottom Panels Row (situational awareness) -->
	<div class="bottom-panels">
		{#if isPanelVisible('gov')}
			<NewsPanel category="gov" panelId="gov" title="Government" />
		{/if}

		{#if isPanelVisible('ai')}
			<NewsPanel category="ai" panelId="ai" title="AI" />
		{/if}

		{#if isPanelVisible('leaders')}
			<WorldLeadersPanel {leaders} loading={leadersLoading} />
		{/if}

		{#if isPanelVisible('venezuela')}
			<SituationPanel
				panelId="venezuela"
				config={{
					title: 'Venezuela Watch',
					subtitle: 'Humanitarian crisis monitoring',
					criticalKeywords: ['maduro', 'caracas', 'venezuela', 'guaido']
				}}
				news={$allNewsItems.filter(
					(n) =>
						n.title.toLowerCase().includes('venezuela') ||
						n.title.toLowerCase().includes('maduro')
				)}
			/>
		{/if}

		{#if isPanelVisible('greenland')}
			<SituationPanel
				panelId="greenland"
				config={{
					title: 'Greenland Watch',
					subtitle: 'Arctic geopolitics monitoring',
					criticalKeywords: ['greenland', 'arctic', 'nuuk', 'denmark']
				}}
				news={$allNewsItems.filter(
					(n) =>
						n.title.toLowerCase().includes('greenland') ||
						n.title.toLowerCase().includes('arctic')
				)}
			/>
		{/if}

		{#if isPanelVisible('iran')}
			<SituationPanel
				panelId="iran"
				config={{
					title: 'Iran Crisis',
					subtitle: 'Revolution protests, regime instability & nuclear program',
					criticalKeywords: [
						'protest', 'uprising', 'revolution', 'crackdown', 'killed',
						'nuclear', 'strike', 'attack', 'irgc', 'khamenei'
					]
				}}
				news={$allNewsItems.filter(
					(n) =>
						n.title.toLowerCase().includes('iran') ||
						n.title.toLowerCase().includes('tehran') ||
						n.title.toLowerCase().includes('irgc')
				)}
			/>
		{/if}

		{#if isPanelVisible('printer')}
			<PrinterPanel />
		{/if}

		{#if isPanelVisible('monitors')}
			<MonitorsPanel
				monitors={$monitors.monitors}
				matches={$monitors.matches}
				onCreateMonitor={handleCreateMonitor}
				onEditMonitor={handleEditMonitor}
				onDeleteMonitor={handleDeleteMonitor}
				onToggleMonitor={handleToggleMonitor}
			/>
		{/if}
	</div>

	<!-- Modals -->
	<SettingsModal
		open={settingsOpen}
		onClose={() => (settingsOpen = false)}
		onReconfigure={handleReconfigure}
	/>
	<MonitorFormModal
		open={monitorFormOpen}
		onClose={() => (monitorFormOpen = false)}
		editMonitor={editingMonitor}
	/>
	<OnboardingModal open={onboardingOpen} onSelectPreset={handleSelectPreset} />
</div>

<style>
	.app {
		position: relative;
		width: 100vw;
		height: 100vh;
		background: #050505;
		color: rgb(226 232 240);
		overflow: hidden;
		font-family: 'Geist Sans', 'SF Pro Display', system-ui, sans-serif;
		display: flex;
		flex-direction: column;
	}

	/* Visual Effect Overlays */
	.vignette-overlay {
		position: fixed;
		inset: 0;
		background: radial-gradient(circle at center, transparent 0%, #000000 120%);
		pointer-events: none;
		z-index: 1;
	}

	.noise-overlay {
		position: fixed;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
		opacity: 0.03;
		pointer-events: none;
		z-index: 2;
	}

	.gradient-overlay {
		position: fixed;
		inset: 0;
		background: linear-gradient(45deg, transparent 25%, rgba(6, 182, 212, 0.02) 50%, transparent 75%);
		pointer-events: none;
		z-index: 2;
	}

	/* Main Layout - 12-column grid */
	.main-layout {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(280px, 3fr) minmax(400px, 6fr) minmax(280px, 3fr);
		gap: 1rem;
		padding: 1rem;
		overflow: hidden;
		position: relative;
		z-index: 10;
	}

	/* Panel Columns */
	.panel-column {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 0;
		pointer-events: auto;
	}

	.column-scroll {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 0;
		padding-right: 0.25rem;
	}

	/* Globe Column */
	.globe-column {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 0;
		position: relative;
	}

	.globe-wrapper {
		flex: 1;
		position: relative;
		background: rgb(2 6 23 / 0.8);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgb(51 65 85 / 0.5);
		border-radius: 2px;
		overflow: hidden;
		min-height: 400px;
		/* Tech corners */
		isolation: isolate;
	}

	.globe-wrapper::before,
	.globe-wrapper::after {
		content: '';
		position: absolute;
		width: 8px;
		height: 8px;
		border-color: rgb(6 182 212 / 0.5);
		pointer-events: none;
		z-index: 20;
	}

	.globe-wrapper::before {
		top: 0;
		left: 0;
		border-top: 2px solid;
		border-left: 2px solid;
	}

	.globe-wrapper::after {
		top: 0;
		right: 0;
		border-top: 2px solid;
		border-right: 2px solid;
	}

	.map-wrapper {
		flex: 1;
		min-height: 400px;
	}

	/* Globe Info Overlay */
	.globe-info-overlay {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		z-index: 15;
		pointer-events: none;
	}

	.globe-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgb(15 23 42 / 0.9);
		backdrop-filter: blur(8px);
		padding: 0.5rem 0.75rem;
		border: 1px solid rgb(51 65 85 / 0.5);
		border-radius: 2px;
	}

	.title-icon {
		color: rgb(34 211 238);
		font-size: 0.75rem;
	}

	.title-text {
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: white;
		text-transform: uppercase;
	}

	/* Alert Overlay */
	.alert-overlay {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 15;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 300px;
	}

	.alert-content {
		background: rgb(15 23 42 / 0.95);
		backdrop-filter: blur(8px);
		border: 1px solid rgb(51 65 85 / 0.5);
		padding: 0.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.alert-text {
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: white;
	}

	.accent-line {
		height: 1px;
		width: 100%;
		background: linear-gradient(to right, transparent, rgb(6 182 212), transparent);
		margin-top: 0.5rem;
	}

	/* Sub Panels */
	.sub-panels {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.sub-panels > :global(*) {
		flex: 1;
	}

	/* Bottom Panels */
	.bottom-panels {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 0.5rem;
		padding: 0 1rem 1rem;
		position: relative;
		z-index: 10;
		max-height: 250px;
		overflow-y: auto;
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.main-layout {
			grid-template-columns: 1fr 2fr;
		}

		.right-column {
			display: none;
		}

		.bottom-panels {
			display: flex;
			flex-wrap: wrap;
		}

		.bottom-panels > :global(*) {
			flex: 1 1 300px;
		}
	}

	@media (max-width: 768px) {
		.main-layout {
			grid-template-columns: 1fr;
			padding: 0.5rem;
		}

		.left-column {
			display: none;
		}

		.globe-wrapper {
			min-height: 300px;
		}

		.bottom-panels {
			padding: 0.5rem;
			max-height: none;
		}
	}

	/* Custom Scrollbar */
	.column-scroll::-webkit-scrollbar {
		width: 4px;
	}

	.column-scroll::-webkit-scrollbar-track {
		background: rgb(15 23 42);
	}

	.column-scroll::-webkit-scrollbar-thumb {
		background: rgb(51 65 85);
		border-radius: 2px;
	}

	.column-scroll::-webkit-scrollbar-thumb:hover {
		background: rgb(71 85 105);
	}
</style>
