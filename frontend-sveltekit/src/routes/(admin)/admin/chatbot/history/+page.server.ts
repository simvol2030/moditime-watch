import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

const PER_PAGE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const status = url.searchParams.get('status') || '';
	const page = Math.max(1, Number(url.searchParams.get('page') || 1));
	const sessionId = url.searchParams.get('session') || '';
	const offset = (page - 1) * PER_PAGE;

	// Load sessions list
	const sessions = status
		? queries.adminListChatSessionsByStatus.all(status, PER_PAGE, offset) as any[]
		: queries.adminListChatSessions.all(PER_PAGE, offset) as any[];

	const totalCount = status
		? (queries.adminCountChatSessionsByStatus.get(status) as any)?.total || 0
		: (queries.adminCountChatSessions.get() as any)?.total || 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

	// If session detail requested, load messages
	let selectedSession: any = null;
	let sessionMessages: any[] = [];
	if (sessionId) {
		selectedSession = queries.getChatSession.get(sessionId) as any;
		if (selectedSession) {
			sessionMessages = queries.getChatMessagesBySession.all(sessionId) as any[];
		}
	}

	return {
		sessions,
		totalCount,
		totalPages,
		currentPage: page,
		status,
		selectedSession,
		sessionMessages,
		sessionId
	};
};

export const actions: Actions = {
	addNote: async ({ request }) => {
		const formData = await request.formData();
		const sessionId = formData.get('session_id')?.toString() || '';
		const note = formData.get('note')?.toString()?.trim() || '';

		if (!sessionId || !note) return fail(400, { error: 'Данные обязательны' });

		try {
			queries.insertChatMessage.run({
				session_id: sessionId,
				role: 'human',
				content: note,
				metadata_json: null
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка' });
		}
	},

	closeSession: async ({ request }) => {
		const formData = await request.formData();
		const sessionId = formData.get('session_id')?.toString() || '';
		if (!sessionId) return fail(400, { error: 'Session ID обязателен' });

		try {
			queries.updateChatSessionStatus.run('closed', sessionId);
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка' });
		}
	}
};
