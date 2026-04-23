// Background service worker — chạy ngầm, không có DOM

chrome.runtime.onInstalled.addListener(() => {
  console.log('Hello Password extension installed.');
});

export {};
