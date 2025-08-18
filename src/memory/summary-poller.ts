import { MemuClient } from 'memu-js';
import { memuExtras, st } from 'utils/context-extra';
import { LOCAL_STORAGE_API_KEY } from 'utils/consts';
import { doSummary } from './utils';

const DEFAULT_INTERVAL_MS = 10_000;

let pollerTimer: ReturnType<typeof setInterval> | undefined;
let isTerminated = false;

export function setIsTerminated(value: boolean): void {
    isTerminated = value;
}

export function startSummaryPolling(intervalMs: number = DEFAULT_INTERVAL_MS): void {
    if (pollerTimer || isTerminated) {
        return;
    }
    pollerTimer = setInterval(tick, intervalMs);
}

export function stopSummaryPolling(): void {
    if (!pollerTimer) {
        clearInterval(pollerTimer);
        pollerTimer = undefined;
    }
    isTerminated = true;
}

async function tick(): Promise<void> {
    try {
        const apiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY);
        if (!apiKey) {
            console.debug('memu-ext: summary-poller tick: apiKey is null, should set key first');
            return;
        }

        const summary = memuExtras.summary;
        if (!summary) {
            console.debug('memu-ext: summary-poller tick: summary is null');
            return;
        }

        switch (summary.summaryTaskStatus) {
            case 'PENDING': {
                // async query latest status (do not wait)
                void fireAndUpdateTaskStatus(apiKey, summary.summaryRange, summary.summaryTaskId);
                break;
            }
            case 'SUCCESS': {
                // clear summary info
                memuExtras.summary = undefined;
                await st.saveChat();
                break;
            }
            case 'FAILURE': {
                // retry, do not wait
                if (summary.summaryRange && summary.summaryRange.length === 2) {
                    const [from, to] = summary.summaryRange;
                    void doSummary(from, to);
                }
                break;
            }
            default: {
                break;
            }
        }
    } catch (error) {
        console.error('memu-ext: summary-poller tick error', error);
    }
}

function fireAndUpdateTaskStatus(apiKey: string, range: [number, number], taskId?: string | null): void {
    if (!taskId) {
        console.error('memu-ext: fireAndUpdateTaskStatus: taskId is null');
        return;
    }

    const client = new MemuClient({
        baseUrl: 'https://api.memu.so',
        apiKey,
        timeout: DEFAULT_INTERVAL_MS / 2,
        maxRetries: 3,
    });

    client.getTaskStatus(taskId as string)
        .then(async (resp: any) => {
            const raw = String(resp?.status ?? '').toUpperCase();
            const mapped = raw === 'SUCCESS' ? 'SUCCESS' : raw === 'PENDING' ? 'PENDING' : 'FAILURE';
            // update summary value, do not do other logic
            memuExtras.summary = {
                summaryRange: range,
                summaryTaskId: taskId,
                summaryTaskStatus: mapped,
            };
            await st.saveChat();
        })
        .catch((err: any) => {
            console.error('memu-ext: getTaskStatus failed', err);
        });
}


