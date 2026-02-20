<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let quickReplies = $state<string[]>([...data.quickReplies]);

	function addQuickReply() {
		if (quickReplies.length < 8) quickReplies = [...quickReplies, ''];
	}

	function removeQuickReply(index: number) {
		quickReplies = quickReplies.filter((_, i) => i !== index);
	}

	function c(key: string, fallback = ''): string {
		return data.config[key] ?? fallback;
	}

	function getWorkingHours(): { start: string; end: string } {
		try { return JSON.parse(c('working_hours', '{"start":"10:00","end":"20:00"}')); }
		catch { return { start: '10:00', end: '20:00' }; }
	}
</script>

<div class="admin-page">
	<div class="page-header">
		<h1>Настройки чатбота</h1>
		<a href="/admin/chatbot" class="btn-link btn-back">&larr; Dashboard</a>
	</div>

	{#if form?.success}
		<div class="alert alert-success">Настройки сохранены</div>
	{/if}
	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<form method="POST" action="?/save" use:enhance>
		<!-- Bot personality -->
		<div class="card">
			<h2>Персона бота</h2>
			<div class="form-grid">
				<div class="form-group">
					<label for="bot_name">Имя бота</label>
					<input type="text" id="bot_name" name="bot_name" value={c('bot_name', 'Modi')} maxlength="50" />
				</div>
				<div class="form-group">
					<label for="bot_avatar_emoji">Аватар (эмодзи)</label>
					<input type="text" id="bot_avatar_emoji" name="bot_avatar_emoji" value={c('bot_avatar_emoji', '\u231A')} maxlength="4" />
				</div>
				<div class="form-group full">
					<label for="welcome_message">Приветственное сообщение</label>
					<textarea id="welcome_message" name="welcome_message" rows="2" maxlength="500">{c('welcome_message', 'Здравствуйте! Я Modi — ваш консультант по часам. Чем могу помочь?')}</textarea>
				</div>
				<div class="form-group full">
					<label for="offline_message">Сообщение при отсутствии ответа</label>
					<textarea id="offline_message" name="offline_message" rows="2" maxlength="500">{c('offline_message', 'К сожалению, я не смог найти ответ. Оставьте контакт, и мы свяжемся с вами.')}</textarea>
				</div>
			</div>
		</div>

		<!-- Quick replies -->
		<div class="card">
			<h2>Быстрые ответы</h2>
			<div class="quick-replies">
				{#each quickReplies as qr, i}
					<div class="qr-row">
						<input type="text" name="quick_reply_{i}" bind:value={quickReplies[i]} placeholder="Текст быстрого ответа" maxlength="100" />
						<button type="button" class="btn-sm btn-delete" onclick={() => removeQuickReply(i)}>x</button>
					</div>
				{/each}
				{#if quickReplies.length < 8}
					<button type="button" class="btn-sm btn-add" onclick={addQuickReply}>+ Добавить</button>
				{/if}
			</div>
		</div>

		<!-- Behavior -->
		<div class="card">
			<h2>Поведение</h2>
			<div class="form-grid">
				<div class="form-group">
					<label for="auto_open_delay">Автооткрытие (секунды, 0 = выкл)</label>
					<input type="number" id="auto_open_delay" name="auto_open_delay" value={c('auto_open_delay', '0')} min="0" max="300" />
				</div>
				<div class="form-group"></div>
				<div class="form-group">
					<label for="wh_start">Часы работы: начало</label>
					<input type="time" id="wh_start" name="working_hours_start" value={getWorkingHours().start} />
				</div>
				<div class="form-group">
					<label for="wh_end">Часы работы: конец</label>
					<input type="time" id="wh_end" name="working_hours_end" value={getWorkingHours().end} />
				</div>
			</div>
		</div>

		<!-- Mode -->
		<div class="card">
			<h2>Режим работы</h2>
			<div class="radio-group">
				<label class="radio-card">
					<input type="radio" name="chat_mode" value="rules" checked={c('chat_mode', 'auto') === 'rules'} />
					<div>
						<strong>Правила</strong>
						<span class="radio-desc">Только FAQ и ключевые слова. Без AI, без расходов.</span>
					</div>
				</label>
				<label class="radio-card">
					<input type="radio" name="chat_mode" value="ai" checked={c('chat_mode', 'auto') === 'ai'} />
					<div>
						<strong>AI</strong>
						<span class="radio-desc">Все ответы через OpenRouter AI. Требуется API ключ.</span>
					</div>
				</label>
				<label class="radio-card">
					<input type="radio" name="chat_mode" value="auto" checked={c('chat_mode', 'auto') === 'auto'} />
					<div>
						<strong>Авто</strong>
						<span class="radio-desc">Сначала правила, если нет совпадения — AI. Оптимальный режим.</span>
					</div>
				</label>
			</div>
		</div>

		<!-- OpenRouter AI -->
		<div class="card">
			<h2>OpenRouter AI</h2>
			<div class="form-grid">
				<div class="form-group full">
					<label for="openrouter_api_key">API ключ</label>
					<input type="password" id="openrouter_api_key" name="openrouter_api_key" value="" placeholder={c('openrouter_api_key') ? '••••••••' : 'Введите ключ OpenRouter'} />
					<span class="hint">Оставьте пустым, чтобы не менять. Env: OPENROUTER_API_KEY</span>
				</div>
				<div class="form-group">
					<label for="ai_model">Модель</label>
					<select id="ai_model" name="ai_model">
						<option value="google/gemini-2.0-flash-001" selected={c('ai_model', 'google/gemini-2.0-flash-001') === 'google/gemini-2.0-flash-001'}>Gemini 2.0 Flash</option>
						<option value="google/gemini-2.5-flash-preview" selected={c('ai_model') === 'google/gemini-2.5-flash-preview'}>Gemini 2.5 Flash Preview</option>
						<option value="anthropic/claude-3.5-haiku" selected={c('ai_model') === 'anthropic/claude-3.5-haiku'}>Claude 3.5 Haiku</option>
						<option value="openai/gpt-4o-mini" selected={c('ai_model') === 'openai/gpt-4o-mini'}>GPT-4o Mini</option>
						<option value="mistralai/mistral-small-latest" selected={c('ai_model') === 'mistralai/mistral-small-latest'}>Mistral Small</option>
					</select>
				</div>
				<div class="form-group">
					<label for="ai_temperature">Температура: {c('ai_temperature', '0.7')}</label>
					<input type="range" id="ai_temperature" name="ai_temperature" min="0" max="2" step="0.1" value={c('ai_temperature', '0.7')} />
					<span class="hint">0 = точные ответы, 2 = креативные</span>
				</div>
				<div class="form-group">
					<label for="ai_max_tokens">Макс. токенов ответа</label>
					<input type="number" id="ai_max_tokens" name="ai_max_tokens" value={c('ai_max_tokens', '500')} min="50" max="4000" />
				</div>
				<div class="form-group">
					<label for="ai_history_depth">Глубина контекста (сообщений)</label>
					<input type="number" id="ai_history_depth" name="ai_history_depth" value={c('ai_history_depth', '10')} min="0" max="50" />
				</div>
				<div class="form-group full">
					<label for="ai_system_prompt">Системный промпт</label>
					<textarea id="ai_system_prompt" name="ai_system_prompt" rows="5" maxlength="2000">{c('ai_system_prompt', 'Ты Modi — профессиональный консультант интернет-магазина премиальных часов Moditime Watch.\nОтвечай кратко, по-русски, в дружелюбном тоне.\nПомогай с выбором часов, доставкой, гарантией и оплатой.\nНе выходи за рамки тематики магазина часов.\nЕсли не знаешь ответа — предложи связаться с менеджером.')}</textarea>
				</div>
			</div>
		</div>

		<!-- Budget -->
		<div class="card">
			<h2>Бюджет AI</h2>
			<div class="form-grid">
				<div class="form-group">
					<label for="ai_monthly_budget">Месячный лимит ($)</label>
					<input type="number" id="ai_monthly_budget" name="ai_monthly_budget" value={c('ai_monthly_budget', '10')} min="0" step="1" />
					<span class="hint">0 = без лимита</span>
				</div>
				<div class="form-group">
					<label>Расход за месяц</label>
					<div class="budget-display">
						<span class="budget-spent">${data.monthlySpend.toFixed(2)}</span>
						<span class="budget-sep">/</span>
						<span class="budget-limit">${parseFloat(c('ai_monthly_budget', '10')) > 0 ? parseFloat(c('ai_monthly_budget', '10')).toFixed(0) : '∞'}</span>
					</div>
				</div>
			</div>
		</div>

		<button type="submit" class="btn-primary">Сохранить настройки</button>
	</form>
</div>

<style>
	.admin-page { max-width: 800px; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	.page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
	.btn-link { padding: 0.5rem 1rem; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
	.btn-link:hover { color: white; }
	.btn-back { background: #6b7280; }
	.btn-back:hover { background: #4b5563; }

	.card { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
	.card h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; }

	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
	.form-group { display: flex; flex-direction: column; gap: 0.25rem; }
	.form-group.full { grid-column: 1 / -1; }
	.form-group label { font-size: 0.8rem; font-weight: 500; color: #374151; }
	.form-group input, .form-group textarea, .form-group select {
		padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; font-family: inherit;
	}

	.quick-replies { display: flex; flex-direction: column; gap: 0.5rem; }
	.qr-row { display: flex; gap: 0.5rem; }
	.qr-row input { flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; font-family: inherit; }
	.btn-sm { padding: 0.375rem 0.75rem; border: 1px solid #d1d5db; background: #f9fafb; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-family: inherit; }
	.btn-delete { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
	.btn-add { background: #f0fdf4; color: #166534; border-color: #86efac; align-self: flex-start; }

	.btn-primary { padding: 0.625rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; font-family: inherit; }
	.btn-primary:hover { background: #2563eb; }

	.alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
	.alert-success { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }
	.alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

	.radio-group { display: flex; flex-direction: column; gap: 0.5rem; }
	.radio-card { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; }
	.radio-card:has(input:checked) { background: #eff6ff; border-color: #3b82f6; }
	.radio-card input { margin-top: 3px; }
	.radio-card strong { display: block; font-size: 0.875rem; }
	.radio-desc { font-size: 0.75rem; color: #6b7280; }

	.hint { font-size: 0.7rem; color: #9ca3af; }

	.budget-display { display: flex; align-items: baseline; gap: 0.25rem; padding: 0.5rem 0; }
	.budget-spent { font-size: 1.5rem; font-weight: 700; color: #059669; }
	.budget-sep { color: #9ca3af; }
	.budget-limit { font-size: 1rem; color: #6b7280; }
</style>
