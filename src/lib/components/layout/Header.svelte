<script lang="ts">
	import { isRefreshing, lastRefresh } from '$lib/stores';

	interface Props {
		onSettingsClick?: () => void;
		onRefreshClick?: () => void;
	}

	let { onSettingsClick, onRefreshClick }: Props = $props();

	const lastRefreshText = $derived(
		$lastRefresh
			? new Date($lastRefresh).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
			: '--:--'
	);

	let currentTime = $state(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

	// Update time every second
	$effect(() => {
		const interval = setInterval(() => {
			currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<header class="header">
	<!-- Tech Corner Decorations -->
	<div class="tech-corner top-left"></div>
	<div class="tech-corner top-right"></div>

	<div class="header-left">
		<div class="logo-container">
			<span class="logo-icon">◆</span>
			<h1 class="logo">AEGIS</h1>
			<span class="logo-subtitle">SITUATION MONITOR</span>
		</div>
	</div>

	<div class="header-center">
		<div class="status-bar">
			<!-- System Time -->
			<div class="status-item">
				<span class="status-label">SYS</span>
				<span class="status-value">{currentTime}</span>
			</div>

			<div class="status-divider"></div>

			<!-- Refresh Status -->
			<div class="status-item">
				<span class="status-label">SYNC</span>
				{#if $isRefreshing}
					<span class="status-dot active"></span>
					<span class="status-value active">UPDATING</span>
				{:else}
					<span class="status-dot"></span>
					<span class="status-value">{lastRefreshText}</span>
				{/if}
			</div>

			<div class="status-divider"></div>

			<!-- System Status -->
			<div class="status-item">
				<span class="status-label">STATUS</span>
				<span class="status-dot online"></span>
				<span class="status-value online">ONLINE</span>
			</div>
		</div>
	</div>

	<div class="header-right">
		{#if onRefreshClick}
			<button
				class="header-btn refresh-btn"
				onclick={onRefreshClick}
				title="Refresh Data"
				disabled={$isRefreshing}
			>
				<span class="btn-icon" class:spinning={$isRefreshing}>↻</span>
			</button>
		{/if}
		<button class="header-btn settings-btn" onclick={onSettingsClick} title="Settings">
			<span class="btn-icon">⚙</span>
			<span class="btn-label">CONFIG</span>
		</button>
	</div>

	<!-- Gradient accent line -->
	<div class="accent-line"></div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		background: var(--surface);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 100;
		gap: 1rem;
		isolation: isolate;
		position: relative;
		min-height: 48px;
	}

	/* Gradient accent line at the bottom */
	.accent-line {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(to right, transparent, var(--accent), transparent);
		opacity: 0.6;
	}

	/* Tech Corner Decorations */
	.tech-corner {
		position: absolute;
		width: 8px;
		height: 8px;
		pointer-events: none;
		z-index: 10;
	}

	.tech-corner.top-left {
		top: 0;
		left: 0;
		border-top: 2px solid var(--accent-border);
		border-left: 2px solid var(--accent-border);
	}

	.tech-corner.top-right {
		top: 0;
		right: 0;
		border-top: 2px solid var(--accent-border);
		border-right: 2px solid var(--accent-border);
	}

	.header-left {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.logo-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo-icon {
		color: var(--accent);
		font-size: 1rem;
		text-shadow: 0 0 10px var(--accent-glow);
		transition: all 0.2s ease;
	}

	.logo {
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--text-primary);
		margin: 0;
	}

	.logo-subtitle {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-left: 0.5rem;
		border-left: 1px solid var(--border);
		margin-left: 0.5rem;
	}

	.header-center {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: center;
		min-width: 0;
	}

	.status-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.25rem 0.75rem;
		background: rgba(15, 23, 42, 0.5);
		border: 1px solid var(--border);
		border-radius: 2px;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.status-label {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.status-value {
		font-size: 0.625rem;
		font-family: 'SF Mono', Monaco, monospace;
		font-weight: 700;
		letter-spacing: 0.05em;
		color: var(--text);
		text-transform: uppercase;
	}

	.status-value.active {
		color: var(--accent);
	}

	.status-value.online {
		color: var(--success);
	}

	.status-divider {
		width: 1px;
		height: 16px;
		background: var(--border);
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-muted);
		transition: background-color 0.2s ease, box-shadow 0.2s ease;
	}

	.status-dot.active {
		background: var(--accent);
		box-shadow: 0 0 10px var(--accent-glow);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.status-dot.online {
		background: var(--success);
		box-shadow: 0 0 8px var(--success);
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	.header-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		min-height: 32px;
		min-width: 32px;
		padding: 0.375rem 0.625rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 2px;
		color: var(--text-dim);
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 0.625rem;
		font-family: 'SF Mono', Monaco, monospace;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.header-btn:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
		color: var(--accent);
	}

	.header-btn:focus-visible {
		outline: 1px solid var(--accent);
		outline-offset: 2px;
	}

	.header-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.refresh-btn {
		padding: 0.375rem;
	}

	.btn-icon {
		font-size: 0.875rem;
	}

	.btn-icon.spinning {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.btn-label {
		display: none;
	}

	@media (min-width: 768px) {
		.btn-label {
			display: inline;
		}
	}

	@media (max-width: 900px) {
		.status-bar {
			display: none;
		}

		.logo-subtitle {
			display: none;
		}
	}
</style>
