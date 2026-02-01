<script lang="ts">
	import { getNavigationHref } from '$lib/types/navigation';

	let {
		siteConfig = {},
		legalLinks = []
	}: {
		siteConfig?: Record<string, string>;
		legalLinks?: { label: string; href: string; isMainDomainOnly?: boolean }[];
	} = $props();

	const phone = $derived(siteConfig.contact_phone || '+7 (495) 120-00-00');
	const email = $derived(siteConfig.contact_email || 'info@moditime-watch.ru');
	const copyright = $derived(siteConfig.copyright_text || `\u00A9 ${new Date().getFullYear()} Moditimewatch. Все права защищены.`);
	const phoneHref = $derived('tel:' + phone.replace(/[\s()-]/g, ''));
	const telegram = $derived(siteConfig.social_telegram || 'https://t.me/moditimewatch');
</script>

<footer class="city-footer">
	<div class="container city-footer__content">
		<div class="city-footer__brand">
			<a class="site-logo" href="/">
				<span class="site-logo__wordmark">Moditimewatch</span>
				<span class="site-logo__tagline">Fine Time Delivery</span>
			</a>
		</div>

		<div class="city-footer__contacts">
			<a href={phoneHref} class="city-footer__link">{phone}</a>
			<a href="mailto:{email}" class="city-footer__link">{email}</a>
			<a href={telegram} target="_blank" rel="noopener noreferrer" class="city-footer__link">Telegram</a>
		</div>

		<div class="city-footer__catalog">
			<a href="/" class="city-footer__catalog-link">Перейти на главный каталог &rarr;</a>
		</div>
	</div>

	<div class="container city-footer__bottom">
		<p>{copyright}</p>
		{#if legalLinks.length > 0}
			<div class="city-footer__legal">
				{#each legalLinks as link}
					{@const href = getNavigationHref(link)}
					<a {href}>{link.label}</a>
				{/each}
			</div>
		{/if}
	</div>
</footer>

<style>
	.city-footer {
		background-color: #f5f7fa;
		color: var(--color-text);
		padding: var(--space-2xl) 0 var(--space-lg);
		border-top: 1px solid var(--color-border);
	}

	:global(body[data-theme='dark']) .city-footer {
		background-color: var(--color-ink);
		color: rgba(255, 255, 255, 0.86);
		border-top-color: rgba(124, 150, 196, 0.16);
	}

	.city-footer__content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-xl);
		flex-wrap: wrap;
	}

	.site-logo {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: var(--color-text);
	}

	.site-logo__wordmark {
		font-family: var(--font-accent);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.site-logo__tagline {
		font-size: 0.5625rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		opacity: 0.6;
		margin-top: 2px;
	}

	.city-footer__contacts {
		display: flex;
		gap: var(--space-lg);
	}

	.city-footer__link {
		color: var(--color-text-soft);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color var(--transition-fast);
	}

	.city-footer__link:hover {
		color: var(--color-primary);
	}

	.city-footer__catalog-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
		transition: color var(--transition-fast);
	}

	.city-footer__catalog-link:hover {
		text-decoration: underline;
	}

	.city-footer__bottom {
		margin-top: var(--space-lg);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	:global(body[data-theme='dark']) .city-footer__bottom {
		border-top-color: rgba(255, 255, 255, 0.1);
	}

	.city-footer__legal {
		display: flex;
		gap: var(--space-md);
	}

	.city-footer__legal a {
		color: var(--color-text-soft);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.city-footer__legal a:hover {
		color: var(--color-primary);
	}

	@media (max-width: 768px) {
		.city-footer__content {
			flex-direction: column;
			text-align: center;
			gap: var(--space-md);
		}

		.city-footer__contacts {
			flex-direction: column;
			gap: var(--space-xs);
		}

		.city-footer__bottom {
			flex-direction: column;
			text-align: center;
			gap: var(--space-sm);
		}

		.city-footer__legal {
			flex-direction: column;
			gap: var(--space-xs);
		}
	}
</style>
