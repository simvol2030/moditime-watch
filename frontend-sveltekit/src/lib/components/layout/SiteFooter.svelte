<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { FooterSection } from '$lib/types/navigation';
	import { getNavigationHref } from '$lib/types/navigation';

	interface Props extends HTMLAttributes<HTMLElement> {
		footerSections: FooterSection[];
		siteConfig?: Record<string, string>;
	}

	let { footerSections, siteConfig = {}, class: className, ...rest }: Props = $props();

	const phone = $derived(siteConfig.contact_phone || '+7 (495) 120-00-00');
	const email = $derived(siteConfig.contact_email || 'info@moditime-watch.ru');
	const address = $derived(siteConfig.contact_address || 'Москва, Столешников переулок, д. 7/5');
	const workingHours = $derived(siteConfig.working_hours || 'Пн-Пт: 10:00-20:00, Сб: 11:00-18:00');
	const copyright = $derived(siteConfig.copyright_text || `\u00A9 ${new Date().getFullYear()} Moditimewatch. Все права защищены.`);
	const phoneHref = $derived('tel:' + phone.replace(/[\s()-]/g, ''));

	// Найти секцию "Правовая информация" для отображения в футере (bottom)
	const legalSection = $derived(footerSections.find((s) => s.title === 'Правовая информация'));
	// Все секции кроме правовой информации
	const mainSections = $derived(footerSections.filter((s) => s.title !== 'Правовая информация'));
</script>

<footer class="site-footer" {...rest}>
	<div class="container site-footer__grid">
		<div class="site-footer__brand">
			<a class="site-logo" href="/">
				<span class="site-logo__wordmark">Moditimewatch</span>
				<span class="site-logo__tagline">Fine Time Delivery</span>
			</a>
			<p>Сервис доставки оригинальных часов из-за рубежа с гарантией подлинности и персональными консультациями.</p>
			<div class="site-footer__contact">
				<a href={phoneHref}>{phone}</a>
				<a href="mailto:{email}">{email}</a>
			</div>
		</div>
		{#each mainSections as section}
			<div class="site-footer__col">
				<h3>{section.title}</h3>
				{#if section.links.length > 0}
					<ul>
						{#each section.links as link}
							{@const href = getNavigationHref(link)}
							<li>
								<a
									{href}
									target={href.startsWith('http') ? '_blank' : undefined}
									rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					{#if section.title === 'Офис'}
						<p>{address}</p>
						<p>{workingHours}</p>
						<p>Посещение по записи</p>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
	<div class="container site-footer__bottom">
		<p>{copyright}</p>
		{#if legalSection && legalSection.links.length > 0}
			<div class="site-footer__links">
				{#each legalSection.links as link}
					{@const href = getNavigationHref(link)}
					<a {href}>{link.label}</a>
				{/each}
			</div>
		{/if}
	</div>
</footer>

<style>
	/* Footer */
	.site-footer {
		background-color: #f5f7fa;
		color: var(--color-text);
		padding: var(--space-4xl) 0 var(--space-2xl);
		border-top: 1px solid var(--color-border);
	}

	:global(body[data-theme='dark']) .site-footer {
		background-color: var(--color-ink);
		color: rgba(255, 255, 255, 0.86);
		border-top-color: rgba(124, 150, 196, 0.16);
	}

	.site-footer__grid {
		display: grid;
		gap: var(--space-2xl);
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.site-footer__brand p {
		margin-top: var(--space-md);
		max-width: 320px;
		color: var(--color-text-muted);
	}

	:global(body[data-theme='dark']) .site-footer__brand p {
		color: rgba(255, 255, 255, 0.72);
	}

	.site-footer__contact {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-top: var(--space-lg);
		font-weight: 600;
	}

	.site-footer__col h3 {
		font-family: var(--font-accent);
		font-size: var(--font-size-body-sm);
		text-transform: uppercase;
		letter-spacing: 0.25em;
		margin-bottom: var(--space-md);
		color: var(--color-text);
		font-weight: 600;
	}

	:global(body[data-theme='dark']) .site-footer__col h3 {
		color: rgba(255, 255, 255, 0.95);
	}

	.site-footer__col ul {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.site-footer__col a {
		color: var(--color-text-soft);
		transition: color 0.2s ease;
	}

	.site-footer__col a:hover {
		color: var(--color-primary);
	}

	:global(body[data-theme='dark']) .site-footer__col a {
		color: rgba(255, 255, 255, 0.76);
	}

	.site-footer__bottom {
		margin-top: var(--space-3xl);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
		font-size: var(--font-size-body-sm);
	}

	:global(body[data-theme='dark']) .site-footer__bottom {
		border-top-color: rgba(255, 255, 255, 0.1);
	}

	.site-footer__links {
		display: flex;
		gap: var(--space-md);
	}

	.site-footer__links a {
		color: var(--color-text-soft);
		transition: color 0.2s ease;
	}

	.site-footer__links a:hover {
		color: var(--color-primary);
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.site-footer__grid {
			text-align: center;
		}

		.site-footer__brand {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.site-footer__brand p {
			max-width: 100%;
		}

		.site-footer__contact {
			align-items: center;
		}

		.site-footer__col {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.site-footer__col ul {
			align-items: center;
		}

		.site-footer__bottom {
			flex-direction: column;
			text-align: center;
			gap: var(--space-lg);
		}

		.site-footer__links {
			flex-direction: column;
			gap: var(--space-sm);
		}
	}
</style>
