import { event_types, eventSource, getMaxContextSize, saveChat } from "@silly-tavern/script.js";
import { debounce_timeout } from "@silly-tavern/scripts/constants.js";
import { Message, MessageCollection, promptManager } from "@silly-tavern/scripts/openai.js";
import { getContext } from "@silly-tavern/scripts/st-context.js";
import { ToolManager } from '@silly-tavern/scripts/tool-calling.js';
import { debounce } from "@silly-tavern/scripts/utils.js";
import { appendFileContent } from '@silly-tavern/scripts/chats.js';
import { getRegexedString, regex_placement } from '@silly-tavern/scripts/extensions/regex/engine.js';
import { MEMU_LOCAL_STORAGE_API_KEY, MEMU_LOCAL_STORAGE_OVERRIDE_SUMMARIZER } from "./consts";
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

    promptManager: promptManager,
    toolManager: ToolManager,

    getRegexedString: getRegexedString,
    regex_placement: regex_placement,
    appendFileContent: appendFileContent,
}

export {
    Message,
    MessageCollection
};

export const API_KEY = {
    get: () => localStorage.getItem(MEMU_LOCAL_STORAGE_API_KEY),
    set: (value: string) => localStorage.setItem(MEMU_LOCAL_STORAGE_API_KEY, value),
}

export const OVERRIDE_SUMMARIZER = {
    get: () => localStorage.getItem(MEMU_LOCAL_STORAGE_OVERRIDE_SUMMARIZER) !== 'false',
    set: (value: boolean) => localStorage.setItem(MEMU_LOCAL_STORAGE_OVERRIDE_SUMMARIZER, value.toString()),
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
