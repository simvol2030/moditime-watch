<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(d: string | null): string {
		if (!d) return '—';
		return new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
	}

	function goToPage(page: number) {
		const params = new URLSearchParams();
		if (data.status) params.set('status', data.status);
		if (page > 1) params.set('page', String(page));
		goto(`/admin/chatbot/history${params.toString() ? '?' + params.toString() : ''}`, { invalidateAll: true });
	}
</script>

<div class="admin-page">
	<div class="page-header">
		<h1>История чатов</h1>
		<a href="/admin/chatbot" class="btn-link btn-back">&larr; Dashboard</a>
	</div>

	<!-- Filters -->
	<div class="filters">
		<a href="/admin/chatbot/history" class="filter-btn" class:active={!data.status}>Все</a>
		<a href="/admin/chatbot/history?status=active" class="filter-btn" class:active={data.status === 'active'}>Активные</a>
		<a href="/admin/chatbot/history?status=waiting_human" class="filter-btn" class:active={data.status === 'waiting_human'}>Ожидают</a>
		<a href="/admin/chatbot/history?status=closed" class="filter-btn" class:active={data.status === 'closed'}>Закрыты</a>
	</div>

	<div class="layout-split">
		<!-- Sessions list -->
		<div class="card sessions-list">
			{#if data.sessions.length === 0}
				<p class="empty">Нет чатов</p>
			{:else}
				{#each data.sessions as s}
					<a
						href="/admin/chatbot/history?session={s.session_id}{data.status ? '&status=' + data.status : ''}"
						class="session-row"
						class:selected={data.sessionId === s.session_id}
					>
						<div class="session-row__main">
							<span class="session-row__name">{s.visitor_name || 'Посетитель'}</span>
							<span class="session-row__count">{s.message_count} сообщ.</span>
						</div>
						<div class="session-row__meta">
							<span class="status-badge" class:active={s.status === 'active'} class:waiting={s.status === 'waiting_human'}>
								{s.status === 'active' ? 'Активный' : s.status === 'waiting_human' ? 'Ожидает' : 'Закрыт'}
							</span>
							<span class="session-row__date">{formatDate(s.last_message_at || s.created_at)}</span>
						</div>
					</a>
				{/each}

				<!-- Pagination -->
				{#if data.totalPages > 1}
					<div class="pagination">
						{#each Array.from({ length: data.totalPages }, (_, i) => i + 1) as p}
							<button class="page-btn" class:active={p === data.currentPage} onclick={() => goToPage(p)}>{p}</button>
						{/each}
					</div>
				{/if}
			{/if}
		</div>

		<!-- Session detail -->
		<div class="card session-detail">
			{#if data.selectedSession}
				<div class="detail-header">
					<h2>{data.selectedSession.visitor_name || 'Посетитель'}</h2>
					{#if data.selectedSession.visitor_phone}
						<span class="detail-contact">{data.selectedSession.visitor_phone}</span>
					{/if}
					{#if data.selectedSession.status !== 'closed'}
						<form method="POST" action="?/closeSession" use:enhance class="inline-form">
							<input type="hidden" name="session_id" value={data.selectedSession.session_id} />
							<button type="submit" class="btn-sm btn-close-session">Закрыть чат</button>
						</form>
					{/if}
				</div>

				{#if data.selectedSession.total_tokens > 0}
					<div class="session-stats">
						<span class="session-stat">Токены: {data.selectedSession.total_tokens}</span>
						<span class="session-stat">Стоимость: ${(data.selectedSession.total_cost || 0).toFixed(4)}</span>
					</div>
				{/if}

				<div class="messages-list">
					{#each data.sessionMessages as msg}
						<div class="msg msg--{msg.role}">
							<div class="msg__role">
								{msg.role === 'user' ? 'Посетитель' : msg.role === 'bot' ? 'Modi' : msg.role === 'human' ? 'Оператор' : 'Система'}
								{#if msg.role === 'bot' && msg.response_mode}
									<span class="mode-badge mode-badge--{msg.response_mode}">
										{msg.response_mode === 'rules' ? 'правила' : msg.response_mode === 'ai' ? 'AI' : 'fallback'}
									</span>
								{/if}
							</div>
							<div class="msg__content">{msg.content}</div>
							<div class="msg__meta">
								<span class="msg__time">{formatDate(msg.created_at)}</span>
								{#if msg.role === 'bot' && msg.response_mode === 'ai' && msg.tokens_prompt}
									<span class="msg__tokens">{msg.tokens_prompt + (msg.tokens_completion || 0)} tok · ${(msg.cost || 0).toFixed(4)}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<!-- Add note -->
				<form method="POST" action="?/addNote" use:enhance class="note-form">
					<input type="hidden" name="session_id" value={data.selectedSession.session_id} />
					<input type="text" name="note" placeholder="Добавить заметку оператора..." class="note-input" required />
					<button type="submit" class="btn-sm btn-save">Отправить</button>
				</form>
			{:else}
				<p class="empty">Выберите чат слева</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.admin-page { max-width: 1200px; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
	.page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
	.btn-link { padding: 0.5rem 1rem; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
	.btn-link:hover { color: white; }
	.btn-back { background: #6b7280; }
	.btn-back:hover { background: #4b5563; }

	.filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
	.filter-btn { padding: 0.375rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.8rem; text-decoration: none; color: #374151; background: white; }
	.filter-btn:hover { background: #f3f4f6; color: #374151; }
	.filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

	.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 1rem; }
	.card { background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

	.sessions-list { max-height: 600px; overflow-y: auto; }
	.session-row { display: block; padding: 0.75rem; border-bottom: 1px solid #f3f4f6; text-decoration: none; color: inherit; }
	.session-row:hover { background: #f9fafb; color: inherit; }
	.session-row.selected { background: #eff6ff; border-left: 3px solid #3b82f6; }
	.session-row__main { display: flex; justify-content: space-between; }
	.session-row__name { font-weight: 500; font-size: 0.875rem; }
	.session-row__count { font-size: 0.75rem; color: #9ca3af; }
	.session-row__meta { display: flex; justify-content: space-between; margin-top: 4px; }
	.session-row__date { font-size: 0.75rem; color: #9ca3af; }

	.status-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 500; background: #f3f4f6; color: #6b7280; }
	.status-badge.active { background: #dcfce7; color: #166534; }
	.status-badge.waiting { background: #fef3c7; color: #92400e; }

	.detail-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
	.detail-header h2 { font-size: 1.1rem; margin: 0; }
	.detail-contact { font-size: 0.8rem; color: #3b82f6; }

	.messages-list { max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem; }
	.msg { padding: 0.5rem 0; border-bottom: 1px solid #f9fafb; }
	.msg:last-child { border: none; }
	.msg__role { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
	.msg--user .msg__role { color: #3b82f6; }
	.msg--bot .msg__role { color: #059669; }
	.msg--human .msg__role { color: #d97706; }
	.msg--system .msg__role { color: #9ca3af; }
	.msg__content { font-size: 0.85rem; margin: 4px 0; white-space: pre-wrap; }
	.msg__meta { display: flex; align-items: center; gap: 0.75rem; }
	.msg__time { font-size: 0.7rem; color: #9ca3af; }
	.msg__tokens { font-size: 0.65rem; color: #6b7280; font-family: monospace; }

	.mode-badge { padding: 1px 6px; border-radius: 8px; font-size: 0.6rem; font-weight: 500; margin-left: 0.5rem; vertical-align: middle; }
	.mode-badge--rules { background: #dcfce7; color: #166534; }
	.mode-badge--ai { background: #dbeafe; color: #1e40af; }
	.mode-badge--fallback { background: #f3f4f6; color: #6b7280; }

	.session-stats { display: flex; gap: 1rem; padding: 0.5rem 0.75rem; background: #f9fafb; border-radius: 6px; margin-bottom: 0.75rem; font-size: 0.8rem; }
	.session-stat { color: #374151; }

	.note-form { display: flex; gap: 0.5rem; }
	.note-input { flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.85rem; font-family: inherit; }
	.btn-sm { padding: 0.375rem 0.75rem; border: 1px solid #d1d5db; background: #f9fafb; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-family: inherit; }
	.btn-save { background: #3b82f6; color: white; border-color: #3b82f6; }
	.btn-close-session { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
	.inline-form { display: inline; }

	.pagination { display: flex; gap: 0.25rem; padding: 0.75rem 0; justify-content: center; }
	.page-btn { width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-size: 0.8rem; font-family: inherit; }
	.page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

	.empty { color: #9ca3af; text-align: center; padding: 2rem; }

	@media (max-width: 768px) {
		.layout-split { grid-template-columns: 1fr; }
	}
</style>
