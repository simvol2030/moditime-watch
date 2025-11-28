<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		open?: boolean;
	}

	let { open = $bindable(false), class: className, ...rest }: Props = $props();

	let overlayElement = $state<HTMLDivElement | null>(null);
	let inputElement = $state<HTMLInputElement | null>(null);

	function closeOverlay() {
		open = false;
	}

	function fillSearch(query: string) {
		if (inputElement) {
			inputElement.value = query;
			inputElement.focus();
		}
	}

	$effect(() => {
		if (overlayElement) {
			overlayElement.setAttribute('data-open', String(open));
			overlayElement.setAttribute('aria-hidden', String(!open));
		}

		// Focus input when opened
		if (open && inputElement) {
			setTimeout(() => inputElement?.focus(), 100);
		}

		// Prevent body scroll when overlay is open
		if (typeof document !== 'undefined') {
			if (open) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	});

	onMount(() => {
		return () => {
			if (typeof document !== 'undefined') {
				document.body.style.overflow = '';
			}
		};
	});
</script>

<div class="search-overlay" bind:this={overlayElement} {...rest}>
	<div class="search-overlay__backdrop" onclick={closeOverlay}></div>
	<div class="search-overlay__panel">
		<div class="search-overlay__top">
			<h2>Поиск по каталогу</h2>
			<button class="icon-button" type="button" onclick={closeOverlay} aria-label="Закрыть поиск">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>
		<form class="search-overlay__form" role="search">
			<div class="search-overlay__field">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="9.5" cy="9.5" r="6.5" stroke="currentColor" stroke-width="1.6"/>
					<path d="M17 17L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
				</svg>
				<input
					bind:this={inputElement}
					type="search"
					name="query"
					placeholder="Найти модель, бренд или коллекцию"
					autocomplete="off"
					required
				>
			</div>
			<button class="btn btn-primary" type="submit">Искать</button>
		</form>
		<div class="search-overlay__suggestions">
			<p>Популярные запросы</p>
			<div class="search-overlay__tags" role="list">
				<button type="button" onclick={() => fillSearch('Rolex Submariner')}>Rolex Submariner</button>
				<button type="button" onclick={() => fillSearch('Patek Philippe Grand Complications')}>Patek Philippe Grand Complications</button>
				<button type="button" onclick={() => fillSearch('Audemars Piguet Royal Oak')}>Audemars Piguet Royal Oak</button>
				<button type="button" onclick={() => fillSearch('Часы на подарок')}>Часы на подарок</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* Search overlay */
	.search-overlay {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		opacity: 0;
		transition: opacity var(--transition-normal);
		z-index: var(--overlay-z);
	}

	.search-overlay[data-open="true"] {
		opacity: 1;
		pointer-events: auto;
	}

	.search-overlay__backdrop {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.search-overlay__panel {
		position: relative;
		width: min(90vw, 720px);
		background-color: var(--color-background);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		max-height: 90vh;
		overflow: hidden;
	}

	.search-overlay__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.search-overlay__form {
		display: flex;
		gap: var(--space-sm);
	}

	.search-overlay__field {
		position: relative;
		flex: 1;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: 0 var(--space-md);
		background-color: var(--color-surface);
	}

	.search-overlay__field input {
		flex: 1;
		padding: 16px 0;
		border: none;
		background: none;
		color: var(--color-text);
		font-size: var(--font-size-body-lg);
	}

	.search-overlay__field input:focus {
		outline: none;
	}

	.search-overlay__suggestions {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.search-overlay__tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.search-overlay__tags button {
		padding: 10px 18px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		cursor: pointer;
		transition: background-color var(--transition-fast), color var(--transition-fast);
	}

	.search-overlay__tags button:hover {
		background-color: var(--color-primary);
		color: #fff;
	}
</style>
