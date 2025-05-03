import React from 'react';

export default function DisplayList({
  displays,
  onDelete,
  onToggleMode,
  onSetActive
}) {
  return (
    <div>
      {displays.map(d => (
        <div
          key={d.display_number}
          style={{
            marginBottom: 15,
            padding: 10,
            border: d.active ? '2px solid blue' : '1px solid #666',
            borderRadius: 4
          }}
        >
          <h3>
            {d.name || `Display ${d.display_number}`}{' '}
            {d.active && <span>(active)</span>}
          </h3>
          <p># {d.display_number}</p>
          <p>
            Mode:{' '}
            <select
              value={d.mode}
              onChange={() => onToggleMode(d)}
              style={{ marginLeft: 8 }}
            >
              <option value="solo">Solo</option>
              <option value="follow">Follow</option>
            </select>
          </p>

          <button onClick={() => onSetActive(d.display_number)}>
            {d.active ? 'Active' : 'Set Active'}
          </button>
          <button
            onClick={() => onDelete(d.display_number)}
            style={{ marginLeft: 8 }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
