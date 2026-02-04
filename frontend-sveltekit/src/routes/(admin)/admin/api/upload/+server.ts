import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processImage, validateImage } from '$lib/server/media/image-processor';
import { saveMedia, buildFilename, getMediaUrl, type EntityType } from '$lib/server/media/storage';

const VALID_ENTITIES: EntityType[] = ['products', 'brands', 'categories', 'cities', 'articles', 'misc'];

/**
 * POST /admin/api/upload
 *
 * Upload an image file, process it (resize + WebP), store and return URLs.
 *
 * FormData fields:
 *   - file: File (required)
 *   - entity: string (required) — 'products' | 'brands' | 'categories' | 'cities' | 'articles' | 'misc'
 *   - slug: string (optional) — used in filename, defaults to 'image'
 *
 * Returns: { url, thumbUrl, width, height }
 */
export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const entity = formData.get('entity')?.toString() as EntityType;
	const slug = formData.get('slug')?.toString() || 'image';

	// Validate entity
	if (!entity || !VALID_ENTITIES.includes(entity)) {
		return json({ error: `Invalid entity. Must be one of: ${VALID_ENTITIES.join(', ')}` }, { status: 400 });
	}

	// Validate file
	if (!file) {
		return json({ error: 'No file provided' }, { status: 400 });
	}

	const validationError = validateImage(file);
	if (validationError) {
		return json({ error: validationError }, { status: 400 });
	}

	try {
		// Read file into buffer
		const arrayBuffer = await file.arrayBuffer();
		const inputBuffer = Buffer.from(arrayBuffer);

		// Process: resize + WebP + thumbnail
		const result = await processImage(inputBuffer);

		// Build filenames
		const mainFilename = buildFilename(slug, result.hash);
		const thumbFilename = buildFilename(slug, result.hash, '-thumb');

		// Save to disk
		const url = saveMedia(entity, mainFilename, result.buffer);
		const thumbUrl = saveMedia(entity, thumbFilename, result.thumbBuffer);

		return json({
			url,
			thumbUrl,
			width: result.width,
			height: result.height
		});
	} catch (err) {
		console.error('Image upload error:', err);
		return json({ error: 'Failed to process image' }, { status: 500 });
	}
};
