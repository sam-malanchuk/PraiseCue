import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDisplay, patchDisplay } from '../services/api';
import { socket } from '../services/socket';

const stanzas = [
  "Amazing grace! How sweet the sound...",
  "T'was grace that taught my heart to fear...",
  "Through many dangers, toils, and snares..."
];

export default function DisplayScreen() {
  const { display_number } = useParams();
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    fetchDisplay(+display_number).then(setDisplay);
    socket.on('display-updated', d => {
      if (d.display_number === +display_number) setDisplay(d);
    });
    return () => socket.off('display-updated');
  }, [display_number]);

  if (!display) return <div>Loading...</div>;

  const current = display.current_stanza;

  return (
    <div style={{ background: 'white', color: 'black', minHeight: '100vh', padding: 40, fontSize: 32 }}>
      <h2>{display.name}</h2>
      {stanzas.map((line, idx) => (
        <p
          key={idx}
          style={{
            fontWeight: current === idx + 1 ? 'bold' : 'normal',
            cursor: 'pointer',
          }}
          onClick={() =>
            patchDisplay(display.display_number, { stanza: idx + 1 })
          }
        >
          {line}
        </p>
      ))}
    </div>
  );
}
