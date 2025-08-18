import { ChatInfo } from "./types";
import { summaryIfNeed } from "./memorize";
import { st } from "utils/context-extra";

export let chatInfo: ChatInfo = {};

export function onMessageReceived(msgIdAny: any) {
    if (chatInfo.chat == null) {
        return;
    }
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageReceived: ', chatInfo.chat[msgId]);
    // 异步写入消息存储
    try { void summaryIfNeed(); } catch { }
}

export function onMessageEdited(msgIdAny: any) {
    if (chatInfo.chat == null) {
        return;
    }
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageEdited: ', chatInfo.chat[msgId]);
    try { void summaryIfNeed(); } catch { }
}

export function onMessageSwiped(msgIdAny: any) {
    if (chatInfo.chat == null) {
        return;
    }
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageSwiped: ', chatInfo.chat[msgId]);
    try { void summaryIfNeed(); } catch { }
}

export function onChatCompletionPromptReady(eventData) {
    console.log('memu-ext: onChatCompletionPromptReady', eventData);
}

export function onChatChanged() {
    const ctx = st.getContext();
    const chatId = String(ctx.getCurrentChatId());
    console.log('memu-ext: onChatChanged', chatId, ctx);

    chatInfo.chat = ctx.chat;
    chatInfo.chatId = chatId;
    chatInfo.userName = ctx.name1;
    const character = ctx.characters.find((c) => c.name === ctx.name2);
    if (character) {
        chatInfo.characterId = `${character.name} - ${character.create_date}`;
        chatInfo.characterName = character.name;
    }

    try { void summaryIfNeed(); } catch { }
}
