<script lang="ts">
	let {
		open = false,
		phone = '',
		onclose
	}: {
		open: boolean;
		phone?: string;
		onclose: () => void;
	} = $props();

	let name = $state('');
	let callbackPhone = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim() || !callbackPhone.trim()) {
			error = 'Заполните все поля';
			return;
		}

		submitting = true;
		error = '';

		try {
			const res = await fetch('/api/callback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name.trim(), phone: callbackPhone.trim() })
			});

			if (!res.ok) {
				const data = await res.json();
				error = data.error || 'Произошла ошибка';
				return;
			}

			submitted = true;
		} catch {
			error = 'Ошибка сети. Попробуйте позже.';
		} finally {
			submitting = false;
		}
	}

	function handleClose() {
		name = '';
		callbackPhone = '';
		submitted = false;
		error = '';
		onclose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') handleClose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="callback-overlay" role="dialog" aria-modal="true" onclick={handleBackdropClick} onkeydown={handleKeydown}>
		<div class="callback-modal">
			<button type="button" class="callback-modal__close" onclick={handleClose} aria-label="Закрыть">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>

			{#if submitted}
				<div class="callback-modal__success">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
					<h3>Заявка отправлена!</h3>
					<p>Мы перезвоним вам в ближайшее время.</p>
					<button type="button" class="btn btn-primary" onclick={handleClose}>Закрыть</button>
				</div>
			{:else}
				<h3 class="callback-modal__title">Обратный звонок</h3>
				<p class="callback-modal__desc">Оставьте номер, и мы перезвоним вам</p>

				{#if phone}
					<p class="callback-modal__direct">
						Или позвоните напрямую: <a href="tel:{phone.replace(/[\s()-]/g, '')}">{phone}</a>
					</p>
				{/if}

				<form class="callback-modal__form" onsubmit={handleSubmit}>
					<div class="callback-modal__field">
						<label for="cb-name">Ваше имя</label>
						<input type="text" id="cb-name" bind:value={name} placeholder="Имя" required />
					</div>
					<div class="callback-modal__field">
						<label for="cb-phone">Телефон</label>
						<input type="tel" id="cb-phone" bind:value={callbackPhone} placeholder="+7 (___) ___-__-__" required />
					</div>

					{#if error}
						<p class="callback-modal__error">{error}</p>
					{/if}

					<button type="submit" class="btn btn-primary callback-modal__submit" disabled={submitting}>
						{submitting ? 'Отправка...' : 'Перезвоните мне'}
					</button>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
	.callback-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		animation: fadeIn 0.2s ease;
	}

	.callback-modal {
		background: var(--color-surface, #fff);
		border-radius: var(--radius-xl, 16px);
		padding: var(--space-2xl);
		max-width: 420px;
		width: 100%;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
		animation: slideUp 0.3s ease;
	}

	.callback-modal__close {
		position: absolute;
		top: var(--space-md);
		right: var(--space-md);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-muted, #9ca3af);
		padding: 4px;
		border-radius: var(--radius-sm);
		transition: color var(--transition-fast);
	}

	.callback-modal__close:hover {
		color: var(--color-text);
	}

	.callback-modal__title {
		font-family: var(--font-accent);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 var(--space-xs);
	}

	.callback-modal__desc {
		color: var(--color-text-soft);
		font-size: 0.875rem;
		margin: 0 0 var(--space-lg);
	}

	.callback-modal__direct {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		margin: 0 0 var(--space-md);
	}

	.callback-modal__direct a {
		color: var(--color-primary);
		font-weight: 600;
		text-decoration: none;
	}

	.callback-modal__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.callback-modal__field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.callback-modal__field label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.callback-modal__field input {
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		background: transparent;
		color: var(--color-text);
		transition: border-color var(--transition-fast);
	}

	.callback-modal__field input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.callback-modal__error {
		color: #dc2626;
		font-size: 0.8125rem;
		margin: 0;
	}

	.callback-modal__submit {
		width: 100%;
		padding: 0.75rem;
		font-size: 0.9375rem;
	}

	.callback-modal__submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.callback-modal__success {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.callback-modal__success h3 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.callback-modal__success p {
		color: var(--color-text-soft);
		margin: 0;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
