import { getContext } from "@silly-tavern/scripts/st-context.js";
import { restoreHistory, upsertFromStMessage } from "./record";
import { ChatInfo } from "./types";

export let chatInfo: ChatInfo = {};

export function onMessageReceived(msgIdAny: any) {
    if (chatInfo.chat == null) {
        return;
    }
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageReceived: ', chatInfo.chat[msgId]);
    // 异步写入消息存储
    try { void upsertFromStMessage(msgId); } catch { }
}

export function onMessageEdited(msgIdAny: any) {
    if (chatInfo.chat == null) {
        return;
    }
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageEdited: ', chatInfo.chat[msgId]);
    try { void upsertFromStMessage(msgId); } catch { }
}

export function onMessageSwiped(msgIdAny: any) {
    if (chatInfo.chat == null) {
        return;
    }
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageSwiped: ', chatInfo.chat[msgId]);
    try { void upsertFromStMessage(msgId); } catch { }
}

export function onChatCompletionPromptReady(eventData) {

}

export function onChatChanged() {
    const ctx = getContext();
    const chatId = String(ctx.getCurrentChatId());
    console.log('memu-ext: onChatChanged', chatId);

    chatInfo.chat = ctx.chat;
    chatInfo.chatId = chatId;
    chatInfo.userName = ctx.name1;
    chatInfo.characterId = ctx.characters.find((c) => c.name === ctx.name2)?.map((c) => {
        return `${c.name} - ${c.create_date}`
    });
    chatInfo.characterName = ctx.name2;

    restoreHistory(chatId).then(() => {

    }).catch((err) => {
        console.error('memu-ext: onChatChanged: restoreHistory: ', err);
    });
}
