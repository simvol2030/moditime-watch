<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Data from database via +page.server.ts
	const { seo, contactMethods, officeInfo } = data;

	let formData = $state({
		name: '',
		email: '',
		subject: '',
		message: ''
	});

	let isSubmitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;

		// Mock API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		console.log('Form submitted:', formData);
		alert('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');

		// Reset form
		formData = { name: '', email: '', subject: '', message: '' };
		isSubmitting = false;
	}
</script>

<SeoManager {seo} />

<main class="page-main contacts-page">
	<!-- Hero Section -->
	<section class="contacts-hero">
		<Container>
			<div class="contacts-hero__content">
				<span class="section-eyebrow">Контакты</span>
				<h1 class="contacts-hero__title">Свяжитесь с нами</h1>
				<p class="contacts-hero__description">
					Персональный консьерж Moditimewatch всегда на связи: подберём часы, проконсультируем по
					доставке, поможем с trade-in и сервисом
				</p>
			</div>
		</Container>
	</section>

	<!-- Contact Methods -->
	<section class="section contacts-methods">
		<Container>
			<div class="methods-grid">
				{#each contactMethods as method}
					<a
						href={method.href}
						class="method-card"
						class:method-card--primary={method.primary}
						target="_blank"
						rel="noopener noreferrer"
					>
						<div class="method-card__icon">{method.icon}</div>
						<h3 class="method-card__title">{method.title}</h3>
						<span class="method-card__value">{method.value}</span>
						<p class="method-card__description">{method.description}</p>
					</a>
				{/each}
			</div>
		</Container>
	</section>

	<!-- Contact Form + Office Info -->
	<section class="section contacts-main">
		<Container>
			<div class="contacts-main__grid">
				<!-- Contact Form -->
				<div class="contact-form">
					<h2 class="contact-form__title">Напишите нам</h2>
					<p class="contact-form__subtitle">Заполните форму, и мы ответим в течение 2 часов</p>

					<form onsubmit={handleSubmit} class="form">
						<div class="form-group">
							<label for="name" class="form-label">Имя</label>
							<input
								type="text"
								id="name"
								bind:value={formData.name}
								class="input-field"
								required
								placeholder="Как к вам обращаться"
							/>
						</div>

						<div class="form-group">
							<label for="email" class="form-label">Email</label>
							<input
								type="email"
								id="email"
								bind:value={formData.email}
								class="input-field"
								required
								placeholder="your@email.com"
							/>
						</div>

						<div class="form-group">
							<label for="subject" class="form-label">Тема</label>
							<select id="subject" bind:value={formData.subject} class="input-field" required>
								<option value="" disabled selected>Выберите тему</option>
								<option value="consultation">Консультация по выбору часов</option>
								<option value="delivery">Вопрос о доставке</option>
								<option value="trade-in">Trade-in моей коллекции</option>
								<option value="service">Сервис и ремонт</option>
								<option value="partnership">Партнёрство</option>
								<option value="other">Другое</option>
							</select>
						</div>

						<div class="form-group">
							<label for="message" class="form-label">Сообщение</label>
							<textarea
								id="message"
								bind:value={formData.message}
								class="input-field"
								rows="5"
								required
								placeholder="Опишите ваш вопрос или запрос"
							></textarea>
						</div>

						<button type="submit" class="btn btn-primary full-width" disabled={isSubmitting}>
							{isSubmitting ? 'Отправляем...' : 'Отправить сообщение'}
						</button>
					</form>
				</div>

				<!-- Office Info -->
				<div class="office-info">
					<h2 class="office-info__title">Наш офис</h2>

					<div class="office-info__card">
						<div class="info-item">
							<div class="info-item__icon">📍</div>
							<div class="info-item__content">
								<span class="info-item__label">Адрес</span>
								<span class="info-item__value">{officeInfo.address}</span>
								<span class="info-item__note">{officeInfo.metro}</span>
							</div>
						</div>

						<div class="info-item">
							<div class="info-item__icon">🕐</div>
							<div class="info-item__content">
								<span class="info-item__label">Время работы</span>
								<span class="info-item__value">{officeInfo.hours}</span>
								<span class="info-item__note">Без выходных</span>
							</div>
						</div>

						<div class="info-item">
							<div class="info-item__icon">🚗</div>
							<div class="info-item__content">
								<span class="info-item__label">Парковка</span>
								<span class="info-item__value">Подземная парковка</span>
								<span class="info-item__note">Бесплатно для клиентов</span>
							</div>
						</div>
					</div>

					<div class="office-note">
						<h3 class="office-note__title">Посещение по записи</h3>
						<p class="office-note__text">
							Мы работаем только по предварительной записи, чтобы обеспечить персональное внимание
							каждому клиенту. Свяжитесь с нами любым удобным способом для назначения встречи.
						</p>
					</div>
				</div>
			</div>
		</Container>
	</section>
</main>

<style>
	.contacts-page {
		padding-bottom: var(--space-4xl);
	}

	/* Hero */
	.contacts-hero {
		padding: var(--space-3xl) 0 var(--space-2xl);
		background: linear-gradient(
			160deg,
			var(--color-surface) 0%,
			var(--color-background) 100%
		);
	}

	.contacts-hero__content {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: center;
	}

	.contacts-hero__title {
		font-size: var(--font-size-h1);
	}

	.contacts-hero__description {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
	}

	/* Contact Methods */
	.contacts-methods {
		padding: var(--space-3xl) 0;
	}

	.methods-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-lg);
	}

	.method-card {
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-sm);
		transition: all var(--transition-fast);
		text-decoration: none;
		color: inherit;
	}

	.method-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.method-card--primary {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: #fff;
		border: none;
	}

	.method-card--primary .method-card__value,
	.method-card--primary .method-card__description {
		color: rgba(255, 255, 255, 0.9);
	}

	.method-card__icon {
		font-size: 48px;
		line-height: 1;
	}

	.method-card__title {
		font-size: var(--font-size-h4);
		font-weight: 600;
	}

	.method-card__value {
		font-family: var(--font-accent);
		font-size: var(--font-size-body);
		font-weight: 600;
		color: var(--color-primary);
	}

	.method-card__description {
		font-size: var(--font-size-body-sm);
	}

	/* Main Content */
	.contacts-main {
		padding: var(--space-4xl) 0;
	}

	.contacts-main__grid {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: var(--space-3xl);
		align-items: start;
	}

	/* Form */
	.contact-form__title {
		font-size: var(--font-size-h2);
		margin-bottom: var(--space-xs);
	}

	.contact-form__subtitle {
		font-size: var(--font-size-body);
		color: var(--color-text-soft);
		margin-bottom: var(--space-2xl);
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.form-label {
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		color: var(--color-text);
	}

	.full-width {
		width: 100%;
		margin-top: var(--space-md);
	}

	/* Office Info */
	.office-info {
		position: sticky;
		top: calc(var(--header-height) + var(--space-lg));
	}

	.office-info__title {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-lg);
	}

	.office-info__card {
		background-color: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		margin-bottom: var(--space-xl);
	}

	.info-item {
		display: flex;
		gap: var(--space-md);
	}

	.info-item__icon {
		font-size: 28px;
		line-height: 1;
		flex-shrink: 0;
	}

	.info-item__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.info-item__label {
		font-size: var(--font-size-caption);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.info-item__value {
		font-size: var(--font-size-body);
		font-weight: 500;
		color: var(--color-text);
	}

	.info-item__note {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-soft);
	}

	/* Office Note */
	.office-note {
		background-color: rgba(10, 36, 99, 0.06);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	body[data-theme='dark'] .office-note {
		background-color: rgba(62, 146, 204, 0.12);
	}

	.office-note__title {
		font-size: var(--font-size-body);
		font-weight: 600;
		margin-bottom: var(--space-sm);
		color: var(--color-primary);
	}

	.office-note__text {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
	}

	/* Responsive */
	@media (max-width: 991px) {
		.contacts-main__grid {
			grid-template-columns: 1fr;
			gap: var(--space-2xl);
		}

		.office-info {
			position: static;
		}

		.methods-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
