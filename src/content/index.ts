import React from 'react';
import ReactDOM from 'react-dom/client';
import { CommandPalette } from './CommandPalette';
// @ts-ignore
import paletteCss from './palette.css?inline';

let hostElement: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let reactRoot: ReactDOM.Root | null = null;
let isOpen = false;

function openPalette() {
  if (isOpen) return;

  if (!hostElement) {
    hostElement = document.createElement('div');
    hostElement.id = 'cleome-command-palette-host';
    document.body.appendChild(hostElement);

    shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // Inject styles directly into shadow root for total isolation
    const styleEl = document.createElement('style');
    styleEl.textContent = paletteCss;
    shadowRoot.appendChild(styleEl);

    // Container for React
    const reactContainer = document.createElement('div');
    reactContainer.id = 'cleome-react-root';
    shadowRoot.appendChild(reactContainer);

    reactRoot = ReactDOM.createRoot(reactContainer);
  }

  isOpen = true;
  hostElement.style.display = 'block';

  reactRoot?.render(
    React.createElement(CommandPalette, {
      onClose: closePalette,
    })
  );
}

function closePalette() {
  if (!isOpen || !hostElement) return;
  isOpen = false;
  hostElement.style.display = 'none';
  reactRoot?.render(null);
}

function togglePalette() {
  if (isOpen) {
    closePalette();
  } else {
    openPalette();
  }
}

// Listen for messages from background script
if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'TOGGLE_COMMAND_PALETTE') {
      togglePalette();
      sendResponse({ success: true });
    }
    return true;
  });
}

// In-page keyboard shortcut listener (Ctrl+Shift+K / Cmd+Shift+K)
window.addEventListener(
  'keydown',
  (e) => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
      e.preventDefault();
      e.stopPropagation();
      togglePalette();
    }
  },
  true // Capture phase to intercept before host page handlers
);
