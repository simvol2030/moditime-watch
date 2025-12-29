import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { randomBytes } from 'crypto';

// Импортируем database для инициализации при старте сервера
import '$lib/server/db/database';

// Reserved subdomains that should not be treated as city slugs
const RESERVED_SUBDOMAINS = new Set(['www', 'quiz', 'admin', 'api', 'cdn', 'static', 'mail', 'twa']);

/**
 * Subdomain Handler Hook
 * Detects city subdomains like moscow.moditime-watch.ru
 * and rewrites URL to /city/{slug} internally (no visible redirect)
 */
const subdomainHandler: Handle = async ({ event, resolve }) => {
	const host = event.request.headers.get('host') || '';

	// Pattern: {city}.moditime-watch.ru
	const match = host.match(/^([a-z0-9-]+)\.moditime-watch\.ru$/);

	if (match && match[1] && !RESERVED_SUBDOMAINS.has(match[1])) {
		const citySlug = match[1];

		// Store in locals for use in layouts and pages
		event.locals.citySlug = citySlug;

		// Rewrite homepage to city page (internal, no visible redirect)
		if (event.url.pathname === '/') {
			// Create new URL with /city/{slug} path
			const newUrl = new URL(event.url);
			newUrl.pathname = `/city/${citySlug}`;

			// Create new request with rewritten URL
			const newRequest = new Request(newUrl.toString(), event.request);

			// Update event.url for routing
			Object.defineProperty(event, 'url', {
				value: newUrl,
				writable: false
			});
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
	subdomainHandler,   // 1. Определение города по поддомену (первым!)
	requestLogger,      // 2. Логирование (чтобы замерить всё)
	securityHeaders,    // 3. Security headers (рано, чтобы защитить всё)
	csrfProtection      // 4. CSRF защита (после headers)
);
