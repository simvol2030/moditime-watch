<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let showCreate = $state(false);
	let editingId = $state<number | null>(null);

	const categories = [
		{ value: 'general', label: 'Общее' },
		{ value: 'delivery', label: 'Доставка' },
		{ value: 'payment', label: 'Оплата' },
		{ value: 'warranty', label: 'Гарантия' },
		{ value: 'returns', label: 'Возврат' }
	];
</script>

<div class="admin-page">
	<div class="page-header">
		<h1>База знаний</h1>
		<div class="header-actions">
			<a href="/admin/chatbot" class="btn-link btn-back">&larr; Dashboard</a>
			<button class="btn-link" onclick={() => showCreate = !showCreate}>
				{showCreate ? 'Отмена' : '+ Добавить FAQ'}
			</button>
		</div>
	</div>

	<!-- Create form -->
	{#if showCreate}
		<div class="card">
			<h2>Новый FAQ</h2>
			<form method="POST" action="?/create" use:enhance={() => { return async ({ update }) => { await update(); showCreate = false; }; }}>
				<div class="form-grid">
					<div class="form-group full">
						<label for="new-q">Вопрос</label>
						<input type="text" id="new-q" name="question" required />
					</div>
					<div class="form-group full">
						<label for="new-a">Ответ</label>
						<textarea id="new-a" name="answer" rows="3" required></textarea>
					</div>
					<div class="form-group">
						<label for="new-kw">Ключевые слова (через запятую)</label>
						<input type="text" id="new-kw" name="keywords" placeholder="доставка,курьер,сроки" />
					</div>
					<div class="form-group">
						<label for="new-cat">Категория</label>
						<select id="new-cat" name="category">
							{#each categories as cat}
								<option value={cat.value}>{cat.label}</option>
							{/each}
						</select>
					</div>
				</div>
				<button type="submit" class="btn-primary">Создать</button>
			</form>
		</div>
	{/if}

	<!-- FAQ list -->
	<div class="card">
		{#if data.faqItems.length === 0}
			<p class="empty">FAQ пусто</p>
		{:else}
			<div class="faq-list">
				{#each data.faqItems as item, i}
					<div class="faq-item" class:inactive={!item.is_active}>
						{#if editingId === item.id}
							<!-- Edit mode -->
							<form method="POST" action="?/update" use:enhance={() => { return async ({ update }) => { await update(); editingId = null; }; }}>
								<input type="hidden" name="id" value={item.id} />
								<input type="hidden" name="position" value={item.position} />
								<div class="form-grid">
									<div class="form-group full">
										<label>Вопрос</label>
										<input type="text" name="question" value={item.question} required />
									</div>
									<div class="form-group full">
										<label>Ответ</label>
										<textarea name="answer" rows="3" required>{item.answer}</textarea>
									</div>
									<div class="form-group">
										<label>Ключевые слова</label>
										<input type="text" name="keywords" value={item.keywords || ''} />
									</div>
									<div class="form-group">
										<label>Категория</label>
										<select name="category">
											{#each categories as cat}
												<option value={cat.value} selected={item.category === cat.value}>{cat.label}</option>
											{/each}
										</select>
									</div>
									<div class="form-group">
										<label class="checkbox-label">
											<input type="checkbox" name="is_active" checked={item.is_active === 1} />
											Активен
										</label>
									</div>
								</div>
								<div class="item-actions">
									<button type="submit" class="btn-sm btn-save">Сохранить</button>
									<button type="button" class="btn-sm btn-cancel" onclick={() => editingId = null}>Отмена</button>
								</div>
							</form>
						{:else}
							<!-- Display mode -->
							<div class="faq-item__header">
								<div class="faq-item__content">
									<strong>{item.question}</strong>
									<p class="faq-item__answer">{item.answer}</p>
									<div class="faq-item__meta">
										<span class="badge">{categories.find(c => c.value === item.category)?.label || item.category}</span>
										{#if item.keywords}
											<span class="keywords">{item.keywords}</span>
										{/if}
										<span class="match-count">{item.match_count} совп.</span>
									</div>
								</div>
								<div class="faq-item__actions">
									<!-- Move buttons -->
									{#if i > 0}
										<form method="POST" action="?/move" use:enhance class="inline">
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="direction" value="up" />
											<button type="submit" class="btn-arrow" title="Вверх">&uarr;</button>
										</form>
									{/if}
									{#if i < data.faqItems.length - 1}
										<form method="POST" action="?/move" use:enhance class="inline">
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="direction" value="down" />
											<button type="submit" class="btn-arrow" title="Вниз">&darr;</button>
										</form>
									{/if}
									<!-- Toggle -->
									<form method="POST" action="?/toggle" use:enhance class="inline">
										<input type="hidden" name="id" value={item.id} />
										<button type="submit" class="btn-sm" class:btn-active={item.is_active}>{item.is_active ? 'On' : 'Off'}</button>
									</form>
									<!-- Edit -->
									<button class="btn-sm btn-edit" onclick={() => editingId = item.id}>Edit</button>
									<!-- Delete -->
									<form method="POST" action="?/delete" use:enhance class="inline">
										<input type="hidden" name="id" value={item.id} />
										<button type="submit" class="btn-sm btn-delete">Del</button>
									</form>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-page { max-width: 1000px; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
	.page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
	.header-actions { display: flex; gap: 0.5rem; }
	.btn-link { padding: 0.5rem 1rem; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500; border: none; cursor: pointer; font-family: inherit; }
	.btn-link:hover { background: #2563eb; color: white; }
	.btn-back { background: #6b7280; }
	.btn-back:hover { background: #4b5563; }

	.card { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
	.card h2 { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem; }

	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
	.form-group { display: flex; flex-direction: column; gap: 0.25rem; }
	.form-group.full { grid-column: 1 / -1; }
	.form-group label { font-size: 0.8rem; font-weight: 500; color: #374151; }
	.form-group input, .form-group textarea, .form-group select {
		padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; font-family: inherit;
	}
	.checkbox-label { display: flex; align-items: center; gap: 0.5rem; flex-direction: row; cursor: pointer; }

	.btn-primary { padding: 0.5rem 1.25rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: inherit; }

	.faq-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.faq-item { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; }
	.faq-item.inactive { opacity: 0.5; }
	.faq-item__header { display: flex; gap: 1rem; justify-content: space-between; }
	.faq-item__content { flex: 1; min-width: 0; }
	.faq-item__content strong { display: block; margin-bottom: 0.25rem; }
	.faq-item__answer { font-size: 0.85rem; color: #6b7280; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.faq-item__meta { display: flex; gap: 0.5rem; margin-top: 0.5rem; align-items: center; flex-wrap: wrap; }
	.badge { padding: 2px 8px; background: #eff6ff; color: #1e40af; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
	.keywords { font-size: 0.75rem; color: #9ca3af; }
	.match-count { font-size: 0.75rem; color: #9ca3af; }

	.faq-item__actions { display: flex; gap: 0.25rem; align-items: flex-start; flex-shrink: 0; flex-wrap: wrap; }
	.inline { display: inline; }
	.btn-sm { padding: 4px 8px; border: 1px solid #d1d5db; background: #f9fafb; border-radius: 4px; font-size: 0.75rem; cursor: pointer; font-family: inherit; }
	.btn-sm:hover { background: #e5e7eb; }
	.btn-active { background: #dcfce7; border-color: #86efac; color: #166534; }
	.btn-save { background: #3b82f6; color: white; border-color: #3b82f6; }
	.btn-cancel { background: #f9fafb; }
	.btn-edit { background: #fef3c7; border-color: #fde68a; color: #92400e; }
	.btn-delete { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
	.btn-arrow { padding: 2px 6px; border: 1px solid #d1d5db; background: #f9fafb; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-family: inherit; }

	.item-actions { display: flex; gap: 0.5rem; }
	.empty { color: #9ca3af; text-align: center; padding: 2rem; }
</style>
