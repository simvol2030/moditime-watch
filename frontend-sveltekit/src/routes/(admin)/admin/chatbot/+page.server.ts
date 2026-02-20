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

	return {
		totalCount,
		todayCount,
		waitingCount,
		recentSessions,
		isEnabled
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
