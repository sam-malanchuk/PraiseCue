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
  ],
  3: [
    `This is the Song's Line 1\nThis is the Song's Line 2\nThis is the Song's Line 3\nThis is the Song's Line 4`,
    `This is the Song's Line 5\nThis is the Song's Line 6\nThis is the Song's Line 7\nThis is the Song's Line 8`,
    `This is the Song's Line 9\nThis is the Song's Line 10\nThis is the Song's Line 11\nThis is the Song's Line 12`,
    `This is the Song's Line 13\nThis is the Song's Line 14\nThis is the Song's Line 15\nThis is the Song's Line 16`
  ]
};

export default function DisplayScreen() {
  const { display_number } = useParams();
  const [display, setDisplay] = useState(null);
  const [fontSize, setFontSize] = useState('2em');

  // Load and subscribe
  useEffect(() => {
    fetchDisplay(+display_number).then(setDisplay).catch(console.error);
    socket.on('display-updated', d => {
      if (d.display_number === +display_number) {
        setDisplay(d);
      }
    });
    return () => socket.off('display-updated');
  }, [display_number]);

  // Compute font size whenever the assigned stanza changes
  useEffect(() => {
    if (!display || !display.current_song_id || !display.current_stanza) return;

    const text =
      songCatalog[display.current_song_id]?.[display.current_stanza - 1] || '';
    const lineCount = text.split('\n').length || 1;
    // const size = window.innerHeight / (lineCount * 1.5); // adjust to taste
    // setFontSize(`${size}px`);
  }, [display]);

  // While loading
  if (!display) {
    return <div style={{ background: 'white', height: '100vh' }} />;
  }

  const { current_song_id, current_stanza, display_number: num, name: displayName } = display;

  // If no stanza assigned, blank screen
  if (!current_song_id || !current_stanza) {
    return <div style={{ background: 'white', height: '100vh' }} />;
  }

  // Prepare lines
  const stanzaText =
    songCatalog[current_song_id]?.[current_stanza - 1] || '';
  const lines = stanzaText.split('\n');

  return (
    <div
      style={{
        background: 'white',
        color: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: 20,
        textAlign: 'center'
      }}
    >
      <div>
        <h2>{displayName}</h2>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize,
              lineHeight: 1.2,
              cursor: 'pointer',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxWidth: '90vw',
              margin: '0.5em 0'
            }}
            // onClick={() =>
            //   patchDisplay(num, { stanza: current_stanza })
            // }
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
