<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSavingTelegram = $state(false);
	let isSavingEmail = $state(false);
	let isTestingTelegram = $state(false);
	let isTestingEmail = $state(false);
</script>

<svelte:head>
	<title>Notifications - Moditime Admin</title>
</svelte:head>

<PageHeader title="Notification Settings" description="Configure Telegram and Email notifications for orders" />

{#if form?.error}
	<div class="alert error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert success">{form.message}</div>
{/if}

<!-- Telegram Section -->
<div class="card">
	<div class="card-header">
		<h3>Telegram Notifications</h3>
		<p class="card-description">Send order notifications to a Telegram group or channel</p>
	</div>

	<form
		method="POST"
		action="?/saveTelegram"
		use:enhance={() => {
			isSavingTelegram = true;
			return async ({ update }) => {
				isSavingTelegram = false;
				await update();
			};
		}}
	>
		<div class="form-grid">
			<div class="form-group toggle-group">
				<label class="toggle-label">
					<input
						type="checkbox"
						name="telegram_enabled"
						checked={data.config.telegram_enabled === 'true'}
						class="toggle-input"
					/>
					<span class="toggle-switch"></span>
					<span>Enabled</span>
				</label>
			</div>

			<div class="form-group">
				<label for="telegram_bot_token">Bot Token</label>
				<input
					type="text"
					id="telegram_bot_token"
					name="telegram_bot_token"
					value={data.config.telegram_bot_token}
					placeholder="123456:ABC-DEF..."
					autocomplete="off"
				/>
				<span class="hint">Get from <a href="https://t.me/BotFather" target="_blank" rel="noopener">@BotFather</a></span>
			</div>

			<div class="form-group">
				<label for="telegram_chat_id">Chat ID</label>
				<input
					type="text"
					id="telegram_chat_id"
					name="telegram_chat_id"
					value={data.config.telegram_chat_id}
					placeholder="-1001234567890"
				/>
				<span class="hint">Group/channel ID (starts with -100 for supergroups)</span>
			</div>
		</div>

		<div class="form-actions">
			<ActionButton type="submit" variant="primary" disabled={isSavingTelegram}>
				{isSavingTelegram ? 'Saving...' : 'Save Telegram Settings'}
			</ActionButton>
		</div>
	</form>

	<div class="test-section">
		<form
			method="POST"
			action="?/testTelegram"
			use:enhance={() => {
				isTestingTelegram = true;
				return async ({ update }) => {
					isTestingTelegram = false;
					await update();
				};
			}}
		>
			<ActionButton type="submit" variant="secondary" disabled={isTestingTelegram}>
				{isTestingTelegram ? 'Sending...' : 'Send Test Message'}
			</ActionButton>
		</form>
	</div>
</div>

<!-- Email Section -->
<div class="card">
	<div class="card-header">
		<h3>Email Notifications</h3>
		<p class="card-description">SMTP settings for sending order emails to customers and admins</p>
	</div>

	<form
		method="POST"
		action="?/saveEmail"
		use:enhance={() => {
			isSavingEmail = true;
			return async ({ update }) => {
				isSavingEmail = false;
				await update();
			};
		}}
	>
		<div class="form-grid">
			<div class="form-group toggle-group">
				<label class="toggle-label">
					<input
						type="checkbox"
						name="email_enabled"
						checked={data.config.email_enabled === 'true'}
						class="toggle-input"
					/>
					<span class="toggle-switch"></span>
					<span>Enabled</span>
				</label>
			</div>

			<div class="form-group">
				<label for="smtp_host">SMTP Host</label>
				<input
					type="text"
					id="smtp_host"
					name="smtp_host"
					value={data.config.smtp_host}
					placeholder="smtp.gmail.com"
				/>
			</div>

			<div class="form-group">
				<label for="smtp_port">SMTP Port</label>
				<input
					type="text"
					id="smtp_port"
					name="smtp_port"
					value={data.config.smtp_port || '587'}
					placeholder="587"
				/>
				<span class="hint">587 (STARTTLS) or 465 (SSL)</span>
			</div>

			<div class="form-group">
				<label for="smtp_user">SMTP User</label>
				<input
					type="text"
					id="smtp_user"
					name="smtp_user"
					value={data.config.smtp_user}
					placeholder="user@gmail.com"
					autocomplete="off"
				/>
			</div>

			<div class="form-group">
				<label for="smtp_password">SMTP Password</label>
				<input
					type="password"
					id="smtp_password"
					name="smtp_password"
					value={data.config.smtp_password}
					placeholder="App password"
					autocomplete="new-password"
				/>
			</div>

			<div class="form-group">
				<label for="email_from">From Email</label>
				<input
					type="email"
					id="email_from"
					name="email_from"
					value={data.config.email_from}
					placeholder="noreply@moditime-watch.ru"
				/>
			</div>

			<div class="form-group">
				<label for="admin_email">Admin Email</label>
				<input
					type="email"
					id="admin_email"
					name="admin_email"
					value={data.config.admin_email}
					placeholder="admin@moditime-watch.ru"
				/>
				<span class="hint">Receives order notifications</span>
			</div>
		</div>

		<div class="form-actions">
			<ActionButton type="submit" variant="primary" disabled={isSavingEmail}>
				{isSavingEmail ? 'Saving...' : 'Save Email Settings'}
			</ActionButton>
		</div>
	</form>

	<div class="test-section">
		<form
			method="POST"
			action="?/testEmail"
			use:enhance={() => {
				isTestingEmail = true;
				return async ({ update }) => {
					isTestingEmail = false;
					await update();
				};
			}}
		>
			<ActionButton type="submit" variant="secondary" disabled={isTestingEmail}>
				{isTestingEmail ? 'Sending...' : 'Send Test Email'}
			</ActionButton>
		</form>
	</div>
</div>

<style>
	.card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.card-header {
		margin-bottom: 1.5rem;
	}

	.card-header h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
	}

	.card-description {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
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

	.form-group label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #374151;
	}

	.form-group input[type='text'],
	.form-group input[type='email'],
	.form-group input[type='password'] {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.hint {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.hint a {
		color: #3b82f6;
	}

	.toggle-group {
		grid-column: span 2;
	}

	.toggle-label {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.toggle-input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.toggle-switch {
		position: relative;
		width: 44px;
		height: 24px;
		background: #d1d5db;
		border-radius: 12px;
		transition: background 0.2s;
	}

	.toggle-switch::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 50%;
		transition: transform 0.2s;
	}

	.toggle-input:checked + .toggle-switch {
		background: #3b82f6;
	}

	.toggle-input:checked + .toggle-switch::after {
		transform: translateX(20px);
	}

	.form-actions {
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.test-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		align-items: center;
		gap: 1rem;
	}
</style>
