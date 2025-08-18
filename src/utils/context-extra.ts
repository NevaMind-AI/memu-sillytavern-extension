import { getMaxContextSize, saveChat } from "@silly-tavern/script.js";
import { getContext } from "@silly-tavern/scripts/st-context.js";
import { event_types, eventSource } from "@silly-tavern/script.js";
import { debounce_timeout } from "@silly-tavern/scripts/constants.js";
import { debounce } from "@silly-tavern/scripts/utils.js";
import { MEMU_LOCAL_STORAGE_API_KEY } from "./consts";
import { MemuBaseInfo, MemuExtras, MemuRetrieve, MemuSummary } from "./types";

const originExtras: MemuExtras = {}

export const st = {
    getContext: () => getContext(),
    getChatMaxContextSize: () => getMaxContextSize(),

    saveChat: async () => await saveChat(),

    debounce: debounce,
    debounce_timeout: debounce_timeout,

    event_types: event_types,
    eventSource: eventSource,
}

export const API_KEY = {
    get: () => localStorage.getItem(MEMU_LOCAL_STORAGE_API_KEY),
    set: (value: string) => localStorage.setItem(MEMU_LOCAL_STORAGE_API_KEY, value),
}

export const memuExtras = new Proxy<MemuExtras>(originExtras, {
    get: (_, prop) => {
        checkAndInitChatMetadata();
        switch (prop) {
            case 'baseInfo':
                return (st.getContext().chatMetadata.memuExtras as MemuExtras).baseInfo;
            case 'retrieve':
                return (st.getContext().chatMetadata.memuExtras as MemuExtras).retrieve;
            case 'summary':
                return (st.getContext().chatMetadata.memuExtras as MemuExtras).summary;
            default:
                throw new Error(`Unknown extra prop: ${String(prop)}`);
        }
    },
    set: (_, prop, value) => {
        checkAndInitChatMetadata();
        switch (prop) {
            case 'baseInfo':
                (st.getContext().chatMetadata.memuExtras as MemuExtras).baseInfo = value as MemuBaseInfo;
                return true;
            case 'retrieve':
                (st.getContext().chatMetadata.memuExtras as MemuExtras).retrieve = value as MemuRetrieve;
                return true;
            case 'summary':
                (st.getContext().chatMetadata.memuExtras as MemuExtras).summary = value as MemuSummary;
                return true;
            default:
                throw new Error(`Unknown extra prop: ${String(prop)}`);
        }
    }
})

function checkAndInitChatMetadata() {
    if (!st.getContext().chatMetadata) {
        (st.getContext() as any).chatMetadata = {};
    }
    if (!(st.getContext().chatMetadata as any).memuExtras) {
        (st.getContext().chatMetadata as any).memuExtras = {} as MemuExtras;
    }
}
