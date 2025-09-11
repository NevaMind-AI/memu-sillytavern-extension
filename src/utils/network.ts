import { DefaultCategoriesResponse, MemorizeResponse, MemorizeTaskStatusResponse, MemorizeTaskSummaryReadyResponse } from "memu-js";
import { ConversationData } from "utils/types";

const ROUTER_BASE_URL = '/api/plugins/memu'

export async function getTaskStatus(
    apiKey: string,
    timeout: number,
    taskId: string,
): Promise<MemorizeTaskStatusResponse> {
    return request<MemorizeTaskStatusResponse>(
        '/getTaskStatus',
        {
            apiKey: apiKey,
            timeout: timeout,
            taskId: taskId,
        },
    );
}

export async function getTaskSummaryReady(
    apiKey: string,
    timeout: number,
    taskId: string,
): Promise<MemorizeTaskSummaryReadyResponse> {
    return request<MemorizeTaskSummaryReadyResponse>(
        '/getTaskSummaryReady',
        {
            apiKey: apiKey,
            timeout: timeout,
            taskId: taskId,
        },
    );
}

export async function retrieveDefaultCategories(
    apiKey: string,
    userId: string,
    agentId: string,
): Promise<DefaultCategoriesResponse> {
    return request<DefaultCategoriesResponse>(
        '/retrieveDefaultCategories',
        {
            apiKey: apiKey,
            userId: userId,
            agentId: agentId,
        },
    );
}

export async function memorizeConversation(
    apiKey: string,
    conversationData: ConversationData,
): Promise<MemorizeResponse> {
    return request<MemorizeResponse>(
        '/memorizeConversation',
        {
            apiKey: apiKey,
            conversation: conversationData.messages,
            userId: conversationData.userId,
            userName: conversationData.userName,
            agentId: conversationData.characterId,
            agentName: conversationData.characterName,
        },
    );
}


async function request<T extends any>(
    url: string,
    body: any,
    method: string = 'POST',
    headers: Record<string, string> = {
        'Content-Type': 'application/json',
    },
): Promise<T> {
    const tokenResp = await fetch('/csrf-token')
    const csrfToken = (await tokenResp.json()).token

    const resp = await fetch(`${ROUTER_BASE_URL}${url}`, {
        method,
        headers: {
            ...headers,
            'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(body),
    });
    if (resp.status !== 200) {
        throw new Error(`Failed to request: ${resp.status}, ${resp.body}`);
    }
    return resp.json() as Promise<T>;
}
