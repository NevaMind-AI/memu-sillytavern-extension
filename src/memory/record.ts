import { getContext } from "@silly-tavern/scripts/st-context.js";
import { STORE_MESSAGES, withStore } from "./db/db";
import { MessageRow, computePrimaryKey } from "./db/messages";
import { estimateTokenUsage, requestToPromise } from "utils/utils";
import { getMemoryRetrieve } from "./db/memory-retrieve";

export async function upsertFromStMessage(messageIndex: number): Promise<MessageRow | undefined> {
    const ctx = getContext();
    const stMessage: any = ctx.chat?.[messageIndex];
    if (!stMessage) return undefined;
    const chatId: string = String(ctx.getCurrentChatId?.() ?? ctx.chatId ?? "");
    const text: string = String(stMessage.mes ?? "");
    const tokenUsage = await computeTokenUsage(text).catch(() => estimateTokenUsage(text));
    const id = computePrimaryKey(chatId, messageIndex);
    const now = Date.now();

    return withStore(STORE_MESSAGES, "readwrite", async (store) => {
        const existing = await requestToPromise<MessageRow | undefined>(store.get(id));
        const entity: MessageRow = {
            id,
            chatId,
            messageId: Number(messageIndex),
            name: stMessage.name,
            is_user: !!stMessage.is_user,
            is_system: !!stMessage.is_system,
            send_date: stMessage.send_date,
            mes: text,
            extra: stMessage.extra ?? {},
            token_usage: tokenUsage,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        };
        await requestToPromise(store.put(entity));
        return entity;
    });
}

export async function computeTokenUsage(text: string): Promise<number> {
    const ctx = getContext();
    if (typeof ctx.getTokenCountAsync === "function") {
        const n = await ctx.getTokenCountAsync(text as unknown as string);
        if (typeof n === "number" && !Number.isNaN(n)) return n;
    }
    if (typeof ctx.getTokenCount === "function") {
        const n = ctx.getTokenCount(text as unknown as string);
        if (typeof n === "number" && !Number.isNaN(n)) return n;
    }
    return estimateTokenUsage(text);
}

export async function restoreHistory(chatId: string) {
    const ctx = getContext();
    const row = await getMemoryRetrieve(chatId);
    const startIndex = (row && row.summaried_last_msg_id != null) ? (row.summaried_last_msg_id + 1) : 0;
    const all = ctx.chat ?? [];
    if (!Array.isArray(all)) return;
    const end = all.length - 1;
    const count = Math.max(0, all.length - startIndex);
    if (count <= 0) return;

    const tasks: Promise<unknown>[] = [];
    for (let i = startIndex; i < all.length; i++) {
        tasks.push(upsertFromStMessage(i));
    }
    await Promise.allSettled(tasks);
    console.log('memu-ext: onChatChanged: batched', { chatId, startIndex, endIndex: end, count });
}
