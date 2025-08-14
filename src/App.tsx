import { useEffect, useState, ChangeEvent } from "react";
import { FailIcon, LoadingIcon, SaveIcon, SuccessIcon } from "ui/status";
import { delay } from "utils/utils";
import { eventSource, event_types } from "@silly-tavern/script.js";

function App() {
    const [apiKey, setApiKey] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    useEffect(() => {
        // console.log('memu-ext-settings', SillyTavern.getContext());
        try {
            const saved = localStorage.getItem('memu-api-key');
            if (saved !== null) setApiKey(saved);
        } catch { }
    }, []);

    useEffect(() => {
        eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, async function onChatCompletionPromptReady(eventData) {
            console.log('memu-ext-settings: onChatCompletionPromptReady', eventData);
        })
    }, []);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setApiKey(e.target.value);
        setStatus('idle');
    }

    async function handleSave() {
        setStatus('saving');
        await delay(1500);
        try {
            localStorage.setItem('memu-api-key', apiKey);
            setStatus('saved');
            await delay(1500);
            setStatus('idle');
        } catch {
            setStatus('error');
            await delay(2000);
            setStatus('idle');
        }
    }

    return (
        <div className="memu-ext-settings">
            <div className="inline-drawer">
                <div className="inline-drawer-toggle inline-drawer-header">
                    <b>MemU Settings</b>
                    <div className="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div className="inline-drawer-content" >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 36 }}>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={handleChange}
                            placeholder="memu-api-key"
                            style={{
                                flex: 1,
                                height: '100%',
                                padding: '0 4px',
                                border: '1px solid #d0d7de',
                                borderRadius: 8,
                                fontSize: 14,
                                outline: 'none',
                                color: 'black'
                            }}
                        />
                        <button
                            onClick={handleSave}
                            className="menu_button"
                            style={{
                                height: '100%',
                                borderRadius: 8,
                                width: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                color: 'rgba(0, 0, 0, 0.1)'
                            }}
                            disabled={status === 'saving'}
                            aria-busy={status === 'saving'}
                            title={status === 'saving' ? 'Saving' : status === 'saved' ? 'Saved' : 'Save'}
                        >
                            {status === 'saving' ? <LoadingIcon width={20} height={20} /> : status === 'saved' ? <SuccessIcon width={20} height={20} /> : <SaveIcon width={20} height={20} />}
                        </button>
                        {status === 'error' && (
                            <FailIcon width={20} height={20} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;


