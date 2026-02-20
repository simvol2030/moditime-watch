<script lang="ts">
	import ChatDialog from './ChatDialog.svelte';

	let isOpen = $state(false);

	function toggle() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div class="chat-widget__overlay" role="presentation">
		<div class="chat-widget__dialog-wrap">
			<ChatDialog onclose={close} />
		</div>
	</div>
{/if}

{#if !isOpen}
	<button class="chat-widget__fab" onclick={toggle} aria-label="Открыть чат">
		<svg class="chat-widget__icon" width="26" height="26" viewBox="0 0 24 24" fill="none">
			<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
			<path d="M7 9H17V11H7V9ZM7 5H17V7H7V5Z" fill="currentColor" opacity="0.6"/>
		</svg>
	</button>
{/if}

<style>
	/* Floating Action Button */
	.chat-widget__fab {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 250;
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary, #0A2463) 0%, var(--color-secondary, #1E3888) 100%);
		color: #fff;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-md, 0 12px 30px rgba(8,15,35,0.12));
		transition: transform var(--transition-fast, 0.18s), box-shadow var(--transition-fast, 0.18s);
		animation: chat-fab-in 0.4s ease 1s both;
		padding: 0;
		font: inherit;
	}

	.chat-widget__fab:hover {
		transform: scale(1.08) translateY(-2px);
		box-shadow: var(--shadow-lg, 0 20px 50px rgba(8,15,35,0.18));
	}

	.chat-widget__fab:active {
		transform: scale(0.95);
	}

	.chat-widget__icon {
		pointer-events: none;
	}

	/* Dialog overlay */
	.chat-widget__overlay {
		position: fixed;
		z-index: 250;
		bottom: 24px;
		right: 24px;
	}

	.chat-widget__dialog-wrap {
		animation: chat-dialog-in 0.3s ease both;
	}

	@keyframes chat-fab-in {
		from { opacity: 0; transform: scale(0.5) translateY(20px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}

	@keyframes chat-dialog-in {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Mobile: dialog is fullscreen, overlay fills screen */
	@media (max-width: 768px) {
		.chat-widget__overlay {
			inset: 0;
			bottom: 0;
			right: 0;
		}

		.chat-widget__fab {
			bottom: 16px;
			right: 16px;
		}
	}
</style>
