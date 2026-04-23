import { useState } from 'react';
import { usePasswordStorage } from './hooks/usePasswordStorage';
import { useCurrentSite } from './hooks/useCurrentSite';
import PasswordList from './components/PasswordList';
import AddPassword from './components/AddPassword';
import './App.css';

type View = 'list' | 'add';

function App() {
  const { entries, loading, addEntry, deleteEntry } = usePasswordStorage();
  const currentSite = useCurrentSite();
  const [view, setView] = useState<View>('list');

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
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : view === 'list' ? (
          <PasswordList entries={entries} currentSite={currentSite} onDelete={deleteEntry} />
        ) : (
          <AddPassword onAdd={addEntry} onCancel={() => setView('list')} />
        )}
      </main>
    </div>
  );
}

export default App;
