<script lang="ts">
	import { onMount, tick } from 'svelte';
	import ChatMessage from './ChatMessage.svelte';
	import ChatProductCard from './ChatProductCard.svelte';
	import ChatContactForm from './ChatContactForm.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	interface Message {
		id?: number;
		role: 'user' | 'bot' | 'system';
		content: string;
		created_at?: string;
		products?: any[];
		show_contact_form?: boolean;
	}

	let messages = $state<Message[]>([]);
	let input = $state('');
	let isLoading = $state(false);
	let sessionId = $state('');
	let config = $state<any>({});
	let quickReplies = $state<string[]>([]);
	let messagesEl: HTMLDivElement | undefined = $state();
	let showContactForm = $state(false);

	onMount(async () => {
		try {
			const res = await fetch('/api/chat/session');
			const data = await res.json();
			sessionId = data.session_id;
			config = data.config || {};
			quickReplies = config.quick_replies || [];

			if (data.messages && data.messages.length > 0) {
				messages = data.messages;
			} else {
				// Show welcome message
				messages = [{
					role: 'bot',
					content: config.welcome_message || 'Здравствуйте! Чем могу помочь?',
					created_at: new Date().toISOString()
				}];
			}
			await tick();
			scrollToBottom();
		} catch {
			messages = [{
				role: 'bot',
				content: 'Здравствуйте! Чем могу помочь?',
				created_at: new Date().toISOString()
			}];
		}
	});

	function scrollToBottom() {
		if (messagesEl) {
			messagesEl.scrollTop = messagesEl.scrollHeight;
		}
	}

	async function sendMessage(text?: string) {
		const msg = (text || input).trim();
		if (!msg || isLoading) return;
		input = '';

		// Add user message
		messages = [...messages, { role: 'user', content: msg, created_at: new Date().toISOString() }];
		await tick();
		scrollToBottom();

		isLoading = true;
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: msg, session_id: sessionId })
			});
			const data = await res.json();

			if (res.ok) {
				if (data.session_id) sessionId = data.session_id;
				const botMsg: Message = {
					role: 'bot',
					content: data.reply,
					created_at: new Date().toISOString(),
					products: data.products || [],
					show_contact_form: data.show_contact_form || false
				};
				messages = [...messages, botMsg];
				if (data.quick_replies?.length) quickReplies = data.quick_replies;
				if (data.show_contact_form) showContactForm = true;
			} else {
				messages = [...messages, {
					role: 'bot',
					content: data.error || 'Произошла ошибка. Попробуйте позже.',
					created_at: new Date().toISOString()
				}];
			}
		} catch {
			messages = [...messages, {
				role: 'bot',
				content: 'Ошибка сети. Проверьте подключение.',
				created_at: new Date().toISOString()
			}];
		} finally {
			isLoading = false;
			await tick();
			scrollToBottom();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function handleContactSubmit() {
		showContactForm = false;
		messages = [...messages, {
			role: 'system',
			content: 'Контактные данные отправлены',
			created_at: new Date().toISOString()
		}];
	}
</script>

<div class="chat-dialog">
	<!-- Header -->
	<div class="chat-dialog__header">
		<div class="chat-dialog__avatar">{config.bot_avatar_emoji || '\u231A'}</div>
		<div class="chat-dialog__info">
			<span class="chat-dialog__name">{config.bot_name || 'Modi'}</span>
			<span class="chat-dialog__status">Онлайн</span>
		</div>
		<button class="chat-dialog__close" onclick={onclose} aria-label="Закрыть чат">
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
				<path d="M4 4L14 14M14 4L4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			</svg>
		</button>
	</div>

	<!-- Messages -->
	<div class="chat-dialog__messages chat-bot__messages" bind:this={messagesEl}>
		{#each messages as msg}
			<ChatMessage role={msg.role} content={msg.content} timestamp={msg.created_at} />
			{#if msg.products && msg.products.length > 0}
				<div class="chat-dialog__products">
					{#each msg.products as product}
						<ChatProductCard {product} />
					{/each}
				</div>
			{/if}
		{/each}
		{#if isLoading}
			<ChatMessage role="bot" content="" isTyping={true} />
		{/if}
	</div>

	<!-- Quick replies -->
	{#if quickReplies.length > 0 && !isLoading}
		<div class="chat-dialog__quick">
			{#each quickReplies as qr}
				<button class="chat-dialog__qr" onclick={() => sendMessage(qr)}>{qr}</button>
			{/each}
		</div>
	{/if}

	<!-- Contact form (persistent) -->
	{#if showContactForm && !messages.some(m => m.role === 'system' && m.content.includes('отправлены'))}
		<div class="chat-dialog__contact-wrap">
			<ChatContactForm {sessionId} onsubmit={handleContactSubmit} />
		</div>
	{/if}

	<!-- Input -->
	<div class="chat-dialog__input-wrap">
		<input
			type="text"
			class="chat-dialog__input"
			placeholder="Напишите сообщение..."
			bind:value={input}
			onkeydown={handleKeydown}
			maxlength="500"
			disabled={isLoading}
		/>
		<button
			class="chat-dialog__send"
			onclick={() => sendMessage()}
			disabled={!input.trim() || isLoading}
			aria-label="Отправить"
		>
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
				<path d="M2 9L16 2L9 16L8 10L2 9Z" fill="currentColor"/>
			</svg>
		</button>
	</div>
</div>

<style>
	.chat-dialog {
		display: flex;
		flex-direction: column;
		width: 380px;
		height: 520px;
		background: var(--color-background, #fff);
		border-radius: var(--radius-xl, 24px);
		box-shadow: var(--shadow-lg, 0 20px 50px rgba(8,15,35,0.18));
		overflow: hidden;
		animation: chat-slide-up 0.3s ease both;
		border: 1px solid var(--color-border, rgba(13,34,83,0.08));
	}

	/* Header */
	.chat-dialog__header {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 12px);
		padding: 14px 16px;
		background: linear-gradient(135deg, var(--color-primary, #0A2463) 0%, var(--color-secondary, #1E3888) 100%);
		color: #fff;
		flex-shrink: 0;
	}

	.chat-dialog__avatar {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		background: rgba(255,255,255,0.15);
		border-radius: 50%;
	}

	.chat-dialog__info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.chat-dialog__name {
		font-weight: 600;
		font-size: 15px;
	}

	.chat-dialog__status {
		font-size: 12px;
		opacity: 0.8;
	}

	.chat-dialog__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: none;
		border: none;
		color: #fff;
		cursor: pointer;
		transition: background var(--transition-fast, 0.18s);
		padding: 0;
		font: inherit;
	}

	.chat-dialog__close:hover { background: rgba(255,255,255,0.15); }

	/* Messages area */
	.chat-dialog__messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
	}

	.chat-dialog__products {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: var(--space-sm, 12px);
		max-width: 85%;
	}

	/* Quick replies */
	.chat-dialog__quick {
		display: flex;
		gap: 6px;
		padding: 0 16px 8px;
		overflow-x: auto;
		flex-shrink: 0;
	}

	.chat-dialog__quick::-webkit-scrollbar { display: none; }

	.chat-dialog__qr {
		padding: 6px 12px;
		border: 1px solid var(--color-border-strong, rgba(13,34,83,0.16));
		border-radius: var(--radius-pill, 999px);
		background: var(--color-background, #fff);
		color: var(--color-primary, #0A2463);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
		transition: all var(--transition-fast, 0.18s);
		font-family: inherit;
	}

	.chat-dialog__qr:hover {
		background: var(--color-primary, #0A2463);
		color: #fff;
		border-color: var(--color-primary, #0A2463);
	}

	/* Contact form wrapper */
	.chat-dialog__contact-wrap {
		padding: 0 16px 8px;
		flex-shrink: 0;
	}

	/* Input area */
	.chat-dialog__input-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-top: 1px solid var(--color-border, rgba(13,34,83,0.08));
		flex-shrink: 0;
	}

	.chat-dialog__input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid var(--color-border, rgba(13,34,83,0.08));
		border-radius: var(--radius-md, 12px);
		font-size: 14px;
		background: var(--color-surface, #F7F8FB);
		color: var(--color-text, #21242C);
		font-family: inherit;
	}

	.chat-dialog__input:focus {
		outline: none;
		border-color: var(--color-primary, #0A2463);
		background: var(--color-background, #fff);
	}

	.chat-dialog__send {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary, #0A2463), var(--color-secondary, #1E3888));
		color: #fff;
		border: none;
		cursor: pointer;
		transition: opacity var(--transition-fast, 0.18s), transform var(--transition-fast, 0.18s);
		flex-shrink: 0;
		padding: 0;
		font: inherit;
	}

	.chat-dialog__send:hover:not(:disabled) { transform: scale(1.05); }
	.chat-dialog__send:disabled { opacity: 0.4; cursor: not-allowed; }

	/* Animations */
	@keyframes chat-slide-up {
		from { opacity: 0; transform: translateY(20px) scale(0.95); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	/* Mobile fullscreen */
	@media (max-width: 768px) {
		.chat-dialog {
			width: 100vw;
			height: 100vh;
			height: 100dvh;
			border-radius: 0;
			position: fixed;
			inset: 0;
		}
	}
</style>
