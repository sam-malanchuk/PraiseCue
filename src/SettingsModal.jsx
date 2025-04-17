// src/SettingsModal.jsx
import React, { useState } from 'react';

function SettingsModal({ settings, onClose, onSave }) {
  const [bgType, setBgType] = useState(settings.type);
  const [bgValue, setBgValue] = useState(settings.value);

  const handleSave = () => {
    onSave({ type: bgType, value: bgValue });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: '20%', left: '30%', background: '#333', color: 'white', padding: 20, borderRadius: 8, zIndex: 1000 }}>
      <h3>Background Settings</h3>
      <label>Type:</label>
      <select value={bgType} onChange={e => setBgType(e.target.value)}>
        <option value="color">Color</option>
        <option value="image">Image URL</option>
        <option value="video">Video URL</option>
      </select>
      <br />
      <label>Value:</label>
      <input
        value={bgValue}
        onChange={e => setBgValue(e.target.value)}
        placeholder={bgType === 'color' ? 'e.g. transparent or #000000' : 'https://...'}
        style={{ width: '100%' }}
      />
      <br />
      <button onClick={handleSave} style={{ marginTop: 10 }}>Save</button>
      <button onClick={onClose} style={{ marginLeft: 10 }}>Cancel</button>
    </div>
  );
}

export default SettingsModal;
