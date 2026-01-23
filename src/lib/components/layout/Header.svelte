<script lang="ts">
	import { isRefreshing, lastRefresh } from '$lib/stores';

	interface Props {
		onSettingsClick?: () => void;
	}

	let { onSettingsClick }: Props = $props();

	const lastRefreshText = $derived(
		$lastRefresh
			? `Last updated: ${new Date($lastRefresh).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
			: 'Never refreshed'
	);
</script>

<header class="header">
	<div class="header-left">
		<h1 class="logo">SITUATION MONITOR</h1>
	</div>

	<div class="header-center">
		<div class="refresh-status">
			{#if $isRefreshing}
				<span class="status-text loading">Refreshing...</span>
			{:else}
				<span class="status-text">{lastRefreshText}</span>
			{/if}
		</div>
	</div>

	<div class="header-right">
		<button class="header-btn settings-btn" onclick={onSettingsClick} title="Settings">
			<span class="btn-icon">⚙</span>
			<span class="btn-label">Settings</span>
		</button>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		background: #000000;
		border-bottom: 1px solid #111827;
		position: sticky;
		top: 0;
		z-index: 100;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		align-items: baseline;
		flex-shrink: 0;
	}

	.logo {
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: #ffffff;
		margin: 0;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.header-center {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: center;
		min-width: 0;
	}

	.refresh-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-text {
		font-size: 0.6rem;
		color: #ffffff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-text.loading {
		color: #ffffff;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.header-btn {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.75rem;
		padding: 0.4rem 0.75rem;
		background: #000000;
		border: 1px solid #ffffff;
		border-radius: 4px;
		color: #ffffff;
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 0.65rem;
	}

	.header-btn:hover {
		background: #111827;
		border-color: #ffffff;
		color: #ffffff;
	}

	.btn-icon {
		font-size: 0.8rem;
	}

	.btn-label {
		display: none;
	}

	@media (min-width: 768px) {
		.btn-label {
			display: inline;
		}
	}
</style>
