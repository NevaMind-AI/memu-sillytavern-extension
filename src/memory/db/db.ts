export type UpgradeHandler = (db: IDBDatabase, oldVersion: number, newVersion: number | null, transaction: IDBTransaction) => void;

let cachedDb: IDBDatabase | null = null;

const DB_NAME = 'memu_st';
const DB_VERSION = 2;

export const STORE_MESSAGES = 'messages';
export const STORE_MEMORY_RETRIEVE = 'memory_retrieve';

export interface OpenDbOptions {
	upgrade?: UpgradeHandler;
}

function defaultUpgrade(db: IDBDatabase, oldVersion: number) {
	if (oldVersion < 1) {
		const messages = db.createObjectStore(STORE_MESSAGES, { keyPath: 'id' });
		messages.createIndex('chatId', 'chatId', { unique: false });
		messages.createIndex('messageId', 'messageId', { unique: false });
		messages.createIndex('chatId_messageId', ['chatId', 'messageId'], { unique: true });
		messages.createIndex('createdAt', 'createdAt', { unique: false });
		messages.createIndex('updatedAt', 'updatedAt', { unique: false });
	}
	if (oldVersion < 2) {
		const memoryRetrieve = db.createObjectStore(STORE_MEMORY_RETRIEVE, { keyPath: 'id' });
		memoryRetrieve.createIndex('chat_id', 'chat_id', { unique: true });
	}
}

export function openDb(options?: OpenDbOptions): Promise<IDBDatabase> {
	if (cachedDb) return Promise.resolve(cachedDb);

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = (event) => {
			const db = request.result;
			const oldVersion = event.oldVersion;
			if (options?.upgrade) {
				options.upgrade(db, oldVersion, request.result.version, request.transaction as IDBTransaction);
			} else {
				defaultUpgrade(db, oldVersion);
			}
		};
		request.onsuccess = () => {
			cachedDb = request.result;
			cachedDb.onversionchange = () => {
				cachedDb?.close();
				cachedDb = null;
			};
			resolve(request.result);
		};
		request.onerror = () => reject(request.error);
	});
}

export function withStore<T>(storeName: string, mode: IDBTransactionMode, runner: (store: IDBObjectStore) => Promise<T>): Promise<T> {
	return openDb().then((db) => new Promise<T>((resolve, reject) => {
		const tx = db.transaction(storeName, mode);
		const store = tx.objectStore(storeName);
		let resultValue: T | undefined;
		let hasError = false;
		try {
			Promise.resolve(runner(store))
				.then((value) => { resultValue = value; })
				.catch((err) => { hasError = true; try { tx.abort(); } catch { } reject(err); });
		} catch (e) {
			hasError = true;
			try { tx.abort(); } catch { }
			return reject(e);
		}
		tx.oncomplete = () => { if (!hasError) resolve(resultValue as T); };
		tx.onerror = () => { hasError = true; reject(tx.error); };
	}));
}


