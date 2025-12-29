<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { SeoProps, AnalyticsConfig } from '$lib/types/seo';

	interface Props {
		seo: SeoProps;
		analytics?: AnalyticsConfig;
	}

	let { seo, analytics }: Props = $props();

	// Default values
	const siteName = 'Moditimewatch';
	const siteUrl = 'https://moditime-watch.ru';
	const defaultImage = `${siteUrl}/og-image.jpg`;

	// Convert relative URLs to absolute
	function toAbsoluteUrl(url: string | undefined, fallback: string): string {
		if (!url) return fallback;
		if (url.startsWith('http://') || url.startsWith('https://')) return url;
		return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
	}

	// Derived values
	const title = $derived(seo.title ? `${seo.title} | ${siteName}` : siteName);
	const description = $derived(seo.description);
	const canonical = $derived(seo.canonical || $page.url.href);
	const ogImage = $derived(toAbsoluteUrl(seo.openGraph?.image, defaultImage));
	const ogUrl = $derived(seo.openGraph?.url || $page.url.href);

	/**
	 * Safely serialize JSON-LD data, escaping closing script tags to prevent XSS
	 */
	function safeJsonLd(obj: Record<string, unknown>): string {
		// Replace </ with <\/ to prevent script tag injection
		return JSON.stringify(obj).replace(/<\//g, '<\\/');
	}

	/**
	 * Validate Google Tag Manager ID format (GTM-XXXXXX)
	 */
	function isValidGtmId(id: string): boolean {
		return /^GTM-[A-Z0-9]+$/i.test(id);
	}

	/**
	 * Validate Google Analytics ID format (G-XXXXXX or UA-XXXXX-X)
	 */
	function isValidGaId(id: string): boolean {
		return /^G-[A-Z0-9]+$/i.test(id) || /^UA-\d+-\d+$/.test(id);
	}

	/**
	 * Validate Yandex Metrika ID format (numeric)
	 */
	function isValidMetrikaId(id: string): boolean {
		return /^\d+$/.test(id);
	}

	// JSON-LD generation
	const schemaOrgData = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: siteName,
			url: $page.url.origin,
			logo: `${$page.url.origin}/logo.png`
		},
		...(seo.breadcrumbs
			? [
					{
						'@context': 'https://schema.org',
						'@type': 'BreadcrumbList',
						itemListElement: seo.breadcrumbs.map((item, index) => ({
							'@type': 'ListItem',
							position: index + 1,
							name: item.name,
							item: item.item.startsWith('http') ? item.item : `${$page.url.origin}${item.item}`
						}))
					}
			  ]
			: []),
		...(Array.isArray(seo.jsonLd) ? seo.jsonLd : seo.jsonLd ? [seo.jsonLd] : [])
	]);

	// Async analytics loading via onMount (client-side only)
	// Note: Analytics scripts are intentionally NOT cleaned up on unmount
	// because they should persist throughout the user session for accurate tracking
	onMount(() => {
		// Google Tag Manager
		if (analytics?.googleTagManagerId && isValidGtmId(analytics.googleTagManagerId)) {
			loadGTM(analytics.googleTagManagerId);
		} else if (analytics?.googleTagManagerId) {
			console.warn('[SEO] Invalid GTM ID format:', analytics.googleTagManagerId);
		}

		// Google Analytics
		if (analytics?.googleAnalyticsId && isValidGaId(analytics.googleAnalyticsId)) {
			loadGA(analytics.googleAnalyticsId);
		} else if (analytics?.googleAnalyticsId) {
			console.warn('[SEO] Invalid GA ID format:', analytics.googleAnalyticsId);
		}

		// Yandex Metrika
		if (analytics?.yandexMetricaId && isValidMetrikaId(analytics.yandexMetricaId)) {
			loadYandexMetrika(analytics.yandexMetricaId);
		} else if (analytics?.yandexMetricaId) {
			console.warn('[SEO] Invalid Yandex Metrika ID format:', analytics.yandexMetricaId);
		}
	});

	/**
	 * Load Google Tag Manager asynchronously
	 */
	function loadGTM(gtmId: string): void {
		// Skip if already loaded
		if (document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)) {
			return;
		}

		// Initialize dataLayer
		(window as any).dataLayer = (window as any).dataLayer || [];
		(window as any).dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

		// Create and inject script
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
		document.head.appendChild(script);
	}

	/**
	 * Load Google Analytics 4 asynchronously
	 */
	function loadGA(gaId: string): void {
		// Skip if already loaded
		if (document.querySelector(`script[src*="gtag/js?id=${gaId}"]`)) {
			return;
		}

		// Load gtag.js
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
		document.head.appendChild(script);

		// Initialize gtag
		(window as any).dataLayer = (window as any).dataLayer || [];
		function gtag(...args: any[]) {
			(window as any).dataLayer.push(args);
		}
		(window as any).gtag = gtag;
		gtag('js', new Date());
		gtag('config', gaId);
	}

	/**
	 * Load Yandex Metrika asynchronously
	 */
	function loadYandexMetrika(metrikaId: string): void {
		// Skip if already loaded
		if ((window as any)[`yaCounter${metrikaId}`]) {
			return;
		}

		// Initialize ym function
		(window as any).ym =
			(window as any).ym ||
			function (...args: any[]) {
				((window as any).ym.a = (window as any).ym.a || []).push(args);
			};
		(window as any).ym.l = Date.now();

		// Load Yandex Metrika script
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://mc.yandex.ru/metrika/tag.js';
		document.head.appendChild(script);

		// Initialize counter after script loads
		script.onload = () => {
			(window as any).ym(metrikaId, 'init', {
				clickmap: true,
				trackLinks: true,
				accurateTrackBounce: true,
				webvisor: true
			});
		};
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	{#if seo.noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:site_name" content={seo.openGraph?.siteName || siteName} />
	<meta property="og:type" content={seo.openGraph?.type || 'website'} />
	<meta property="og:title" content={seo.openGraph?.title || title} />
	<meta property="og:description" content={seo.openGraph?.description || description} />
	<meta property="og:url" content={ogUrl} />
	<meta property="og:image" content={ogImage} />
	{#if seo.openGraph?.imageAlt}
		<meta property="og:image:alt" content={seo.openGraph.imageAlt} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content={seo.twitter?.card || 'summary_large_image'} />
	<meta name="twitter:title" content={seo.openGraph?.title || title} />
	<meta name="twitter:description" content={seo.openGraph?.description || description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- JSON-LD (using safeJsonLd to prevent XSS via </script> injection) -->
	{#each schemaOrgData as schema}
		{@html `<script type="application/ld+json">${safeJsonLd(schema)}</script>`}
	{/each}
</svelte:head>

<!-- Noscript fallbacks for analytics -->
{#if analytics?.yandexMetricaId}
	<noscript>
		<div>
			<img
				src="https://mc.yandex.ru/watch/{analytics.yandexMetricaId}"
				style="position:absolute; left:-9999px;"
				alt=""
			/>
		</div>
	</noscript>
{/if}

{#if analytics?.googleTagManagerId}
	<noscript>
		<iframe
			src="https://www.googletagmanager.com/ns.html?id={analytics.googleTagManagerId}"
			height="0"
			width="0"
			style="display:none;visibility:hidden"
			title="gtm"
		></iframe>
	</noscript>
{/if}
