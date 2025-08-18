import { CategoryResponse, MemuClient } from "memu-js";
import { API_KEY, memuExtras, st } from "utils/context-extra";
import { ConversationMessage } from "./types";
import { sumTokens } from "./utils";
import { MEMU_BASE_URL, MEMU_DEFAULT_MAX_RETRIES, MEMU_DEFAULT_TIMEOUT } from "utils/consts";
import { MemuSummary } from "utils/types";


export async function summaryIfNeed(): Promise<void> {
    const from = memuExtras.summary?.summaryRange?.[1] ?? 0;
    const total = await sumTokens(from);
    const chat = st.getContext().chat;

    console.log('memu-ext: now token accumulated: %d, max context: %d', total, st.getChatMaxContextSize());
    if (total < st.getChatMaxContextSize()) {
        return;
    }

    await doSummary(from, chat.length);
}

export async function doSummary(from: number, to: number): Promise<void> {
    const apiKey = API_KEY.get();
    if (apiKey == null) {
        // toastr.warning('Please set API key first');
        console.log('memu-ext: API key is not set');
        return;
    }
    console.log('memu-ext: trigger memorize summary');

    const client = new MemuClient({
        baseUrl: MEMU_BASE_URL,
        apiKey: apiKey,
        timeout: MEMU_DEFAULT_TIMEOUT,
        maxRetries: MEMU_DEFAULT_MAX_RETRIES
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

        const statusRaw = response.status.toLowerCase();
        memuExtras.summary = {
            summaryRange: [from, to],
            summaryTaskId: response.taskId,
            summaryTaskStatus: statusRaw === 'success' ? 'SUCCESS' :
                statusRaw === 'pending' ? 'PENDING' :
                    'FAILURE',
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

export async function retrieveMemories(summary: MemuSummary): Promise<void> {
    const apiKey = API_KEY.get();
    if (apiKey == null) {
        console.log('memu-ext: API key is not set');
        return;
    }
    console.log('memu-ext: trigger retrieve memories');
    try {
        const client = new MemuClient({
            baseUrl: MEMU_BASE_URL,
            apiKey: apiKey,
            timeout: MEMU_DEFAULT_TIMEOUT,
            maxRetries: MEMU_DEFAULT_MAX_RETRIES
        });
        const response = await client.retrieveDefaultCategories({
            userId: memuExtras.baseInfo.userName,
            agentId: memuExtras.baseInfo.characterId,
            includeInactive: false,
        });
        console.log('memu-ext: retrieve memories response', response);
        const retrieve = memuExtras.retrieve ?? {
            history: [],
        };
        if (retrieve.nowRetrieve != null) {
            retrieve.history.push(retrieve.nowRetrieve);
        }
        retrieve.nowRetrieve = {
            summaryRange: summary.summaryRange,
            summaryTaskId: summary.summaryTaskId ?? "undefined",
            summary: parseSummary(response.categories),
        };
        memuExtras.retrieve = retrieve;
        console.log('memu-ext: retrieve memories parsed', retrieve);
        await st.saveChat();
    } catch (error) {
        console.error('memu-ext: retrieve memories failed', error);
    }
}

function parseSummary(categories: CategoryResponse[]): string {
    return categories.map(category => `[${category.name}] ${category.summary}`).join('\n');
}

function prepareConversationData(): ConversationMessage[] {
    const chat = st.getContext().chat;
    const chatInfo = memuExtras.baseInfo;
    if (!chatInfo) {
        throw new Error('memu-ext: chatInfo not found');
    }

    const messages: ConversationMessage[] = [];
    for (const message of chat) {
        messages.push({
            role: message.is_user ? message.name === chatInfo.userName ? 'user' : 'participant' : 'assistant',
            name: message.is_user && message.name !== chatInfo.userName ? message.name : undefined,
            content: message.mes,
        });
    }
    return messages;
}
