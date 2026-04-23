import { useState } from 'react';
import { PasswordEntry } from '../types';
import { fillCredentials, matchesSite } from '../utils/tabs';

interface Props {
  entries: PasswordEntry[];
  currentSite: string;
  onDelete: (id: string) => void;
}

function PasswordList({ entries, currentSite, onDelete }: Props) {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fillStatus, setFillStatus] = useState<{ id: string; ok: boolean; msg?: string } | null>(null);

  const toggleVisible = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyPassword = async (entry: PasswordEntry) => {
    await navigator.clipboard.writeText(entry.password);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleFill = async (entry: PasswordEntry) => {
    const result = await fillCredentials(entry.username, entry.password);
    setFillStatus({ id: entry.id, ok: result.success, msg: result.error });
    setTimeout(() => setFillStatus(null), 2000);
  };

  if (entries.length === 0) {
    return <p className="empty-state">No passwords saved yet.</p>;
  }

  // Entries khớp domain hiện tại lên đầu
  const sorted = currentSite
    ? [...entries].sort((a, b) => {
        const aMatch = matchesSite(a.site, currentSite) ? -1 : 0;
        const bMatch = matchesSite(b.site, currentSite) ? -1 : 0;
        return aMatch - bMatch;
      })
    : entries;

  return (
    <>
      {currentSite && <p className="current-site">🌐 {currentSite}</p>}
      <ul className="password-list">
        {sorted.map((entry) => {
          const isMatch = matchesSite(entry.site, currentSite);
          const status = fillStatus?.id === entry.id ? fillStatus : null;

          return (
            <li key={entry.id} className={`password-item${isMatch ? ' password-item--match' : ''}`}>
              <div className="entry-site">
                {isMatch && <span className="match-badge">✓</span>}
                {entry.site}
              </div>
              <div className="entry-user">{entry.username}</div>
              <div className="entry-password">
                <span className="entry-password-value">
                  {visibleIds.has(entry.id) ? entry.password : '••••••••'}
                </span>
                <button className="btn-text" onClick={() => toggleVisible(entry.id)}>
                  {visibleIds.has(entry.id) ? 'Hide' : 'Show'}
                </button>
                <button className="btn-text" onClick={() => copyPassword(entry)}>
                  {copiedId === entry.id ? '✓' : 'Copy'}
                </button>
              </div>

              <div className="entry-actions">
                <button
                  className={`btn-fill${status ? (status.ok ? ' btn-fill--ok' : ' btn-fill--err') : ''}`}
                  onClick={() => handleFill(entry)}
                  title={status?.msg ?? 'Auto-fill vào trang hiện tại'}
                >
                  {status ? (status.ok ? '✓ Filled' : '✗ Failed') : 'Fill'}
                </button>
                <button className="btn-delete" onClick={() => onDelete(entry.id)} title="Delete">
                  🗑
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default PasswordList;
