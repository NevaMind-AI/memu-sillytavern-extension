import { estimateTokenUsage } from "utils/utils";
import { memuExtras, st } from "utils/context-extra";
import { MemuClient } from "memu-js";
import { LOCAL_STORAGE_API_KEY } from "utils/consts";
import { ConvMessage } from "./types";

export async function sumTokens(from: number): Promise<number> {
	const chat = st.getContext().chat;
	if (chat == null || chat.length <= from) {
		return 0;
	}
	let sum = 0;
	for (let i = from; i < chat.length; i++) {
		const message = chat[i];
		const text = message.mes;
		if (text == null || typeof text !== 'string') {
			continue;
		}
		const usage = await computeTokenUsage(text);
		sum += usage;
	}
	return sum;
}

export async function doSummary(from: number, to: number) {
	const apiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY);
    if (apiKey == null) {
        toastr.warning('Please set API key first');
        return;
    }
    console.log('memu-ext: trigger memorize summary');

    const client = new MemuClient({
        baseUrl: 'https://api.memu.so',
        apiKey: apiKey,
        timeout: 30000,
        maxRetries: 3
    });

    try {
        const response = await client.memorizeConversation(
            prepareConversationData(),
            memuExtras.baseInfo.userName,
            memuExtras.baseInfo.userName,
            memuExtras.baseInfo.characterId,
            memuExtras.baseInfo.characterName,
        );
        console.log('memu-ext: memorize response', response);
        memuExtras.summary = {
            summaryRange: [from, to],
            summaryTaskId: response.taskId,
            summaryTaskStatus: response.status as 'PENDING' | 'SUCCESS' | 'FAILURE',
        };
        await st.saveChat();
    } catch (error) {
		memuExtras.summary = {
            summaryRange: [from, to],
            summaryTaskId: null,
            summaryTaskStatus: 'FAILURE',
        };
        await st.saveChat();
        console.error('memu-ext: memorize failed', error);
    }
}

async function computeTokenUsage(text: string): Promise<number> {
    const ctx = st.getContext();
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

function prepareConversationData() {
    const chat = st.getContext().chat;
    const chatInfo = memuExtras.baseInfo;
    if (!chatInfo) {
        throw new Error('memu-ext: chatInfo not found');
    }

    const messages: ConvMessage[] = [];
    for (const message of chat) {
        messages.push({
            role: message.is_user ? message.name === chatInfo.userName ? 'user' : 'participant' : 'assistant',
            name: message.is_user && message.name !== chatInfo.userName ? message.name : undefined,
            content: message.mes,
        });
    }
    return messages;
}
