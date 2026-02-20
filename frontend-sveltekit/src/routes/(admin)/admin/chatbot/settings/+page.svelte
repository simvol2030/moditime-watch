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
</style>
