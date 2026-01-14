<script lang="ts">
	import { onMount } from 'svelte';
	import { Header, Dashboard } from '$lib/components/layout';
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
		WhalePanel,
		PolymarketPanel,
		ContractsPanel,
		LayoffsPanel,
		IntelPanel,
		SituationPanel,
		WorldLeadersPanel,
		PrinterPanel,
		Nifty50HeatmapPanel,
		NiftyNext50HeatmapPanel
	} from '$lib/components/panels';
	import {
		news,
		markets,
		monitors,
		settings,
		refresh,
		allNewsItems,
		nifty50,
		niftyNext50
	} from '$lib/stores';
	import {
		fetchAllNews,
		fetchAllMarkets,
		fetchPolymarket,
		fetchWhaleTransactions,
		fetchGovContracts,
		fetchLayoffs,
		fetchWorldLeaders,
		fetchNifty50,
		fetchNiftyNext50
	} from '$lib/api';
	import type { Prediction, WhaleTransaction, Contract, Layoff } from '$lib/api';
	import type { CustomMonitor, WorldLeader } from '$lib/types';
	import type { PanelId } from '$lib/config';

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
		// Set loading for all categories
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

	async function loadNiftyData() {
		if (!isPanelVisible('nifty50') && !isPanelVisible('niftynext50')) return;

		try {
			const promises = [];

			if (isPanelVisible('nifty50')) {
				nifty50.setLoading(true);
				promises.push(
					fetchNifty50()
						.then((data) => nifty50.setItems(data))
						.catch((error) => {
							console.error('Failed to load Nifty 50:', error);
							nifty50.setError(String(error));
						})
				);
			}

			if (isPanelVisible('niftynext50')) {
				niftyNext50.setLoading(true);
				promises.push(
					fetchNiftyNext50()
						.then((data) => niftyNext50.setItems(data))
						.catch((error) => {
							console.error('Failed to load Nifty Next 50:', error);
							niftyNext50.setError(String(error));
						})
				);
			}

			await Promise.all(promises);
		} catch (error) {
			console.error('Failed to load Nifty data:', error);
		}
	}

	// Refresh handlers
	async function handleRefresh() {
		refresh.startRefresh();
		try {
			await Promise.all([loadNews(), loadMarkets(), loadNiftyData()]);
			refresh.endRefresh();
		} catch (error) {
			refresh.endRefresh([String(error)]);
		}
	}

	// Monitor handlers
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

	// Get panel visibility
	function isPanelVisible(id: PanelId): boolean {
		return $settings.enabled[id] !== false;
	}

	// Handle preset selection from onboarding
	function handleSelectPreset(presetId: string) {
		settings.applyPreset(presetId);
		onboardingOpen = false;
		// Refresh data after applying preset
		handleRefresh();
	}

	// Show onboarding again (called from settings)
	function handleReconfigure() {
		settingsOpen = false;
		settings.resetOnboarding();
		onboardingOpen = true;
	}

	// Initial load
	onMount(() => {
		// Check if first visit
		if (!settings.isOnboardingComplete()) {
			onboardingOpen = true;
		}

		// Load initial data and track as refresh
		async function initialLoad() {
			refresh.startRefresh();
			try {
				await Promise.all([
					loadNews(),
					loadMarkets(),
					loadMiscData(),
					loadWorldLeaders(),
					loadNiftyData()
				]);
				refresh.endRefresh();
			} catch (error) {
				refresh.endRefresh([String(error)]);
			}
		}
		initialLoad();
		refresh.setupAutoRefresh(handleRefresh);

		// Setup auto-refresh for Nifty data (60 seconds)
		async function refreshNifty50() {
			if (!isPanelVisible('nifty50')) return;
			try {
				nifty50.setLoading(true);
				const data = await fetchNifty50();
				nifty50.setItems(data);
			} catch (error) {
				console.error('Failed to refresh Nifty 50:', error);
				nifty50.setError(String(error));
			}
		}

		async function refreshNiftyNext50() {
			if (!isPanelVisible('niftynext50')) return;
			try {
				niftyNext50.setLoading(true);
				const data = await fetchNiftyNext50();
				niftyNext50.setItems(data);
			} catch (error) {
				console.error('Failed to refresh Nifty Next 50:', error);
				niftyNext50.setError(String(error));
			}
		}

		nifty50.setupAutoRefresh(refreshNifty50);
		niftyNext50.setupAutoRefresh(refreshNiftyNext50);

		return () => {
			refresh.stopAutoRefresh();
			nifty50.stopAutoRefresh();
			niftyNext50.stopAutoRefresh();
		};
	});
</script>

<svelte:head>
	<title>SMERSH ARKHAM - Global geopolitical situation monitor</title>
	<meta name="description" content="SMERSH ARKHAM - Global geopolitical situation monitor" />
</svelte:head>

<div class="app">
	<Header onSettingsClick={() => (settingsOpen = true)} />

	<main class="main-content">
		<Dashboard>
			<!-- Map Panel - Full width -->
			{#if isPanelVisible('map')}
				<div class="panel-slot map-slot">
					<MapPanel monitors={$monitors.monitors} />
				</div>
			{/if}

			<!-- News Panels -->
			{#if isPanelVisible('politics')}
				<div class="panel-slot">
					<NewsPanel category="politics" panelId="politics" title="Politics" />
				</div>
			{/if}

			{#if isPanelVisible('tech')}
				<div class="panel-slot">
					<NewsPanel category="tech" panelId="tech" title="Tech" />
				</div>
			{/if}

			{#if isPanelVisible('finance')}
				<div class="panel-slot">
					<NewsPanel category="finance" panelId="finance" title="Finance" />
				</div>
			{/if}

			{#if isPanelVisible('gov')}
				<div class="panel-slot">
					<NewsPanel category="gov" panelId="gov" title="Government" />
				</div>
			{/if}

			{#if isPanelVisible('ai')}
				<div class="panel-slot">
					<NewsPanel category="ai" panelId="ai" title="AI" />
				</div>
			{/if}

			<!-- Markets Panels -->
			{#if isPanelVisible('markets')}
				<div class="panel-slot">
					<MarketsPanel />
				</div>
			{/if}

			{#if isPanelVisible('heatmap')}
				<div class="panel-slot">
					<HeatmapPanel />
				</div>
			{/if}

			{#if isPanelVisible('nifty50')}
				<div class="panel-slot">
					<Nifty50HeatmapPanel />
				</div>
			{/if}

			{#if isPanelVisible('niftynext50')}
				<div class="panel-slot">
					<NiftyNext50HeatmapPanel />
				</div>
			{/if}

			{#if isPanelVisible('commodities')}
				<div class="panel-slot">
					<CommoditiesPanel />
				</div>
			{/if}

			{#if isPanelVisible('crypto')}
				<div class="panel-slot">
					<CryptoPanel />
				</div>
			{/if}

			<!-- Analysis Panels -->
			{#if isPanelVisible('mainchar')}
				<div class="panel-slot">
					<MainCharPanel />
				</div>
			{/if}

			{#if isPanelVisible('correlation')}
				<div class="panel-slot">
					<CorrelationPanel news={$allNewsItems} />
				</div>
			{/if}

			{#if isPanelVisible('narrative')}
				<div class="panel-slot">
					<NarrativePanel news={$allNewsItems} />
				</div>
			{/if}

			<!-- Intel Panel -->
			{#if isPanelVisible('intel')}
				<div class="panel-slot">
					<IntelPanel />
				</div>
			{/if}

			<!-- World Leaders Panel -->
			{#if isPanelVisible('leaders')}
				<div class="panel-slot">
					<WorldLeadersPanel {leaders} loading={leadersLoading} />
				</div>
			{/if}

			<!-- Situation Panels -->
			{#if isPanelVisible('venezuela')}
				<div class="panel-slot">
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
				</div>
			{/if}

			{#if isPanelVisible('greenland')}
				<div class="panel-slot">
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
				</div>
			{/if}

			{#if isPanelVisible('iran')}
				<div class="panel-slot">
					<SituationPanel
						panelId="iran"
						config={{
							title: 'Iran Crisis',
							subtitle: 'Revolution protests, regime instability & nuclear program',
							criticalKeywords: [
								'protest',
								'uprising',
								'revolution',
								'crackdown',
								'killed',
								'nuclear',
								'strike',
								'attack',
								'irgc',
								'khamenei'
							]
						}}
						news={$allNewsItems.filter(
							(n) =>
								n.title.toLowerCase().includes('iran') ||
								n.title.toLowerCase().includes('tehran') ||
								n.title.toLowerCase().includes('irgc')
						)}
					/>
				</div>
			{/if}

			<!-- Placeholder panels for additional data sources -->
			{#if isPanelVisible('whales')}
				<div class="panel-slot">
					<WhalePanel {whales} />
				</div>
			{/if}

			{#if isPanelVisible('polymarket')}
				<div class="panel-slot">
					<PolymarketPanel {predictions} />
				</div>
			{/if}

			{#if isPanelVisible('contracts')}
				<div class="panel-slot">
					<ContractsPanel {contracts} />
				</div>
			{/if}

			{#if isPanelVisible('layoffs')}
				<div class="panel-slot">
					<LayoffsPanel {layoffs} />
				</div>
			{/if}

			<!-- Money Printer Panel -->
			{#if isPanelVisible('printer')}
				<div class="panel-slot">
					<PrinterPanel />
				</div>
			{/if}

			<!-- Custom Monitors (always last) -->
			{#if isPanelVisible('monitors')}
				<div class="panel-slot">
					<MonitorsPanel
						monitors={$monitors.monitors}
						matches={$monitors.matches}
						onCreateMonitor={handleCreateMonitor}
						onEditMonitor={handleEditMonitor}
						onDeleteMonitor={handleDeleteMonitor}
						onToggleMonitor={handleToggleMonitor}
					/>
				</div>
			{/if}
		</Dashboard>
	</main>

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
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg);
	}

	.main-content {
		flex: 1;
		padding: 0.5rem;
		overflow-y: auto;
	}

	.map-slot {
		column-span: all;
		margin-bottom: 0.5rem;
	}

	@media (max-width: 768px) {
		.main-content {
			padding: 0.25rem;
		}
	}
</style>
