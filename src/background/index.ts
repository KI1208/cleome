/**
 * Background Service Worker for Cleome
 * Handles global shortcuts and inter-component communication
 */

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-command-palette') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    // Check if the URL is valid for content scripts
    if (
      tab.url?.startsWith('chrome://') ||
      tab.url?.startsWith('chrome-extension://') ||
      tab.url?.startsWith('edge://') ||
      tab.url?.startsWith('about:')
    ) {
      // For restricted chrome pages, open dashboard in a new tab instead
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_COMMAND_PALETTE' });
    } catch {
      // Content script might not be injected yet (e.g. tab opened before extension installed)
      // Inject dynamically if permitted
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });
        await chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_COMMAND_PALETTE' });
      } catch (err) {
        console.warn('Could not inject content script into tab:', err);
      }
    }
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'OPEN_BOOKMARK') {
    const { url, isSecret } = message;

    if (isSecret) {
      // Open in Chrome Incognito (Secret) Window
      chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
        if (isAllowed) {
          chrome.windows.create({ url, incognito: true });
          sendResponse({ success: true, mode: 'incognito' });
        } else {
          // If extension not allowed incognito access by user in chrome://extensions, try anyway or fallback
          chrome.windows.create({ url, incognito: true }, (win) => {
            if (chrome.runtime.lastError || !win) {
              console.warn(
                'Incognito access not allowed. Please allow incognito access in chrome://extensions for Cleome:',
                chrome.runtime.lastError
              );
              chrome.tabs.create({ url, active: true });
              sendResponse({ success: true, mode: 'fallback_normal', needsPermission: true });
            } else {
              sendResponse({ success: true, mode: 'incognito' });
            }
          });
        }
      });
    } else {
      chrome.tabs.create({ url, active: true });
      sendResponse({ success: true, mode: 'normal' });
    }
    return true; // Keep channel open for async sendResponse
  } else if (message.action === 'OPEN_URL') {
    chrome.tabs.create({ url: message.url, active: true });
    sendResponse({ success: true });
  } else if (message.action === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html'), active: true });
    sendResponse({ success: true });
  }
  return true;
});
