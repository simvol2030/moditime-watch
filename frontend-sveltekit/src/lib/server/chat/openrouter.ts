import { queries } from '$lib/server/db/database';

// ============================================
// OpenRouter API Client (Session-24)
// ============================================

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface OpenRouterOptions {
	model: string;
	temperature: number;
	max_tokens: number;
	messages: OpenRouterMessage[];
}

export interface OpenRouterResponse {
	content: string;
	model: string;
	tokens_prompt: number;
	tokens_completion: number;
	cost: number;
}

export class OpenRouterError extends Error {
	constructor(
		message: string,
		public status?: number,
		public retryable: boolean = false
	) {
		super(message);
		this.name = 'OpenRouterError';
	}
}

// Approximate pricing per 1M tokens (input/output)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
	'google/gemini-2.0-flash-001': { input: 0.10, output: 0.40 },
	'meta-llama/llama-3.3-70b-instruct': { input: 0.10, output: 0.10 },
	'anthropic/claude-3.5-haiku': { input: 0.80, output: 4.00 }
};

/**
 * Get API key from chat_config DB or environment variable
 */
export function getApiKey(): string | null {
	try {
		const row = queries.getChatConfig.get('openrouter_api_key') as { value: string } | undefined;
		if (row?.value) return row.value;
	} catch { /* fallback to env */ }
	return process.env.OPENROUTER_API_KEY || null;
}

/**
 * Check monthly budget
 */
export function checkBudget(): { allowed: boolean; spent: number; limit: number } {
	try {
		const spendRow = queries.getMonthlyAISpend.get() as { total_cost: number } | undefined;
		const spent = spendRow?.total_cost || 0;

		const budgetRow = queries.getChatConfig.get('ai_monthly_budget') as { value: string } | undefined;
		const limit = parseFloat(budgetRow?.value || '10');

		if (limit <= 0) return { allowed: true, spent, limit: 0 }; // 0 = unlimited
		return { allowed: spent < limit, spent, limit };
	} catch {
		return { allowed: true, spent: 0, limit: 0 };
	}
}

/**
 * Estimate cost in USD
 */
export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
	const pricing = MODEL_PRICING[model] || { input: 0.50, output: 1.50 }; // conservative default
	return (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
}

/**
 * Call OpenRouter API with retry + fallback models
 *
 * Strategy:
 * - 3 attempts on primary model (1s, 2s, 4s backoff)
 * - If all fail, try each fallback model with 2 attempts
 */
export async function callOpenRouter(
	options: OpenRouterOptions,
	apiKey: string
): Promise<OpenRouterResponse> {
	const fallbackModels = getFallbackModels();

	// Try primary model with 3 retries
	const primaryResult = await tryModelWithRetries(options, apiKey, options.model, 3);
	if (primaryResult) return primaryResult;

	// Try fallback models
	for (const fallbackModel of fallbackModels) {
		if (fallbackModel === options.model) continue;
		const fallbackResult = await tryModelWithRetries(
			{ ...options, model: fallbackModel },
			apiKey,
			fallbackModel,
			2
		);
		if (fallbackResult) return fallbackResult;
	}

	throw new OpenRouterError('All models failed after retries', undefined, false);
}

async function tryModelWithRetries(
	options: OpenRouterOptions,
	apiKey: string,
	model: string,
	maxRetries: number
): Promise<OpenRouterResponse | null> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await singleRequest(options, apiKey, model);
		} catch (err) {
			const isRetryable = err instanceof OpenRouterError && err.retryable;
			if (!isRetryable || attempt === maxRetries) {
				if (attempt === maxRetries) return null; // exhausted retries
				throw err; // non-retryable error
			}
			// Exponential backoff: 1s, 2s, 4s
			const delay = Math.pow(2, attempt - 1) * 1000;
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
	return null;
}

async function singleRequest(
	options: OpenRouterOptions,
	apiKey: string,
	model: string
): Promise<OpenRouterResponse> {
	const body = JSON.stringify({
		model,
		messages: options.messages,
		temperature: options.temperature,
		max_tokens: options.max_tokens
	});

	const res = await fetch(OPENROUTER_URL, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'https://moditime-watch.ru',
			'X-Title': 'Moditime Watch Chatbot'
		},
		body
	});

	if (!res.ok) {
		const retryable = [429, 500, 502, 503].includes(res.status);
		let errorMsg = `OpenRouter API error ${res.status}`;
		try {
			const errBody = await res.json();
			errorMsg = errBody?.error?.message || errorMsg;
		} catch { /* ignore parse errors */ }
		throw new OpenRouterError(errorMsg, res.status, retryable);
	}

	const data = await res.json();
	const choice = data?.choices?.[0];

	if (!choice?.message?.content) {
		throw new OpenRouterError('Empty response from OpenRouter', undefined, true);
	}

	const usedModel = data.model || model;
	const promptTokens = data.usage?.prompt_tokens || 0;
	const completionTokens = data.usage?.completion_tokens || 0;

	return {
		content: choice.message.content,
		model: usedModel,
		tokens_prompt: promptTokens,
		tokens_completion: completionTokens,
		cost: estimateCost(usedModel, promptTokens, completionTokens)
	};
}

function getFallbackModels(): string[] {
	try {
		const row = queries.getChatConfig.get('ai_fallback_models') as { value: string } | undefined;
		if (row?.value) return JSON.parse(row.value);
	} catch { /* use defaults */ }
	return ['meta-llama/llama-3.3-70b-instruct'];
}
