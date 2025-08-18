import { st } from "utils/context-extra";
import { initChatExtraInfo } from "./utils";
import { summaryIfNeed } from "./memorize";
import { setIsTerminated, startSummaryPolling, stopSummaryPolling } from "./summary-poller";

const summaryIfNeedDebounced = st.debounce(() => {
    try {
        void summaryIfNeed();
    } catch { }
}, st.debounce_timeout.extended);

export function onMessageReceived(msgIdAny: any): void {
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageReceived: ', st.getContext().chat[msgId]);
    summaryIfNeedDebounced();
}

export function onMessageEdited(msgIdAny: any): void {
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageEdited: ', st.getContext().chat[msgId]);
    summaryIfNeedDebounced();
}

export function onMessageSwiped(msgIdAny: any): void {
    const msgId = parseInt(msgIdAny);
    console.log('memu-ext: onMessageSwiped: ', st.getContext().chat[msgId]);
    summaryIfNeedDebounced();
}

export function onChatCompletionPromptReady(eventData: any): void {
    console.log('memu-ext: onChatCompletionPromptReady', eventData);
}

export function onChatChanged(): void {
    const ctx = st.getContext();
    console.log('memu-ext: onChatChanged, chatId:', ctx.getCurrentChatId(), ctx);

    if (ctx.getCurrentChatId() === undefined) {
        stopSummaryPolling();
        console.log('memu-ext: onChatChanged: chatId is undefined, stop summary polling');
    } else {
        async function init() {
            try {
                setIsTerminated(false);
                await initChatExtraInfo(ctx);
                summaryIfNeedDebounced();
                startSummaryPolling();
                console.log('memu-ext: onChatChanged: chatId is defined, start summary polling');
            } catch { }
        }
        void init();
    }
}
