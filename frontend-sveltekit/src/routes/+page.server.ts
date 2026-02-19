import type { PageServerLoad } from './$types';
import { queries, db, formatPrice } from '$lib/server/db/database';
import type { HeroContent } from '$lib/types/hero';
import type { CollectionsSectionProps } from '$lib/types/collections';
import type { ShowcaseSectionProps } from '$lib/types/showcase';
import type { TestimonialsSectionProps } from '$lib/types/testimonials';
import type { TelegramCtaSectionProps } from '$lib/types/telegram-cta';

export const load: PageServerLoad = async () => {
	// Section configs from homepage_section_config table
	const sectionConfigs = queries.getHomepageSectionConfigs.all() as any[];
	const sectionMap = new Map(sectionConfigs.map((s: any) => [s.section_key, s]));
	const sc = (key: string) => sectionMap.get(key) || { eyebrow: '', title: '', description: '', extra_json: '{}' };

	// ============================================
	// 1. HERO - из БД ✅
	// ============================================
	const heroFromDb = queries.getHomeHero.get() as any;
	const heroContent: HeroContent = {
		tagline: heroFromDb.tagline,
		title: heroFromDb.title,
		description: heroFromDb.description,
		primaryCta: {
			text: heroFromDb.primary_cta_text,
			href: heroFromDb.primary_cta_href
		},
		secondaryCta: {
			text: heroFromDb.secondary_cta_text,
			href: heroFromDb.secondary_cta_href
		},
		stats: buildDynamicStats(),
		image: {
			src: heroFromDb.image_url,
			alt: heroFromDb.image_alt,
			width: 520,
			height: 640,
			badge: {
				label: heroFromDb.image_badge_label,
				title: heroFromDb.image_badge_title
			}
		},
		quickLinks: JSON.parse(heroFromDb.quick_links_json),
		brands: JSON.parse(heroFromDb.brands_json)
	};

	// ============================================
	// 2. COLLECTIONS - из БД ✅
	// ============================================
	const collectionsFromDb = queries.getAllCollections.all() as any[];
	const collectionsConfig = sc('collections');
	const collectionsContent: CollectionsSectionProps = {
		eyebrow: collectionsConfig.eyebrow || 'Подборки',
		title: collectionsConfig.title || 'Кураторские коллекции Moditimewatch',
		description: collectionsConfig.description || 'Каждая подборка создаётся командой сервиса: учитываем силу бренда, инвестиционный потенциал, редкость референса и сценарии ношения.',
		collections: collectionsFromDb.map((c) => ({
			id: c.slug,
			image: c.image_url,
			category: c.category,
			title: c.title,
			description: c.description,
			linkText: c.link_text,
			linkHref: c.link_href
		}))
	};

	// ============================================
	// 3. SHOWCASE (Бестселлеры) - из БД ✅
	// ============================================
	const showcaseConfig = sc('showcase');
	const showcaseExtra = JSON.parse(showcaseConfig.extra_json || '{}');

	// Manual mode: use homepage_showcase_items; Auto mode: use is_featured products
	let showcaseProducts: any[];
	if (showcaseExtra.mode === 'manual') {
		const manualItems = queries.getShowcaseItems.all() as any[];
		if (manualItems.length > 0) {
			showcaseProducts = manualItems.map((item: any) => ({
				slug: item.slug,
				brand_name: item.brand_name,
				name: item.name,
				price: item.price,
				id: item.product_id,
				is_new: 0,
				is_limited: 0
			}));
		} else {
			showcaseProducts = queries.getFeaturedProducts.all(8) as any[];
		}
	} else {
		showcaseProducts = queries.getFeaturedProducts.all(8) as any[];
	}

	const showcaseContent: ShowcaseSectionProps = {
		eyebrow: showcaseConfig.eyebrow || 'Бестселлеры',
		title: showcaseConfig.title || 'Топ-модели недели',
		showAllButton: true,
		showAllHref: showcaseExtra.link_href || '/catalog',
		showAllText: showcaseExtra.link_text || 'Вся витрина',
		products: showcaseProducts.map((p) => ({
			id: p.slug,
			brand: p.brand_name,
			name: p.name,
			price: formatPrice(p.price),
			image: `https://picsum.photos/seed/watch-${p.id}/360/440`,
			imageAlt: `${p.brand_name} ${p.name}`,
			badge: p.is_new ? 'New 2024' : p.is_limited ? 'Limited' : undefined,
			badgeVariant: (p.is_limited ? 'gold' : 'default') as 'default' | 'gold'
		}))
	};

	// ============================================
	// 4. EXPERIENCE (Services) - из БД ✅
	// ============================================
	const servicesFromDb = queries.getHomeServices.all() as any[];
	const statsFromDb = queries.getHomeServiceStats.all() as any[];

	const experienceConfig = sc('experience');
	const experienceContent = {
		eyebrow: experienceConfig.eyebrow || 'Опыт Moditimewatch',
		title: experienceConfig.title || 'Премиальный сервис для ценителей часов',
		description: experienceConfig.description || 'Команда сервиса сопровождает на каждом этапе: от консультации и поиска редких моделей до постгарантийного обслуживания и оценки коллекций.',
		stats: statsFromDb.map((s) => ({
			label: s.label,
			value: s.value
		})),
		services: servicesFromDb.map((s) => ({
			id: String(s.id),
			icon: s.icon_svg,
			title: s.title,
			description: s.description,
			linkText: s.link_text,
			linkHref: s.link_href
		})),
		ctaText: 'Запланировать консультацию',
		ctaHref: '/contacts'
	};

	// ============================================
	// 5. TESTIMONIALS - из БД ✅
	// ============================================
	const testimonialsFromDb = queries.getAllTestimonials.all() as any[];
	const testimonialsConfig = sc('testimonials');
	const testimonialsContent: TestimonialsSectionProps = {
		eyebrow: testimonialsConfig.eyebrow || 'Отзывы клиентов',
		title: testimonialsConfig.title || 'Истории владельцев Moditimewatch',
		description: testimonialsConfig.description || 'Мы строим долгосрочные отношения: подбираем часы для особых событий, поддерживаем коллекции и сопровождаем на каждом этапе.',
		testimonials: testimonialsFromDb.map((t) => ({
			id: String(t.id),
			name: t.name,
			position: t.position,
			avatar: t.avatar_url || 'https://picsum.photos/seed/client-default/64/64',
			text: t.text,
			choice: t.choice
		}))
	};

	// ============================================
	// 6. EDITORIAL (Журнал) - из БД ✅
	// ============================================
	const articlesFromDb = queries.getFeaturedArticles.all(6) as any[];
	const editorialConfig = sc('editorial');
	const editorialContent = {
		eyebrow: editorialConfig.eyebrow || 'Журнал',
		title: editorialConfig.title || 'Экспертиза и вдохновение',
		articles: articlesFromDb.map((a) => ({
			id: a.slug,
			tag: a.category_name || 'Статья',
			title: a.title,
			description: a.excerpt,
			image: a.image_url,
			link: `/journal/${a.slug}`,
			linkText: 'Читать'
		}))
	};

	// ============================================
	// 7. TELEGRAM CTA - из config + виджет (Session-12: link instead of iframe)
	// ============================================
	const telegramGroupEnabled = (queries.getConfigByKey.get('telegram_group_enabled') as any)?.value === 'true';
	const telegramGroupUrl = (queries.getConfigByKey.get('telegram_group_url') as any)?.value || 'https://t.me/moditime_watch';
	const telegramGroupLabel = (queries.getConfigByKey.get('telegram_group_label') as any)?.value || 'Telegram группа Moditimewatch';

	const telegramWidgetFromDb = queries.getTelegramWidget.get() as any;
	let telegramCtaContent: TelegramCtaSectionProps;

	if (telegramWidgetFromDb?.data_json) {
		telegramCtaContent = JSON.parse(telegramWidgetFromDb.data_json);
	} else {
		telegramCtaContent = {
			eyebrow: 'Подписка',
			title: 'Канал Moditimewatch в Telegram',
			description: 'Анонсы релизов и эксклюзивные предложения',
			features: ['Эксклюзивные предложения', 'Подборки часов', 'Обзоры новинок'],
			ctaText: 'Подписаться',
			ctaHref: telegramGroupUrl,
			channelUrl: telegramGroupUrl
		};
	}

	// Override with config values
	telegramCtaContent.ctaHref = telegramGroupUrl;
	telegramCtaContent.channelUrl = telegramGroupUrl;

	return {
		heroContent,
		collectionsContent,
		showcaseContent,
		experienceContent,
		testimonialsContent,
		editorialContent,
		telegramCtaContent,
		telegramGroupEnabled
	};
};

function buildDynamicStats(): { value: string; label: string }[] {
	const productCount = (db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get() as { count: number }).count;
	const brandCount = (db.prepare('SELECT COUNT(*) as count FROM brands WHERE is_active = 1').get() as { count: number }).count;

	return [
		{ value: `${productCount}+`, label: 'моделей в каталоге' },
		{ value: String(brandCount), label: 'премиальных брендов' },
		{ value: '24ч', label: 'консьерж-подбор' }
	];
}
