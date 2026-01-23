<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { timeAgo } from '$lib/utils';
	import { _ } from 'svelte-i18n';
	import { settings } from '$lib/stores/settings';
	import { translate } from '$lib/services/translation';

	interface Layoff {
		company: string;
		count?: string | number;
		title: string;
		date: string;
	}

	interface Props {
		layoffs?: Layoff[];
		loading?: boolean;
		error?: string | null;
	}

	let { layoffs = [], loading = false, error = null }: Props = $props();

	const count = $derived(layoffs.length);

	// Translation settings
	const currentLocale = $derived(settings.getLocale());
	const autoTranslate = $derived(settings.getAutoTranslate());
	const shouldTranslate = $derived(currentLocale === 'zh' && autoTranslate);

	// Track translated titles
	let translations = $state<Record<string, string>>({});
	let pending = $state<Record<string, boolean>>({});

	// Get translated title
	function getTranslatedTitle(id: string, original: string): string {
		if (!shouldTranslate) return original;
		return translations[id] || original;
	}

	// Translate a single item
	async function translateItem(id: string, text: string) {
		if (translations[id] || pending[id]) return;
		
		pending = { ...pending, [id]: true };
		
		try {
			const translated = await translate(text, 'zh');
			translations = { ...translations, [id]: translated };
		} catch {
			// Keep original on error
		} finally {
			const { [id]: _, ...rest } = pending;
			pending = rest;
		}
	}

	// Translate all items when conditions are met
	$effect(() => {
		if (!shouldTranslate || layoffs.length === 0) return;

		let delay = 0;
		for (let i = 0; i < layoffs.length; i++) {
			const layoff = layoffs[i];
			const id = `${layoff.company}-${i}`;
			if (!translations[id] && !pending[id]) {
				setTimeout(() => translateItem(id, layoff.title), delay);
				delay += 200;
			}
		}
	});
</script>

<Panel id="layoffs" title={$_('panels.layoffs')} {count} {loading} {error}>
	{#if layoffs.length === 0 && !loading && !error}
		<div class="empty-state">{$_('common.noData')}</div>
	{:else}
		<div class="layoffs-list">
			{#each layoffs as layoff, i (layoff.company + i)}
				{@const id = `${layoff.company}-${i}`}
				<div class="layoff-item">
					<div class="layoff-company">{layoff.company}</div>
					{#if layoff.count}
						<div class="layoff-count">
							{typeof layoff.count === 'string'
								? parseInt(layoff.count).toLocaleString()
								: layoff.count.toLocaleString()} {$_('layoffs.jobs')}
						</div>
					{/if}
					<div class="layoff-meta">
						<span class="headline">{getTranslatedTitle(id, layoff.title)}</span>
						<span class="time">{timeAgo(layoff.date)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.layoffs-list {
		display: flex;
		flex-direction: column;
	}

	.layoff-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.layoff-item:last-child {
		border-bottom: none;
	}

	.layoff-company {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.15rem;
	}

	.layoff-count {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--danger);
		margin-bottom: 0.2rem;
	}

	.layoff-meta {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.headline {
		font-size: 0.6rem;
		color: var(--text-secondary);
		line-height: 1.3;
		flex: 1;
	}

	.time {
		font-size: 0.55rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
