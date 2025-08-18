export interface MemuExtras {
    summary?: MemuSummary;
    retrieve?: MemuRetrieve;
}

export interface MemuRetrieve {
    content?: string;
    history?: MemuRetrieveHistory[];
}

export interface MemuRetrieveHistory {
    lastSummaryId?: number;
    summary?: string;
    content?: string;
}

export interface MemuSummary {
    lastSummaryId?: number;
    summaryTaskStatus?: 'running' | 'completed' | 'failed';
    summaryTaskId?: string;
}
