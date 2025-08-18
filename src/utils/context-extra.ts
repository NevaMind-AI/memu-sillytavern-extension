import { getContext } from "@silly-tavern/scripts/st-context.js";
import { MemuExtras, MemuRetrieve, MemuSummary } from "./types";
import { max_context } from "@silly-tavern/script.js";

const originExtras: MemuExtras = {}

export const st = {
    getContext: () => getContext(),
    getChatMaxContextLength: () => max_context,
}

export const memuExtras = new Proxy<MemuExtras>(originExtras, {
    get: (_, prop) => {
        switch (prop) {
            case 'retrieve':
                checkAndInitChatMetadata();
                return (st.getContext().chatMetadata.memuExtras as MemuExtras).retrieve;
            case 'summary':
                checkAndInitChatMetadata();
                return (st.getContext().chatMetadata.memuExtras as MemuExtras).summary;
            default:
                throw new Error(`Unknown extra prop: ${String(prop)}`);
        }
    },
    set: (_, prop, value) => {
        switch (prop) {
            case 'retrieve':
                checkAndInitChatMetadata();
                (st.getContext().chatMetadata.memuExtras as MemuExtras).retrieve = value as MemuRetrieve;
                return true;
            case 'summary':
                checkAndInitChatMetadata();
                (st.getContext().chatMetadata.memuExtras as MemuExtras).summary = value as MemuSummary;
                return true;
            default:
                throw new Error(`Unknown extra prop: ${String(prop)}`);
        }
    }
})

function checkAndInitChatMetadata() {
    if (!st.getContext().chatMetadata) {
        // SillyTavern 上下文里字段是 chat_metadata，对应 getContext().chatMetadata 暴露
        (st.getContext() as any).chatMetadata = {};
    }
    if (!(st.getContext().chatMetadata as any).memuExtras) {
        (st.getContext().chatMetadata as any).memuExtras = {} as MemuExtras;
    }
}
