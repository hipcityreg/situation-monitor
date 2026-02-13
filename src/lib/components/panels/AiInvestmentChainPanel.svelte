<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { t } from '$lib/stores';
	import { onMount } from 'svelte';

	// Calculate actual days to NVIDIA earnings (Feb 25, 2026)
	function calculateDaysToEarnings(): number {
		const earningsDate = new Date('2026-02-25T00:00:00Z');
		const now = new Date();
		const diff = earningsDate.getTime() - now.getTime();
		const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
		return days > 0 ? days : 0;
	}

	let aiData = $state({
		nvidiaEarningsCountdown: calculateDaysToEarnings(),
		tsmcCapacity: 88,
		powerGrowth: 18,
		concentration: 42
	});
	let loading = $state(false);
	let error: string | null = $state(null);

	onMount(() => {
		// Update countdown daily
		const interval = setInterval(() => {
			aiData.nvidiaEarningsCountdown = calculateDaysToEarnings();
		}, 1000 * 60 * 60); // Update every hour

		return () => clearInterval(interval);
	});
</script>

<Panel id="aiinvestment" title={$t('panels.aiinvestment.name')} {loading} {error}>
	<div class="ai-container">
		<div class="item">
			<div class="label">NVIDIA Earnings Countdown</div>
			<div class="value">{aiData.nvidiaEarningsCountdown} days</div>
		</div>
		<div class="item">
			<div class="label">TSMC Capacity Utilization</div>
			<div class="value">{aiData.tsmcCapacity}%</div>
		</div>
		<div class="item">
			<div class="label">US Data Center Power Growth</div>
			<div class="value">+{aiData.powerGrowth}% YoY</div>
		</div>
		<div class="item">
			<div class="label">AI Stock Concentration</div>
			<div class="value">{aiData.concentration}% (Top 10)</div>
		</div>
	</div>
</Panel>

<style>
	.ai-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
	}

	.item {
		text-align: center;
	}

	.label {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.value {
		font-size: 1.2rem;
		font-weight: bold;
	}
</style>
