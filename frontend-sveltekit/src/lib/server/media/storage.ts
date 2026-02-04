import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';

/**
 * Root directory for all media storage.
 * Resolves to: <project-root>/data/media/images/
 */
const MEDIA_ROOT = resolve(process.cwd(), '..', 'data', 'media', 'images');

/** Entity types that map to subdirectories */
export type EntityType = 'products' | 'brands' | 'categories' | 'cities' | 'articles' | 'misc';

/**
 * Get the absolute filesystem path for a media file.
 * @param entity — subdirectory (e.g. 'products')
 * @param filename — the file name (e.g. 'rolex-submariner-a1b2c3d4.webp')
 */
export function getMediaPath(entity: EntityType, filename: string): string {
	return join(MEDIA_ROOT, entity, filename);
}

/**
 * Get the URL path for serving a media file.
 * Returns a path like: /media/images/products/rolex-submariner-a1b2c3d4.webp
 */
export function getMediaUrl(entity: EntityType, filename: string): string {
	return `/media/images/${entity}/${filename}`;
}

/**
 * Build a safe filename from a slug and hash.
 * @param slug — item slug (will be sanitized)
 * @param hash — content hash (8 chars)
 * @param suffix — optional suffix like '-thumb'
 */
export function buildFilename(slug: string, hash: string, suffix = ''): string {
	// Sanitize slug: keep only alphanumeric, hyphens, underscores
	const safe = slug.replace(/[^a-z0-9_-]/gi, '-').replace(/-+/g, '-').slice(0, 80);
	return `${safe}-${hash}${suffix}.webp`;
}

/**
 * Save a buffer to the media directory.
 * Creates parent directories if needed.
 * Returns the URL path.
 */
export function saveMedia(entity: EntityType, filename: string, buffer: Buffer): string {
	const filePath = getMediaPath(entity, filename);
	const dir = dirname(filePath);

	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	writeFileSync(filePath, buffer);
	return getMediaUrl(entity, filename);
}

/**
 * Delete a media file by its URL path.
 * Returns true if deleted, false if not found.
 */
export function deleteMedia(urlPath: string): boolean {
	// urlPath: /media/images/products/file.webp → products/file.webp
	const relative = urlPath.replace(/^\/media\/images\//, '');
	const filePath = join(MEDIA_ROOT, relative);

	if (existsSync(filePath)) {
		unlinkSync(filePath);
		return true;
	}
	return false;
}

/**
 * Read a media file by relative path (e.g. 'products/file.webp').
 * Returns { buffer, stat } or null if not found.
 */
export function readMedia(relativePath: string): { buffer: Buffer; size: number; mtime: Date } | null {
	const filePath = join(MEDIA_ROOT, relativePath);

	if (!existsSync(filePath)) {
		return null;
	}

	try {
		const stat = statSync(filePath);
		const buffer = readFileSync(filePath);
		return { buffer, size: stat.size, mtime: stat.mtimeMs ? new Date(stat.mtimeMs) : stat.mtime };
	} catch {
		return null;
	}
}

/**
 * Ensure all entity subdirectories exist.
 */
export function ensureMediaDirs(): void {
	const entities: EntityType[] = ['products', 'brands', 'categories', 'cities', 'articles', 'misc'];
	for (const entity of entities) {
		const dir = join(MEDIA_ROOT, entity);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	}
}
