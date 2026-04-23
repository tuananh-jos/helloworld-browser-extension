export interface PongResponse {
  type: 'PONG';
  message: string;
  os: string;
  user: string;
  machine: string;
  time: string;
}

const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime?.id;

export async function pingNativeHost(): Promise<PongResponse> {
  if (!isExtension) throw new Error('Not in extension context');

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'NATIVE_PING' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.error) {
        reject(new Error(response.error));
      } else {
        resolve(response as PongResponse);
      }
    });
  });
}
