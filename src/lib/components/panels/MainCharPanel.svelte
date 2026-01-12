<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { allNewsItems } from '$lib/stores';
	import { calculateMainCharacter, type MainCharacterResults } from '$lib/analysis';

	// Calculate main character from all news (reactive via derived store)
	const results: MainCharacterResults = $derived(calculateMainCharacter($allNewsItems));
	const topChar = $derived(results.topCharacter);
	const rankings = $derived(results.characters);
</script>

<Panel id="mainchar" title="Main Character">
	{#if !topChar}
		<div class="empty-state">No data yet</div>
	{:else}
		<div class="main-char-display">
			<div class="main-char-label">Today's Main Character</div>
			<div class="main-char-name">{topChar.name}</div>
			<div class="main-char-count">{topChar.count} mentions in headlines</div>

			{#if rankings.length > 1}
				<div class="main-char-list">
					{#each rankings.slice(1, 8) as char, i (char.name)}
						<div class="char-row">
							<span class="rank">{i + 2}.</span>
							<span class="name">{char.name}</span>
							<span class="mentions">{char.count}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</Panel>

<style>
	.main-char-display {
		text-align: center;
		padding: 0.5rem;
	}

	.main-char-label {
		font-size: 0.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		margin-bottom: 0.5rem;
	}

	.main-char-name {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 0.25rem;
		text-shadow: 0 0 20px var(--accent-glow);
	}

	.main-char-count {
		font-size: 0.5625rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-dim);
		margin-bottom: 1rem;
	}

	.main-char-list {
		border-top: 1px solid var(--border-divider);
		padding-top: 0.75rem;
	}

	.char-row {
		display: flex;
		align-items: center;
		padding: 0.25rem 0;
		font-size: 0.625rem;
	}

	.rank {
		width: 1.5rem;
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-muted);
	}

	.name {
		flex: 1;
		color: var(--text);
	}

	.mentions {
		font-family: 'SF Mono', Monaco, monospace;
		color: var(--text-dim);
		font-variant-numeric: tabular-nums;
	}

	.empty-state {
		text-align: center;
		color: var(--text-dim);
		font-size: 0.65rem;
		padding: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>
