<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '$lib/components/layout/SiteFooter.svelte';
	import { initializeTheme } from '$lib/stores/ui.svelte';
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import type { AnalyticsConfig } from '$lib/types/seo';
	import { PUBLIC_GTM_ID, PUBLIC_GA_ID, PUBLIC_YM_ID } from '$env/static/public';

	// ИСПРАВЛЕНИЕ: Получаем data из load функции!
	let { children, data }: { children, any; data: LayoutData } = $props();

	// Check if current page is admin page
	const isAdminPage = $derived($page.url.pathname.startsWith('/admin'));

	// Analytics config from environment variables (for production)
	const analyticsConfig: AnalyticsConfig | undefined =
		PUBLIC_GTM_ID || PUBLIC_GA_ID || PUBLIC_YM_ID
			? {
					googleTagManagerId: PUBLIC_GTM_ID || undefined,
					googleAnalyticsId: PUBLIC_GA_ID || undefined,
					yandexMetricaId: PUBLIC_YM_ID || undefined
				}
			: undefined;

	// Initialize theme on mount
	onMount(() => {
		initializeTheme();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SeoManager
	seo={{
		title: 'Moditimewatch',
		description: 'Premium watch delivery service',
		canonical: $page.url.href
	}}
	analytics={analyticsConfig}
/>

{#if !isAdminPage}
	<!-- Передаем данные из БД -->
	<SiteHeader navigationItems={data.navigationItems} siteConfig={data.siteConfig} />
{/if}

<main>
	{@render children?.()}
</main>

{#if !isAdminPage}
	<!-- Передаем данные из БД -->
	<SiteFooter footerSections={data.footerSections} siteConfig={data.siteConfig} />
{/if}
