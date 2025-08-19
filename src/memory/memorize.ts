import { CategoryResponse } from "memu-js";
import { API_KEY, memuExtras, st } from "utils/context-extra";
import { memorizeConversation, retrieveDefaultCategories } from "utils/network";
import { ConversationMessage, MemuSummary, MemuTaskStatus } from "utils/types";
import { sumTokens } from "./utils";


export async function summaryIfNeed(): Promise<void> {
    const from = memuExtras.summary?.summaryRange?.[1] ?? 0;
    const total = await sumTokens(from);
    const chat = st.getContext().chat;

    console.log('memu-ext: now token accumulated: %d, max context: %d', total, st.getChatMaxContextSize());
    if (total < st.getChatMaxContextSize()) {
        return;
    }

    await doSummary(from, chat.length - 1);
}

export async function doSummary(from: number, to: number): Promise<void> {
    const apiKey = API_KEY.get();
    if (apiKey == null) {
        // toastr.warning('Please set API key first');
        console.log('memu-ext: API key is not set');
        return;
    }
    if (memuExtras.baseInfo == null) {
        console.log('memu-ext: baseInfo not found');
        return;
    }
    console.log('memu-ext: trigger memorize summary');

    try {
        const response = await memorizeConversation(
            apiKey,
            {
                messages: prepareConversationData(),
                userId: memuExtras.baseInfo.userName,
                userName: memuExtras.baseInfo.userName,
                characterId: memuExtras.baseInfo.characterId,
                characterName: memuExtras.baseInfo.characterName,
            },
        );
        console.log('memu-ext: memorize response', response);

        memuExtras.summary = {
            summaryRange: [from, to],
            summaryTaskId: response.taskId,
            summaryTaskStatus: MemuTaskStatus.PENDING
        };
        await st.saveChat();
    } catch (error) {
        memuExtras.summary = {
            summaryRange: [from, to],
            summaryTaskId: null,
            summaryTaskStatus: MemuTaskStatus.FAILURE,
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
        const response = await retrieveDefaultCategories(
            apiKey,
            memuExtras.baseInfo.userName,
            memuExtras.baseInfo.characterId,
            false,
        );
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
        throw error;
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
