<script lang="ts">
	import { page } from '$app/stores';
	import Container from '$lib/components/ui/Container.svelte';

	const errorCode = $derived($page.status || 404);
	const errorMessage = $derived($page.error?.message || 'Страница не найдена');

	const errors: Record<number, { title: string; description: string }> = {
		404: {
			title: 'Страница не найдена',
			description:
				'Похоже, эта страница потерялась, как редкие часы Patek Philippe. Давайте найдем что-то другое.'
		},
		500: {
			title: 'Внутренняя ошибка сервера',
			description:
				'Что-то пошло не так. Наша команда уже работает над решением проблемы. Попробуйте обновить страницу.'
		},
		403: {
			title: 'Доступ запрещен',
			description: 'У вас нет доступа к этой странице. Пожалуйста, вернитесь на главную.'
		}
	};

	const error = $derived(
		errors[errorCode] || {
			title: `Ошибка ${errorCode}`,
			description: errorMessage
		}
	);
</script>

<svelte:head>
	<title>{errorCode} - {error.title} | Moditimewatch</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="error-page">
	<Container>
		<div class="error-content">
			<div class="error-code">{errorCode}</div>
			<h1 class="error-title">{error.title}</h1>
			<p class="error-description">{error.description}</p>

			<div class="error-actions">
				<a href="/" class="btn btn-primary">Вернуться на главную</a>
				<a href="/catalog" class="btn btn-ghost">Смотреть каталог</a>
			</div>

			<div class="error-links">
				<a href="/contacts">Связаться с нами</a>
				<span class="divider">•</span>
				<a href="/about">О компании</a>
				<span class="divider">•</span>
				<a href="/delivery">Доставка</a>
			</div>
		</div>
	</Container>
</main>

<style>
	.error-page {
		min-height: calc(100vh - var(--header-height) - 200px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4xl) 0;
		background: linear-gradient(
			160deg,
			var(--color-surface) 0%,
			var(--color-background) 100%
		);
	}

	.error-content {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xl);
	}

	.error-code {
		font-size: clamp(80px, 15vw, 180px);
		font-weight: 700;
		line-height: 1;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		font-family: var(--font-primary);
	}

	.error-title {
		font-size: var(--font-size-h1);
		margin: 0;
	}

	.error-description {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
		max-width: 560px;
		color: var(--color-text-soft);
	}

	.error-actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		justify-content: center;
		margin-top: var(--space-lg);
	}

	.error-links {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		justify-content: center;
		margin-top: var(--space-2xl);
		padding-top: var(--space-2xl);
		border-top: 1px solid var(--color-border);
		font-size: var(--font-size-body-sm);
	}

	.error-links a {
		color: var(--color-primary);
		text-decoration: none;
		transition: opacity var(--transition-fast);
	}

	.error-links a:hover {
		opacity: 0.7;
	}

	.divider {
		color: var(--color-border);
	}

	@media (max-width: 768px) {
		.error-actions {
			flex-direction: column;
			width: 100%;
		}

		.error-actions .btn {
			width: 100%;
		}
	}
</style>
