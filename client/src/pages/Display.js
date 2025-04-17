import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

function Display() {
  const { id } = useParams(); // Display ID from URL
  const displayId = parseInt(id, 10);
  const [mode, setMode] = useState('solo');
  const [content, setContent] = useState(null);
  const [stanzaLines, setStanzaLines] = useState([]);

  useEffect(() => {
    localStorage.setItem('displayId', displayId);
    fetch(`/api/displays/${displayId}`)
      .then((res) => res.json())
      .then((data) => setMode(data.mode || 'solo'));

    socket.emit('registerDisplay', displayId);

    socket.on('contentUpdate', async (data) => {
      const isFollow = mode === 'follow';
      const isSoloTarget = !Array.isArray(data.targetDisplays); // solo-targeted
      const isFollowTarget = Array.isArray(data.targetDisplays) && data.targetDisplays.includes(displayId);
      if (!(isSoloTarget || isFollowTarget)) return;

      setContent(data);

      if (data.contentType === 'song') {
        const res = await fetch(`/api/songs/${data.contentId}`);
        const song = await res.json();
        const stanzas = JSON.parse(song.content);
        const stanza = stanzas.find((s) => `${song.title} - ${s.title}` === data.stanzaOrVerse);
        setStanzaLines(stanza?.lines || []);
      } else {
        setStanzaLines([]);
      }
    });

    socket.on('contentClear', () => {
      setContent(null);
      setStanzaLines([]);
    });

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        socket.emit('clearContent');
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      socket.off('contentUpdate');
      socket.off('contentClear');
    };
  }, [displayId, mode]);

  return (
    <div style={{
      height: '100vh',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.5rem',
      textAlign: 'center',
      padding: 40,
    }}>
      {!content && <div>No content</div>}

      {content?.contentType === 'bible' && (
        <div>{content.stanzaOrVerse}</div>
      )}

      {content?.contentType === 'song' && stanzaLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}

      {content?.contentType === 'announcement' && (
        <div>{content.stanzaOrVerse}</div>
      )}
    </div>
  );
}

export default Display;
