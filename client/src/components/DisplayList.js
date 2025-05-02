import React from 'react';

export default function DisplayList({ displays, onDelete, onToggleMode }) {
  return (
    <div>
      {displays.map(d => (
        <div
          key={d.display_number}
          style={{
            marginBottom: 15,
            padding: 10,
            border: '1px solid #666',
            borderRadius: 4,
          }}
        >
          <h3>{d.name || `Display ${d.display_number}`}</h3>
          <p>#: {d.display_number}</p>
          <p>
            Mode: <select value={d.mode} onChange={() => onToggleMode(d)}>
              <option value="solo">Solo</option>
              <option value="follow">Follow</option>
            </select>
          </p>
          <p style={{ fontStyle: 'italic' }}>
            {`${window.location.protocol}//${window.location.hostname}`}/display/{d.display_number}
          </p>
          <button onClick={() => onDelete(d.display_number)}>Delete</button>
        </div>
      ))}
    </div>
)};