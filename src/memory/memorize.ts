import { MemuClient } from 'memu-js';
import { LOCAL_STORAGE_API_KEY } from "utils/consts";
import { memuExtras, st } from "utils/context-extra";
import { sumTokens } from "./utils";


export async function summaryIfNeed() {
    const from = memuExtras.summary?.lastSummaryId ?? 0;
    const total = await sumTokens(from);
    console.log('memu-ext: now token accumulated: %d, max context: %d', total, st.getChatMaxContextLength());
    if (total < st.getChatMaxContextLength()) {
        return;
    }
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

    // const response = await client.memorize({
    //     chatId: chat_id,
    //     userName: chatInfo.userName,
    //     characterName: chatInfo.characterName,
    // });
}
