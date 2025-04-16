// src/DisplayContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { initDB, getDB, saveDB } from './db';

export const DisplayContext = createContext();

export function DisplayProvider({ children }) {
  const [displays, setDisplays] = useState([]);

  // Initialize the SQLite DB and load the initial displays.
  useEffect(() => {
    async function loadDB() {
      const db = await initDB();
      try {
        const res = db.exec('SELECT * FROM displays');
        if (res.length > 0) {
          // res[0].values is an array of rows [id, text]
          const rows = res[0].values.map(([id, text]) => ({ id, text }));
          setDisplays(rows);
        }
      } catch (error) {
        console.error('DB select error:', error);
      }
    }
    loadDB();
  }, []);

  // Connect to the Socket.io server for real-time updates.
  useEffect(() => {
    const socket = io('http://localhost:3001'); // Change URL as needed.
    socket.on('newDisplay', newDisplay => {
      setDisplays(prev => {
        // If not already present, add the new display.
        if (!prev.find(d => d.id === newDisplay.id)) {
          // Insert new record into DB.
          const db = getDB();
          if (db) {
            try {
              db.run('INSERT OR IGNORE INTO displays (id, text) VALUES (?, ?)', [
                newDisplay.id,
                newDisplay.text,
              ]);
              saveDB();
            } catch (e) {
              console.error('Error inserting new display from socket:', e);
            }
          }
          return [...prev, newDisplay];
        }
        return prev;
      });
    });

    // Optionally add error handling for socket events.
    socket.on('connect_error', err => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <DisplayContext.Provider value={{ displays, setDisplays }}>
      {children}
    </DisplayContext.Provider>
  );
}
