import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, seedChatbot } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	seedChatbot();

	const totalCount = (queries.adminCountChatSessions.get() as any)?.total || 0;
	const todayCount = (queries.adminCountChatSessionsToday.get() as any)?.total || 0;
	const waitingCount = (queries.adminCountChatSessionsWaiting.get() as any)?.total || 0;
	const recentSessions = queries.adminListChatSessions.all(10, 0) as any[];
	const isEnabled = (queries.getChatConfig.get('is_enabled') as any)?.value !== 'false';

	// AI stats
	const chatMode = (queries.getChatConfig.get('chat_mode') as any)?.value || 'auto';
	const monthlySpend = (queries.getMonthlyAISpend.get() as any)?.total_cost || 0;
	const monthlyBudget = parseFloat((queries.getChatConfig.get('ai_monthly_budget') as any)?.value || '10');

	return {
		totalCount,
		todayCount,
		waitingCount,
		recentSessions,
		isEnabled,
		chatMode,
		monthlySpend,
		monthlyBudget
	};
};

export const actions: Actions = {
	toggleEnabled: async () => {
		try {
			const current = (queries.getChatConfig.get('is_enabled') as any)?.value;
			const newValue = current === 'false' ? 'true' : 'false';
			queries.setChatConfig.run({ key: 'is_enabled', value: newValue, description: 'Включён ли чатбот' });
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка сохранения' });
		}
	}
};
