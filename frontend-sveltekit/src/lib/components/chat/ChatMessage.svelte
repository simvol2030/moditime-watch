<script lang="ts">
	interface Props {
		role: 'user' | 'bot' | 'system';
		content: string;
		timestamp?: string;
		isTyping?: boolean;
	}

	let { role, content, timestamp, isTyping = false }: Props = $props();

	function formatTime(ts: string | undefined): string {
		if (!ts) return '';
		try {
			const d = new Date(ts);
			return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
		} catch { return ''; }
	}
</script>

{#if isTyping}
	<div class="chat-msg chat-msg--bot">
		<div class="chat-msg__bubble chat-msg__bubble--bot">
			<span class="typing-dots">
				<span></span><span></span><span></span>
			</span>
		</div>
	</div>
{:else if role === 'system'}
	<div class="chat-msg chat-msg--system">
		<span class="chat-msg__system-text">{content}</span>
	</div>
{:else}
	<div class="chat-msg chat-msg--{role}">
		<div class="chat-msg__bubble chat-msg__bubble--{role}">
			{content}
		</div>
		{#if timestamp}
			<span class="chat-msg__time chat-msg__time--{role}">{formatTime(timestamp)}</span>
		{/if}
	</div>
{/if}

<style>
	.chat-msg {
		display: flex;
		flex-direction: column;
		margin-bottom: var(--space-sm, 12px);
		animation: fade-up 0.25s ease both;
	}

	.chat-msg--user { align-items: flex-end; }
	.chat-msg--bot { align-items: flex-start; }
	.chat-msg--system { align-items: center; }

	.chat-msg__bubble {
		max-width: 85%;
		padding: 10px 14px;
		border-radius: var(--radius-md, 12px);
		font-size: var(--font-size-body-sm, 14px);
		line-height: var(--line-height-normal, 1.5);
		white-space: pre-wrap;
		word-break: break-word;
	}

	.chat-msg__bubble--user {
		background: linear-gradient(135deg, var(--color-primary, #0A2463) 0%, var(--color-secondary, #1E3888) 100%);
		color: #fff;
		border-bottom-right-radius: 4px;
	}

	.chat-msg__bubble--bot {
		background-color: var(--color-surface, #F7F8FB);
		color: var(--color-text, #21242C);
		border: 1px solid var(--color-border, rgba(13,34,83,0.08));
		border-bottom-left-radius: 4px;
	}

	.chat-msg__time {
		font-size: 11px;
		color: var(--color-text-muted, #80879A);
		margin-top: 2px;
		padding: 0 4px;
	}

	.chat-msg__time--user { text-align: right; }
	.chat-msg__time--bot { text-align: left; }

	.chat-msg__system-text {
		font-size: 12px;
		color: var(--color-text-muted, #80879A);
		font-style: italic;
		padding: 4px 12px;
		background: var(--color-surface-alt, #EFF2F9);
		border-radius: var(--radius-pill, 999px);
	}

	/* Typing indicator */
	.typing-dots {
		display: inline-flex;
		gap: 4px;
		padding: 4px 0;
	}

	.typing-dots span {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background-color: var(--color-text-muted, #80879A);
		animation: typing-bounce 1.4s infinite ease-in-out;
	}

	.typing-dots span:nth-child(2) { animation-delay: 0.16s; }
	.typing-dots span:nth-child(3) { animation-delay: 0.32s; }

	@keyframes typing-bounce {
		0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
		40% { transform: scale(1); opacity: 1; }
	}

	@keyframes fade-up {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
