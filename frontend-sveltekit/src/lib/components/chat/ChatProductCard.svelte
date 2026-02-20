<script lang="ts">
	interface Props {
		product: {
			id: number;
			name: string;
			brand: string;
			price: number;
			slug: string;
			image: string | null;
		};
	}

	let { product }: Props = $props();

	function formatPrice(kopecks: number): string {
		return new Intl.NumberFormat('ru-RU').format(Math.round(kopecks / 100)) + ' \u20BD';
	}
</script>

<a href="/product/{product.slug}" class="chat-product" target="_blank" rel="noopener">
	<div class="chat-product__info">
		<span class="chat-product__brand">{product.brand}</span>
		<span class="chat-product__name">{product.name}</span>
		<span class="chat-product__price">{formatPrice(product.price)}</span>
	</div>
	<span class="chat-product__link">Подробнее &rarr;</span>
</a>

<style>
	.chat-product {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm, 12px);
		padding: 10px 12px;
		background-color: var(--color-background, #fff);
		border: 1px solid var(--color-border, rgba(13,34,83,0.08));
		border-radius: var(--radius-md, 12px);
		text-decoration: none;
		color: inherit;
		transition: box-shadow var(--transition-fast, 0.18s), transform var(--transition-fast, 0.18s);
		margin-top: 6px;
	}

	.chat-product:hover {
		box-shadow: var(--shadow-sm, 0 6px 18px rgba(8,15,35,0.08));
		transform: translateY(-1px);
		color: inherit;
	}

	.chat-product__info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.chat-product__brand {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted, #80879A);
	}

	.chat-product__name {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text, #21242C);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chat-product__price {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-primary, #0A2463);
	}

	.chat-product__link {
		font-size: 12px;
		color: var(--color-accent, #3E92CC);
		white-space: nowrap;
		flex-shrink: 0;
	}
</style>
