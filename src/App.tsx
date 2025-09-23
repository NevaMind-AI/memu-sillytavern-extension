import { onChatChanged, onChatCompletionPromptReady, onMessageEdited, onMessageReceived, onMessageSwiped } from "memory/exports";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import MemoryShowModal from "component/MemoryShowModal";
import EyeIcon from "ui/icons";
import MemuLogo from "ui/logo";
import { FailIcon, LoadingIcon, SuccessIcon } from "ui/status";
import { API_KEY, memuExtras, OVERRIDE_SUMMARIZER, st } from "utils/context-extra";
import { delay } from "utils/utils";

const buttonStyle: CSSProperties = {
    height: '100%',
    borderRadius: 8,
    width: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
}

function App() {
    const [apiKey, setApiKey] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [overrideSummarizer, setOverrideSummarizer] = useState<boolean>(false);
    const [showMemoryModal, setShowMemoryModal] = useState<boolean>(false);
    const [memoryText, setMemoryText] = useState<string>('');

    useEffect(() => {
        st.eventSource.on(st.event_types.CHAT_COMPLETION_PROMPT_READY, onChatCompletionPromptReady);
        st.eventSource.on(st.event_types.CHAT_CHANGED, onChatChanged);
        st.eventSource.on(st.event_types.CHARACTER_MESSAGE_RENDERED, onMessageReceived);
        st.eventSource.on(st.event_types.MESSAGE_EDITED, onMessageEdited);
        st.eventSource.on(st.event_types.MESSAGE_SWIPED, onMessageSwiped);

        st.eventSource.on(st.event_types.CHAT_CHANGED, () => {
            setMemoryText(memuExtras.retrieve?.nowRetrieve?.summary ?? '');
        });
    }, []);

    useEffect(() => {
        try {
            const saved = API_KEY.get();
            if (saved !== null) setApiKey(saved);
        } catch { }
    }, []);

    useEffect(() => {
        const saved = OVERRIDE_SUMMARIZER.get();
        if (saved !== null) setOverrideSummarizer(saved);
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

    function handleOverrideSummarizerChange(e: ChangeEvent<HTMLInputElement>) {
        setOverrideSummarizer(e.target.checked);
        OVERRIDE_SUMMARIZER.set(e.target.checked);
    }

    return (
        <>
            <div className="memu-ext-settings">
                <div className="inline-drawer">
                    <div className="inline-drawer-toggle inline-drawer-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MemuLogo width={58} height={20} />
                            <button
                                className="menu_button"
                                style={{ ...buttonStyle, width: 30 }}
                                disabled={memoryText === ''}
                                onClick={(e) => { e.stopPropagation(); setShowMemoryModal(true); }}
                            >
                                <EyeIcon width={16} height={16} />
                            </button>
                        </div>
                        <div className="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                    </div>
                    <div className="inline-drawer-content" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 4px' }}>
                            <h4>API Key</h4>
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
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h4>Memory</h4>
                            <label className="checkbox_label expander" htmlFor="override_summarizer" title="Override Summarizer">
                                <input id="override_summarizer" type="checkbox" className="checkbox" checked={overrideSummarizer} onChange={handleOverrideSummarizerChange} />
                                <span>Override Summarizer</span>
                                <i className="fa-solid fa-info-circle" title="Override the summarizer with MemU's summarizer. Extremely recommend to be checked."></i>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <MemoryShowModal open={showMemoryModal} text={memoryText} onClose={() => setShowMemoryModal(false)} />
        </>
    );
}

export default App;


