import { memuExtras, st } from "utils/context-extra";

export async function initChatExtraInfo(ctx: any) {
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
