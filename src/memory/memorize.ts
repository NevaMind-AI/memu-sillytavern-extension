import { CategoryResponse } from "memu-js";
import { API_KEY, memuExtras, st, Message, MessageCollection } from "utils/context-extra";
import { memorizeConversation, retrieveDefaultCategories } from "utils/network";
import { ConversationMessage, MemuSummary, MemuTaskStatus, STEventData } from "utils/types";
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
                messages: await prepareConversationData(from, to),
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
            summaryTaskStatus: MemuTaskStatus.PENDING,
            isReady: false,
        };
        await st.saveChat();
    } catch (error) {
        memuExtras.summary = {
            summaryRange: [from, to],
            summaryTaskId: null,
            summaryTaskStatus: MemuTaskStatus.FAILURE,
            isReady: false,
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

export function addSummaryToPrompt(eventData: STEventData, replaceSystem: boolean = true): void {
    const memuSummary = memuExtras.retrieve?.nowRetrieve?.summary;
    if (!memuSummary) {
        console.log('memu-ext: no memu summary found');
        return;
    }
    if (replaceSystem) {
        const summary = findSystemSummary(st.promptManager.messages);
        if (summary) {
            console.log('memu-ext: found system summary', summary);
            replaceSystemSummary(summary, memuSummary, eventData);
            return;
        }
    }
    addSummary(memuSummary, eventData);
}

function replaceSystemSummary(summary: string, memuSummary: string, eventData: STEventData): void {
    eventData.chat.forEach(msg => {
        if (msg.content === summary) {
            console.log('memu-ext: found system summary in prompt', msg);
            msg.content = memuSummary;
            return;
        }
    });
}

function addSummary(memuSummary: string, eventData: STEventData): void {
    eventData.chat.unshift({
        role: 'system',
        content: memuSummary,
    });
    console.log('memu-ext: added memu summary to', eventData);
}

/**
 * @copy from @silly-tavern/scripts/openai.js
 *
 * Retrieves the chat as a flattened array of messages.
 * @returns {Array} The chat messages.
 */
function findSystemSummary(messages: MessageCollection): string {
    for (let item of messages.collection) {
        if (item instanceof MessageCollection) {
            const summary = findSystemSummary(item);
            if (summary) {
                return summary;
            }
        } else if (item instanceof Message && item.content) {
            if (item.identifier === 'summary') {
                return item.content;
            }
        } else {
            console.log(`Skipping invalid or empty message in collection: ${JSON.stringify(item)}`);
        }
    }
    return null;
}

function parseSummary(categories: CategoryResponse[]): string {
    return categories.map(category => `[${category.name}] ${category.summary}`).join('\n\n\n');
}

// function prepareConversationData(): ConversationMessage[] {
//     const chat = st.getContext().chat;
//     const chatInfo = memuExtras.baseInfo;
//     if (!chatInfo) {
//         throw new Error('memu-ext: chatInfo not found');
//     }

//     const messages: ConversationMessage[] = [];
//     for (const message of chat) {
//         messages.push({
//             role: message.is_user ? message.name === chatInfo.userName ? 'user' : 'participant' : 'assistant',
//             name: message.is_user && message.name !== chatInfo.userName ? message.name : undefined,
//             content: message.mes,
//         });
//     }
//     return messages;
// }

async function prepareConversationData(from: number, to: number): Promise<ConversationMessage[]> {
    const chat = st.getContext().chat;
    const chatInfo = memuExtras.baseInfo;
    if (!chatInfo) {
        throw new Error('memu-ext: chatInfo not found');
    }

    const canUseTools = st.toolManager.isToolCallingSupported();
    let coreChat = chat.slice(from, to).filter(x => !x.is_system || (canUseTools && Array.isArray(x.extra?.tool_invocations)));

    const messages: ConversationMessage[] = [];
    await Promise.all(coreChat.map(async (chatItem, index) => {
        let message = chatItem.mes;
        let regexType = chatItem.is_user ? st.regex_placement.USER_INPUT : st.regex_placement.AI_OUTPUT;
        let options = { isPrompt: true, depth: (coreChat.length - index - 1) };

        let regexedMessage = st.getRegexedString(message, regexType, options);
        regexedMessage = await st.appendFileContent(chatItem, regexedMessage);

        if (chatItem?.extra?.append_title && chatItem?.extra?.title) {
            regexedMessage = `${regexedMessage}\n\n${chatItem.extra.title}`;
        }

        messages.push({
            role: message.is_user ? message.name === memuExtras.baseInfo.userName ? 'user' : 'participant' : 'assistant',
            name: message.is_user && message.name !== memuExtras.baseInfo.userName ? message.name : undefined,
            content: regexedMessage,
        });
    }));

    console.log('memu-ext: prepared conversation data', messages);
    return messages;
}
