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
		FedPanel
	} from '$lib/components/panels';
	import {
		news,
		markets,
		monitors,
		settings,
		refresh,
		allNewsItems,
		fedIndicators,
		fedNews
	} from '$lib/stores';
	import {
		fetchAllNews,
		fetchAllMarkets,
		fetchPolymarket,
		fetchWhaleTransactions,
		fetchGovContracts,
		fetchLayoffs,
		fetchWorldLeaders,
		fetchFedIndicators,
		fetchFedNews
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
		console.log('[Page] Starting loadNews...');
		// Set loading for all categories
		const categories = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'] as const;
		categories.forEach((cat) => news.setLoading(cat, true));

		try {
			const data = await fetchAllNews();
			console.log('[Page] fetchAllNews returned:', data);
			Object.entries(data).forEach(([category, items]) => {
				console.log(`[Page] Setting ${category} items:`, items.length);
				news.setItems(category as keyof typeof data, items);
			});
		} catch (error) {
			console.error('[Page] loadNews error:', error);
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

	async function loadFedData() {
		if (!isPanelVisible('fed')) return;
		fedIndicators.setLoading(true);
		fedNews.setLoading(true);
		try {
			const [indicatorsData, newsData] = await Promise.all([fetchFedIndicators(), fetchFedNews()]);
			fedIndicators.setData(indicatorsData);
			fedNews.setItems(newsData);
		} catch (error) {
			console.error('Failed to load Fed data:', error);
			fedIndicators.setError(String(error));
			fedNews.setError(String(error));
		}
	}

	// Refresh handlers
	async function handleRefresh() {
		refresh.startRefresh();
		try {
			await Promise.all([loadNews(), loadMarkets()]);
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
					loadFedData()
				]);
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
	<title>态势监控</title>
	<meta name="description" content="实时全球态势监控仪表板" />
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

			<!-- 新闻面板 -->
		{#if isPanelVisible('politics')}
			<div class="panel-slot">
				<NewsPanel category="politics" panelId="politics" title="政治" />
			</div>
		{/if}

		{#if isPanelVisible('tech')}
			<div class="panel-slot">
				<NewsPanel category="tech" panelId="tech" title="科技" />
			</div>
		{/if}

		{#if isPanelVisible('finance')}
			<div class="panel-slot">
				<NewsPanel category="finance" panelId="finance" title="财经" />
			</div>
		{/if}

		{#if isPanelVisible('gov')}
			<div class="panel-slot">
				<NewsPanel category="gov" panelId="gov" title="政府" />
			</div>
		{/if}

		{#if isPanelVisible('ai')}
			<div class="panel-slot">
				<NewsPanel category="ai" panelId="ai" title="人工智能" />
			</div>
		{/if}

			<!-- 市场面板 -->
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

		<!-- 分析面板 -->
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

		<!-- 情报面板 -->
		{#if isPanelVisible('intel')}
			<div class="panel-slot">
				<IntelPanel />
			</div>
		{/if}

		<!-- 美联储面板 -->
		{#if isPanelVisible('fed')}
			<div class="panel-slot">
				<FedPanel />
			</div>
		{/if}

		<!-- 世界各国领导人面板 -->
		{#if isPanelVisible('leaders')}
			<div class="panel-slot">
				<WorldLeadersPanel {leaders} loading={leadersLoading} />
			</div>
		{/if}

		<!-- 态势监控面板 -->
		{#if isPanelVisible('venezuela')}
			<div class="panel-slot">
				<SituationPanel
					panelId="venezuela"
					config={{
						title: '委内瑞拉监控',
						subtitle: '人道主义危机监控',
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
						title: '格陵兰监控',
						subtitle: '北极地缘政治监控',
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
						title: '伊朗危机',
						subtitle: '革命抗议、政权不稳定与核计划',
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

		<!-- 其他数据源面板 -->
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

		<!-- 印钞机面板 -->
		{#if isPanelVisible('printer')}
			<div class="panel-slot">
				<PrinterPanel />
			</div>
		{/if}

		<!-- 自定义监控（始终在最后） -->
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
