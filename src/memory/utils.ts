import { memuExtras, st } from "utils/context-extra";
import { estimateTokenUsage } from "utils/utils";

export async function initChatExtraInfo(ctx: any): Promise<void> {
    if (memuExtras.baseInfo) {
        return;
    }
    const character = ctx.characters[0];
    if (!character) {
        return;
    }
    memuExtras.baseInfo = {
        characterId: `${character.name} - ${character.create_date}`,
        characterName: character.name,
        userName: ctx.name1,
    }

    await st.saveChat();
}


export async function sumTokens(from: number): Promise<number> {
	const chat = st.getContext().chat;
	if (chat == null || chat.length <= from) {
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
