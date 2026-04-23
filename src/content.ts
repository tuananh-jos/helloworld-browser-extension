// Content script — inject vào mọi trang web
/// <reference types="chrome" />

// ─── Types ───────────────────────────────────────────────────────────────────

interface PasswordEntry {
  id: string;
  site: string;
  username: string;
  password: string;
}

// ─── Inject CSS ──────────────────────────────────────────────────────────────

const style = document.createElement('style');
style.textContent = `
  .hp-dropdown {
    position: fixed;
    background: #16213e;
    border: 1px solid #e94560;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    z-index: 2147483647;
    min-width: 220px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
  }
  .hp-dropdown-header {
    padding: 5px 12px;
    font-size: 11px;
    color: #a0a0b0;
    background: #0f3460;
    letter-spacing: 0.5px;
  }
  .hp-dropdown-item {
    padding: 9px 12px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #e0e0e0;
    border-bottom: 1px solid #0f3460;
  }
  .hp-dropdown-item:last-child { border-bottom: none; }
  .hp-dropdown-item:hover { background: #1a4a80; }
  .hp-dropdown-item-user { font-weight: 500; }
  .hp-dropdown-item-site { font-size: 11px; color: #a0a0b0; }

  .hp-save {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #16213e;
    border: 1px solid #e94560;
    border-radius: 10px;
    padding: 14px 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
    z-index: 2147483647;
    width: 270px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: hp-in 0.2s ease;
  }
  @keyframes hp-in {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .hp-save-title {
    font-size: 13px;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 4px;
  }
  .hp-save-detail {
    font-size: 12px;
    color: #a0a0b0;
    margin-bottom: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hp-save-actions { display: flex; gap: 8px; }
  .hp-btn-primary {
    flex: 1; padding: 7px; background: #e94560; color: white;
    border: none; border-radius: 6px; font-size: 12px;
    font-weight: 600; cursor: pointer;
  }
  .hp-btn-primary:hover { background: #c73652; }
  .hp-btn-secondary {
    flex: 1; padding: 7px; background: #0f3460; color: #a0a0b0;
    border: none; border-radius: 6px; font-size: 12px; cursor: pointer;
  }
  .hp-btn-secondary:hover { background: #1a4a80; }
`;
(document.head ?? document.documentElement).appendChild(style);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchesSite(entrySite: string, hostname: string): boolean {
  const s = entrySite.toLowerCase().replace(/^www\./, '');
  const h = hostname.toLowerCase().replace(/^www\./, '');
  return h.includes(s) || s.includes(h);
}

function getHostname() {
  return window.location.hostname.replace(/^www\./, '');
}

function setInputValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function isUsernameField(el: HTMLElement): boolean {
  if (el.tagName !== 'INPUT') return false;
  const input = el as HTMLInputElement;
  if (!['email', 'text'].includes(input.type)) return false;
  const form = input.closest('form');
  if (form) return !!form.querySelector('input[type="password"]');
  return !!document.querySelector('input[type="password"]');
}

async function loadPasswords(): Promise<PasswordEntry[]> {
  const result = await chrome.storage.local.get('passwords');
  return (result['passwords'] as PasswordEntry[]) ?? [];
}

// ─── Dropdown khi click vào username field ───────────────────────────────────

let activeDropdown: HTMLElement | null = null;

function removeDropdown() {
  activeDropdown?.remove();
  activeDropdown = null;
}

document.addEventListener('focusin', async (e) => {
  const target = e.target as HTMLElement;
  if (!isUsernameField(target)) { removeDropdown(); return; }

  const passwords = await loadPasswords();
  if (passwords.length === 0) return;

  const hostname = getHostname();
  const matched = passwords.filter((p) => matchesSite(p.site, hostname));
  const toShow = matched.length > 0 ? matched : passwords;

  showDropdown(target as HTMLInputElement, toShow);
});

document.addEventListener('click', (e) => {
  if (activeDropdown && !activeDropdown.contains(e.target as Node)) {
    removeDropdown();
  }
});

function showDropdown(input: HTMLInputElement, entries: PasswordEntry[]) {
  removeDropdown();

  const rect = input.getBoundingClientRect();
  const dd = document.createElement('div');
  dd.className = 'hp-dropdown';
  dd.style.top = `${rect.bottom + 4}px`;
  dd.style.left = `${rect.left}px`;
  dd.style.minWidth = `${Math.max(rect.width, 220)}px`;

  const header = document.createElement('div');
  header.className = 'hp-dropdown-header';
  header.textContent = '🔐 Hello Password';
  dd.appendChild(header);

  entries.forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'hp-dropdown-item';
    item.innerHTML = `
      <span class="hp-dropdown-item-user">${entry.username}</span>
      <span class="hp-dropdown-item-site">${entry.site}</span>
    `;
    // mousedown thay vì click để prevent blur trước khi fill
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      fillForm(entry.username, entry.password);
      removeDropdown();
    });
    dd.appendChild(item);
  });

  document.body.appendChild(dd);
  activeDropdown = dd;
}

// ─── Save dialog sau khi submit form ─────────────────────────────────────────

const SESSION_KEY = 'hp_pending_save';

interface PendingSave {
  username: string;
  password: string;
  site: string;
}

document.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement;
  const pwInput = form.querySelector<HTMLInputElement>('input[type="password"]');
  const userInput = form.querySelector<HTMLInputElement>(
    'input[type="email"], input[type="text"], input[name*="user"], input[name*="email"]'
  );
  if (!pwInput?.value || !userInput?.value) return;

  const pending: PendingSave = {
    username: userInput.value,
    password: pwInput.value,
    site: getHostname(),
  };

  // Lưu sessionStorage để survive page reload (traditional login)
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(pending));

  // SPA login: sau 1.5s nếu password field biến mất = đăng nhập thành công
  setTimeout(() => {
    const stillOnLoginPage = !!document.querySelector('input[type="password"]');
    if (!stillOnLoginPage) {
      sessionStorage.removeItem(SESSION_KEY);
      showSaveDialog(pending);
    }
  }, 1500);
});

// Traditional login: trang mới load, check sessionStorage
const raw = sessionStorage.getItem(SESSION_KEY);
if (raw) {
  sessionStorage.removeItem(SESSION_KEY);
  const pending: PendingSave = JSON.parse(raw);
  // Chờ DOM render xong, kiểm tra không còn ở trang login nữa
  setTimeout(() => {
    const stillOnLoginPage = !!document.querySelector('input[type="password"]');
    if (!stillOnLoginPage) showSaveDialog(pending);
  }, 800);
}

function showSaveDialog({ username, password, site }: PendingSave) {
  document.getElementById('hp-save')?.remove();

  const dialog = document.createElement('div');
  dialog.id = 'hp-save';
  dialog.className = 'hp-save';
  dialog.innerHTML = `
    <div class="hp-save-title">🔐 Save password?</div>
    <div class="hp-save-detail">${site} &nbsp;·&nbsp; ${username}</div>
    <div class="hp-save-actions">
      <button class="hp-btn-primary" id="hp-save-yes">Save</button>
      <button class="hp-btn-secondary" id="hp-save-no">Not now</button>
    </div>
  `;
  document.body.appendChild(dialog);

  dialog.querySelector('#hp-save-yes')?.addEventListener('click', async () => {
    await saveCredential(site, username, password);
    dialog.remove();
  });

  dialog.querySelector('#hp-save-no')?.addEventListener('click', () => {
    dialog.remove();
  });

  setTimeout(() => dialog.remove(), 10_000);
}

async function saveCredential(site: string, username: string, password: string) {
  const passwords = await loadPasswords();
  const exists = passwords.some((p) => p.site === site && p.username === username);
  if (exists) return;
  passwords.push({ id: Date.now().toString(), site, username, password });
  await chrome.storage.local.set({ passwords });
}

// ─── Fill form (từ popup hoặc dropdown) ──────────────────────────────────────

function fillForm(username: string, password: string): { success: boolean; error?: string } {
  const pwInput = document.querySelector<HTMLInputElement>('input[type="password"]');
  if (!pwInput) return { success: false, error: 'No password field found' };

  const userInput = document.querySelector<HTMLInputElement>(
    'input[type="email"], input[type="text"], input[name*="user"], input[name*="email"], input[id*="user"], input[id*="email"]'
  );
  if (userInput) setInputValue(userInput, username);
  setInputValue(pwInput, password);
  return { success: true };
}

chrome.runtime.onMessage.addListener(
  (
    msg: { type: string; username: string; password: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (r: unknown) => void
  ) => {
    if (msg.type === 'FILL_CREDENTIALS') {
      sendResponse(fillForm(msg.username, msg.password));
    }
  }
);

export {};
