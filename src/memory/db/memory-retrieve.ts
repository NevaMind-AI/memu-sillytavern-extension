import { STORE_MEMORY_RETRIEVE, withStore } from './db';

export interface MemoryRetrieveRow {
	id: string; // 主键，推荐使用 chat_id 作为 id，或 `${chat_id}`
	chat_id: string; // 对话 id
	memory: string; // 记忆信息
	summaried_last_msg_id?: number; // 总结到了哪个 msgId；可为空
}

function requestToPromise<T = unknown>(request: IDBRequest): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result as T);
		request.onerror = () => reject(request.error);
	});
}

export async function getMemoryRetrieve(chatId: string): Promise<MemoryRetrieveRow | undefined> {
	const id = chatId; // 以 chat_id 作为主键，以便唯一约束
	return withStore(STORE_MEMORY_RETRIEVE, 'readonly', async (store) => {
		const res = await requestToPromise<MemoryRetrieveRow | undefined>(store.get(id));
		return res ?? undefined;
	});
}

export async function upsertMemoryRetrieve(row: { chat_id: string; memory: string; summaried_last_msg_id?: number | null }): Promise<MemoryRetrieveRow> {
	const id = row.chat_id;
	const entity: MemoryRetrieveRow = {
		id,
		chat_id: row.chat_id,
		memory: row.memory,
		summaried_last_msg_id: row.summaried_last_msg_id ?? undefined,
	};
	return withStore(STORE_MEMORY_RETRIEVE, 'readwrite', async (store) => {
		await requestToPromise(store.put(entity));
		return entity;
	});
}


