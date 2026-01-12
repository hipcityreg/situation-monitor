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
	<!-- Tech Corner Decorations -->
	<div class="tech-corner top-left"></div>
	<div class="tech-corner top-right"></div>

	<div class="header-left">
		<div class="logo-container">
			<span class="logo-icon">◆</span>
			<h1 class="logo">SITUATION MONITOR</h1>
		</div>
	</div>

	<div class="header-center">
		<div class="refresh-status">
			{#if $isRefreshing}
				<span class="status-dot active"></span>
				<span class="status-text active">REFRESHING</span>
			{:else}
				<span class="status-dot"></span>
				<span class="status-text">{lastRefreshText}</span>
			{/if}
		</div>
	</div>

	<div class="header-right">
		<button class="header-btn settings-btn" onclick={onSettingsClick} title="Settings">
			<span class="btn-icon">⚙</span>
			<span class="btn-label">SETTINGS</span>
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
		align-items: baseline;
		flex-shrink: 0;
	}

	.logo-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo-icon {
		color: var(--accent);
		font-size: 0.875rem; /* Match logo size */
		transition: color 0.2s ease;
	}

	.logo {
		font-size: 0.875rem; /* text-sm (14px) per Aegis design system */
		font-weight: 700; /* font-bold */
		letter-spacing: 0.1em; /* tracking-widest */
		text-transform: uppercase;
		color: var(--text-primary);
		margin: 0;
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

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-muted);
		transition: background-color 0.2s ease, box-shadow 0.2s ease;
	}

	.status-dot.active {
		background: var(--accent);
		box-shadow: 0 0 10px cyan; /* Proper glow effect per Aegis design system */
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.status-text {
		font-size: 10px; /* text-[10px] per Aegis design system */
		font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Mono', monospace; /* font-mono */
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: color 0.2s ease;
	}

	.status-text.active {
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
		min-height: 2rem;
		padding: 0.4rem 0.75rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 2px;
		color: var(--text-dim);
		cursor: pointer;
		transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
		font-size: 10px; /* text-[10px] per Aegis design system */
		font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Mono', monospace; /* font-mono */
		text-transform: uppercase;
		letter-spacing: 0.05em;
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

	.btn-icon {
		font-size: 0.75rem;
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
