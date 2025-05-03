import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDisplay, patchDisplay } from '../services/api';
import { socket } from '../services/socket';

const songCatalog = {
  1: [
    `Amazing grace! How sweet the sound...\nThat saved a wretch like me`,
    `T'was grace that taught my heart to fear...\nAnd grace my fears relieved`,
    `Through many dangers, toils, and snares...\nI have already come`
  ],
  2: [
    `Be Thou my Vision, O Lord of my heart;\nNaught be all else to me, save that Thou art.`,
    `Be Thou my Wisdom, and Thou my true Word;\nI ever with Thee and Thou with me, Lord.`,
    `Riches I heed not, nor man's empty praise;\nThou mine Inheritance, now and always.`
  ]
};

export default function DisplayScreen() {
  const { display_number } = useParams();
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    load();
    socket.on('display-updated', d => {
      if (d.display_number === +display_number) setDisplay(d);
    });
    return () => socket.off('display-updated');
  }, [display_number]);

  function load() {
    fetchDisplay(+display_number).then(setDisplay).catch(console.error);
  }

  if (!display) return <div>Loading...</div>;

  const { current_song_id, current_stanza, name } = display;

  // If no stanza assigned, show blank full-screen
  if (!current_stanza || !current_song_id) {
    return <div style={{ background: 'white', height: '100vh' }} />;
  }

  // Only show the one selected stanza
  const stanzaText =
    songCatalog[current_song_id]?.[current_stanza - 1] || '';

  return (
    <div
      style={{
        background: 'white',
        color: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: 40,
        textAlign: 'center',
        fontSize: '2rem'
      }}
    >
      <div>
        <h2>{name}</h2>
        <p
          onClick={() =>
            patchDisplay(display.display_number, { stanza: current_stanza })
          }
          style={{ cursor: 'pointer', fontWeight: 'normal' }}
        >
          {stanzaText}
        </p>
      </div>
    </div>
  );
}
