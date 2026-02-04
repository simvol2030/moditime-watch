import type { RequestHandler } from './$types';
import { readMedia } from '$lib/server/media/storage';

/**
 * GET /media/images/[...path]
 *
 * Serves images from data/media/images/ directory.
 * Supports cache headers for efficient caching.
 */
export const GET: RequestHandler = async ({ params }) => {
	const relativePath = params.path;

	if (!relativePath) {
		return new Response('Not found', { status: 404 });
	}

	// Security: prevent path traversal
	if (relativePath.includes('..') || relativePath.includes('\0')) {
		return new Response('Forbidden', { status: 403 });
	}

	const media = readMedia(relativePath);

	if (!media) {
		return new Response('Not found', { status: 404 });
	}

	// Determine content type
	const contentType = relativePath.endsWith('.webp')
		? 'image/webp'
		: relativePath.endsWith('.jpg') || relativePath.endsWith('.jpeg')
			? 'image/jpeg'
			: relativePath.endsWith('.png')
				? 'image/png'
				: 'application/octet-stream';

	return new Response(media.buffer, {
		headers: {
			'Content-Type': contentType,
			'Content-Length': String(media.size),
			'Cache-Control': 'public, max-age=31536000, immutable',
			'Last-Modified': media.mtime.toUTCString()
		}
	});
};
