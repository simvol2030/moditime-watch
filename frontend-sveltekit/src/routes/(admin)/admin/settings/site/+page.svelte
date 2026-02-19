<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const c = (key: string, fallback: string = '') => data.config[key] || fallback;
</script>

<svelte:head>
	<title>Site Settings - Moditime Admin</title>
</svelte:head>

<PageHeader title="Настройки сайта" description="Глобальные данные: логотип, контакты, соцсети, topbar" />

{#if form?.error}
	<div class="alert error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert success">Настройки сохранены</div>
{/if}

<form method="POST" action="?/saveSiteSettings" use:enhance>
	<!-- ОСНОВНОЕ -->
	<div class="card">
		<h3>Основное</h3>
		<div class="form-grid">
			<div class="form-group full">
				<label for="site_name">Название сайта <span class="hint">max 100</span></label>
				<input type="text" id="site_name" name="site_name" value={c('site_name', 'Moditimewatch')} maxlength="100" />
			</div>
			<div class="form-group">
				<label for="logo_wordmark">Логотип wordmark <span class="hint">текст в header/footer</span></label>
				<input type="text" id="logo_wordmark" name="logo_wordmark" value={c('logo_wordmark', 'Moditimewatch')} maxlength="60" />
			</div>
			<div class="form-group">
				<label for="logo_tagline">Логотип tagline</label>
				<input type="text" id="logo_tagline" name="logo_tagline" value={c('logo_tagline', 'Fine Time Delivery')} maxlength="60" />
			</div>
			<div class="form-group full">
				<label for="logo_image_url">Логотип изображение URL <span class="hint">SVG/PNG, рек. высота 40px</span></label>
				<input type="text" id="logo_image_url" name="logo_image_url" value={c('logo_image_url')} />
			</div>
			{#if c('logo_image_url')}
				<div class="form-group full">
					<img src={c('logo_image_url')} alt="Logo preview" class="logo-preview" />
				</div>
			{/if}
			<div class="form-group full">
				<label>Режим логотипа</label>
				<div class="radio-group">
					<label class="radio-label">
						<input type="radio" name="logo_mode" value="text" checked={c('logo_mode', 'text') === 'text'} />
						Текст (wordmark + tagline)
					</label>
					<label class="radio-label">
						<input type="radio" name="logo_mode" value="image" checked={c('logo_mode', 'text') === 'image'} />
						Изображение (logo_image_url)
					</label>
				</div>
			</div>
			<div class="form-group full">
				<label for="favicon_url">Favicon URL <span class="hint">ico/png/svg</span></label>
				<input type="text" id="favicon_url" name="favicon_url" value={c('favicon_url')} />
			</div>
			<div class="form-group full">
				<label for="company_description">Описание компании <span class="hint">max 300, footer</span></label>
				<textarea id="company_description" name="company_description" rows="3" maxlength="300">{c('company_description', 'Сервис доставки оригинальных часов из-за рубежа с гарантией подлинности и персональными консультациями.')}</textarea>
			</div>
		</div>
	</div>

	<!-- КОНТАКТЫ -->
	<div class="card">
		<h3>Контакты</h3>
		<div class="form-grid">
			<div class="form-group">
				<label for="contact_phone">Телефон</label>
				<input type="text" id="contact_phone" name="contact_phone" value={c('contact_phone', '+7 (495) 120-00-00')} />
			</div>
			<div class="form-group">
				<label for="contact_email">Email</label>
				<input type="text" id="contact_email" name="contact_email" value={c('contact_email', 'info@moditime-watch.ru')} />
			</div>
			<div class="form-group full">
				<label for="contact_address">Адрес <span class="hint">max 200</span></label>
				<input type="text" id="contact_address" name="contact_address" value={c('contact_address', 'Москва, Столешников переулок, д. 7/5')} maxlength="200" />
			</div>
			<div class="form-group full">
				<label for="working_hours">Часы работы <span class="hint">max 200</span></label>
				<input type="text" id="working_hours" name="working_hours" value={c('working_hours', 'Пн-Пт: 10:00-20:00, Сб: 11:00-18:00')} maxlength="200" />
			</div>
			<div class="form-group full">
				<label>Режим телефона</label>
				<div class="radio-group">
					<label class="radio-label">
						<input type="radio" name="phone_mode" value="direct" checked={c('phone_mode', 'direct') === 'direct'} />
						Прямой звонок (tel:)
					</label>
					<label class="radio-label">
						<input type="radio" name="phone_mode" value="callback" checked={c('phone_mode', 'direct') === 'callback'} />
						Форма обратного звонка (callback modal)
					</label>
				</div>
			</div>
		</div>
	</div>

	<!-- СОЦСЕТИ -->
	<div class="card">
		<h3>Соцсети</h3>
		<div class="form-grid">
			<div class="form-group">
				<label for="social_telegram">Telegram</label>
				<input type="text" id="social_telegram" name="social_telegram" value={c('social_telegram')} placeholder="https://t.me/moditime_watch" />
			</div>
			<div class="form-group">
				<label for="social_vk">VK</label>
				<input type="text" id="social_vk" name="social_vk" value={c('social_vk')} placeholder="https://vk.com/..." />
			</div>
			<div class="form-group">
				<label for="social_youtube">YouTube</label>
				<input type="text" id="social_youtube" name="social_youtube" value={c('social_youtube')} placeholder="https://youtube.com/..." />
			</div>
			<div class="form-group">
				<label for="social_whatsapp">WhatsApp</label>
				<input type="text" id="social_whatsapp" name="social_whatsapp" value={c('social_whatsapp')} placeholder="https://wa.me/..." />
			</div>
		</div>
	</div>

	<!-- TELEGRAM-ГРУППА -->
	<div class="card">
		<h3>Telegram-группа</h3>
		<div class="form-grid">
			<div class="form-group checkbox full">
				<label>
					<input type="checkbox" name="telegram_group_enabled" checked={c('telegram_group_enabled') === 'true'} />
					Включена
				</label>
			</div>
			<div class="form-group">
				<label for="telegram_group_url">URL группы</label>
				<input type="text" id="telegram_group_url" name="telegram_group_url" value={c('telegram_group_url', 'https://t.me/moditime_watch')} />
			</div>
			<div class="form-group">
				<label for="telegram_group_label">Название <span class="hint">max 100</span></label>
				<input type="text" id="telegram_group_label" name="telegram_group_label" value={c('telegram_group_label', 'Telegram группа Moditimewatch')} maxlength="100" />
			</div>
		</div>
	</div>

	<!-- HEADER (TOPBAR) -->
	<div class="card">
		<h3>Header (Topbar)</h3>
		<div class="form-grid">
			<div class="form-group checkbox full">
				<label>
					<input type="checkbox" name="topbar_visible" checked={c('topbar_visible', 'true') === 'true'} />
					Показывать topbar
				</label>
			</div>
			<div class="form-group">
				<label for="topbar_badge">Бейдж <span class="hint">max 40</span></label>
				<input type="text" id="topbar_badge" name="topbar_badge" value={c('topbar_badge', 'Moditimewatch Delivery')} maxlength="40" />
			</div>
			<div class="form-group">
				<label for="topbar_text">Текст <span class="hint">max 200</span></label>
				<input type="text" id="topbar_text" name="topbar_text" value={c('topbar_text', 'Доставка премиальных часов по России и СНГ')} maxlength="200" />
			</div>
		</div>
	</div>

	<!-- ЮРИДИЧЕСКОЕ -->
	<div class="card">
		<h3>Юридическое</h3>
		<div class="form-grid">
			<div class="form-group full">
				<label for="copyright_text">Копирайт <span class="hint">max 200, {'{year}'} = текущий год</span></label>
				<input type="text" id="copyright_text" name="copyright_text" value={c('copyright_text', '© {year} Moditimewatch. Все права защищены.')} maxlength="200" />
			</div>
		</div>
	</div>

	<div class="form-actions">
		<ActionButton type="submit" variant="primary">Сохранить</ActionButton>
	</div>
</form>

<style>
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
		margin: 0 0 1rem 0;
	}

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

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group.full {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
	}

	.hint {
		font-weight: 400;
		color: #9ca3af;
	}

	.form-group input[type="text"],
	.form-group textarea {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.form-group textarea {
		resize: vertical;
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

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		margin-bottom: 1.5rem;
		justify-content: flex-end;
	}

	.logo-preview {
		max-width: 200px;
		max-height: 60px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 0.25rem;
	}

	@media (max-width: 640px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
