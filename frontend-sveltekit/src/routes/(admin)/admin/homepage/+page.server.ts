import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

export const load: PageServerLoad = async ({ url }) => {
	const tab = url.searchParams.get('tab') || 'hero';

	const hero = queries.adminGetHomeHero.get() as any;
	const services = queries.adminGetHomeServices.all() as any[];
	const stats = queries.adminGetHomeStats.all() as any[];
	const telegramWidget = queries.adminGetTelegramWidget.get() as any;
	const brands = queries.adminListBrands.all() as any[];
	const sectionConfigs = queries.getAllSectionConfigs.all() as any[];
	const collections = queries.adminListCollections.all() as any[];
	const showcaseItems = queries.getShowcaseItems.all() as any[];

	// Parse hero JSON fields for the UI
	let heroStats: { value: string; label: string }[] = [];
	let heroQuickLinks: { text: string; href: string; variant?: string }[] = [];
	let heroBrands: string[] = [];
	try { heroStats = JSON.parse(hero?.stats_json || '[]'); } catch { /* empty */ }
	try { heroQuickLinks = JSON.parse(hero?.quick_links_json || '[]'); } catch { /* empty */ }
	try { heroBrands = JSON.parse(hero?.brands_json || '[]'); } catch { /* empty */ }

	// Section configs as a map
	const sectionMap: Record<string, any> = {};
	for (const s of sectionConfigs) {
		sectionMap[s.section_key] = s;
	}

	return {
		tab,
		hero,
		heroStats,
		heroQuickLinks,
		heroBrands,
		services,
		stats,
		brands,
		sectionConfigs: sectionMap,
		collections,
		showcaseItems,
		telegramWidget: telegramWidget ? {
			id: telegramWidget.id,
			is_active: telegramWidget.is_active,
			data: telegramWidget.data_json ? JSON.parse(telegramWidget.data_json) : null
		} : null
	};
};

export const actions: Actions = {
	saveHero: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const tagline = formData.get('tagline')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const primary_cta_text = formData.get('primary_cta_text')?.toString() || '';
		const primary_cta_href = formData.get('primary_cta_href')?.toString() || '';
		const secondary_cta_text = formData.get('secondary_cta_text')?.toString() || '';
		const secondary_cta_href = formData.get('secondary_cta_href')?.toString() || '';
		const show_secondary = formData.get('show_secondary') ? true : false;
		const image_url = formData.get('image_url')?.toString() || '';
		const image_alt = formData.get('image_alt')?.toString() || '';
		const image_badge_label = formData.get('image_badge_label')?.toString() || '';
		const image_badge_title = formData.get('image_badge_title')?.toString() || '';
		const show_badge = formData.get('show_badge') ? true : false;

		if (!title) return fail(400, { error: 'Title is required', tab: 'hero' });

		// Build stats JSON from dynamic fields
		const statsValues = formData.getAll('stat_value');
		const statsLabels = formData.getAll('stat_label');
		const statsArr: { value: string; label: string }[] = [];
		for (let i = 0; i < statsValues.length; i++) {
			const v = statsValues[i]?.toString().trim();
			const l = statsLabels[i]?.toString().trim();
			if (v && l) statsArr.push({ value: v, label: l });
		}
		const stats_json = JSON.stringify(statsArr);

		// Build quick links JSON from dynamic fields
		const qlTexts = formData.getAll('ql_text');
		const qlHrefs = formData.getAll('ql_href');
		const quickLinksArr: { text: string; href: string }[] = [];
		for (let i = 0; i < qlTexts.length; i++) {
			const t = qlTexts[i]?.toString().trim();
			const h = qlHrefs[i]?.toString().trim();
			if (t && h) quickLinksArr.push({ text: t, href: h });
		}
		const quick_links_json = JSON.stringify(quickLinksArr);

		// Build brands JSON from checkboxes or auto mode
		const brandsMode = formData.get('brands_mode')?.toString() || 'auto';
		let brands_json: string;
		if (brandsMode === 'auto') {
			const allBrands = queries.adminListBrands.all() as any[];
			brands_json = JSON.stringify(allBrands.filter(b => b.is_active).map(b => b.name));
		} else {
			const selectedBrands = formData.getAll('selected_brands');
			brands_json = JSON.stringify(selectedBrands.map(b => b.toString()));
		}

		// If secondary CTA is hidden, clear its fields but keep them stored
		const finalSecondaryCta = show_secondary ? secondary_cta_text : secondary_cta_text;
		const finalSecondaryHref = show_secondary ? secondary_cta_href : secondary_cta_href;

		try {
			queries.adminUpdateHomeHero.run({
				id, tagline, title, description,
				primary_cta_text, primary_cta_href,
				secondary_cta_text: finalSecondaryCta, secondary_cta_href: finalSecondaryHref,
				image_url, image_alt,
				image_badge_label: show_badge ? image_badge_label : '',
				image_badge_title: show_badge ? image_badge_title : '',
				stats_json, quick_links_json, brands_json
			});
			return { success: true, tab: 'hero' };
		} catch {
			return fail(500, { error: 'Failed to update hero', tab: 'hero' });
		}
	},

	saveSectionConfig: async ({ request }) => {
		const formData = await request.formData();
		const section_key = formData.get('section_key')?.toString() || '';
		const eyebrow = formData.get('eyebrow')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const extra_json = formData.get('extra_json')?.toString() || '{}';
		const is_active = formData.get('is_active') ? 1 : 0;
		const tab = formData.get('tab')?.toString() || section_key;

		if (!section_key) return fail(400, { error: 'Section key is required', tab });

		try { JSON.parse(extra_json); } catch { return fail(400, { error: 'Invalid extra JSON', tab }); }

		try {
			queries.updateSectionConfig.run({ section_key, eyebrow, title, description, extra_json, is_active });
			return { success: true, tab };
		} catch {
			return fail(500, { error: 'Failed to update section config', tab });
		}
	},

	// Collections CRUD
	createCollection: async ({ request }) => {
		const formData = await request.formData();
		const slug = formData.get('slug')?.toString() || '';
		const category = formData.get('category')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const image_url = formData.get('image_url')?.toString() || '';
		const link_text = formData.get('link_text')?.toString() || 'Открыть подборку';
		const link_href = formData.get('link_href')?.toString() || '';
		const is_active = formData.get('is_active') ? 1 : 0;

		if (!slug || !title) return fail(400, { error: 'Slug and title are required', tab: 'collections' });

		try {
			const pos = (queries.adminGetMaxCollectionPosition.get() as any).next_position;
			queries.adminCreateCollection.run({ slug, category, title, description, image_url, link_text, link_href, is_active, position: pos });
			return { success: true, tab: 'collections' };
		} catch (e: any) {
			if (e.message?.includes('UNIQUE')) return fail(400, { error: 'Collection with this slug already exists', tab: 'collections' });
			return fail(500, { error: 'Failed to create collection', tab: 'collections' });
		}
	},

	updateCollection: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const slug = formData.get('slug')?.toString() || '';
		const category = formData.get('category')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const image_url = formData.get('image_url')?.toString() || '';
		const link_text = formData.get('link_text')?.toString() || '';
		const link_href = formData.get('link_href')?.toString() || '';
		const is_active = formData.get('is_active') ? 1 : 0;
		const position = Number(formData.get('position') || 0);

		if (!slug || !title) return fail(400, { error: 'Slug and title are required', tab: 'collections' });

		try {
			queries.adminUpdateCollection.run({ id, slug, category, title, description, image_url, link_text, link_href, is_active, position });
			return { success: true, tab: 'collections' };
		} catch {
			return fail(500, { error: 'Failed to update collection', tab: 'collections' });
		}
	},

	deleteCollection: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			queries.adminDeleteCollection.run(id);
			return { success: true, tab: 'collections' };
		} catch {
			return fail(500, { error: 'Failed to delete collection', tab: 'collections' });
		}
	},

	moveCollection: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const direction = formData.get('direction')?.toString();

		const collections = queries.adminListCollections.all() as any[];
		const idx = collections.findIndex((c: any) => c.id === id);
		if (idx === -1) return fail(400, { error: 'Collection not found', tab: 'collections' });

		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= collections.length) return { success: true, tab: 'collections' };

		const current = collections[idx];
		const swap = collections[swapIdx];

		try {
			db.transaction(() => {
				queries.reorderCollection.run({ id: current.id, position: swap.position });
				queries.reorderCollection.run({ id: swap.id, position: current.position });
			})();
			return { success: true, tab: 'collections' };
		} catch {
			return fail(500, { error: 'Failed to reorder', tab: 'collections' });
		}
	},

	addProductToCollection: async ({ request }) => {
		const formData = await request.formData();
		const collection_id = Number(formData.get('collection_id'));
		const product_id = Number(formData.get('product_id'));

		if (!collection_id || !product_id) return fail(400, { error: 'Missing collection or product ID', tab: 'collections' });

		try {
			const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next FROM collection_products WHERE collection_id = ?').get(collection_id) as any;
			queries.adminAddProductToCollection.run({ collection_id, product_id, position: maxPos.next });
			return { success: true, tab: 'collections', editingCollectionId: collection_id };
		} catch {
			return fail(500, { error: 'Failed to add product', tab: 'collections' });
		}
	},

	removeProductFromCollection: async ({ request }) => {
		const formData = await request.formData();
		const collection_id = Number(formData.get('collection_id'));
		const product_id = Number(formData.get('product_id'));

		try {
			queries.adminRemoveProductFromCollection.run(collection_id, product_id);
			return { success: true, tab: 'collections', editingCollectionId: collection_id };
		} catch {
			return fail(500, { error: 'Failed to remove product', tab: 'collections' });
		}
	},

	// Showcase (Bestsellers) actions
	saveShowcaseConfig: async ({ request }) => {
		const formData = await request.formData();
		const eyebrow = formData.get('eyebrow')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const link_text = formData.get('link_text')?.toString() || 'Вся витрина';
		const link_href = formData.get('link_href')?.toString() || '/catalog';
		const mode = formData.get('showcase_mode')?.toString() || 'auto';
		const is_active = formData.get('is_active') ? 1 : 0;

		const extra_json = JSON.stringify({ link_text, link_href, mode });

		try {
			queries.updateSectionConfig.run({
				section_key: 'showcase',
				eyebrow, title,
				description: '',
				extra_json,
				is_active
			});
			return { success: true, tab: 'showcase' };
		} catch {
			return fail(500, { error: 'Failed to update showcase config', tab: 'showcase' });
		}
	},

	addShowcaseItem: async ({ request }) => {
		const formData = await request.formData();
		const product_id = Number(formData.get('product_id'));

		if (!product_id) return fail(400, { error: 'Product is required', tab: 'showcase' });

		// Check limit
		const items = queries.getShowcaseItems.all() as any[];
		if (items.length >= 12) return fail(400, { error: 'Maximum 12 products allowed', tab: 'showcase' });

		// Check duplicate
		if (items.some((i: any) => i.product_id === product_id)) {
			return fail(400, { error: 'Product already in showcase', tab: 'showcase' });
		}

		try {
			const pos = (queries.getMaxShowcasePosition.get() as any).next_position;
			queries.addShowcaseItem.run({ product_id, position: pos });
			return { success: true, tab: 'showcase' };
		} catch {
			return fail(500, { error: 'Failed to add showcase item', tab: 'showcase' });
		}
	},

	removeShowcaseItem: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			queries.removeShowcaseItem.run(id);
			return { success: true, tab: 'showcase' };
		} catch {
			return fail(500, { error: 'Failed to remove showcase item', tab: 'showcase' });
		}
	},

	moveShowcaseItem: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const direction = formData.get('direction')?.toString();

		const items = queries.getShowcaseItems.all() as any[];
		const idx = items.findIndex((i: any) => i.id === id);
		if (idx === -1) return fail(400, { error: 'Item not found', tab: 'showcase' });

		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= items.length) return { success: true, tab: 'showcase' };

		const current = items[idx];
		const swap = items[swapIdx];

		try {
			db.transaction(() => {
				queries.reorderShowcaseItem.run({ id: current.id, position: swap.position });
				queries.reorderShowcaseItem.run({ id: swap.id, position: current.position });
			})();
			return { success: true, tab: 'showcase' };
		} catch {
			return fail(500, { error: 'Failed to reorder', tab: 'showcase' });
		}
	},

	// Keep existing service/stat/telegram actions
	updateService: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const icon_svg = formData.get('icon_svg')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const link_text = formData.get('link_text')?.toString() || '';
		const link_href = formData.get('link_href')?.toString() || '';
		const position = Number(formData.get('position') || 0);
		const is_active = formData.get('is_active') ? 1 : 0;

		if (!title) return fail(400, { error: 'Title is required' });

		try {
			queries.adminUpdateHomeService.run({ id, icon_svg, title, description, link_text, link_href, position, is_active });
			return { success: true, section: 'services' };
		} catch {
			return fail(500, { error: 'Failed to update service' });
		}
	},

	createService: async ({ request }) => {
		const formData = await request.formData();
		const icon_svg = formData.get('icon_svg')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const link_text = formData.get('link_text')?.toString() || '';
		const link_href = formData.get('link_href')?.toString() || '';
		const position = Number(formData.get('position') || 0);
		const is_active = formData.get('is_active') ? 1 : 0;

		if (!title) return fail(400, { error: 'Title is required' });

		try {
			queries.adminCreateHomeService.run({ icon_svg, title, description, link_text, link_href, position, is_active });
			return { success: true, section: 'services' };
		} catch {
			return fail(500, { error: 'Failed to create service' });
		}
	},

	deleteService: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			queries.adminDeleteHomeService.run(id);
			return { success: true, section: 'services' };
		} catch {
			return fail(500, { error: 'Failed to delete service' });
		}
	},

	updateStat: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const label = formData.get('label')?.toString() || '';
		const value = formData.get('value')?.toString() || '';
		const position = Number(formData.get('position') || 0);

		if (!label || !value) return fail(400, { error: 'Label and value are required' });

		try {
			queries.adminUpdateHomeStat.run({ id, label, value, position });
			return { success: true, section: 'stats' };
		} catch {
			return fail(500, { error: 'Failed to update stat' });
		}
	},

	createStat: async ({ request }) => {
		const formData = await request.formData();
		const label = formData.get('label')?.toString() || '';
		const value = formData.get('value')?.toString() || '';
		const position = Number(formData.get('position') || 0);

		if (!label || !value) return fail(400, { error: 'Label and value are required' });

		try {
			queries.adminCreateHomeStat.run({ label, value, position });
			return { success: true, section: 'stats' };
		} catch {
			return fail(500, { error: 'Failed to create stat' });
		}
	},

	deleteStat: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			queries.adminDeleteHomeStat.run(id);
			return { success: true, section: 'stats' };
		} catch {
			return fail(500, { error: 'Failed to delete stat' });
		}
	},

	updateTelegram: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const is_active = formData.get('is_active') ? 1 : 0;
		const data_json = formData.get('data_json')?.toString() || '{}';

		try { JSON.parse(data_json); } catch { return fail(400, { error: 'Invalid JSON for telegram widget' }); }

		try {
			queries.adminUpdateWidget.run({ id, data_json, is_active });
			return { success: true, section: 'telegram' };
		} catch {
			return fail(500, { error: 'Failed to update telegram widget' });
		}
	},

	// Product search for collections/showcase
	searchProducts: async ({ request }) => {
		const formData = await request.formData();
		const query = formData.get('query')?.toString() || '';
		const tab = formData.get('tab')?.toString() || 'collections';

		if (query.length < 2) return { searchResults: [], tab };

		try {
			const results = db.prepare(`
				SELECT p.id, p.name, p.sku, p.price, b.name as brand_name
				FROM products p
				LEFT JOIN brands b ON b.id = p.brand_id
				WHERE p.is_active = 1
				AND (p.name LIKE @q OR p.sku LIKE @q OR b.name LIKE @q)
				ORDER BY p.name LIMIT 10
			`).all({ q: `%${query}%` }) as any[];
			return { searchResults: results, tab };
		} catch {
			return { searchResults: [], tab };
		}
	}
};
