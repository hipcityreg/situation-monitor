<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { t } from '$lib/stores';
	import { fetchMoveIndex } from '$lib/api/moveIndex';
	import { onMount } from 'svelte';

	let moveData = $state({
		value: 0,
		change: 0,
		changePercent: 0
	});
	let loading = $state(true);
	let error: string | null = $state(null);
	let dataSource = $state<'yahoo' | 'demo'>('demo');

	// Calculate classification
	function getClassification(value: number): string {
		if (value < 80) return 'Low Volatility';
		if (value < 100) return 'Normal';
		if (value < 120) return 'Elevated';
		return 'High Volatility';
	}

	const classification = $derived(getClassification(moveData.value));
	const changeClass = $derived(moveData.changePercent > 0 ? 'up' : 'down');

	// Fetch data
	async function loadData() {
		loading = true;
		error = null;

		try {
			const result = await fetchMoveIndex();
			
			if (result.data) {
				moveData = result.data;
				dataSource = result.source;
			} else {
				throw new Error('No data received');
			}
		} catch (e) {
			console.error('[MOVE] Error:', e);
			error = 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});
</script>

<Panel id="moveindex" title={$t('panels.moveindex.name')} {loading} {error}>
	{#if moveData.value}
		<div class="move-container">
			<div class="data-source" class:yahoo={dataSource === 'yahoo'} class:demo={dataSource === 'demo'}>
				{#if dataSource === 'yahoo'}
					<span class="badge">Yahoo</span>
				{:else}
					<span class="badge">Demo</span>
				{/if}
			</div>
			<div class="value">{moveData.value.toFixed(2)}</div>
			<div class="classification">{classification}</div>
			<div class="change {changeClass}">
				{moveData.change.toFixed(2)} ({moveData.changePercent.toFixed(2)}%)
			</div>
		</div>
	{:else}
		<div class="empty-state">No data available</div>
	{/if}
</Panel>

<style>
	.move-container {
		text-align: center;
		padding: 1rem;
	}

	.data-source {
		margin-bottom: 0.5rem;
	}

	.data-source .badge {
		font-size: 0.5rem;
		padding: 0.15rem 0.4rem;
		border-radius: 3px;
	}

	.data-source.yahoo .badge {
		background: rgba(0, 255, 136, 0.2);
		color: var(--success);
	}

	.data-source.demo .badge {
		background: rgba(128, 128, 128, 0.2);
		color: gray;
	}

	.value {
		font-size: 2rem;
		font-weight: bold;
	}

	.classification {
		font-size: 1rem;
		margin: 0.5rem 0;
	}

	.change.up {
		color: green;
	}

	.change.down {
		color: red;
	}
</style>
