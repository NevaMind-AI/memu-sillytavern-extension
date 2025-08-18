import { estimateTokenUsage } from "utils/utils";
import { chatInfo } from "./exports";
import { st } from "utils/context-extra";

export async function sumTokens(from: number): Promise<number> {
	const chat = chatInfo.chat;
	if (chat == null) {
		return 0;
	}
	let sum = 0;
	for (let i = from; i < chat.length; i++) {
		const message = chat[i];
		const text = message.mes;
		if (text == null || typeof text !== 'string') {
			continue;
		}
		const usage = await computeTokenUsage(text);
		sum += usage;
	}
	return sum;
}

async function computeTokenUsage(text: string): Promise<number> {
    const ctx = st.getContext();
    if (typeof ctx.getTokenCountAsync === "function") {
        const n = await ctx.getTokenCountAsync(text as unknown as string);
        if (typeof n === "number" && !Number.isNaN(n)) return n;
    }
    if (typeof ctx.getTokenCount === "function") {
        const n = ctx.getTokenCount(text as unknown as string);
        if (typeof n === "number" && !Number.isNaN(n)) return n;
    }
    return estimateTokenUsage(text);
}
