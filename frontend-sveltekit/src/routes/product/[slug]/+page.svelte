<script lang="ts">
	// SEO
	import SeoManager from '$lib/components/seo/SeoManager.svelte';

	// Поток 1: Hero компоненты
	import Breadcrumbs from '$lib/components/ui/Breadcrumbs.svelte';
	import ProductGallery from '$lib/components/sections/ProductGallery.svelte';
	import ProductSummary from '$lib/components/sections/ProductSummary.svelte';

	// Поток 2: Контент компоненты
	import ProductHighlights from '$lib/components/sections/ProductHighlights.svelte';
	import ProductSpecs from '$lib/components/sections/ProductSpecs.svelte';
	import ProductTabs from '$lib/components/sections/ProductTabs.svelte';

	// Поток 3: Отзывы, рекомендации, сервисы
	import ProductReviews from '$lib/components/sections/ProductReviews.svelte';
	import Recommendations from '$lib/components/sections/Recommendations.svelte';
	import ProductServices from '$lib/components/sections/ProductServices.svelte';

	import TelegramCtaSection from '$lib/components/sections/TelegramCtaSection.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoManager seo={data.seo} />

<main class="page-main product-page">
	<!-- Поток 1: Hero секция -->
	<Breadcrumbs items={data.breadcrumbs} />

	<section class="product-hero">
		<div class="container product-hero__grid">
			<ProductGallery {...data.galleryContent} />
			<ProductSummary {...data.summaryContent} />
		</div>
	</section>

	<!-- Поток 2: Контент секции -->
	<ProductHighlights highlights={data.highlights} />
	<ProductSpecs groups={data.specGroups} />
	<ProductTabs tabs={data.tabs} />

	<!-- Поток 3: Отзывы, рекомендации, сервисы -->
	<ProductReviews {...data.reviewsContent} />
	<Recommendations {...data.recommendationsContent} />
	<ProductServices {...data.servicesContent} />

	<TelegramCtaSection {...data.telegramContent} />
</main>

<style>
	/* Product Hero Grid */
	.product-hero {
		padding: var(--space-2xl) 0;
	}

	.product-hero__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3xl);
		align-items: start;
	}

	/* Mobile: Stack vertically */
	@media (max-width: 991px) {
		.product-hero__grid {
			grid-template-columns: 1fr;
			gap: var(--space-2xl);
		}
	}
</style>
