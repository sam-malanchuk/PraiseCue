// src/Controller.jsx
import React, { useState, useContext } from 'react';
import { DisplayContext } from './DisplayContext';
import { getDB, saveDB } from './db';
import { sampleTexts } from './sampleData';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Create a single socket instance.
const socket = io('http://localhost:3001'); // Adjust as needed.

function Controller() {
  const { displays, setDisplays } = useContext(DisplayContext);
  const [selectedText, setSelectedText] = useState(sampleTexts[0]);
  const navigate = useNavigate();

  const handleAddDisplay = () => {
    const newId = uuidv4(); // Generate a unique ID.
    const newDisplay = { id: newId, text: selectedText };

    // Insert into local SQLite DB.
    const db = getDB();
    if (db) {
      try {
        db.run('INSERT INTO displays (id, text) VALUES (?, ?)', [newId, selectedText]);
        saveDB();
      } catch (error) {
        console.error('Error inserting new display:', error);
      }
    }

    // Update React state.
    setDisplays([...displays, newDisplay]);

    // Emit the event to notify other clients.
    socket.emit('newDisplay', newDisplay);

    // Navigate to the new display page.
    navigate(`/display/${newId}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Controller</h1>
      <div>
        <label htmlFor="text-select">Choose Display Content:</label>
        <select
          id="text-select"
          value={selectedText}
          onChange={e => setSelectedText(e.target.value)}
          style={{ marginLeft: '10px' }}
        >
          {sampleTexts.map((text, index) => (
            <option key={index} value={text}>
              {`Option ${index + 1}`}
            </option>
          ))}
        </select>
        <button onClick={handleAddDisplay} style={{ marginLeft: '10px' }}>
          Create New Display
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Existing Displays</h2>
        {displays.length === 0 ? (
          <p>No displays created yet.</p>
        ) : (
          <ul>
            {displays.map(display => (
              <li key={display.id}>
                Display {display.id}: {display.text.slice(0, 40)}...
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Controller;
