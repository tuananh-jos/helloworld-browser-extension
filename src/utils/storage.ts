import { PasswordEntry } from '../types';

const STORAGE_KEY = 'passwords';

// Fallback sang localStorage khi chạy npm start (không phải extension context)
const isExtension =
  typeof chrome !== 'undefined' && chrome.storage !== undefined;

export async function loadPasswords(): Promise<PasswordEntry[]> {
  if (isExtension) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as PasswordEntry[]) ?? [];
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function savePasswords(entries: PasswordEntry[]): Promise<void> {
  if (isExtension) {
    await chrome.storage.local.set({ [STORAGE_KEY]: entries });
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}
