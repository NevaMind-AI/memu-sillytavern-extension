import { memuExtras, st } from "utils/context-extra";
import { doSummary, sumTokens } from "./utils";


export async function summaryIfNeed() {
    const from = memuExtras.summary?.summaryRange?.[1] ?? 0;
    const total = await sumTokens(from);
	const chat = st.getContext().chat;

    console.log('memu-ext: now token accumulated: %d, max context: %d', total, st.getChatMaxContextSize());
    if (total < st.getChatMaxContextSize()) {
        return;
    }

    await doSummary(from, chat.length);
}
