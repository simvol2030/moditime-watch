import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const getHero = db.prepare('SELECT * FROM home_hero WHERE is_active = 1 LIMIT 1');
const getServices = db.prepare('SELECT * FROM home_services ORDER BY position');
const getStats = db.prepare('SELECT * FROM home_service_stats ORDER BY position');
const getTelegramWidget = db.prepare("SELECT * FROM widgets WHERE type = 'telegram_cta' AND is_active = 1 LIMIT 1");

const updateHero = db.prepare(`
	UPDATE home_hero SET
		tagline = @tagline,
		title = @title,
		description = @description,
		primary_cta_text = @primary_cta_text,
		primary_cta_href = @primary_cta_href,
		secondary_cta_text = @secondary_cta_text,
		secondary_cta_href = @secondary_cta_href,
		image_url = @image_url,
		image_alt = @image_alt,
		image_badge_label = @image_badge_label,
		image_badge_title = @image_badge_title,
		stats_json = @stats_json,
		quick_links_json = @quick_links_json,
		brands_json = @brands_json
	WHERE id = @id
`);

const updateService = db.prepare(`
	UPDATE home_services SET
		icon_svg = @icon_svg,
		title = @title,
		description = @description,
		link_text = @link_text,
		link_href = @link_href,
		position = @position,
		is_active = @is_active
	WHERE id = @id
`);

const createService = db.prepare(`
	INSERT INTO home_services (icon_svg, title, description, link_text, link_href, position, is_active)
	VALUES (@icon_svg, @title, @description, @link_text, @link_href, @position, @is_active)
`);

const deleteService = db.prepare('DELETE FROM home_services WHERE id = ?');

const updateStat = db.prepare('UPDATE home_service_stats SET label = @label, value = @value, position = @position WHERE id = @id');
const createStat = db.prepare('INSERT INTO home_service_stats (label, value, position) VALUES (@label, @value, @position)');
const deleteStat = db.prepare('DELETE FROM home_service_stats WHERE id = ?');

const updateWidget = db.prepare('UPDATE widgets SET data_json = @data_json, is_active = @is_active WHERE id = @id');

export const load: PageServerLoad = async () => {
	const hero = getHero.get() as any;
	const services = getServices.all() as any[];
	const stats = getStats.all() as any[];
	const telegramWidget = getTelegramWidget.get() as any;

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
			updateHero.run({
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
			updateService.run({ id, icon_svg, title, description, link_text, link_href, position, is_active });
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
			createService.run({ icon_svg, title, description, link_text, link_href, position, is_active });
			return { success: true, section: 'services' };
		} catch {
			return fail(500, { error: 'Failed to create service' });
		}
	},

	deleteService: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			deleteService.run(id);
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
			updateStat.run({ id, label, value, position });
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
			createStat.run({ label, value, position });
			return { success: true, section: 'stats' };
		} catch {
			return fail(500, { error: 'Failed to create stat' });
		}
	},

	deleteStat: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			deleteStat.run(id);
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
			updateWidget.run({ id, data_json, is_active });
			return { success: true, section: 'telegram' };
		} catch {
			return fail(500, { error: 'Failed to update telegram widget' });
		}
	}
};
