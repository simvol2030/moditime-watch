<script lang="ts">
	interface Props {
		sessionId: string;
		onsubmit?: () => void;
	}

	let { sessionId, onsubmit }: Props = $props();
	let name = $state('');
	let phone = $state('');
	let email = $state('');
	let error = $state('');
	let success = $state(false);
	let loading = $state(false);

	async function handleSubmit() {
		error = '';
		if (!name.trim() || name.trim().length < 2) {
			error = 'Укажите имя (минимум 2 символа)';
			return;
		}
		if (!phone.trim() || !/^[\d\s()+-]{7,20}$/.test(phone.trim())) {
			error = 'Укажите корректный номер телефона';
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/chat/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ session_id: sessionId, name: name.trim(), phone: phone.trim(), email: email.trim() || undefined })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Ошибка отправки';
			} else {
				success = true;
				onsubmit?.();
			}
		} catch {
			error = 'Ошибка сети. Попробуйте позже.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="chat-contact">
	{#if success}
		<div class="chat-contact__success">
			Спасибо! Мы свяжемся с вами в ближайшее время.
		</div>
	{:else}
		<div class="chat-contact__title">Оставьте ваши контакты</div>
		<form class="chat-contact__form" onsubmit|preventDefault={handleSubmit}>
			<input
				type="text"
				placeholder="Ваше имя *"
				bind:value={name}
				class="chat-contact__input"
				maxlength="100"
			/>
			<input
				type="tel"
				placeholder="Телефон *"
				bind:value={phone}
				class="chat-contact__input"
				maxlength="20"
			/>
			<input
				type="email"
				placeholder="Email (необязательно)"
				bind:value={email}
				class="chat-contact__input"
				maxlength="100"
			/>
			{#if error}
				<div class="chat-contact__error">{error}</div>
			{/if}
			<button type="submit" class="chat-contact__btn" disabled={loading}>
				{loading ? 'Отправка...' : 'Отправить'}
			</button>
		</form>
	{/if}
</div>

<style>
	.chat-contact {
		padding: 12px;
		background: var(--color-surface-alt, #EFF2F9);
		border-radius: var(--radius-md, 12px);
		margin-top: 6px;
	}

	.chat-contact__title {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text, #21242C);
		margin-bottom: 8px;
	}

	.chat-contact__form {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.chat-contact__input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--color-border, rgba(13,34,83,0.08));
		border-radius: var(--radius-sm, 6px);
		font-size: 13px;
		background: var(--color-background, #fff);
		color: var(--color-text, #21242C);
		font-family: inherit;
	}

	.chat-contact__input:focus {
		outline: none;
		border-color: var(--color-primary, #0A2463);
	}

	.chat-contact__error {
		font-size: 12px;
		color: var(--color-danger, #E45858);
	}

	.chat-contact__btn {
		padding: 8px 16px;
		background: linear-gradient(135deg, var(--color-primary, #0A2463) 0%, var(--color-secondary, #1E3888) 100%);
		color: #fff;
		border: none;
		border-radius: var(--radius-sm, 6px);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: opacity var(--transition-fast, 0.18s);
	}

	.chat-contact__btn:hover { opacity: 0.9; }
	.chat-contact__btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.chat-contact__success {
		font-size: 13px;
		color: var(--color-success, #3BA776);
		font-weight: 500;
		text-align: center;
		padding: 12px;
	}
</style>
