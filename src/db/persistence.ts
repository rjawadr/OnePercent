import { StateStorage } from 'zustand/middleware';
import { db } from './client';

export const sqliteStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const result = await db.executeAsync('SELECT value FROM kv_store WHERE key = ?', [name]);
      if (result.rows && result.rows.length > 0) {
        return (result.rows.item(0) as { value: string }).value;
      }
      return null;
    } catch (e) {
      console.error('Failed to get item from sqlite:', e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await db.executeAsync('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [name, value]);
    } catch (e) {
      console.error('Failed to set item in sqlite:', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await db.executeAsync('DELETE FROM kv_store WHERE key = ?', [name]);
    } catch (e) {
      console.error('Failed to remove item from sqlite:', e);
    }
  },
};
