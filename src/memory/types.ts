export interface ConversationData {
    messages: ConvMessage[];
    userName: string;
    userId: string;
    characterName: string;
    characterId: string;
}

export interface ConvMessage {
    role: 'user' | 'assistant' | 'participant';
    content: string;
    name?: string;
}
