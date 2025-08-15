import { max_context } from "@silly-tavern/script.js";
import { LOCAL_STORAGE_API_KEY } from "utils/consts";
import { sumTokensByChatId } from "./utils";
import { MemuClient, MemorizeResponse } from 'memu-js';
import { chatInfo } from "./exports";


export async function summaryIfNeed(chat_id: string) {
    const total = sumTokensByChatId(chat_id);
    console.log('memu-ext: now token accumulated: %d, max context: %d', total, max_context);
    if (total < max_context) {
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

    const response = await client.memorize({
        chatId: chat_id,
        userName: chatInfo.userName,
        characterName: chatInfo.characterName,
    });
}
