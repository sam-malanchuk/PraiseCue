// src/db.js
import initSqlJs from 'sql.js';

const DB_KEY = 'displays-sqlite-db';
let dbInstance = null;

/**
 * Load a Uint8Array from a Base64 string.
 */
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert a Uint8Array into a Base64 string.
 */
function uint8ArrayToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Initialize the SQLite database.
 * If a saved DB exists in localStorage, load it. Otherwise, create a new DB and table.
 */
export async function initDB() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`,
    });
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      const bytes = base64ToUint8Array(saved);
      dbInstance = new SQL.Database(bytes);
    } else {
      dbInstance = new SQL.Database();
      // Create displays table with id (TEXT primary key) and text.
      dbInstance.run('CREATE TABLE IF NOT EXISTS displays (id TEXT PRIMARY KEY, text TEXT)');
    }
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize DB:', error);
  }
}

/**
 * Save the current DB state to localStorage.
 */
export function saveDB() {
  try {
    if (!dbInstance) return;
    const data = dbInstance.export();
    const base64 = uint8ArrayToBase64(data);
    localStorage.setItem(DB_KEY, base64);
  } catch (error) {
    console.error('Failed to save DB:', error);
  }
}

/**
 * Get the current DB instance.
 */
export function getDB() {
  return dbInstance;
}
