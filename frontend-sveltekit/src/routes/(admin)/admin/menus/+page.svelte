<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import ReorderButtons from '$lib/components/admin/ReorderButtons.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// State for nav items editing
	let editingItemId = $state<number | null>(null);
	let showAddItem = $state(false);
	let addParentId = $state<number | null>(null);

	// State for footer section editing
	let editingSectionId = $state<number | null>(null);
	let showAddSection = $state(false);
	let addingLinkSectionId = $state<number | null>(null);
	let editingLinkId = $state<number | null>(null);

	// State for legal links
	let showAddLegalLink = $state(false);
	let editingLegalLinkId = $state<number | null>(null);

	const isNavMenu = $derived(data.menu === 'header_desktop' || data.menu === 'header_mobile' || data.menu === 'city_header');
	const isFooterMenu = $derived(data.menu === 'footer');
	const isLegalMenu = $derived(data.menu === 'footer_legal');
	const hasSubmenu = $derived(data.menu === 'header_desktop' || data.menu === 'header_mobile');

	// Reset state when menu changes
	$effect(() => {
		if (data.menu) {
			editingItemId = null;
			showAddItem = false;
			addParentId = null;
			editingSectionId = null;
			showAddSection = false;
			addingLinkSectionId = null;
			editingLinkId = null;
			showAddLegalLink = false;
			editingLegalLinkId = null;
		}
	});

	async function submitMove(action: string, id: number, direction: 'up' | 'down') {
		const formData = new FormData();
		formData.append('id', String(id));
		formData.append('direction', direction);
		await fetch(`?/${action}`, { method: 'POST', body: formData });
		await invalidateAll();
	}

	function startAddChild(parentId: number) {
		addParentId = parentId;
		showAddItem = true;
	}
</script>

<svelte:head>
	<title>Управление меню — Moditime Admin</title>
</svelte:head>

{#if !data.menu}
	<!-- ==================== OVERVIEW ==================== -->
	<PageHeader title="Управление меню" description="Все меню сайта: навигация, footer, city" />

	<div class="menus-table">
		<table>
			<thead>
				<tr>
					<th>Название</th>
					<th>Идентификатор</th>
					<th>Пунктов</th>
					<th>Действия</th>
				</tr>
			</thead>
			<tbody>
				{#each data.menus as m}
					<tr>
						<td class="menu-name">{m.label}</td>
						<td><code>{m.id}</code></td>
						<td>{m.count}</td>
						<td>
							<a href="?menu={m.id}" class="btn-edit">Редактировать</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<!-- ==================== EDITOR ==================== -->
	<PageHeader title={data.menuLabel} description="Идентификатор: {data.menu}">
		{#snippet actions()}
			<a href="/admin/menus" class="btn-back">&larr; Все меню</a>
			{#if isNavMenu}
				<ActionButton variant="primary" onclick={() => { showAddItem = !showAddItem; addParentId = null; }}>
					{showAddItem && !addParentId ? 'Отмена' : '+ Добавить пункт'}
				</ActionButton>
			{/if}
			{#if isFooterMenu}
				<ActionButton variant="primary" onclick={() => showAddSection = !showAddSection}>
					{showAddSection ? 'Отмена' : '+ Добавить секцию'}
				</ActionButton>
			{/if}
			{#if isLegalMenu}
				<ActionButton variant="primary" onclick={() => showAddLegalLink = !showAddLegalLink}>
					{showAddLegalLink ? 'Отмена' : '+ Добавить ссылку'}
				</ActionButton>
			{/if}
		{/snippet}
	</PageHeader>

	{#if form?.error}
		<div class="alert error">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="alert success">Изменения сохранены</div>
	{/if}

	<!-- ========== NAV MENU EDITOR (header_desktop, header_mobile, city_header) ========== -->
	{#if isNavMenu}
		{#if showAddItem}
			<div class="card">
				<h3>{addParentId ? 'Добавить подпункт' : 'Добавить пункт меню'}</h3>
				<form method="POST" action="?/createNavItem" use:enhance>
					<input type="hidden" name="menu_type" value={data.menu} />
					{#if addParentId}
						<input type="hidden" name="parent_id" value={addParentId} />
					{/if}
					<input type="hidden" name="position" value="999" />
					<div class="form-row">
						<div class="form-group">
							<label for="nav-label">Название</label>
							<input type="text" id="nav-label" name="label" required maxlength="40" placeholder="Каталог" />
						</div>
						<div class="form-group">
							<label for="nav-href">URL</label>
							<input type="text" id="nav-href" name="href" required placeholder="/catalog" />
						</div>
						<div class="form-group checkbox">
							<label><input type="checkbox" name="is_active" checked /> Активен</label>
						</div>
						<div class="form-group">
							<ActionButton type="submit" variant="primary">Добавить</ActionButton>
						</div>
						{#if addParentId}
							<div class="form-group">
								<ActionButton variant="ghost" onclick={() => { addParentId = null; showAddItem = false; }}>Отмена</ActionButton>
							</div>
						{/if}
					</div>
				</form>
			</div>
		{/if}

		{#if data.navTopLevel.length === 0}
			<div class="card"><p class="empty-text">Нет пунктов меню. Добавьте первый пункт.</p></div>
		{:else}
			<div class="card">
				{#each data.navTopLevel as item, idx}
					<div class="nav-item-row" class:has-children={data.navChildren[item.id]?.length}>
						{#if editingItemId === item.id}
							<form method="POST" action="?/updateNavItem" use:enhance class="edit-form">
								<input type="hidden" name="id" value={item.id} />
								<input type="hidden" name="position" value={item.position} />
								<input type="text" name="label" value={item.label} class="input-sm" placeholder="Название" />
								<input type="text" name="href" value={item.href} class="input-sm" placeholder="URL" />
								<label class="checkbox-inline"><input type="checkbox" name="is_active" checked={item.is_active === 1} /> Активен</label>
								<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
								<ActionButton variant="ghost" size="sm" onclick={() => editingItemId = null}>Отмена</ActionButton>
							</form>
						{:else}
							<div class="nav-item-content">
								<ReorderButtons
									itemId={item.id}
									isFirst={idx === 0}
									isLast={idx === data.navTopLevel.length - 1}
									onMoveUp={(id) => submitMove('moveNavItem', id, 'up')}
									onMoveDown={(id) => submitMove('moveNavItem', id, 'down')}
								/>
								<span class="item-label">{item.label}</span>
								<span class="item-href">{item.href}</span>
								<span class="status-badge" class:active={item.is_active === 1}>{item.is_active ? 'Активен' : 'Неактивен'}</span>
								<div class="item-actions">
									<button type="button" class="btn-link" onclick={() => editingItemId = item.id}>Ред.</button>
									{#if hasSubmenu}
										<button type="button" class="btn-link" onclick={() => startAddChild(item.id)}>+ Подпункт</button>
									{/if}
									<form method="POST" action="?/deleteNavItem" use:enhance class="inline-form">
										<input type="hidden" name="id" value={item.id} />
										<button type="submit" class="btn-link danger" onclick={(e) => { if (!confirm(`Удалить "${item.label}" и все подпункты?`)) e.preventDefault(); }}>Удалить</button>
									</form>
								</div>
							</div>
						{/if}

						<!-- Children -->
						{#if data.navChildren[item.id]?.length}
							<div class="nav-children">
								{#each data.navChildren[item.id] as child, childIdx}
									<div class="nav-item-row child">
										{#if editingItemId === child.id}
											<form method="POST" action="?/updateNavItem" use:enhance class="edit-form">
												<input type="hidden" name="id" value={child.id} />
												<input type="hidden" name="position" value={child.position} />
												<input type="text" name="label" value={child.label} class="input-sm" placeholder="Название" />
												<input type="text" name="href" value={child.href} class="input-sm" placeholder="URL" />
												<label class="checkbox-inline"><input type="checkbox" name="is_active" checked={child.is_active === 1} /> Активен</label>
												<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
												<ActionButton variant="ghost" size="sm" onclick={() => editingItemId = null}>Отмена</ActionButton>
											</form>
										{:else}
											<div class="nav-item-content">
												<ReorderButtons
													itemId={child.id}
													isFirst={childIdx === 0}
													isLast={childIdx === data.navChildren[item.id].length - 1}
													onMoveUp={(id) => submitMove('moveNavItem', id, 'up')}
													onMoveDown={(id) => submitMove('moveNavItem', id, 'down')}
												/>
												<span class="item-label">{child.label}</span>
												<span class="item-href">{child.href}</span>
												<span class="status-badge" class:active={child.is_active === 1}>{child.is_active ? 'Активен' : 'Неактивен'}</span>
												<div class="item-actions">
													<button type="button" class="btn-link" onclick={() => editingItemId = child.id}>Ред.</button>
													<form method="POST" action="?/deleteNavItem" use:enhance class="inline-form">
														<input type="hidden" name="id" value={child.id} />
														<button type="submit" class="btn-link danger" onclick={(e) => { if (!confirm(`Удалить "${child.label}"?`)) e.preventDefault(); }}>Удалить</button>
													</form>
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	<!-- ========== FOOTER SECTIONS EDITOR ========== -->
	{#if isFooterMenu}
		{#if showAddSection}
			<div class="card">
				<h3>Добавить секцию</h3>
				<form method="POST" action="?/createSection" use:enhance>
					<input type="hidden" name="position" value="999" />
					<div class="form-row">
						<div class="form-group">
							<label for="sec-title">Название</label>
							<input type="text" id="sec-title" name="title" required placeholder="Название секции" />
						</div>
						<div class="form-group">
							<label for="sec-col">Колонка</label>
							<input type="number" id="sec-col" name="column_number" value="1" min="1" max="4" />
						</div>
						<div class="form-group checkbox">
							<label><input type="checkbox" name="is_active" checked /> Активна</label>
						</div>
						<div class="form-group">
							<ActionButton type="submit" variant="primary">Добавить</ActionButton>
						</div>
					</div>
				</form>
			</div>
		{/if}

		{#each data.sections as section, sectionIdx}
			<div class="card section-card">
				{#if editingSectionId === section.id}
					<form method="POST" action="?/updateSection" use:enhance class="edit-form">
						<input type="hidden" name="id" value={section.id} />
						<input type="hidden" name="position" value={section.position} />
						<input type="text" name="title" value={section.title} class="input-sm" />
						<label class="input-label-inline">Кол.:</label>
						<input type="number" name="column_number" value={section.column_number} class="input-xs" min="1" max="4" />
						<label class="checkbox-inline"><input type="checkbox" name="is_active" checked={section.is_active === 1} /> Активна</label>
						<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
						<ActionButton variant="ghost" size="sm" onclick={() => editingSectionId = null}>Отмена</ActionButton>
					</form>
				{:else}
					<div class="section-header">
						<div class="section-info">
							<ReorderButtons
								itemId={section.id}
								isFirst={sectionIdx === 0}
								isLast={sectionIdx === data.sections.length - 1}
								onMoveUp={(id) => submitMove('moveSection', id, 'up')}
								onMoveDown={(id) => submitMove('moveSection', id, 'down')}
							/>
							<h3>{section.title}</h3>
							<span class="section-meta">Кол. {section.column_number} | #{section.position}</span>
							<span class="status-badge" class:active={section.is_active === 1}>
								{section.is_active ? 'Активна' : 'Неактивна'}
							</span>
						</div>
						<div class="section-actions">
							<button type="button" class="btn-link" onclick={() => editingSectionId = section.id}>Ред.</button>
							<button type="button" class="btn-link" onclick={() => addingLinkSectionId = addingLinkSectionId === section.id ? null : section.id}>+ Ссылка</button>
							<form method="POST" action="?/deleteSection" use:enhance class="inline-form">
								<input type="hidden" name="id" value={section.id} />
								<button type="submit" class="btn-link danger" onclick={(e) => { if (!confirm(`Удалить секцию "${section.title}" и все ссылки?`)) e.preventDefault(); }}>Удалить</button>
							</form>
						</div>
					</div>
				{/if}

				<!-- Add link form -->
				{#if addingLinkSectionId === section.id}
					<div class="add-link-form">
						<form method="POST" action="?/createLink" use:enhance>
							<input type="hidden" name="section_id" value={section.id} />
							<input type="hidden" name="position" value="999" />
							<div class="form-row">
								<div class="form-group">
									<label for="link-label-{section.id}">Название</label>
									<input type="text" id="link-label-{section.id}" name="label" required placeholder="Текст ссылки" />
								</div>
								<div class="form-group">
									<label for="link-href-{section.id}">URL</label>
									<input type="text" id="link-href-{section.id}" name="href" required placeholder="/path" />
								</div>
								<div class="form-group checkbox">
									<label><input type="checkbox" name="is_main_domain_only" checked /> Основной домен</label>
								</div>
								<div class="form-group">
									<ActionButton type="submit" variant="primary" size="sm">Добавить</ActionButton>
								</div>
							</div>
						</form>
					</div>
				{/if}

				<!-- Links list -->
				{#if section.links.length > 0}
					<div class="links-list">
						{#each section.links as link, linkIdx}
							<div class="link-item">
								{#if editingLinkId === link.id}
									<form method="POST" action="?/updateLink" use:enhance class="edit-form">
										<input type="hidden" name="id" value={link.id} />
										<input type="hidden" name="position" value={link.position} />
										<input type="text" name="label" value={link.label} class="input-sm" />
										<input type="text" name="href" value={link.href} class="input-sm" />
										<label class="checkbox-inline"><input type="checkbox" name="is_main_domain_only" checked={link.is_main_domain_only === 1} /> Осн.</label>
										<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
										<ActionButton variant="ghost" size="sm" onclick={() => editingLinkId = null}>Отмена</ActionButton>
									</form>
								{:else}
									<div class="link-content">
										<ReorderButtons
											itemId={link.id}
											isFirst={linkIdx === 0}
											isLast={linkIdx === section.links.length - 1}
											onMoveUp={(id) => submitMove('moveLink', id, 'up')}
											onMoveDown={(id) => submitMove('moveLink', id, 'down')}
										/>
										<span class="link-label">{link.label}</span>
										<span class="link-href">{link.href}</span>
										{#if link.is_main_domain_only}<span class="link-badge">Осн.</span>{/if}
										<div class="link-actions">
											<button type="button" class="btn-link" onclick={() => editingLinkId = link.id}>Ред.</button>
											<form method="POST" action="?/deleteLink" use:enhance class="inline-form">
												<input type="hidden" name="id" value={link.id} />
												<button type="submit" class="btn-link danger" onclick={(e) => { if (!confirm(`Удалить ссылку "${link.label}"?`)) e.preventDefault(); }}>Удалить</button>
											</form>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-links">Нет ссылок в этой секции</div>
				{/if}
			</div>
		{/each}

		{#if data.sections.length === 0}
			<div class="card"><p class="empty-text">Нет секций. Добавьте первую секцию.</p></div>
		{/if}
	{/if}

	<!-- ========== FOOTER LEGAL EDITOR ========== -->
	{#if isLegalMenu}
		{#if showAddLegalLink && data.legalSectionId}
			<div class="card">
				<h3>Добавить правовую ссылку</h3>
				<form method="POST" action="?/createLink" use:enhance>
					<input type="hidden" name="section_id" value={data.legalSectionId} />
					<input type="hidden" name="position" value="999" />
					<div class="form-row">
						<div class="form-group">
							<label for="legal-label">Название</label>
							<input type="text" id="legal-label" name="label" required placeholder="Политика конфиденциальности" />
						</div>
						<div class="form-group">
							<label for="legal-href">URL</label>
							<input type="text" id="legal-href" name="href" required placeholder="/privacy" />
						</div>
						<div class="form-group checkbox">
							<label><input type="checkbox" name="is_main_domain_only" checked /> Основной домен</label>
						</div>
						<div class="form-group">
							<ActionButton type="submit" variant="primary">Добавить</ActionButton>
						</div>
					</div>
				</form>
			</div>
		{/if}

		{#if !data.legalSectionId}
			<div class="card">
				<p class="empty-text">Секция «Правовая информация» не найдена в footer. Создайте её на вкладке <a href="?menu=footer">Footer секции</a>.</p>
			</div>
		{:else if data.legalLinks.length === 0}
			<div class="card"><p class="empty-text">Нет правовых ссылок. Добавьте первую ссылку.</p></div>
		{:else}
			<div class="card">
				{#each data.legalLinks as link, idx}
					<div class="link-item">
						{#if editingLegalLinkId === link.id}
							<form method="POST" action="?/updateLink" use:enhance class="edit-form">
								<input type="hidden" name="id" value={link.id} />
								<input type="hidden" name="position" value={link.position} />
								<input type="text" name="label" value={link.label} class="input-sm" />
								<input type="text" name="href" value={link.href} class="input-sm" />
								<label class="checkbox-inline"><input type="checkbox" name="is_main_domain_only" checked={link.is_main_domain_only === 1} /> Осн.</label>
								<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
								<ActionButton variant="ghost" size="sm" onclick={() => editingLegalLinkId = null}>Отмена</ActionButton>
							</form>
						{:else}
							<div class="link-content">
								<ReorderButtons
									itemId={link.id}
									isFirst={idx === 0}
									isLast={idx === data.legalLinks.length - 1}
									onMoveUp={(id) => submitMove('moveLink', id, 'up')}
									onMoveDown={(id) => submitMove('moveLink', id, 'down')}
								/>
								<span class="link-label">{link.label}</span>
								<span class="link-href">{link.href}</span>
								<div class="link-actions">
									<button type="button" class="btn-link" onclick={() => editingLegalLinkId = link.id}>Ред.</button>
									<form method="POST" action="?/deleteLink" use:enhance class="inline-form">
										<input type="hidden" name="id" value={link.id} />
										<button type="submit" class="btn-link danger" onclick={(e) => { if (!confirm(`Удалить "${link.label}"?`)) e.preventDefault(); }}>Удалить</button>
									</form>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
{/if}

<style>
	/* Overview table */
	.menus-table {
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.875rem 1.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	td {
		padding: 1rem 1.25rem;
		border-bottom: 1px solid #f3f4f6;
		font-size: 0.9375rem;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.menu-name {
		font-weight: 600;
		color: #1f2937;
	}

	code {
		background: #f3f4f6;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.btn-edit {
		color: #3b82f6;
		text-decoration: none;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.btn-edit:hover {
		text-decoration: underline;
	}

	.btn-back {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #374151;
		border-radius: 8px;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-back:hover {
		background: #e5e7eb;
	}

	/* Cards */
	.card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem;
	}

	/* Alerts */
	.alert {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.alert.error {
		background: #fee2e2;
		border: 1px solid #ef4444;
		color: #dc2626;
	}

	.alert.success {
		background: #dcfce7;
		border: 1px solid #22c55e;
		color: #16a34a;
	}

	/* Forms */
	.form-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-end;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
	}

	.form-group input[type="text"],
	.form-group input[type="number"] {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.form-group.checkbox {
		flex-direction: row;
		align-items: center;
	}

	.form-group.checkbox label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.edit-form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding: 0.5rem;
		background: #fef3c7;
		border-radius: 8px;
	}

	.input-sm {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
		width: 160px;
	}

	.input-xs {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
		width: 60px;
	}

	.input-label-inline {
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.checkbox-inline {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: #374151;
	}

	/* Nav item rows */
	.nav-item-row {
		border-bottom: 1px solid #f3f4f6;
		padding: 0.25rem 0;
	}

	.nav-item-row:last-child {
		border-bottom: none;
	}

	.nav-item-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
	}

	.nav-children {
		padding-left: 2.5rem;
		border-left: 2px solid #e5e7eb;
		margin-left: 1rem;
	}

	.nav-item-row.child {
		border-bottom: 1px solid #f9fafb;
	}

	.item-label {
		font-weight: 600;
		color: #1f2937;
		min-width: 120px;
	}

	.item-href {
		color: #6b7280;
		font-size: 0.875rem;
		flex: 1;
	}

	.item-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	/* Footer sections */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.section-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.section-info h3 {
		margin: 0;
	}

	.section-meta {
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.section-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.add-link-form {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	/* Links */
	.links-list {
		margin-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.link-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.link-item:last-child {
		border-bottom: none;
	}

	.link-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.25rem 0;
	}

	.link-label {
		font-weight: 500;
		min-width: 140px;
		color: #1f2937;
	}

	.link-href {
		color: #6b7280;
		font-size: 0.875rem;
		flex: 1;
	}

	.link-badge {
		font-size: 0.6875rem;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		background: #eff6ff;
		color: #3b82f6;
	}

	.link-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* Status badge */
	.status-badge {
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		background: #fee2e2;
		color: #dc2626;
	}

	.status-badge.active {
		background: #dcfce7;
		color: #16a34a;
	}

	/* Buttons */
	.btn-link {
		background: none;
		border: none;
		color: #3b82f6;
		font-size: 0.8125rem;
		cursor: pointer;
		padding: 0;
	}

	.btn-link:hover {
		text-decoration: underline;
	}

	.btn-link.danger {
		color: #ef4444;
	}

	.inline-form {
		display: inline;
	}

	.empty-text {
		color: #9ca3af;
		font-style: italic;
		margin: 0;
	}

	.empty-links {
		margin-top: 1rem;
		padding: 0.75rem 0;
		color: #9ca3af;
		font-size: 0.875rem;
		font-style: italic;
		border-top: 1px solid #e5e7eb;
	}
</style>
