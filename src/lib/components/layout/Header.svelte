<script lang="ts">
	import { onMount } from 'svelte';
	import { isRefreshing, lastRefresh, t } from '$lib/stores';
	import { LanguageSwitcher } from '$lib/components/common';

	interface Props {
		onSettingsClick?: () => void;
	}

	let { onSettingsClick }: Props = $props();

	const lastRefreshText = $derived(
		$lastRefresh
			? $t('header.lastUpdated', { time: new Date($lastRefresh).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) })
			: $t('header.neverRefreshed')
	);

	// Fullscreen toggle
	let isFullscreen = $state(false);

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().then(() => {
				isFullscreen = true;
			}).catch(() => {
				isFullscreen = false;
			});
		} else {
			document.exitFullscreen().then(() => {
				isFullscreen = false;
			}).catch(() => {});
		}
	}

	// Listen for fullscreen change
	onMount(() => {
		const handleFullscreenChange = () => {
			isFullscreen = !!document.fullscreenElement;
		};
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	});
</script>

<header class="header">
	<div class="header-left">
		<h1 class="logo">{$t('header.logo')}</h1>
	</div>

	<div class="header-center">
		<div class="refresh-status">
			{#if $isRefreshing}
				<span class="status-text loading">{$t('header.refreshing')}</span>
			{:else}
				<span class="status-text">{lastRefreshText}</span>
			{/if}
		</div>
	</div>

	<div class="header-right">
		<button 
			class="header-btn fullscreen-btn" 
			onclick={toggleFullscreen} 
			title={isFullscreen ? $t('header.exitFullscreen') : $t('header.enterFullscreen')}
		>
			<span class="btn-icon">{isFullscreen ? '⛶' : '⛶'}</span>
			<span class="btn-label">{isFullscreen ? $t('header.exitFullscreen') : $t('header.enterFullscreen')}</span>
		</button>
		<LanguageSwitcher variant="minimal" />
		<button class="header-btn settings-btn" onclick={onSettingsClick} title={$t('header.settings')}>
			<span class="btn-icon">⚙</span>
			<span class="btn-label">{$t('header.settings')}</span>
		</button>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
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
		color: var(--text-primary);
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
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-text.loading {
		color: var(--accent);
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
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 0.65rem;
	}

	.header-btn:hover {
		background: var(--border);
		color: var(--text-primary);
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
