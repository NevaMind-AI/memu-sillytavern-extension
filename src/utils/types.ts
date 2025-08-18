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
    summaryRange: [number, number];
    summaryTaskId?: string;
    summaryTaskStatus: 'PENDING' | 'SUCCESS' | 'FAILURE';
}
