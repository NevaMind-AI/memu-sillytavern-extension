import { CSSProperties } from "react";

export interface MemoryShowModalProps {
    open: boolean;
    text: string;
    onClose: () => void;
}

const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    zIndex: 9999,
};

const containerStyle: CSSProperties = {
    background: 'var(--SmartThemeBlurTintColor)',
    color: 'var(--SmartThemeEmColor)',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    maxWidth: 720,
    width: '90%',
    maxHeight: '80%',
    display: 'flex',
    flexDirection: 'column',
};

const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(0,0,0,0.1)'
};

const bodyStyle: CSSProperties = {
    padding: 12,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
};

const closeBtnStyle: CSSProperties = {
    border: 'none',
    background: 'transparent',
    color: 'var(--SmartThemeEmColor)',
    fontSize: 18,
    cursor: 'pointer',
};

export function MemoryShowModal(props: MemoryShowModalProps) {
    if (!props.open) return null;

    function onOverlayClick() {
        props.onClose?.();
    }

    function onContainerClick(e: React.MouseEvent) {
        e.stopPropagation();
    }

    return (
        <div style={overlayStyle} onClick={onOverlayClick}>
            <div style={containerStyle} onClick={onContainerClick} role="dialog" aria-modal="true" aria-label="Memory">
                <div style={headerStyle}>
                    <b>Memory</b>
                    <button style={closeBtnStyle} onClick={props.onClose} aria-label="Close">×</button>
                </div>
                <div style={bodyStyle}>
                    {props.text || 'No content'}
                </div>
            </div>
        </div>
    );
}

export default MemoryShowModal;


