import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const cities = queries.getAllCitiesForSelect.all() as { id: number; name: string }[];
	const categories = queries.getAllCityArticleCategoriesForSelect.all() as { id: number; name: string }[];
	return { cities, categories };
};

/**
 * Parse simple YAML frontmatter from Markdown
 * Format:
 * ---
 * title: My Article
 * slug: my-article
 * category: pokupka-chasov
 * tags: rolex, luxury
 * meta_title: SEO Title
 * meta_description: SEO description
 * read_time: 5
 * ---
 * Content here...
 */
function parseFrontmatter(text: string): { meta: Record<string, string>; content: string } {
	const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { meta: {}, content: text };

	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx > 0) {
			const key = line.slice(0, idx).trim();
			const value = line.slice(idx + 1).trim();
			meta[key] = value;
		}
	}
	return { meta, content: match[2].trim() };
}

/**
 * Convert simple Markdown to HTML
 */
function markdownToHtml(md: string): string {
	return md
		.replace(/^### (.+)$/gm, '<h3>$1</h3>')
		.replace(/^## (.+)$/gm, '<h2>$1</h2>')
		.replace(/^# (.+)$/gm, '<h1>$1</h1>')
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/\n\n/g, '</p><p>')
		.replace(/^(?!<[h|p])(.+)/gm, '<p>$1</p>')
		.replace(/<p><\/p>/g, '');
}

export const actions: Actions = {
	importMarkdown: async ({ request }) => {
		const fd = await request.formData();
		const cityId = parseInt(fd.get('city_id')?.toString() || '0');
		const file = fd.get('file') as File | null;

		if (!cityId) return fail(400, { error: 'Select a city' });
		if (!file || file.size === 0) return fail(400, { error: 'Upload a Markdown file' });

		try {
			const text = await file.text();
			const { meta, content } = parseFrontmatter(text);
			const htmlContent = markdownToHtml(content);

			const title = meta.title;
			const slug = meta.slug;
			if (!title || !slug) return fail(400, { error: 'Markdown must have title and slug in frontmatter' });

			// Find category by slug if provided
			let categoryId: number | null = null;
			if (meta.category) {
				const cat = queries.listCityArticleCategories.all() as any[];
				const found = cat.find((c: any) => c.slug === meta.category);
				if (found) categoryId = found.id;
			}

			queries.createCityArticle.run({
				city_id: cityId,
				slug,
				title,
				excerpt: meta.excerpt || null,
				content: htmlContent,
				image_url: meta.image || null,
				template_type: meta.template || 'standard',
				meta_title: meta.meta_title || null,
				meta_description: meta.meta_description || null,
				category_id: categoryId,
				read_time: meta.read_time ? parseInt(meta.read_time) : null,
				is_published: meta.published === 'false' ? 0 : 1
			});

			// Add tags if provided
			if (meta.tags) {
				const tagNames = meta.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
				const allTags = queries.listCityArticleTags.all() as any[];
				const newArticle = queries.listCityArticlesByCity.all(cityId) as any[];
				const inserted = newArticle.find((a: any) => a.slug === slug);
				if (inserted) {
					for (const name of tagNames) {
						const tag = allTags.find((t: any) => t.name === name || t.slug === name);
						if (tag) queries.addTagToCityArticle.run(inserted.id, tag.id);
					}
				}
			}

			return { success: true, message: `Article "${title}" imported successfully` };
		} catch (err: any) {
			if (err.message?.includes('UNIQUE')) return fail(400, { error: 'Article with this slug already exists for this city' });
			return fail(500, { error: 'Import failed: ' + (err.message || '') });
		}
	},

	exportCsv: async ({ request }) => {
		const fd = await request.formData();
		const cityId = parseInt(fd.get('city_id')?.toString() || '0');

		if (!cityId) return fail(400, { error: 'Select a city' });

		const articles = queries.listCityArticlesByCity.all(cityId) as any[];

		// Build CSV
		const headers = ['id', 'slug', 'title', 'excerpt', 'category_name', 'template_type', 'meta_title', 'meta_description', 'read_time', 'is_published', 'views_count', 'published_at'];
		const rows = articles.map((a: any) =>
			headers.map(h => {
				const val = a[h] ?? '';
				const str = String(val).replace(/"/g, '""');
				return `"${str}"`;
			}).join(',')
		);

		const csv = [headers.join(','), ...rows].join('\n');

		return { success: true, csv, message: `Exported ${articles.length} articles` };
	}
};
