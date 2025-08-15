import { requestToPromise } from "utils/utils";
import { STORE_MESSAGES, withStore } from "./db";

export interface MessageRow {
	id: string;
	chatId: string;
	messageId: number;
	name?: string;
	is_user?: boolean;
	is_system?: boolean;
	send_date?: string;
	mes: string;
	extra?: Record<string, unknown>;
	token_usage: number;
	createdAt: number;
	updatedAt: number;
}

export function computePrimaryKey(chatId: string, messageId: number): string {
	return `${chatId}:${messageId}`;
}

export async function saveMessage(row: Omit<MessageRow, "createdAt" | "updatedAt" | "id"> & { id?: string }): Promise<MessageRow> {
	const now = Date.now();
	const id = row.id ?? computePrimaryKey(row.chatId, row.messageId);
	const entity: MessageRow = { ...row, id, createdAt: now, updatedAt: now } as MessageRow;

	await withStore(STORE_MESSAGES, "readwrite", async (store) => {
		await requestToPromise(store.put(entity));
		return Promise.resolve(entity);
	});
	return entity;
}

export async function getMessage(chatId: string, messageId: number): Promise<MessageRow | undefined> {
	const id = computePrimaryKey(chatId, messageId);
	return withStore(STORE_MESSAGES, "readonly", async (store) => {
		const res = await requestToPromise<MessageRow | undefined>(store.get(id));
		return res ?? undefined;
	});
}
