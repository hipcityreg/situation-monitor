<script lang="ts">
	import { alerts, allNewsItems } from '$lib/stores';
	import type { NewsItem } from '$lib/types';

	const items = $derived(
		$alerts.length > 0
			? $alerts
			: [...$allNewsItems].sort((a: NewsItem, b: NewsItem) => b.timestamp - a.timestamp).slice(
					0,
					5
			  )
	);

	const hasItems = $derived(items.length > 0);
</script>

{#if hasItems}
	<div class="breaking-news">
		<div class="breaking-inner">
			<div class="breaking-label">
				<span class="pulse-dot" aria-hidden="true"></span>
				<span class="label-text">Breaking News</span>
			</div>

			<div class="ticker-wrapper">
				<div class="ticker-track">
					<div class="ticker-content">
						{#each items as item (item.id)}
							<a
								class="headline"
								href={item.link}
								target="_blank"
								rel="noopener noreferrer"
								title={item.title}
							>
								{item.title}
							</a>
						{/each}
					</div>

					<div class="ticker-content" aria-hidden="true">
						{#each items as item (item.id + '-dup')}
							<a
								class="headline"
								href={item.link}
								target="_blank"
								rel="noopener noreferrer"
								title={item.title}
							>
								{item.title}
							</a>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.breaking-news {
		background: rgba(127, 29, 29, 0.3);
		border-top: 1px solid rgba(248, 113, 113, 0.85);
		border-bottom: 1px solid rgba(248, 113, 113, 0.85);
		color: #fee2e2;
		font-size: 0.7rem;
		margin: 0.5rem 1rem 0;
	}

	.breaking-inner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 0.75rem;
		min-height: 2.25rem;
		max-width: 2000px;
		margin: 0 auto;
		overflow: hidden;
	}

	.breaking-label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		flex-shrink: 0;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-weight: 700;
		color: #fee2e2;
	}

	.pulse-dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 999px;
		background: #ef4444;
		box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8);
		animation: pulse 1.4s ease-out infinite;
	}

	.label-text {
		white-space: nowrap;
	}

	.ticker-wrapper {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	.ticker-track {
		display: flex;
		width: max-content;
		animation: ticker-scroll 30s linear infinite;
	}

	.breaking-news:hover .ticker-track {
		animation-play-state: paused;
	}

	.ticker-content {
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	.headline {
		display: inline-flex;
		align-items: center;
		color: #fef2f2;
		text-decoration: none;
		padding-right: 1.5rem;
	}

	.headline:hover {
		color: #ffffff;
		text-decoration: underline;
	}

	.headline + .headline::before {
		content: '•';
		margin-right: 0.75rem;
		color: #fecaca;
	}

	:global([data-theme='light']) .breaking-news {
		background: rgba(127, 29, 29, 0.08);
		border-top-color: rgba(185, 28, 28, 0.9);
		border-bottom-color: rgba(185, 28, 28, 0.9);
		color: #7f1d1d;
	}

	:global([data-theme='light']) .breaking-label {
		color: #7f1d1d;
	}

	:global([data-theme='light']) .headline {
		color: #991b1b;
	}

	:global([data-theme='light']) .headline + .headline::before {
		color: #dc2626;
	}

	@keyframes ticker-scroll {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8);
		}
		50% {
			transform: scale(1.4);
			box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
		}
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
		}
	}

	@media (max-width: 768px) {
		.breaking-news {
			margin: 0.5rem 0.25rem 0;
		}

		.breaking-inner {
			padding: 0 0.5rem;
			font-size: 0.65rem;
		}

		.headline {
			padding-right: 1rem;
		}
	}
</style>

