<script lang="ts">
	interface Props {
		status: string | number | boolean;
		type?: 'active' | 'status' | 'custom';
		colors?: Record<string, string>;
	}

	let { status, type = 'active', colors = {} }: Props = $props();

	const defaultColors: Record<string, string> = {
		// Boolean / Active states
		'1': '#22c55e',
		'0': '#ef4444',
		true: '#22c55e',
		false: '#ef4444',
		active: '#22c55e',
		inactive: '#ef4444',
		// Order statuses
		pending: '#f59e0b',
		confirmed: '#3b82f6',
		paid: '#10b981',
		shipped: '#6366f1',
		delivered: '#22c55e',
		cancelled: '#ef4444',
		// Default
		default: '#6b7280'
	};

	const displayLabels: Record<string, string> = {
		'1': 'Active',
		'0': 'Inactive',
		true: 'Active',
		false: 'Inactive'
	};

	const color = $derived(colors[String(status)] || defaultColors[String(status)] || defaultColors.default);
	const label = $derived(displayLabels[String(status)] || String(status));
</script>

<span class="badge" style="background: {color}">
	{label}
</span>

<style>
	.badge {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		color: white;
		text-transform: capitalize;
	}
</style>
