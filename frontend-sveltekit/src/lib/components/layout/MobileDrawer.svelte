<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount } from 'svelte';

	interface Props extends HTMLAttributes<HTMLElement> {
		open?: boolean;
	}

	let { open = $bindable(false), class: className, ...rest }: Props = $props();

	let drawerElement = $state<HTMLElement | null>(null);
	let backdropElement = $state<HTMLElement | null>(null);

	function closeDrawer() {
		open = false;
	}

	$effect(() => {
		if (drawerElement) {
			drawerElement.setAttribute('aria-hidden', String(!open));
		}
		if (backdropElement) {
			backdropElement.setAttribute('data-active', String(open));
		}

		// Prevent body scroll when drawer is open
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

<aside class="mobile-drawer" id="mobile-menu" bind:this={drawerElement} {...rest}>
	<div class="mobile-drawer__header">
		<span>Меню</span>
		<button class="mobile-drawer__close" type="button" aria-label="Закрыть меню" onclick={closeDrawer}>
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M14 4L4 14M4 4L14 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
	</div>
	<div class="mobile-drawer__body">
		<form class="mobile-search" role="search">
			<input class="input-field" type="search" name="q" placeholder="Поиск часов или брендов" autocomplete="off">
			<button class="mobile-search__submit" type="submit">Искать</button>
		</form>
		<nav class="mobile-nav" aria-label="Мобильное меню">
			<details open>
				<summary>Каталог</summary>
				<div class="mobile-nav__group">
					<h4>Мужские</h4>
					<a href="#">Классические</a>
					<a href="#">Спортивные</a>
					<a href="#">Деловые</a>
					<a href="#">Лимитированные серии</a>
				</div>
				<div class="mobile-nav__group">
					<h4>Женские</h4>
					<a href="#">Ювелирные</a>
					<a href="#">Минималистичные</a>
					<a href="#">Смарт-хронографы</a>
					<a href="#">На кожаном ремне</a>
				</div>
			</details>
			<a href="#collections">Коллекции</a>
			<a href="#bestsellers">Бестселлеры</a>
			<a href="#services">Сервис</a>
			<a href="#editorial">Журнал</a>
			<a href="#telegram">Telegram-канал</a>
		</nav>
		<div class="mobile-drawer__services">
			<h4>Консьерж-сервис</h4>
			<p>Подбор модели за 24 часа, поиск лимитированных коллекций, эксклюзивные предложения.</p>
			<a href="#" class="btn btn-light btn-small">Оставить заявку</a>
		</div>
	</div>
	<div class="mobile-drawer__footer">
		<div>
			<span class="mobile-drawer__label">Контакты</span>
			<a href="tel:+74951234567">+7 (495) 123-45-67</a>
			<a href="mailto:info@moditimewatch.com">info@moditimewatch.com</a>
		</div>
		<div>
			<span class="mobile-drawer__label">График</span>
			<p>Пн–Вс: 10:00 — 21:00</p>
		</div>
	</div>
</aside>
<div class="drawer-backdrop" bind:this={backdropElement} onclick={closeDrawer}></div>

<style>
	/* Mobile drawer */
	.mobile-drawer {
		position: fixed;
		inset: 0 0 0 auto;
		width: min(100%, 360px);
		background-color: var(--color-background);
		transform: translateX(100%);
		transition: transform var(--transition-normal) ease;
		z-index: var(--drawer-z);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.mobile-drawer[aria-hidden="false"] {
		transform: translateX(0);
	}

	.mobile-drawer__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg) var(--space-lg) var(--space-md);
		border-bottom: 1px solid var(--color-border);
	}

	.mobile-drawer__body {
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.mobile-search {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-sm);
	}

	.mobile-search__submit {
		padding: 0 var(--space-md);
		border-radius: var(--radius-lg);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: #fff;
		font-weight: 600;
	}

	.mobile-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		font-size: var(--font-size-body-lg);
	}

	.mobile-nav a {
		color: var(--color-text);
	}

	.mobile-nav details {
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		padding: var(--space-md);
	}

	.mobile-nav summary {
		cursor: pointer;
		font-weight: 600;
	}

	.mobile-nav__group {
		margin-top: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.mobile-nav__group h4 {
		margin: 0;
		font-size: var(--font-size-body-sm);
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-text-muted);
	}

	.mobile-drawer__services {
		padding: var(--space-lg);
		border-radius: var(--radius-xl);
		background-color: var(--color-surface);
		box-shadow: var(--shadow-xs);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.mobile-drawer__footer {
		padding: var(--space-lg);
		border-top: 1px solid var(--color-border);
		display: grid;
		gap: var(--space-md);
		font-size: var(--font-size-body-sm);
		background-color: var(--color-surface);
	}

	.mobile-drawer__label {
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-text-muted);
		display: block;
		margin-bottom: var(--space-xs);
	}

	.drawer-backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.4);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--transition-normal);
		z-index: var(--backdrop-z);
	}

	.drawer-backdrop[data-active="true"] {
		opacity: 1;
		pointer-events: auto;
	}
</style>
