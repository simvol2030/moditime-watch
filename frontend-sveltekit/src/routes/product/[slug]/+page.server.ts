import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { queries } from '$lib/server/db/database';
import type { BreadcrumbItem } from '$lib/types/breadcrumbs';
import type {
	ProductGalleryProps,
	ProductSummaryProps,
	ProductHighlight,
	ProductSpecGroup,
	TabItem,
	CatalogProduct
} from '$lib/types/product';
import type { ProductReviewsProps } from '$lib/types/reviews';
import type { RecommendationsProps } from '$lib/types/recommendations';
import type { ProductServicesProps } from '$lib/types/services';
import type { SeoProps } from '$lib/types/seo';
import { generateProductSchema } from '$lib/utils/schema-helpers';

// DB interfaces
interface DbProduct {
	id: number;
	slug: string;
	brand_id: number;
	brand_name: string;
	brand_slug: string;
	category_id: number | null;
	name: string;
	sku: string;
	price: number;
	availability_status: string;
	availability_text: string | null;
	description: string | null;
	rating: number;
	review_count: number;
	specs_json: string | null;
	is_new: number;
	is_limited: number;
	is_featured: number;
}

interface DbProductImage {
	id: number;
	url: string;
	alt: string;
	position: number;
	is_main: number;
}

interface DbHighlight {
	icon: string;
	title: string;
	description: string | null;
}

interface DbTab {
	id: string;
	label: string;
	content: string;
}

interface DbBenefit {
	id: number;
	icon: string;
	title: string;
	description: string;
}

interface DbOption {
	option_type: string;
	option_label: string;
	option_value: string;
	option_value_label: string;
	price_modifier: number;
	is_default: number;
}

interface DbReview {
	id: number;
	author_name: string;
	author_role: string | null;
	author_avatar_url: string | null;
	rating: number;
	content: string;
	delivery_info: string | null;
	is_verified: number;
	created_at: string;
}

interface DbRelatedProduct {
	id: number;
	slug: string;
	name: string;
	price: number;
	brand_name: string;
	main_image: string | null;
	is_new: number;
	is_limited: number;
	is_featured: number;
	availability_status: string;
	specs_json: string | null;
}

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	// Get product from DB
	const product = queries.getProductBySlug.get(slug) as DbProduct | undefined;

	if (!product) {
		throw error(404, {
			message: 'Товар не найден'
		});
	}

	// Get product images
	const imagesFromDb = queries.getProductImages.all(product.id) as DbProductImage[];

	// Get additional data
	const highlightsFromDb = queries.getProductHighlights.all(product.id) as DbHighlight[];
	const tabsFromDb = queries.getProductTabs.all(product.id) as DbTab[];
	const benefitsFromDb = queries.getProductBenefits.all(product.id) as DbBenefit[];
	const optionsFromDb = queries.getProductOptions.all(product.id) as DbOption[];
	const reviewsFromDb = queries.getProductReviews.all(product.id, 10) as DbReview[];
	const relatedFromDb = queries.getRelatedProducts.all(
		product.id,
		product.brand_id,
		product.category_id || 0,
		5
	) as DbRelatedProduct[];

	// Parse specs_json
	let specGroups: ProductSpecGroup[] = [];
	if (product.specs_json) {
		try {
			const specs = JSON.parse(product.specs_json);
			specGroups = Object.entries(specs).map(([title, items]) => ({
				title,
				specs: (items as { label: string; value: string }[]).map((item) => ({
					label: item.label,
					value: item.value
				}))
			}));
		} catch {
			// Ignore JSON parse errors
		}
	}

	// Build breadcrumbs
	const breadcrumbs: BreadcrumbItem[] = [
		{ label: 'Главная', href: '/' },
		{ label: 'Каталог', href: '/catalog' },
		{ label: product.brand_name, href: `/catalog?brand=${product.brand_slug}` },
		{ label: product.name }
	];

	// Build gallery content
	const galleryContent: ProductGalleryProps = {
		images:
			imagesFromDb.length > 0
				? imagesFromDb.map((img, idx) => ({
						id: String(img.id),
						src: img.url.startsWith('/') ? img.url : `https://picsum.photos/seed/${slug}-${idx}/720/720`,
						alt: img.alt || product.name,
						thumbnail: img.url.startsWith('/')
							? img.url.replace(/(\.\w+)$/, '-thumb$1')
							: `https://picsum.photos/seed/${slug}-${idx}/120/120`
					}))
				: [
						{
							id: '1',
							src: `https://picsum.photos/seed/${slug}-main/720/720`,
							alt: product.name,
							thumbnail: `https://picsum.photos/seed/${slug}-main/120/120`
						}
					],
		badge: product.is_limited ? 'Limited' : product.is_new ? 'New' : undefined,
		badgeType: product.is_limited ? 'limited' : 'default'
	};

	// Build summary content
	const summaryContent: ProductSummaryProps = {
		brand: product.brand_name,
		name: product.name,
		rating: product.rating || 4.8,
		reviewsCount: product.review_count || reviewsFromDb.length,
		sku: product.sku || `SKU-${product.id}`,
		availability: buildAvailabilityText(product),
		availabilityStatus: product.availability_status as 'in-stock' | 'pre-order' | 'waitlist',
		price: product.price / 100, // kopecks to rubles
		priceNote: 'Включая страховку и доставку до двери',
		installment: calculateInstallment(product.price / 100),
		tradeIn: 'Бесплатный аудит вашей коллекции за 24 часа',
		options: buildOptions(optionsFromDb),
		benefits: buildBenefits(benefitsFromDb),
		tags: buildTags(product)
	};

	// Build highlights
	const highlights: ProductHighlight[] =
		highlightsFromDb.length > 0
			? highlightsFromDb.map((h) => ({
					icon: h.icon,
					title: h.title,
					description: h.description || ''
				}))
			: [
					{
						icon: '🎯',
						title: 'Сертификат подлинности',
						description: 'Официальные документы и гарантия происхождения'
					},
					{
						icon: '📦',
						title: 'Полная комплектация',
						description: 'Оригинальная коробка, документы, ремешки'
					},
					{
						icon: '⚡',
						title: 'Быстрая доставка',
						description: 'От 24 часов по Москве, 2-5 дней в регионы'
					}
				];

	// Build tabs
	const tabs: TabItem[] =
		tabsFromDb.length > 0
			? tabsFromDb.map((t) => ({
					id: t.id,
					label: t.label,
					content: t.content
				}))
			: [
					{
						id: 'description',
						label: 'Описание',
						content: product.description || `<p>${product.brand_name} ${product.name} — изысканная модель от легендарного бренда.</p>`
					},
					{
						id: 'delivery',
						label: 'Доставка и оплата',
						content: `
						<ul>
							<li><strong>Опции оплаты:</strong> банковский перевод, корпоративный счёт, криптовалюта</li>
							<li><strong>Трекинг:</strong> онлайн-трекинг в личном кабинете + уведомления в Telegram</li>
							<li><strong>Примерка:</strong> выезд эксперта с альтернативами для финального выбора</li>
						</ul>
					`
					},
					{
						id: 'warranty',
						label: 'Гарантия',
						content: `
						<ul>
							<li>Официальная гарантия ${product.brand_name} — 5 лет</li>
							<li>Сертификат проверки модулей и герметичности</li>
							<li>Документ о происхождении и таможенные декларации</li>
							<li>Сервисная карта Moditimewatch с личным менеджером</li>
						</ul>
					`
					}
				];

	// Build reviews content
	const reviewsContent: ProductReviewsProps = {
		reviews: reviewsFromDb.map((r) => ({
			id: String(r.id),
			author: {
				name: r.author_name,
				role: r.author_role || 'Покупатель'
			},
			rating: r.rating,
			content: r.content,
			delivery: r.delivery_info || 'Стандартная доставка'
		})),
		title: 'Отзывы',
		subtitle: 'Истории владельцев',
		showLoadMore: reviewsFromDb.length >= 10
	};

	// Build recommendations
	const recommendedProducts: CatalogProduct[] = relatedFromDb.map((p) => ({
		id: p.slug,
		brand: p.brand_name,
		name: p.name,
		price: p.price / 100,
		image: p.main_image || `https://picsum.photos/seed/related-${p.id}/360/440`,
		badge: p.is_limited ? 'Limited' : p.is_new ? 'New' : p.is_featured ? 'Top' : undefined,
		badgeType: p.is_limited ? 'gold' : ('default' as const),
		info: buildProductInfo(p),
		availability: buildRelatedAvailability(p.availability_status)
	}));

	const recommendationsContent: RecommendationsProps = {
		title: 'Похожие модели',
		subtitle: 'Рекомендуем посмотреть',
		products: recommendedProducts,
		showCatalogButton: true,
		catalogButtonText: 'Смотреть каталог',
		catalogButtonHref: '/catalog'
	};

	// Telegram CTA (static for now)
	const telegramContent = {
		eyebrow: 'Подписка',
		title: 'Канал Moditimewatch в Telegram',
		description:
			'Анонсы лимитированных релизов, backstage сервиса, приглашения на закрытые презентации и инсайды о Programmatic SEO-поддоменах для партнёров.',
		features: [
			'Эксклюзивные предложения до попадания в витрину',
			'Подборки часов по городам — Programmatic SEO коконы',
			'Короткие обзоры новинок и советы коллекционеров'
		],
		ctaText: 'Подписаться',
		ctaHref: 'https://t.me/moditimewatch',
		channelUrl: 'https://t.me/s/moditimewatch'
	};

	// Services content (static)
	const servicesContent: ProductServicesProps = {
		title: 'Сервис Moditimewatch Delivery',
		description:
			'От выбора модели до полноценного обслуживания — ваш персональный менеджер сопровождает каждый этап.',
		features: [
			{ title: 'Консьерж 24/7', description: 'чат в Telegram, звонки, личные встречи' },
			{ title: 'Поддержка коллекций', description: 'аудит, выкуп, trade-in, хранение в сейфах' },
			{ title: 'Подарочные сценарии', description: 'персонализация с гравировкой и упаковкой' }
		],
		ctaText: 'Получить консультацию',
		ctaHref: '/contacts',
		faqTitle: 'Частые вопросы',
		faqItems: [
			{
				question: 'Можно ли проверить часы перед оплатой?',
				answer:
					'Да, доступна услуга escrow: проверка экспертом в присутствии клиента до окончательного расчёта.',
				defaultOpen: true
			},
			{
				question: 'Как работает международная доставка?',
				answer:
					'Мы оформляем экспортные документы, страхуем груз и передаём часы курьеру высокого уровня (Ferrari Group, Malca-Amit).'
			},
			{
				question: 'Есть ли обслуживание после покупки?',
				answer:
					'Доступен официальный сервисный центр, а также вспомогательные услуги (чистка, полировка, подбор ремешков).'
			}
		]
	};

	// Build SEO data with Product JSON-LD schema
	const productUrl = `https://moditimewatch.ru/product/${slug}`;
	const mainImage = galleryContent.images[0]?.src || '/og-image.jpg';

	const seo: SeoProps = {
		title: `${product.brand_name} ${product.name}`,
		description: `Купить ${product.brand_name} ${product.name} — ${summaryContent.availability}. Гарантия подлинности, экспресс-доставка, консьерж-сопровождение.`,
		canonical: productUrl,
		openGraph: {
			type: 'product',
			title: `${product.brand_name} ${product.name} — Moditimewatch`,
			description: product.description || `Премиальные часы ${product.brand_name} ${product.name} с доставкой и гарантией.`,
			image: mainImage,
			url: productUrl
		},
		breadcrumbs: breadcrumbs.map((b) => ({
			name: b.label,
			item: b.href || productUrl
		})),
		jsonLd: generateProductSchema({
			name: `${product.brand_name} ${product.name}`,
			description: product.description || `Премиальные часы ${product.brand_name} ${product.name}`,
			image: mainImage,
			brand: product.brand_name,
			sku: product.sku,
			price: product.price / 100,
			currency: 'RUB',
			availability: product.availability_status === 'in-stock'
				? 'InStock'
				: product.availability_status === 'pre-order'
					? 'PreOrder'
					: 'OutOfStock',
			url: productUrl,
			reviewCount: product.review_count || reviewsFromDb.length,
			ratingValue: product.rating || 4.8
		})
	};

	return {
		slug,
		product: {
			name: product.name,
			id: product.id,
			price: product.price / 100,
			brand: product.brand_name,
			sku: product.sku
		},
		seo,
		breadcrumbs,
		galleryContent,
		summaryContent,
		highlights,
		specGroups,
		tabs,
		telegramContent,
		reviewsContent,
		recommendationsContent,
		servicesContent
	};
};

// Helper functions
function buildAvailabilityText(product: DbProduct): string {
	if (product.availability_text) return product.availability_text;

	switch (product.availability_status) {
		case 'in-stock':
			return 'В наличии на складе';
		case 'pre-order':
			return 'Под заказ 7-21 день';
		case 'waitlist':
			return 'Лист ожидания';
		default:
			return 'Уточняйте наличие';
	}
}

function calculateInstallment(price: number): string | undefined {
	if (price < 100000) return undefined;
	const monthly = Math.round(price / 12);
	return `от ${new Intl.NumberFormat('ru-RU').format(monthly)} ₽ / мес — 12 месяцев без переплаты`;
}

function buildOptions(optionsFromDb: DbOption[]): ProductSummaryProps['options'] {
	if (optionsFromDb.length === 0) return [];

	// Group options by type
	const grouped: Record<string, DbOption[]> = {};
	optionsFromDb.forEach((opt) => {
		if (!grouped[opt.option_type]) grouped[opt.option_type] = [];
		grouped[opt.option_type].push(opt);
	});

	return Object.entries(grouped).map(([type, options]) => ({
		id: type,
		label: options[0].option_label,
		selected: options.find((o) => o.is_default)?.option_value || options[0].option_value,
		choices: options.map((o) => ({
			value: o.option_value,
			label: o.option_value_label
		}))
	}));
}

function buildBenefits(benefitsFromDb: DbBenefit[]): ProductSummaryProps['benefits'] {
	if (benefitsFromDb.length > 0) {
		return benefitsFromDb.map((b) => ({
			id: String(b.id),
			icon: b.icon,
			title: b.title,
			description: b.description
		}));
	}

	// Default benefits
	return [
		{
			id: 'authenticity',
			icon: '<path d="M16.6667 5.83301H3.33333C2.8731 5.83301 2.5 6.2061 2.5 6.66634V15.833C2.5 16.2932 2.8731 16.6663 3.33333 16.6663H16.6667C17.1269 16.6663 17.5 16.2932 17.5 15.833V6.66634C17.5 6.2061 17.1269 5.83301 16.6667 5.83301Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.3337 16.6663V4.16634C13.3337 3.5043 13.0703 2.86942 12.6005 2.39958C12.1306 1.92974 11.4957 1.66634 10.8337 1.66634H9.16699C8.50495 1.66634 7.87007 1.92974 7.40024 2.39958C6.9304 2.86942 6.66699 3.5043 6.66699 4.16634V16.6663" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
			title: 'Гарантия подлинности',
			description: 'Экспертиза по серийному номеру, гарантия 5 лет'
		},
		{
			id: 'delivery',
			icon: '<path d="M3.33301 3.33301H6.66634L8.33299 11.6663C8.40177 12.0129 8.58561 12.3234 8.85108 12.5473C9.11655 12.7711 9.44798 12.8944 9.79299 12.8953H15.833C16.178 12.8944 16.5094 12.7711 16.7749 12.5473C17.0404 12.3234 17.2242 12.0129 17.293 11.6663L18.333 6.66634H6.99967" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
			title: 'Страхованная доставка',
			description: 'Экспресс-доставка в 140 городов с полной страховкой'
		},
		{
			id: 'concierge',
			icon: '<path d="M18.3337 8.33301C18.3337 14.9997 9.99967 18.333 9.99967 18.333C9.99967 18.333 1.66634 14.9997 1.66634 8.33301C1.66634 6.56511 2.36879 4.86927 3.61904 3.61902C4.86929 2.36877 6.56512 1.66634 8.33301 1.66634" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
			title: 'Консьерж-сопровождение',
			description: 'Эксперт рядом на каждом шаге: подбор, trade-in, сервис'
		}
	];
}

function buildTags(product: DbProduct): string[] {
	const tags: string[] = [];
	if (product.is_limited) tags.push('#Limited');
	if (product.is_new) tags.push('#New');
	if (product.is_featured) tags.push('#Bestseller');
	tags.push(`#${product.brand_name.replace(/\s+/g, '')}`);
	return tags;
}

function buildProductInfo(p: DbRelatedProduct): string[] {
	const info: string[] = [];

	if (p.specs_json) {
		try {
			const specs = JSON.parse(p.specs_json);
			if (specs['Корпус']) {
				const material = specs['Корпус'].find(
					(s: { label: string; value: string }) => s.label === 'Материал'
				);
				if (material) info.push(material.value);
				const diameter = specs['Корпус'].find(
					(s: { label: string; value: string }) => s.label === 'Диаметр'
				);
				if (diameter) info.push(diameter.value);
			}
		} catch {
			// Ignore
		}
	}

	info.push(buildRelatedAvailability(p.availability_status));
	return info;
}

function buildRelatedAvailability(status: string): string {
	switch (status) {
		case 'in-stock':
			return 'В наличии';
		case 'pre-order':
			return 'Под заказ';
		case 'waitlist':
			return 'Лист ожидания';
		default:
			return 'Уточняйте';
	}
}
