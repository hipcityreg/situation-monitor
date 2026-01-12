<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { fetchLocalNews } from '$lib/api';
	import { localNews } from '$lib/stores';

	const { items, loading, error, location } = $derived($localNews);

	let city = $state(location?.city ?? '');
	let region = $state(location?.state ?? '');
	let initialFetchDone = $state(false);

	$effect(() => {
		if (!location) return;
		if (city !== location.city) city = location.city;
		if (region !== location.state) region = location.state;
	});

	$effect(() => {
		if (initialFetchDone) return;
		if (!location || items.length > 0 || loading) return;
		initialFetchDone = true;
		void runFetch(location);
	});

	const count = $derived(items.length);
	const locationLabel = $derived(
		location ? [location.city, location.state].filter(Boolean).join(', ') : ''
	);

	async function runFetch(nextLocation: { city: string; state: string }) {
		localNews.setLoading(true);
		try {
			const data = await fetchLocalNews(nextLocation);
			localNews.setItems(data);
		} catch (err) {
			localNews.setError(err instanceof Error ? err.message : String(err));
		}
	}

	async function applyLocation() {
		const cityValue = city.trim();
		const stateValue = region.trim();

		if (!cityValue && !stateValue) {
			localNews.setError('Enter a city or state to load local news.');
			return;
		}

		const nextLocation = { city: cityValue, state: stateValue };
		localNews.setLocation(nextLocation);
		initialFetchDone = true;
		await runFetch(nextLocation);
	}

	async function refresh() {
		if (location) {
			initialFetchDone = true;
			await runFetch(location);
			return;
		}
		await applyLocation();
	}
</script>

<Panel id="local" title="Local News" {count} {loading} {error} header={header} actions={actions}>
	{#if !locationLabel && !loading && !error}
		<div class="empty-state">Set a city/state to load local news.</div>
	{:else if items.length === 0 && !loading && !error}
		<div class="empty-state">No local news available</div>
	{:else}
		<div class="news-list">
			{#each items.slice(0, 15) as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

{#snippet header()}
	<div class="filter-row">
		<input class="filter-input" placeholder="City" bind:value={city} />
		<input class="filter-input" placeholder="State" bind:value={region} />
		<button class="filter-button" type="button" onclick={applyLocation}>
			Apply
		</button>
	</div>
	{#if locationLabel}
		<div class="current-location">Current: {locationLabel}</div>
	{/if}
{/snippet}

{#snippet actions()}
	<button class="refresh-button" type="button" onclick={refresh} disabled={loading}>
		Refresh
	</button>
{/snippet}

<style>
	.filter-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.35rem;
	}

	.filter-input {
		flex: 1 1 6rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-primary);
		font-size: 0.6rem;
		padding: 0.25rem 0.4rem;
	}

	.filter-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.filter-button,
	.refresh-button {
		background: var(--border);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-primary);
		font-size: 0.55rem;
		padding: 0.25rem 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.filter-button:hover,
	.refresh-button:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.refresh-button:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.current-location {
		margin-top: 0.25rem;
		font-size: 0.55rem;
		color: var(--text-secondary);
	}

	.news-list {
		display: flex;
		flex-direction: column;
	}

	.empty-state {
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>
