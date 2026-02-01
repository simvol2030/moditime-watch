import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const hero = queries.adminGetHomeHero.get() as any;
	const services = queries.adminGetHomeServices.all() as any[];
	const stats = queries.adminGetHomeStats.all() as any[];
	const telegramWidget = queries.adminGetTelegramWidget.get() as any;

	return {
		hero,
		services,
		stats,
		telegramWidget: telegramWidget ? {
			id: telegramWidget.id,
			is_active: telegramWidget.is_active,
			data: telegramWidget.data_json ? JSON.parse(telegramWidget.data_json) : null
		} : null
	};
};

export const actions: Actions = {
	updateHero: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const tagline = formData.get('tagline')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const primary_cta_text = formData.get('primary_cta_text')?.toString() || '';
		const primary_cta_href = formData.get('primary_cta_href')?.toString() || '';
		const secondary_cta_text = formData.get('secondary_cta_text')?.toString() || '';
		const secondary_cta_href = formData.get('secondary_cta_href')?.toString() || '';
		const image_url = formData.get('image_url')?.toString() || '';
		const image_alt = formData.get('image_alt')?.toString() || '';
		const image_badge_label = formData.get('image_badge_label')?.toString() || '';
		const image_badge_title = formData.get('image_badge_title')?.toString() || '';
		const stats_json = formData.get('stats_json')?.toString() || '[]';
		const quick_links_json = formData.get('quick_links_json')?.toString() || '[]';
		const brands_json = formData.get('brands_json')?.toString() || '[]';

		if (!title) return fail(400, { error: 'Title is required' });

		try {
			// Validate JSON fields
			JSON.parse(stats_json);
			JSON.parse(quick_links_json);
			JSON.parse(brands_json);
		} catch {
			return fail(400, { error: 'Invalid JSON in stats, quick_links, or brands fields' });
		}

		try {
			queries.adminUpdateHomeHero.run({
				id, tagline, title, description,
				primary_cta_text, primary_cta_href,
				secondary_cta_text, secondary_cta_href,
				image_url, image_alt,
				image_badge_label, image_badge_title,
				stats_json, quick_links_json, brands_json
			});
			return { success: true, section: 'hero' };
		} catch {
			return fail(500, { error: 'Failed to update hero' });
		}
	},

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

		try {
			JSON.parse(data_json);
		} catch {
			return fail(400, { error: 'Invalid JSON for telegram widget' });
		}

		try {
			queries.adminUpdateWidget.run({ id, data_json, is_active });
			return { success: true, section: 'telegram' };
		} catch {
			return fail(500, { error: 'Failed to update telegram widget' });
		}
	}
};
