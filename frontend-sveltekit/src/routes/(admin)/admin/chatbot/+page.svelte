<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(d: string | null): string {
		if (!d) return '—';
		return new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
	}

	const modeLabels: Record<string, string> = { rules: 'Правила', ai: 'AI', auto: 'Авто' };
</script>

<div class="admin-page">
	<div class="page-header">
		<h1>Чатбот — Dashboard</h1>
		<div class="header-actions">
			<a href="/admin/chatbot/faq" class="btn-link">FAQ</a>
			<a href="/admin/chatbot/history" class="btn-link">История</a>
			<a href="/admin/chatbot/settings" class="btn-link">Настройки</a>
		</div>
	</div>

	<!-- Toggle -->
	<div class="card toggle-card">
		<form method="POST" action="?/toggleEnabled" use:enhance>
			<span class="toggle-label">Чатбот {data.isEnabled ? 'включён' : 'выключен'}</span>
			<button type="submit" class="toggle-btn" class:active={data.isEnabled}>
				{data.isEnabled ? 'Выключить' : 'Включить'}
			</button>
		</form>
	</div>

	<!-- Stats -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-value">{data.totalCount}</div>
			<div class="stat-label">Всего чатов</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{data.todayCount}</div>
			<div class="stat-label">Сегодня</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{data.waitingCount}</div>
			<div class="stat-label">Ожидают ответа</div>
		</div>
		<div class="stat-card">
			<div class="stat-value stat-mode">{modeLabels[data.chatMode] || data.chatMode}</div>
			<div class="stat-label">Режим бота</div>
		</div>
		{#if data.chatMode !== 'rules'}
			<div class="stat-card">
				<div class="stat-value stat-cost">${data.monthlySpend.toFixed(2)}</div>
				<div class="stat-label">AI расход / ${data.monthlyBudget > 0 ? data.monthlyBudget.toFixed(0) : '∞'}</div>
			</div>
		{/if}
	</div>

	<!-- Recent sessions -->
	<div class="card">
		<h2>Последние чаты</h2>
		{#if data.recentSessions.length === 0}
			<p class="empty">Чатов пока нет</p>
		{:else}
			<table class="table">
				<thead>
					<tr>
						<th>Сессия</th>
						<th>Посетитель</th>
						<th>Сообщений</th>
						<th>Статус</th>
						<th>Дата</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentSessions as s}
						<tr>
							<td><a href="/admin/chatbot/history?session={s.session_id}" class="session-link">{s.session_id.slice(0, 8)}...</a></td>
							<td>{s.visitor_name || '—'}</td>
							<td>{s.message_count}</td>
							<td>
								<span class="status-badge" class:active={s.status === 'active'} class:waiting={s.status === 'waiting_human'}>
									{s.status === 'active' ? 'Активный' : s.status === 'waiting_human' ? 'Ожидает' : 'Закрыт'}
								</span>
							</td>
							<td>{formatDate(s.last_message_at || s.created_at)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.admin-page { max-width: 1000px; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
	.page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
	.header-actions { display: flex; gap: 0.5rem; }
	.btn-link { padding: 0.5rem 1rem; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
	.btn-link:hover { background: #2563eb; color: white; }

	.card { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
	.card h2 { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem; }

	.toggle-card form { display: flex; align-items: center; justify-content: space-between; }
	.toggle-label { font-weight: 500; }
	.toggle-btn { padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #d1d5db; background: #f9fafb; cursor: pointer; font-size: 0.875rem; font-family: inherit; }
	.toggle-btn.active { background: #dcfce7; border-color: #86efac; color: #166534; }

	.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
	.stat-card { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
	.stat-value { font-size: 2rem; font-weight: 700; color: #1e40af; }
	.stat-label { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
	.stat-mode { font-size: 1.25rem; }
	.stat-cost { font-size: 1.25rem; color: #059669; }

	.table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
	.table th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
	.table td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; }
	.session-link { color: #3b82f6; text-decoration: none; font-family: monospace; font-size: 0.8rem; }
	.session-link:hover { text-decoration: underline; color: #3b82f6; }

	.status-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: #f3f4f6; color: #6b7280; }
	.status-badge.active { background: #dcfce7; color: #166534; }
	.status-badge.waiting { background: #fef3c7; color: #92400e; }

	.empty { color: #9ca3af; text-align: center; padding: 2rem; }
</style>
