import { useState } from 'react';
import { PasswordEntry } from '../types';

interface Props {
  entries: PasswordEntry[];
  onDelete: (id: string) => void;
}

function PasswordList({ entries, onDelete }: Props) {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const toggleVisible = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (entries.length === 0) {
    return <p className="empty-state">No passwords saved yet.</p>;
  }

  return (
    <ul className="password-list">
      {entries.map((entry) => (
        <li key={entry.id} className="password-item">
          <div className="entry-site">{entry.site}</div>
          <div className="entry-user">{entry.username}</div>
          <div className="entry-password">
            <span>{visibleIds.has(entry.id) ? entry.password : '••••••••'}</span>
            <button className="btn-text" onClick={() => toggleVisible(entry.id)}>
              {visibleIds.has(entry.id) ? 'Hide' : 'Show'}
            </button>
          </div>
          <button className="btn-delete" onClick={() => onDelete(entry.id)} title="Delete">
            🗑
          </button>
        </li>
      ))}
    </ul>
  );
}

export default PasswordList;
