import { onChatChanged, onChatCompletionPromptReady, onMessageEdited, onMessageReceived, onMessageSwiped } from "memory/exports";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import { FailIcon, LoadingIcon, SuccessIcon } from "ui/status";
import { API_KEY, st } from "utils/context-extra";
import { delay } from "utils/utils";

const buttonStyle: CSSProperties = {
    height: '100%',
    borderRadius: 8,
    width: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    color: 'rgba(0, 0, 0, 0.1)'
}

function App() {
    const [apiKey, setApiKey] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    useEffect(() => {
        st.eventSource.on(st.event_types.CHAT_COMPLETION_PROMPT_READY, onChatCompletionPromptReady);
        st.eventSource.on(st.event_types.CHAT_CHANGED, onChatChanged);
        st.eventSource.on(st.event_types.CHARACTER_MESSAGE_RENDERED, onMessageReceived);
        st.eventSource.on(st.event_types.MESSAGE_EDITED, onMessageEdited);
        st.eventSource.on(st.event_types.MESSAGE_SWIPED, onMessageSwiped);
    }, []);

    useEffect(() => {
        try {
            const saved = API_KEY.get();
            if (saved !== null) setApiKey(saved);
        } catch { }
    }, []);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setApiKey(e.target.value);
        setStatus('idle');
    }

    // todo: check available
    async function handleSave() {
        setStatus('saving');
        await delay(1500);
        try {
            API_KEY.set(apiKey);
            setStatus('saved');
            await delay(1500);
            setStatus('idle');
        } catch {
            setStatus('error');
            await delay(1500);
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
                <div className="inline-drawer-content" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 4px' }}>
                        <span>API Key</span>
                        <small>
                            <span>get your API key from <a href="https://app.memu.so/api-key" target="_blank" rel="noopener noreferrer">here</a></span>
                        </small>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={handleChange}
                            className="text_pole"
                            placeholder="memu-api-key"
                        />
                        <button
                            onClick={handleSave}
                            className="menu_button"
                            style={buttonStyle}
                            disabled={status === 'saving'}
                            aria-busy={status === 'saving'}
                            title={status === 'saving' ? 'Saving' : status === 'saved' ? 'Saved' : 'Save'}
                        >
                            {status === 'saving' ? <LoadingIcon width={20} height={20} /> :
                                status === 'saved' ? <SuccessIcon width={20} height={20} /> :
                                    <i className="fa-fw fa-solid fa-save" style={{ fontSize: 20 }} />}
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


