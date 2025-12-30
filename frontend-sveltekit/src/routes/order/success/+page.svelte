<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import { cart } from '$lib/stores/cart.svelte';

	const seo = {
		title: 'Заказ оформлен',
		description: 'Ваш заказ успешно оформлен. Мы свяжемся с вами в ближайшее время.',
		noindex: true
	};

	const features = [
		{
			icon: '📧',
			title: 'Подтверждение на email',
			description: 'Мы отправили детали заказа на вашу почту'
		},
		{
			icon: '👤',
			title: 'Персональный консьерж',
			description: 'С вами свяжется наш эксперт в течение 2 часов'
		},
		{
			icon: '📱',
			title: 'Трекинг в Telegram',
			description: 'Получайте обновления о статусе заказа в реальном времени'
		}
	];

	onMount(() => {
		// Очищаем корзину после успешного заказа
		cart.clear();
	});
</script>

<SeoManager {seo} />

<main class="page-main success-page">
	<Container>
		<div class="success-content">
			<div class="success-icon">✓</div>
			<h1 class="success-title">Заказ успешно оформлен!</h1>
			<p class="success-description">
				Благодарим за выбор Moditimewatch. Ваш заказ принят в обработку, и наш персональный
				консьерж свяжется с вами в ближайшее время для подтверждения деталей.
			</p>

			<div class="success-features">
				{#each features as feature}
					<div class="feature-card">
						<div class="feature-card__icon">{feature.icon}</div>
						<h3 class="feature-card__title">{feature.title}</h3>
						<p class="feature-card__description">{feature.description}</p>
					</div>
				{/each}
			</div>

			<div class="success-info">
				<h2 class="success-info__title">Что дальше?</h2>
				<ol class="success-steps">
					<li>Наш консьерж свяжется с вами для подтверждения заказа</li>
					<li>Мы проверим наличие часов и подтвердим сроки доставки</li>
					<li>После оплаты отправим вам трекинг-номер для отслеживания</li>
					<li>Курьер доставит часы с возможностью примерки перед оплатой</li>
				</ol>
			</div>

			<div class="success-actions">
				<a href="/" class="btn btn-primary">Вернуться на главную</a>
				<a href="/catalog" class="btn btn-ghost">Продолжить покупки</a>
			</div>

			<div class="success-note">
				<p>
					<strong>Нужна помощь?</strong> Свяжитесь с нами через
					<a href="https://t.me/moditimewatch">Telegram</a>
					или по телефону
					<a href="tel:+79999604322">+7 (999) 960-43-22</a>
				</p>
			</div>
		</div>
	</Container>
</main>

<style>
	.success-page {
		min-height: 70vh;
		padding: var(--space-4xl) 0;
		background: linear-gradient(
			160deg,
			var(--color-surface) 0%,
			var(--color-background) 100%
		);
	}

	.success-content {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2xl);
		text-align: center;
	}

	.success-icon {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 72px;
		box-shadow: var(--shadow-lg);
		animation: scale-in 0.5s ease;
	}

	@keyframes scale-in {
		from {
			transform: scale(0);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.success-title {
		font-size: var(--font-size-h1);
		color: var(--color-text);
	}

	.success-description {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
		max-width: 640px;
	}

	.success-features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-xl);
		width: 100%;
		margin-top: var(--space-xl);
	}

	.feature-card {
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
	}

	.feature-card__icon {
		font-size: 48px;
		line-height: 1;
	}

	.feature-card__title {
		font-size: var(--font-size-h4);
	}

	.feature-card__description {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
	}

	.success-info {
		width: 100%;
		max-width: 640px;
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-2xl);
		text-align: left;
		margin-top: var(--space-xl);
	}

	.success-info__title {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-lg);
		text-align: center;
	}

	.success-steps {
		list-style: none;
		counter-reset: step;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: 0;
		margin: 0;
	}

	.success-steps li {
		counter-increment: step;
		position: relative;
		padding-left: var(--space-2xl);
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
	}

	.success-steps li::before {
		content: counter(step);
		position: absolute;
		left: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background-color: var(--color-primary);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: var(--font-size-body-sm);
	}

	.success-actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		justify-content: center;
		margin-top: var(--space-xl);
	}

	.success-note {
		padding: var(--space-lg);
		background-color: rgba(10, 36, 99, 0.06);
		border-radius: var(--radius-lg);
		font-size: var(--font-size-body-sm);
		margin-top: var(--space-xl);
	}

	body[data-theme='dark'] .success-note {
		background-color: rgba(62, 146, 204, 0.12);
	}

	.success-note a {
		color: var(--color-primary);
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.success-actions {
			flex-direction: column;
			width: 100%;
		}

		.success-actions .btn {
			width: 100%;
		}

		.success-features {
			grid-template-columns: 1fr;
		}
	}
</style>
