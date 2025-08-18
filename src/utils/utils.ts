export const delay = (ms: number): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export function estimateTokenUsage(text: string): number {
	const length = (text ?? "").length;
	return Math.max(1, Math.ceil(length / 4));
}

export function requestToPromise<T = unknown>(request: IDBRequest): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result as T);
		request.onerror = () => reject(request.error);
	});
}

