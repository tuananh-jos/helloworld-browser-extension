import { useState, useEffect } from 'react';
import { PasswordEntry } from '../types';
import { loadPasswords, savePasswords } from '../utils/storage';

export function usePasswordStorage() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load từ storage lần đầu popup mở
  useEffect(() => {
    loadPasswords().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const addEntry = async (entry: Omit<PasswordEntry, 'id'>) => {
    const newEntry: PasswordEntry = { ...entry, id: Date.now().toString() };
    const next = [...entries, newEntry];
    await savePasswords(next);
    setEntries(next);
  };

  const deleteEntry = async (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    await savePasswords(next);
    setEntries(next);
  };

  return { entries, loading, addEntry, deleteEntry };
}
