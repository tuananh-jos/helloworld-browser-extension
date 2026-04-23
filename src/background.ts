// Background service worker — chạy ngầm, không có DOM
/// <reference types="chrome" />

const NATIVE_HOST = 'com.hellopassword.native';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Hello Password extension installed.');
});

// Relay message từ popup → native host → trả response về popup
chrome.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (r: unknown) => void
  ) => {
    if (message.type === 'NATIVE_PING') {
      chrome.runtime.sendNativeMessage(
        NATIVE_HOST,
        { type: 'PING', timestamp: Date.now() },
        (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        }
      );
      return true; // giữ message channel mở cho async response
    }
  }
);

export {};
