import { OVERRIDE_SUMMARIZER, st } from "utils/context-extra";
import { addSummaryToPrompt, summaryIfNeed } from "./memorize";
import { setIsTerminated, startSummaryPolling, stopSummaryPolling } from "./summary-poller";
import { initChatExtraInfo } from "./utils";

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
    addSummaryToPrompt(eventData, OVERRIDE_SUMMARIZER.get());
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
