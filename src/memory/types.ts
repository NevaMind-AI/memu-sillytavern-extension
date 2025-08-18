export interface ConversationData {
    messages: ConversationMessage[];
    userName: string;
    userId: string;
    characterName: string;
    characterId: string;
}

export interface ConversationMessage {
    role: 'user' | 'assistant' | 'participant';
    content: string;
    name?: string;
}
