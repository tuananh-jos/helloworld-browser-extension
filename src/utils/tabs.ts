const isExtension = typeof chrome !== 'undefined' && chrome.tabs !== undefined;

export async function getCurrentTabUrl(): Promise<string> {
  if (!isExtension) return window.location.href;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? '';
}

export async function fillCredentials(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!isExtension) return { success: false, error: 'Not in extension context' };

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return { success: false, error: 'No active tab' };

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_CREDENTIALS',
      username,
      password,
    });
    return response ?? { success: false };
  } catch {
    return { success: false, error: 'Cannot reach page — try refreshing it' };
  }
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function matchesSite(entrySite: string, tabHostname: string): boolean {
  if (!entrySite || !tabHostname) return false;
  const site = entrySite.toLowerCase().replace(/^www\./, '');
  const host = tabHostname.toLowerCase();
  return host.includes(site) || site.includes(host);
}
