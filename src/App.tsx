import { useState } from 'react';
import { PasswordEntry } from './types';
import PasswordList from './components/PasswordList';
import AddPassword from './components/AddPassword';
import './App.css';

const INITIAL_ENTRIES: PasswordEntry[] = [
  { id: '1', site: 'github.com', username: 'alice', password: 'gh_secret123' },
  { id: '2', site: 'google.com', username: 'alice@gmail.com', password: 'g00gle!pass' },
];

type View = 'list' | 'add';

function App() {
  const [entries, setEntries] = useState<PasswordEntry[]>(INITIAL_ENTRIES);
  const [view, setView] = useState<View>('list');

  const handleAdd = (entry: Omit<PasswordEntry, 'id'>) => {
    setEntries((prev) => [...prev, { ...entry, id: Date.now().toString() }]);
    setView('list');
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">🔐</span>
        <h1 className="app-title">Hello Password</h1>
        {view === 'list' && (
          <button className="btn-icon" onClick={() => setView('add')} title="Add password">
            +
          </button>
        )}
      </header>

      <main className="app-body">
        {view === 'list' ? (
          <PasswordList entries={entries} onDelete={handleDelete} />
        ) : (
          <AddPassword onAdd={handleAdd} onCancel={() => setView('list')} />
        )}
      </main>
    </div>
  );
}

export default App;
