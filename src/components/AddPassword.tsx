import { useState } from 'react';
import { PasswordEntry } from '../types';

interface Props {
  onAdd: (entry: Omit<PasswordEntry, 'id'>) => void;
  onCancel: () => void;
}

function AddPassword({ onAdd, onCancel }: Props) {
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!site || !username || !password) return;
    onAdd({ site, username, password });
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Add Password</h2>

      <label className="field-label">Site</label>
      <input
        className="field-input"
        type="text"
        placeholder="e.g. github.com"
        value={site}
        onChange={(e) => setSite(e.target.value)}
        autoFocus
      />

      <label className="field-label">Username</label>
      <input
        className="field-input"
        type="text"
        placeholder="e.g. alice"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className="field-label">Password</label>
      <input
        className="field-input"
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

export default AddPassword;
