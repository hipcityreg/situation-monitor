<script lang="ts">
	import { isRefreshing, lastRefresh } from '$lib/stores';
	import { _ } from 'svelte-i18n';
	import { settings } from '$lib/stores/settings';
	import { SUPPORTED_LOCALES } from '$lib/i18n';

	interface Props {
		onSettingsClick?: () => void;
	}

	let { onSettingsClick }: Props = $props();

	const lastRefreshText = $derived(
		$lastRefresh
			? `${$_('common.lastUpdated')}: ${new Date($lastRefresh).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
			: 'Never refreshed'
	);

	function toggleLanguage() {
		const currentLocale = settings.getLocale();
		const currentIndex = SUPPORTED_LOCALES.indexOf(currentLocale);
		const nextIndex = (currentIndex + 1) % SUPPORTED_LOCALES.length;
		const nextLocale = SUPPORTED_LOCALES[nextIndex];
		settings.setLocale(nextLocale);
	}
</script>

<header class="header">
	<div class="header-left">
		<h1 class="logo">{$_('header.title')}</h1>
	</div>

	<div class="header-center">
		<div class="refresh-status">
			{#if $isRefreshing}
				<span class="status-text loading">{$_('common.refreshing')}</span>
			{:else}
				<span class="status-text">{lastRefreshText}</span>
			{/if}
		</div>
	</div>

	<div class="header-right">
		<!-- Panel size controls -->
		<div class="size-controls">
			<button 
				class="size-btn" 
				onclick={() => settings.minimizeAllPanels()} 
				title={$_('header.minimizeAll')}
			>
				▁
			</button>
			<button 
				class="size-btn" 
				onclick={() => settings.resetAllPanelHeights()} 
				title={$_('header.resetAll')}
			>
				▬
			</button>
			<button 
				class="size-btn" 
				onclick={() => settings.expandAllPanels()} 
				title={$_('header.expandAll')}
			>
				▆
			</button>
		</div>

		<button class="header-btn" onclick={toggleLanguage} title={$_('header.language')}>
			<span class="btn-icon">🌐</span>
			<span class="btn-label">{settings.getLocale().toUpperCase()}</span>
		</button>
		<button class="header-btn settings-btn" onclick={onSettingsClick} title={$_('header.settings')}>
			<span class="btn-icon">⚙</span>
			<span class="btn-label">{$_('header.settings')}</span>
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

	.size-controls {
		display: flex;
		align-items: center;
		gap: 0.15rem;
		padding: 0.25rem 0.4rem;
		background: var(--bg-secondary, rgba(0, 0, 0, 0.2));
		border-radius: 4px;
		border: 1px solid var(--border);
	}

	.size-btn {
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0.25rem 0.4rem;
		font-size: 0.6rem;
		line-height: 1;
		border-radius: 2px;
		transition: all 0.15s ease;
	}

	.size-btn:hover {
		color: var(--accent);
		background: rgba(var(--accent-rgb, 0, 136, 255), 0.15);
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
