import { st } from "utils/context-extra";
import { initChatExtraInfo } from "./extra-utils";
import { summaryIfNeed } from "./memorize";
import { setIsTerminated, startSummaryPolling, stopSummaryPolling } from "./summary-poller";

export function onMessageReceived(msgIdAny: any) {
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageReceived: ', st.getContext().chat[msgId]);
    try { void summaryIfNeed(); } catch { }
}

export function onMessageEdited(msgIdAny: any) {
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageEdited: ', st.getContext().chat[msgId]);
    try { void summaryIfNeed(); } catch { }
}

export function onMessageSwiped(msgIdAny: any) {
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageSwiped: ', st.getContext().chat[msgId]);
    try { void summaryIfNeed(); } catch { }
}

export function onChatCompletionPromptReady(eventData) {
    console.log('memu-ext: onChatCompletionPromptReady', eventData);
}

export function onChatChanged() {
    const ctx = st.getContext();
    const chatId = String(ctx.getCurrentChatId());
    console.log('memu-ext: onChatChanged', chatId, ctx);

    if (chatId === undefined) {
        stopSummaryPolling();
    } else {
        async function init() {
            try {
                setIsTerminated(false);
                await initChatExtraInfo(ctx);
                await summaryIfNeed();
                startSummaryPolling();
            } catch { }
        }
        void init();
    }
}
