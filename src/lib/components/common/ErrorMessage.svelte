<script lang="ts">
	interface Props {
		message: string;
		retry?: () => void;
	}

	let { message, retry }: Props = $props();
</script>

<div class="error-container">
	<div class="error-icon">⚠</div>
	<div class="error-message">{message}</div>
	{#if retry}
		<button class="retry-btn" onclick={retry}>RETRY</button>
	{/if}
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		gap: 0.5rem;
		text-align: center;
		background: var(--critical-bg);
		border: 1px solid var(--critical-border);
		border-radius: 2px;
		margin: 0.5rem;
	}

	.error-icon {
		font-size: 1.25rem;
		color: var(--danger);
	}

	.error-message {
		font-size: 0.65rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--danger);
	}

	.retry-btn {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		font-weight: 700;
		padding: 0.35rem 0.75rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 2px;
		color: var(--text-dim);
		cursor: pointer;
		transition: all 0.15s ease;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.retry-btn:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
