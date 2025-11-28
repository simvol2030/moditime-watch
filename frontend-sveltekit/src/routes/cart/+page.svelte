<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import SeoManager from '$lib/components/seo/SeoManager.svelte';

	const seo = {
		title: 'Корзина',
		description: 'Ваша корзина покупок в Moditimewatch'
	};

	function formatPrice(price: number) {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			maximumFractionDigits: 0
		}).format(price);
	}
</script>

<SeoManager {seo} />

<main class="page-main cart-page">
	<div class="container">
		<h1 class="page-title">Корзина</h1>

		{#if cart.items.length === 0}
			<div class="empty-cart">
				<p>Ваша корзина пуста</p>
				<a href="/catalog" class="btn btn-primary">Перейти в каталог</a>
			</div>
		{:else}
			<div class="cart-layout">
				<div class="cart-items">
					{#each cart.items as item}
						<div class="cart-item">
							<div class="cart-item__image">
								<img src={item.image} alt={item.name} />
							</div>
							<div class="cart-item__info">
								<span class="cart-item__brand">{item.brand}</span>
								<h3 class="cart-item__name">{item.name}</h3>
								<span class="cart-item__price">{formatPrice(item.price)}</span>
							</div>
							<div class="cart-item__controls">
								<div class="quantity-control">
									<button onclick={() => cart.updateQuantity(item.id, -1)}>−</button>
									<span>{item.quantity}</span>
									<button onclick={() => cart.updateQuantity(item.id, 1)}>+</button>
								</div>
								<button class="remove-btn" onclick={() => cart.removeItem(item.id)}>
									Удалить
								</button>
							</div>
						</div>
					{/each}
				</div>

				<div class="cart-summary">
					<h2 class="summary-title">Итого</h2>
					<div class="summary-row">
						<span>Товары ({cart.count})</span>
						<span>{formatPrice(cart.total)}</span>
					</div>
					<div class="summary-row">
						<span>Доставка</span>
						<span>Бесплатно</span>
					</div>
					<div class="summary-total">
						<span>К оплате</span>
						<span>{formatPrice(cart.total)}</span>
					</div>
					<a href="/checkout" class="btn btn-primary full-width">Оформить заказ</a>
				</div>
			</div>
		{/if}
	</div>
</main>

<style>
	.cart-page {
		padding: var(--space-3xl) 0;
		min-height: 60vh;
	}

	.page-title {
		font-size: var(--font-size-h1);
		margin-bottom: var(--space-2xl);
	}

	.empty-cart {
		text-align: center;
		padding: var(--space-3xl);
		background: var(--color-surface);
		border-radius: var(--radius-xl);
	}

	.empty-cart p {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-lg);
		color: var(--color-text);
	}

	.cart-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: var(--space-2xl);
		align-items: start;
	}

	@media (max-width: 991px) {
		.cart-layout {
			grid-template-columns: 1fr;
		}
	}

	.cart-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.cart-item {
		display: flex;
		gap: var(--space-lg);
		padding: var(--space-lg);
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: background-color var(--transition-normal), border-color var(--transition-normal);
	}

	.cart-item__image {
		width: 100px;
		height: 100px;
		flex-shrink: 0;
	}

	.cart-item__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius-md);
	}

	.cart-item__info {
		flex: 1;
	}

	.cart-item__brand {
		font-size: var(--font-size-caption);
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.cart-item__name {
		font-size: var(--font-size-body-lg);
		margin-bottom: var(--space-xs);
		color: var(--color-text);
	}

	.cart-item__price {
		font-weight: 600;
		color: var(--color-primary);
	}

	.cart-item__controls {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: space-between;
	}

	.quantity-control {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		background: var(--color-surface);
		border-radius: var(--radius-pill);
		padding: 4px;
	}

	.quantity-control button {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		cursor: pointer;
		color: var(--color-text);
		transition: all var(--transition-fast);
	}

	.quantity-control button:hover {
		background: var(--color-primary);
		color: #fff;
		border-color: var(--color-primary);
	}

	.quantity-control span {
		min-width: 24px;
		text-align: center;
		font-weight: 600;
		color: var(--color-text);
	}

	.remove-btn {
		font-size: var(--font-size-caption);
		color: var(--color-danger);
		text-decoration: underline;
		cursor: pointer;
		background: none;
		border: none;
		transition: opacity var(--transition-fast);
	}

	.remove-btn:hover {
		opacity: 0.7;
	}

	/* Summary */
	.cart-summary {
		background: var(--color-surface);
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		position: sticky;
		top: 120px;
	}

	.summary-title {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-lg);
		color: var(--color-text);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--space-sm);
		color: var(--color-text-soft);
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
		margin-bottom: var(--space-xl);
	}

	.full-width {
		width: 100%;
	}

	/* Dark theme specific adjustments */
	body[data-theme='dark'] .cart-item {
		background: var(--color-surface);
		border-color: var(--color-border-strong);
	}

	body[data-theme='dark'] .cart-item:hover {
		border-color: var(--color-primary);
	}

	body[data-theme='dark'] .quantity-control {
		background: var(--color-surface-alt);
	}

	body[data-theme='dark'] .quantity-control button {
		background: var(--color-surface);
	}

	body[data-theme='dark'] .cart-summary {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}
</style>

