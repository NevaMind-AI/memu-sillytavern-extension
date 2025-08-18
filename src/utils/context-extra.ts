import { getContext } from "@silly-tavern/scripts/st-context.js";
import { getMaxContextSize, saveChat } from "@silly-tavern/script.js";
// import { oai_settings } from "@silly-tavern/scripts/openai.js";
import { MemuBaseInfo, MemuExtras, MemuRetrieve, MemuSummary } from "./types";

const originExtras: MemuExtras = {}

export const st = {
    getContext: () => getContext(),
    getChatMaxContextSize: getMaxContextSize,

    saveChat: async () => await saveChat()
}

export const memuExtras = new Proxy<MemuExtras>(originExtras, {
    get: (_, prop) => {
        checkAndInitChatMetadata();
        switch (prop) {
            case 'baseInfo':
                return (st.getContext().chatMetadata.memuExtras as MemuExtras).baseInfo;
            case 'retrieve':
                return (st.getContext().chatMetadata.memuExtras as MemuExtras).retrieve ?? {};
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
