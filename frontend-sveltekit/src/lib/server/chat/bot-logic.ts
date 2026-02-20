import { queries } from '$lib/server/db/database';
import { callOpenRouter, getApiKey, checkBudget, type OpenRouterMessage } from './openrouter';

// ============================================
// Bot Logic — Session-24: async + 3 modes + FAQ grounding
// ============================================

export interface BotResponse {
	reply: string;
	products?: ProductCard[];
	quick_replies?: string[];
	metadata?: Record<string, unknown>;
	show_contact_form?: boolean;
	response_mode: 'rules' | 'ai' | 'fallback';
	model?: string;
	tokens_prompt?: number;
	tokens_completion?: number;
	cost?: number;
}

interface ProductCard {
	id: number;
	name: string;
	brand: string;
	price: number;
	slug: string;
	image: string | null;
}

interface FaqEntry {
	id: number;
	question: string;
	answer: string;
	keywords: string | null;
	category: string;
}

// Rate limiting: in-memory map
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

// Cleanup old entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	for (const [key, val] of rateLimits) {
		if (val.resetAt < now) rateLimits.delete(key);
	}
}, 300_000);

export function checkRateLimit(sessionId: string): boolean {
	const now = Date.now();
	const entry = rateLimits.get(sessionId);
	if (!entry || entry.resetAt < now) {
		rateLimits.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
		return true;
	}
	if (entry.count >= RATE_LIMIT_MAX) return false;
	entry.count++;
	return true;
}

export function sanitizeMessage(input: string): string {
	return input
		.replace(/<[^>]*>/g, '') // strip HTML
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 500);
}

// Track consecutive fallbacks per session
const fallbackCounts = new Map<string, number>();

// Cleanup fallbackCounts every 5 minutes to prevent memory leak
setInterval(() => {
	if (fallbackCounts.size > 1000) fallbackCounts.clear();
}, 300_000);

// ============================================
// Main entry point — async, 3 modes
// ============================================

export async function generateResponse(message: string, sessionId: string): Promise<BotResponse> {
	const mode = getChatConfigValue('chat_mode') || 'auto';

	if (mode === 'rules') {
		return rulesResponse(message, sessionId);
	}

	if (mode === 'ai') {
		return aiResponse(message, sessionId);
	}

	// mode === 'auto': rules first, AI fallback
	const rulesResult = rulesResponse(message, sessionId);
	if (rulesResult.metadata?.matched_faq_id || rulesResult.products?.length || rulesResult.show_contact_form) {
		// Rules found a real match — return it
		return rulesResult;
	}

	// No rules match — try AI
	try {
		const aiResult = await aiResponse(message, sessionId);
		fallbackCounts.set(sessionId, 0);
		return aiResult;
	} catch {
		// AI failed — return rules fallback
		return rulesResult;
	}
}

// ============================================
// Rules-based response (Session-23 logic)
// ============================================

function rulesResponse(message: string, sessionId: string): BotResponse {
	const normalized = message.toLowerCase().trim();

	// 1. Quick reply intents (exact match)
	const quickReplyResponse = matchQuickReply(normalized);
	if (quickReplyResponse) {
		fallbackCounts.set(sessionId, 0);
		return { ...quickReplyResponse, response_mode: 'rules' };
	}

	// 2. FAQ matching
	const faqResponse = matchFaq(normalized);
	if (faqResponse) {
		fallbackCounts.set(sessionId, 0);
		return { ...faqResponse, response_mode: 'rules' };
	}

	// 3. Product matching
	const productResponse = matchProducts(normalized);
	if (productResponse) {
		fallbackCounts.set(sessionId, 0);
		return { ...productResponse, response_mode: 'rules' };
	}

	// 4. Fallback
	const fallbacks = (fallbackCounts.get(sessionId) || 0) + 1;
	fallbackCounts.set(sessionId, fallbacks);

	const offlineMsg = getChatConfigValue('offline_message') ||
		'К сожалению, я не смог найти ответ. Оставьте контакт, и мы свяжемся с вами.';

	if (fallbacks >= 3) {
		return {
			reply: offlineMsg,
			quick_replies: ['Связаться с консультантом'],
			show_contact_form: true,
			response_mode: 'fallback'
		};
	}

	return {
		reply: 'Я пока не нашёл точного ответа на ваш вопрос. Попробуйте уточнить или выберите тему:',
		quick_replies: getQuickReplies(),
		response_mode: 'fallback'
	};
}

// ============================================
// AI response (OpenRouter + FAQ grounding)
// ============================================

async function aiResponse(message: string, sessionId: string): Promise<BotResponse> {
	const apiKey = getApiKey();
	if (!apiKey) {
		return {
			reply: getChatConfigValue('offline_message') || 'Извините, AI-консультант временно недоступен.',
			quick_replies: getQuickReplies(),
			response_mode: 'fallback'
		};
	}

	const budget = checkBudget();
	if (!budget.allowed) {
		return {
			reply: getChatConfigValue('offline_message') || 'Извините, AI-консультант временно недоступен.',
			quick_replies: getQuickReplies(),
			response_mode: 'fallback'
		};
	}

	// Build context
	const history = getMessageHistory(sessionId);
	const faqContext = getRelevantFaq(message, 3);
	const systemPrompt = buildSystemPrompt(faqContext);
	const model = getChatConfigValue('ai_model') || 'google/gemini-2.0-flash-001';
	const temperature = parseFloat(getChatConfigValue('ai_temperature') || '0.7');
	const maxTokens = parseInt(getChatConfigValue('ai_max_tokens') || '500');

	const messages: OpenRouterMessage[] = [
		{ role: 'system', content: systemPrompt },
		...history,
		{ role: 'user', content: message }
	];

	const result = await callOpenRouter({ model, temperature, max_tokens: maxTokens, messages }, apiKey);

	return {
		reply: result.content,
		quick_replies: getQuickReplies(),
		response_mode: 'ai',
		model: result.model,
		tokens_prompt: result.tokens_prompt,
		tokens_completion: result.tokens_completion,
		cost: result.cost
	};
}

// ============================================
// FAQ grounding helpers
// ============================================

function getRelevantFaq(message: string, limit: number): FaqEntry[] {
	try {
		const allFaq = queries.getChatFaqActive.all() as FaqEntry[];
		const normalized = message.toLowerCase().trim();

		const scored = allFaq
			.map(faq => {
				if (!faq.keywords) return { faq, score: 0 };
				const keywords = faq.keywords.split(',').map(k => k.trim().toLowerCase());
				let score = 0;
				for (const kw of keywords) {
					if (kw && normalized.includes(kw)) score++;
				}
				return { faq, score };
			})
			.filter(item => item.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, limit);

		return scored.map(item => item.faq);
	} catch {
		return [];
	}
}

function buildSystemPrompt(faqEntries: FaqEntry[]): string {
	const base = getChatConfigValue('ai_system_prompt') ||
		'Ты Modi — профессиональный консультант интернет-магазина премиальных часов Moditime Watch.\nОтвечай кратко, по-русски, в дружелюбном тоне.\nПомогай с выбором часов, доставкой, гарантией и оплатой.\nНе выходи за рамки тематики магазина часов.\nЕсли не знаешь ответа — предложи связаться с менеджером.';

	if (faqEntries.length === 0) return base;

	const faqSection = faqEntries.map(f =>
		`В: ${f.question}\nО: ${f.answer}`
	).join('\n---\n');

	return `${base}\n\n<context>\nЧасто задаваемые вопросы:\n${faqSection}\n</context>`;
}

function getMessageHistory(sessionId: string): OpenRouterMessage[] {
	try {
		const depth = parseInt(getChatConfigValue('ai_history_depth') || '10');
		const rows = queries.getChatMessagesForContext.all(sessionId, depth) as { role: string; content: string }[];
		// Rows are DESC order — reverse to chronological
		return rows.reverse().map(r => ({
			role: r.role === 'user' ? 'user' as const : 'assistant' as const,
			content: r.content
		}));
	} catch {
		return [];
	}
}

// ============================================
// Rules matching helpers (from Session-23)
// ============================================

function matchQuickReply(normalized: string): Omit<BotResponse, 'response_mode'> | null {
	if (normalized === 'каталог часов') {
		try {
			const brands = queries.getAllBrands.all() as { name: string }[];
			const brandList = brands.slice(0, 5).map(b => b.name).join(', ');
			const products = getTopProducts(4);
			return {
				reply: `В нашем каталоге представлены часы ведущих мировых брендов: ${brandList} и другие.\n\nВот некоторые популярные модели:`,
				products,
				quick_replies: ['Доставка и оплата', 'Гарантия', 'Связаться с консультантом']
			};
		} catch {
			return {
				reply: 'Ознакомьтесь с нашим каталогом на странице /catalog. Там вы найдёте часы ведущих мировых брендов.',
				quick_replies: ['Доставка и оплата', 'Гарантия', 'Связаться с консультантом']
			};
		}
	}

	if (normalized === 'доставка и оплата') {
		return matchFaqByCategory('delivery') || matchFaqByCategory('payment') || null;
	}

	if (normalized === 'гарантия') {
		return matchFaqByCategory('warranty') || null;
	}

	if (normalized === 'связаться с консультантом') {
		return {
			reply: 'Оставьте ваши контактные данные, и наш менеджер свяжется с вами в ближайшее время.',
			show_contact_form: true,
			quick_replies: []
		};
	}

	return null;
}

function matchFaq(normalized: string): Omit<BotResponse, 'response_mode'> | null {
	try {
		const allFaq = queries.getChatFaqActive.all() as FaqEntry[];

		let bestMatch: FaqEntry | null = null;
		let bestScore = 0;

		for (const faq of allFaq) {
			if (!faq.keywords) continue;
			const keywords = faq.keywords.split(',').map(k => k.trim().toLowerCase());
			let score = 0;
			for (const kw of keywords) {
				if (kw && normalized.includes(kw)) score++;
			}
			if (score > bestScore) {
				bestScore = score;
				bestMatch = faq;
			}
		}

		if (bestMatch && bestScore > 0) {
			queries.incrementFaqMatchCount.run(bestMatch.id);
			return {
				reply: bestMatch.answer,
				quick_replies: getQuickReplies(),
				metadata: { matched_faq_id: bestMatch.id }
			};
		}
	} catch {
		// DB error — fall through
	}
	return null;
}

function matchFaqByCategory(category: string): Omit<BotResponse, 'response_mode'> | null {
	try {
		const faqs = queries.getChatFaqActive.all() as FaqEntry[];
		const matched = faqs.filter(f => f.category === category);
		if (matched.length > 0) {
			const answers = matched.map(f => f.answer).join('\n\n');
			for (const f of matched) queries.incrementFaqMatchCount.run(f.id);
			return {
				reply: answers,
				quick_replies: getQuickReplies()
			};
		}
	} catch {
		// fall through
	}
	return null;
}

function matchProducts(normalized: string): Omit<BotResponse, 'response_mode'> | null {
	try {
		// Check brand names
		const brands = queries.getAllBrands.all() as { id: number; name: string; slug: string }[];
		for (const brand of brands) {
			if (normalized.includes(brand.name.toLowerCase()) || normalized.includes(brand.slug)) {
				const products = getProductsByBrand(brand.id);
				if (products.length > 0) {
					return {
						reply: `Вот модели ${brand.name}, доступные в нашем каталоге:`,
						products,
						quick_replies: ['Доставка и оплата', 'Гарантия', 'Связаться с консультантом']
					};
				}
			}
		}

		// Check category-related keywords
		const categoryKeywords: Record<string, string[]> = {
			'мужские': ['мужские', 'мужчин', 'для мужчины', 'муж'],
			'спортивные': ['спортивные', 'спорт', 'дайвер', 'дайверские'],
		};

		const categories = queries.getAllCategories.all() as { id: number; name: string; slug: string }[];
		for (const cat of categories) {
			const keywords = categoryKeywords[cat.slug] || [cat.name.toLowerCase()];
			if (keywords.some(kw => normalized.includes(kw))) {
				const products = getProductsByCategory(cat.id);
				if (products.length > 0) {
					return {
						reply: `Вот часы из категории "${cat.name}":`,
						products,
						quick_replies: ['Каталог часов', 'Связаться с консультантом']
					};
				}
			}
		}

		// Generic watch query
		if (normalized.includes('час') || normalized.includes('модел') || normalized.includes('бестселлер') || normalized.includes('популярн')) {
			const products = getTopProducts(4);
			if (products.length > 0) {
				return {
					reply: 'Вот наши популярные модели:',
					products,
					quick_replies: ['Доставка и оплата', 'Гарантия', 'Связаться с консультантом']
				};
			}
		}
	} catch {
		// fall through
	}
	return null;
}

// ============================================
// Product helpers
// ============================================

function getTopProducts(limit: number): ProductCard[] {
	try {
		const rows = queries.getFeaturedProducts.all(limit) as any[];
		return rows.map(toProductCard);
	} catch {
		return [];
	}
}

function getProductsByBrand(brandId: number): ProductCard[] {
	try {
		const rows = queries.getActiveProductsByBrand.all(brandId) as any[];
		return rows.map(toProductCard);
	} catch {
		return [];
	}
}

function getProductsByCategory(categoryId: number): ProductCard[] {
	try {
		const rows = queries.getActiveProductsByCategory.all(categoryId) as any[];
		return rows.map(toProductCard);
	} catch {
		return [];
	}
}

function toProductCard(row: any): ProductCard {
	return {
		id: row.id,
		name: row.name,
		brand: row.brand_name || '',
		price: row.price,
		slug: row.slug,
		image: null
	};
}

// ============================================
// Config helpers
// ============================================

function getChatConfigValue(key: string): string | null {
	try {
		const row = queries.getChatConfig.get(key) as { value: string } | undefined;
		return row?.value ?? null;
	} catch {
		return null;
	}
}

function getQuickReplies(): string[] {
	try {
		const json = getChatConfigValue('quick_replies_json');
		if (json) return JSON.parse(json);
	} catch { /* use defaults */ }
	return ['Каталог часов', 'Доставка и оплата', 'Гарантия', 'Связаться с консультантом'];
}
