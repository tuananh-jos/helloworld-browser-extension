import { useState } from 'react';
import { usePasswordStorage } from './hooks/usePasswordStorage';
import { useCurrentSite } from './hooks/useCurrentSite';
import PasswordList from './components/PasswordList';
import AddPassword from './components/AddPassword';
import NativeConnect from './components/NativeConnect';
import './App.css';

type View = 'list' | 'add' | 'native';

function App() {
  const { entries, loading, addEntry, deleteEntry } = usePasswordStorage();
  const currentSite = useCurrentSite();
  const [view, setView] = useState<View>('list');

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">🔐</span>
        <h1 className="app-title">Hello Password</h1>
        <div className="header-actions">
          {view === 'list' && (
            <>
              <button className="btn-icon" onClick={() => setView('native')} title="Win32 App">🖥️</button>
              <button className="btn-icon" onClick={() => setView('add')} title="Add password">+</button>
            </>
          )}
          {(view === 'add' || view === 'native') && (
            <button className="btn-icon btn-icon--back" onClick={() => setView('list')} title="Back">←</button>
          )}
        </div>
      </header>

      <main className="app-body">
        {view === 'native' ? (
          <NativeConnect />
        ) : loading ? (
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
