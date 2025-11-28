<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData | null } = $props();

	const seo = {
		title: 'Оформление заказа',
		description: 'Оформление заказа в Moditimewatch'
	};

	let isSubmitting = $state(false);

	function formatPrice(price: number) {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			maximumFractionDigits: 0
		}).format(price);
	}

	// Prepare cart data as JSON for hidden input
	let cartJson = $derived(
		JSON.stringify(
			cart.items.map((item) => ({
				id: item.id,
				name: item.name,
				brand: item.brand,
				price: item.price,
				quantity: item.quantity,
				sku: item.sku
			}))
		)
	);
</script>

<SeoManager {seo} />

<main class="page-main checkout-page">
	<div class="container">
		<h1 class="page-title">Оформление заказа</h1>

		{#if cart.items.length === 0}
			<div class="empty-cart">
				<p>Корзина пуста. Добавьте товары для оформления заказа.</p>
				<a href="/catalog" class="btn btn-primary">Перейти в каталог</a>
			</div>
		{:else}
			<div class="checkout-layout">
				<!-- Order Form -->
				<form
					class="checkout-form"
					method="POST"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							if (result.type === 'redirect') {
								// Clear cart on successful order
								cart.clear();
							}
							isSubmitting = false;
							await update();
						};
					}}
				>
					{#if form?.error}
						<div class="form-error" role="alert">
							{form.error}
						</div>
					{/if}

					<!-- Hidden cart data -->
					<input type="hidden" name="cart" value={cartJson} />

					<div class="form-section">
						<h2 class="section-title">Контактные данные</h2>
						<div class="form-group">
							<label for="name">Имя *</label>
							<input
								type="text"
								id="name"
								name="name"
								class="input-field"
								class:input-error={form?.field === 'name'}
								required
								minlength="2"
								placeholder="Как к вам обращаться"
							/>
						</div>
						<div class="form-group">
							<label for="phone">Телефон *</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								class="input-field"
								class:input-error={form?.field === 'phone'}
								required
								minlength="10"
								placeholder="+7 (999) 000-00-00"
							/>
						</div>
						<div class="form-group">
							<label for="email">Email (необязательно)</label>
							<input
								type="email"
								id="email"
								name="email"
								class="input-field"
								placeholder="email@example.com"
							/>
						</div>
					</div>

					<div class="form-section">
						<h2 class="section-title">Доставка</h2>
						<div class="form-group">
							<label for="address">Адрес доставки *</label>
							<input
								type="text"
								id="address"
								name="address"
								class="input-field"
								class:input-error={form?.field === 'address'}
								required
								minlength="5"
								placeholder="Город, улица, дом, квартира"
							/>
						</div>
						<div class="form-group">
							<label for="comment">Комментарий к заказу</label>
							<textarea
								id="comment"
								name="comment"
								class="input-field"
								rows="3"
								placeholder="Код домофона, удобное время и т.д."
							></textarea>
						</div>
					</div>

					<button type="submit" class="btn btn-primary full-width" disabled={isSubmitting}>
						{isSubmitting ? 'Оформляем заказ...' : 'Подтвердить заказ'}
					</button>
				</form>

				<!-- Order Summary -->
				<div class="order-summary">
					<h2 class="summary-title">Ваш заказ</h2>
					<div class="summary-items">
						{#each cart.items as item}
							<div class="summary-item">
								<div class="summary-item__info">
									<span class="summary-item__name">{item.brand} {item.name}</span>
									<span class="summary-item__qty">{item.quantity} шт.</span>
								</div>
								<span class="summary-item__price">{formatPrice(item.price * item.quantity)}</span>
							</div>
						{/each}
					</div>

					<div class="summary-total">
						<span>Итого к оплате</span>
						<span>{formatPrice(cart.total)}</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</main>

<style>
	.checkout-page {
		padding: var(--space-3xl) 0;
		min-height: 60vh;
	}

	.page-title {
		font-size: var(--font-size-h1);
		margin-bottom: var(--space-2xl);
	}

	.checkout-layout {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: var(--space-3xl);
		align-items: start;
	}

	@media (max-width: 991px) {
		.checkout-layout {
			grid-template-columns: 1fr;
			gap: var(--space-xl);
		}

		.order-summary {
			order: -1;
		}
	}

	/* Empty cart */
	.empty-cart {
		text-align: center;
		padding: var(--space-3xl) 0;
	}

	.empty-cart p {
		font-size: var(--font-size-body-lg);
		color: var(--color-text-muted);
		margin-bottom: var(--space-xl);
	}

	/* Form error */
	.form-error {
		background: var(--color-danger-50, #fef2f2);
		border: 1px solid var(--color-danger-200, #fecaca);
		color: var(--color-danger-700, #b91c1c);
		padding: var(--space-md) var(--space-lg);
		border-radius: var(--radius-md);
		font-size: var(--font-size-body-sm);
	}

	.input-error {
		border-color: var(--color-danger-500, #ef4444) !important;
	}

	/* Form */
	.checkout-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xl);
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.section-title {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-sm);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.form-group label {
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	/* Summary */
	.order-summary {
		background: var(--color-surface);
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		position: sticky;
		top: 120px;
	}

	.summary-title {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-lg);
	}

	.summary-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		max-height: 300px;
		overflow-y: auto;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		gap: var(--space-md);
		font-size: var(--font-size-body-sm);
	}

	.summary-item__info {
		display: flex;
		flex-direction: column;
	}

	.summary-item__name {
		font-weight: 500;
	}

	.summary-item__qty {
		color: var(--color-text-muted);
	}

	.summary-total {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-lg);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-border);
		font-size: var(--font-size-h4);
		font-weight: 600;
		color: var(--color-text);
	}

	.full-width {
		width: 100%;
		margin-top: var(--space-lg);
	}
</style>
