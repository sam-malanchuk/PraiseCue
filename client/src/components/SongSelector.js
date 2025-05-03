import React from 'react';

export default function SongSelector({ stanzas, currentStanza, onSelect }) {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      overflowX: 'auto'
    }}>
      {stanzas.map((text, idx) => {
        const num = idx + 1;
        const selected = currentStanza === num;
        return (
          <div
            key={num}
            onClick={() => onSelect(num)}
            style={{
              padding: '0.5rem 1rem',
              border: selected ? '2px solid blue' : '1px solid gray',
              borderRadius: 4,
              cursor: 'pointer',
              whiteSpace: 'normal',
              maxWidth: '200px'
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}
