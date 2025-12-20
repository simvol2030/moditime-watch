import { type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { randomBytes } from 'crypto';

// Импортируем database для инициализации при старте сервера
import { db } from '$lib/server/db/database';

// Cache city slugs in memory for fast subdomain lookup
let citySlugCache: Set<string> | null = null;
const CITY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cityCacheTime = 0;

function getCitySlugCache(): Set<string> {
	const now = Date.now();
	if (!citySlugCache || now - cityCacheTime > CITY_CACHE_TTL) {
		try {
			const cities = db.prepare('SELECT slug FROM cities WHERE is_active = 1').all() as { slug: string }[];
			citySlugCache = new Set(cities.map(c => c.slug));
			cityCacheTime = now;
		} catch {
			citySlugCache = new Set();
		}
	}
	return citySlugCache;
}

/**
 * Subdomain Routing Hook
 * Handles city subdomains (moscow.moditimewatch.ru → /city/moscow)
 *
 * Configured domains (from environment or defaults):
 * - moditimewatch.ru (production)
 * - moditimewatch.com (alias)
 * - localhost (development)
 *
 * Any subdomain that matches an active city slug is rewritten to /city/{slug}
 */
const subdomainRouting: Handle = async ({ event, resolve }) => {
	const host = event.request.headers.get('host') || '';

	// Extract subdomain from host
	// moscow.moditimewatch.ru → subdomain = "moscow"
	// www.moditimewatch.ru → subdomain = "www"
	// moditimewatch.ru → subdomain = ""
	// localhost:5173 → subdomain = ""

	// Main domains to recognize
	const mainDomains = ['moditimewatch.ru', 'moditimewatch.com', 'localhost'];

	let subdomain = '';

	for (const domain of mainDomains) {
		// Check if host ends with or equals the main domain
		if (host === domain || host.startsWith(domain + ':')) {
			// No subdomain
			subdomain = '';
			break;
		}

		// Check for subdomain pattern: {subdomain}.{domain}
		const domainWithDot = '.' + domain;
		if (host.includes(domainWithDot)) {
			const parts = host.split(domainWithDot);
			if (parts.length > 0 && parts[0]) {
				subdomain = parts[0].split('.').pop() || ''; // Get the last subdomain part
				break;
			}
		}
	}

	// Skip common subdomains that are not city subdomains
	const ignoredSubdomains = new Set(['www', 'admin', 'api', 'cdn', 'static', 'assets', 'mail', 'smtp']);
	if (subdomain && ignoredSubdomains.has(subdomain)) {
		subdomain = '';
	}

	// If we have a subdomain, check if it's a valid city
	if (subdomain) {
		const validCities = getCitySlugCache();

		if (validCities.has(subdomain)) {
			// Store city slug in locals for use in pages
			event.locals.citySlug = subdomain;
			event.locals.isSubdomain = true;

			// If user is on root path of subdomain, redirect/rewrite to city page
			const pathname = event.url.pathname;

			// Rewrite root to city page
			if (pathname === '/' || pathname === '') {
				// Internal rewrite to /city/{slug}
				const url = new URL(event.url);
				url.pathname = `/city/${subdomain}`;
				event.url = url;

				// Also update the request URL for downstream handlers
				Object.defineProperty(event, 'url', { value: url, writable: false });
			}

			// Handle city article paths: /article/{slug} → /city/{city}/article/{slug}
			if (pathname.startsWith('/article/')) {
				const url = new URL(event.url);
				url.pathname = `/city/${subdomain}${pathname}`;
				event.url = url;
				Object.defineProperty(event, 'url', { value: url, writable: false });
			}
		}
	}

	return resolve(event);
};

/**
 * Security Headers Hook
 * Adds important security headers to all responses
 */
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Content Security Policy - защита от XSS атак
	// Разрешаем собственные скрипты, стили и analytics провайдеры
	const csp = [
		"default-src 'self'",
		// Analytics: GTM, GA, Yandex Metrika
		"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://mc.yandex.ru",
		"style-src 'self' 'unsafe-inline'", // unsafe-inline для inline стилей Svelte
		"img-src 'self' data: https: https://mc.yandex.ru https://www.google-analytics.com",
		"font-src 'self' data:",
		// Analytics connections
		"connect-src 'self' https://www.google-analytics.com https://mc.yandex.ru https://region1.google-analytics.com",
		"frame-src https://www.googletagmanager.com", // GTM может использовать iframe
		"frame-ancestors 'none'", // запрещаем iframe embedding нашего сайта
		"base-uri 'self'",
		"form-action 'self'"
	].join('; ');

	response.headers.set('Content-Security-Policy', csp);

	// Запрещаем встраивание сайта в iframe (защита от clickjacking)
	response.headers.set('X-Frame-Options', 'DENY');

	// Запрещаем браузеру определять MIME type автоматически
	response.headers.set('X-Content-Type-Options', 'nosniff');

	// Включаем защиту от XSS в старых браузерах
	response.headers.set('X-XSS-Protection', '1; mode=block');

	// Referrer Policy - контролируем передачу referrer
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	// Permissions Policy - отключаем ненужные API браузера
	response.headers.set(
		'Permissions-Policy',
		'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=()'
	);

	// HSTS - заставляем использовать HTTPS (только в production)
	if (process.env.NODE_ENV === 'production') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	}

	return response;
};

/**
 * CSRF Protection Hook
 * Проверяет CSRF токены для всех POST/PUT/DELETE запросов
 */
const csrfProtection: Handle = async ({ event, resolve }) => {
	const { request, cookies } = event;

	// Генерируем CSRF токен для GET запросов
	if (request.method === 'GET') {
		let csrfToken = cookies.get('csrf_token');

		// Создаём новый токен если его нет
		if (!csrfToken) {
			csrfToken = randomBytes(32).toString('base64');
			cookies.set('csrf_token', csrfToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 // 24 часа
			});
		}

		// Добавляем токен в locals для доступа на страницах
		event.locals.csrfToken = csrfToken;
	}

	// Проверяем CSRF токен для мутирующих запросов
	if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
		const cookieToken = cookies.get('csrf_token');

		// Логин endpoint - особый случай, там нет токена до первого GET
		const isLoginEndpoint = event.url.pathname === '/login';

		if (!isLoginEndpoint) {
			// Получаем токен из заголовка или из формы
			const headerToken = request.headers.get('x-csrf-token');

			// Для form submissions проверяем в body
			let formToken: string | null = null;
			if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
				try {
					const formData = await request.clone().formData();
					formToken = formData.get('csrf_token')?.toString() || null;
				} catch {
					// Если не можем распарсить - продолжаем без form token
				}
			}

			const submittedToken = headerToken || formToken;

			// Проверяем токен
			if (!cookieToken || !submittedToken || cookieToken !== submittedToken) {
				// Публичные endpoints без защиты
				const publicEndpoints = ['/api/health'];
				if (!publicEndpoints.includes(event.url.pathname)) {
					console.warn(`CSRF token mismatch for ${request.method} ${event.url.pathname}`);

					// В development режиме просто предупреждаем, в production блокируем
					if (process.env.NODE_ENV === 'production') {
						return new Response('CSRF token validation failed', { status: 403 });
					}
				}
			}
		}
	}

	return resolve(event);
};

/**
 * Request Logging Hook (опционально, для debugging)
 */
const requestLogger: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const response = await resolve(event);
	const duration = Date.now() - start;

	// Логируем только в development
	if (process.env.NODE_ENV !== 'production') {
		console.log(`${event.request.method} ${event.url.pathname} - ${response.status} (${duration}ms)`);
	}

	return response;
};

/**
 * Комбинируем все hooks в правильном порядке
 */
export const handle = sequence(
	requestLogger,      // 1. Логирование (первым, чтобы замерить всё)
	subdomainRouting,   // 2. Subdomain routing (до security, чтобы правильно обработать URL)
	securityHeaders,    // 3. Security headers (рано, чтобы защитить всё)
	csrfProtection      // 4. CSRF защита (после headers)
);
