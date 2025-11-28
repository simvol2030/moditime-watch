<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { onMount } from 'svelte';

	interface Props extends HTMLButtonAttributes {
		compact?: boolean;
	}

	let {
		compact = false,
		class: className,
		...rest
	}: Props = $props();

	const classes = $derived([
		'theme-toggle',
		{ 'theme-toggle--compact': compact },
		className
	]);

	let theme = $state<'light' | 'dark'>('light');
	let mounted = $state(false);

	onMount(() => {
		// Читаем сохраненную тему из localStorage
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		theme = savedTheme || (prefersDark ? 'dark' : 'light');
		applyTheme(theme);
		mounted = true;
	});

	function applyTheme(newTheme: 'light' | 'dark') {
		document.body.setAttribute('data-theme', newTheme);
	}

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		applyTheme(theme);
	}
</script>

<button
	class={classes}
	onclick={toggleTheme}
	aria-label="Переключить тему"
	aria-pressed={theme === 'dark'}
	{...rest}
>
	{#if mounted}
		<svg class="theme-toggle__icon theme-toggle__icon--sun" class:active={theme === 'light'} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
		</svg>

		<svg class="theme-toggle__icon theme-toggle__icon--moon" class:active={theme === 'dark'} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
		</svg>

		{#if !compact}
			<span class="theme-toggle__text">
				{theme === 'light' ? 'Светлая' : 'Темная'}
			</span>
		{/if}
	{/if}
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-family: var(--font-secondary, -apple-system, sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		background: var(--color-surface, #f5f5f5);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--border-radius-md, 0.5rem);
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--color-text, #1a1a1a);
	}

	.theme-toggle:hover {
		background: var(--color-border, #e5e5e5);
		border-color: var(--color-text, #1a1a1a);
	}

	.theme-toggle--compact {
		padding: 0.5rem;
		width: 2.5rem;
		height: 2.5rem;
		justify-content: center;
	}

	.theme-toggle__icon {
		width: 1.25rem;
		height: 1.25rem;
		fill: currentColor;
		opacity: 0.3;
		transition: opacity 0.2s ease;
	}

	.theme-toggle__icon.active {
		opacity: 1;
	}

	.theme-toggle__text {
		line-height: 1;
	}

	/* Скрываем неактивную иконку в компактном режиме */
	.theme-toggle--compact .theme-toggle__icon:not(.active) {
		display: none;
	}
</style>
