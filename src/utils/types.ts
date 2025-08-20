export enum MemuTaskStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
}

export interface MemuExtras {
    baseInfo?: MemuBaseInfo;
    summary?: MemuSummary;
    retrieve?: MemuRetrieve;
}

export interface MemuBaseInfo {
    characterId: string;
    characterName: string;
    userName: string;
}

export interface MemuRetrieve {
    nowRetrieve?: MemuRetrieveHistory;
    history: MemuRetrieveHistory[];
}

export interface MemuRetrieveHistory {
    summaryRange?: [number, number];
    summaryTaskId?: string;
    summary?: string;
}

export interface MemuSummary {
    // [from, to)
    summaryRange: [number, number];
    summaryTaskId?: string;
    summaryTaskStatus: MemuTaskStatus;
    // the summary content in retrieve task is ready
    isReady?: boolean;
}

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

export interface STEventData {
    chat: STEventDataMsg[];
    dryRun: boolean;
}

export interface STEventDataMsg {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
