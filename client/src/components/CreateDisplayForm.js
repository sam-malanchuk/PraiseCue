import React, { useState } from 'react';
import { createDisplay } from '../services/api';

export default function CreateDisplayForm({ onCreated }) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('solo');

  const handleSubmit = e => {
    e.preventDefault();
    createDisplay(name, mode)
      .then(() => {
        setName('');
        setMode('solo');
        onCreated();
      })
      .catch(console.error);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <div>
        <label>Name: </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Main Projector"
        />
      </div>
      <div>
        <label>Mode: </label>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="solo">Solo</option>
          <option value="follow">Follow</option>
        </select>
      </div>
      <button type="submit">Create Display</button>
    </form>
  );
}
