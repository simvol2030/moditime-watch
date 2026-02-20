import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('category') || '';
	const faqItems = category
		? queries.adminListChatFaqByCategory.all(category) as any[]
		: queries.adminListChatFaq.all() as any[];

	return { faqItems, category };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const question = formData.get('question')?.toString()?.trim() || '';
		const answer = formData.get('answer')?.toString()?.trim() || '';
		const keywords = formData.get('keywords')?.toString()?.trim() || '';
		const category = formData.get('category')?.toString() || 'general';

		if (!question || !answer) return fail(400, { error: 'Вопрос и ответ обязательны' });

		try {
			const nextPos = (queries.adminGetMaxFaqPosition.get() as any)?.next_position || 0;
			queries.adminCreateChatFaq.run({
				question, answer, keywords, category, is_active: 1, position: nextPos
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка создания' });
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const question = formData.get('question')?.toString()?.trim() || '';
		const answer = formData.get('answer')?.toString()?.trim() || '';
		const keywords = formData.get('keywords')?.toString()?.trim() || '';
		const category = formData.get('category')?.toString() || 'general';
		const position = Number(formData.get('position') || 0);
		const is_active = formData.get('is_active') ? 1 : 0;

		if (!id || !question || !answer) return fail(400, { error: 'Данные обязательны' });

		try {
			queries.adminUpdateChatFaq.run({ id, question, answer, keywords, category, is_active, position });
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка обновления' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'ID обязателен' });

		try {
			queries.adminDeleteChatFaq.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка удаления' });
		}
	},

	toggle: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'ID обязателен' });

		try {
			queries.adminToggleChatFaq.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка' });
		}
	},

	move: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const direction = formData.get('direction')?.toString();
		if (!id || !direction) return fail(400, { error: 'Данные обязательны' });

		try {
			const allItems = queries.adminListChatFaq.all() as any[];
			const idx = allItems.findIndex((f: any) => f.id === id);
			if (idx < 0) return fail(404, { error: 'FAQ не найден' });

			const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
			if (swapIdx < 0 || swapIdx >= allItems.length) return { success: true };

			const current = allItems[idx];
			const swap = allItems[swapIdx];
			queries.adminUpdateChatFaq.run({ ...current, position: swap.position, is_active: current.is_active });
			queries.adminUpdateChatFaq.run({ ...swap, position: current.position, is_active: swap.is_active });
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка перемещения' });
		}
	}
};
