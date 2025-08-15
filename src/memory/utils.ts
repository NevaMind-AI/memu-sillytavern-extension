import { STORE_MESSAGES, withStore } from "./db/db";
import type { MessageRow } from "./db/messages";

export async function sumTokensByChatId(chat_id: string): Promise<number> {
	const total = await withStore<number>(STORE_MESSAGES, "readonly", async (store) => {
		const index = store.index("chatId");
		const range = IDBKeyRange.only(chat_id);
		return new Promise<number>((resolve, reject) => {
			let sum = 0;
			const req = index.openCursor(range);
			req.onsuccess = () => {
				const cursor = req.result as IDBCursorWithValue | null;
				if (cursor) {
					const value = cursor.value as MessageRow;
					sum += Number(value?.token_usage ?? 0);
					cursor.continue();
				} else {
					resolve(sum);
				}
			};
			req.onerror = () => reject(req.error);
		});
	});
	return total;
}


