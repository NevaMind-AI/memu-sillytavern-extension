import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootContainer = document.getElementById('extensions_settings2');
if (!rootContainer) {
    throw new Error('Cannot find container element with id "extensions_settings"');
}

const rootElement = document.createElement('div');
rootContainer.appendChild(rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);


