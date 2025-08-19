import { MEMU_DEFAULT_TIMEOUT } from 'utils/consts';
import { API_KEY, memuExtras, st } from 'utils/context-extra';
import { getTaskStatus } from 'utils/network';
import { MemuTaskStatus } from 'utils/types';
import { doSummary, retrieveMemories } from './memorize';

const DEFAULT_INTERVAL_MS = MEMU_DEFAULT_TIMEOUT;

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
    if (pollerTimer) {
        clearInterval(pollerTimer);
        pollerTimer = undefined;
    }
    isTerminated = true;
}

async function tick(): Promise<void> {
    try {
        const apiKey = API_KEY.get();
        if (!apiKey) {
            console.debug('memu-ext: summary-poller tick: apiKey is null, should set key first');
            return;
        }

        const summary = memuExtras.summary;
        if (!summary) {
            console.debug('memu-ext: summary-poller tick: summary is null');
            return;
        }

        console.log('memu-ext: summary-poller tick: summary', summary);
        switch (summary.summaryTaskStatus) {
            case MemuTaskStatus.PENDING:
            case MemuTaskStatus.PROCESSING: {
                // async query latest status (do not wait)
                void fireAndUpdateTaskStatus(apiKey, summary.summaryRange, summary.summaryTaskId);
                console.log(`memu-ext: summary-poller tick: summary is ${summary.summaryTaskStatus}, fire and update task status`, summary.summaryRange, summary.summaryTaskId);
                break;
            }
            case MemuTaskStatus.SUCCESS: {
                // clear summary info
                try {
                    if (memuExtras.retrieve?.nowRetrieve?.summaryTaskId === summary.summaryTaskId) {
                        console.log('memu-ext: summary-poller tick: retrieve data is already retrieved, do nothing');
                        break;
                    }
                    await retrieveMemories(summary);
                    console.log('memu-ext: summary-poller tick: summary is success, retrieve memories');
                } catch (error) {
                    console.error('memu-ext: summary-poller tick: summary is success, but retrieve memories failed', error);
                }
                break;
            }
            case MemuTaskStatus.FAILURE: {
                // retry, do not wait
                if (summary.summaryRange && summary.summaryRange.length === 2) {
                    const [from, to] = summary.summaryRange;
                    console.log('memu-ext: summary-poller tick: summary is failure, retry summary', from, to);
                    void doSummary(from, to);
                } else {
                    console.log('memu-ext: summary-poller tick: summary is failure, but range is not valid, do nothing');
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

    getTaskStatus(apiKey, DEFAULT_INTERVAL_MS / 2, taskId)
        .then(async (resp) => {
            console.log('memu-ext: fireAndUpdateTaskStatus: resp', resp);
            const raw = String(resp?.status ?? '').toUpperCase();
            let mapped: MemuTaskStatus;
            switch (raw) {
                case 'SUCCESS':
                    mapped = MemuTaskStatus.SUCCESS;
                    break;
                case 'PENDING':
                    mapped = MemuTaskStatus.PENDING;
                    break;
                case 'PROCESSING':
                    mapped = MemuTaskStatus.PROCESSING;
                    break;
                default:
                    mapped = MemuTaskStatus.FAILURE;
            }
            // update summary value, do not do other logic
            memuExtras.summary = {
                summaryRange: range,
                summaryTaskId: taskId,
                summaryTaskStatus: mapped,
            };
            await st.saveChat();
        })
        .catch((err) => {
            console.error('memu-ext: getTaskStatus failed', err);
        });
}


