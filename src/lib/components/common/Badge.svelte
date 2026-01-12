<script lang="ts">
	interface Props {
		text: string;
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'critical' | 'neutral';
		size?: 'sm' | 'md';
	}

	let { text, variant = 'default', size = 'sm' }: Props = $props();

	// Map variants to CSS classes (critical = danger for backward compat)
	const variantClass = $derived(variant === 'critical' ? 'danger' : variant);
</script>

<span class="badge {variantClass} {size}">{text}</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 2px;
		border: 1px solid;
	}

	.sm {
		font-size: 0.5625rem;
		padding: 0.125rem 0.375rem;
	}

	.md {
		font-size: 0.625rem;
		padding: 0.15rem 0.4rem;
	}

	/* Neutral (default) - Slate */
	.default,
	.neutral {
		background: rgba(51, 65, 85, 0.5);
		color: var(--text-dim);
		border-color: rgba(51, 65, 85, 0.5);
	}

	/* Success - Emerald */
	.success {
		background: var(--success-bg);
		color: var(--success);
		border-color: var(--success-border);
	}

	/* Warning - Amber */
	.warning {
		background: var(--warning-bg);
		color: var(--warning);
		border-color: var(--warning-border);
	}

	/* Danger/Critical - Red */
	.danger {
		background: var(--critical-bg);
		color: var(--danger);
		border-color: var(--critical-border);
	}

	/* Info - Cyan */
	.info {
		background: rgba(34, 211, 238, 0.1);
		color: var(--accent);
		border-color: var(--accent-border);
	}
</style>
