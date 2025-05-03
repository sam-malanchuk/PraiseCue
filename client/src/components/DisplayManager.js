import React, { useEffect, useState } from 'react';
import {
  fetchDisplays,
  deleteDisplay,
  patchDisplay
} from '../services/api';
import { socket } from '../services/socket';
import CreateDisplayForm from './CreateDisplayForm';
import DisplayList from './DisplayList';
import SongSelector from './SongSelector';

export default function DisplayManager() {
  const [displays, setDisplays] = useState([]);
  const [activeNum, setActiveNum] = useState(null);

  // Hard-coded song catalog
  const songs = [
    {
      id: 1,
      title: 'Amazing Grace',
      stanzas: [
        `Amazing grace! How sweet the sound...\nThat saved a wretch like me`,
        `T'was grace that taught my heart to fear...\nAnd grace my fears relieved`,
        `Through many dangers, toils, and snares...\nI have already come`
      ]
    },
    {
      id: 2,
      title: 'Be Thou My Vision',
      stanzas: [
        `Be Thou my Vision, O Lord of my heart;\nNaught be all else to me, save that Thou art.`,
        `Be Thou my Wisdom, and Thou my true Word;\nI ever with Thee and Thou with me, Lord.`,
        `Riches I heed not, nor man's empty praise;\nThou mine Inheritance, now and always.`
      ]
    }
  ];

  useEffect(() => {
    load();

    socket.on('display-created', d => {
      setDisplays(prev => [...prev, d]);
      if (d.active) setActiveNum(d.display_number);
    });
    socket.on('display-deleted', ({ display_number }) => {
      setDisplays(prev => prev.filter(d => d.display_number !== display_number));
      if (display_number === activeNum) setActiveNum(null);
    });
    socket.on('display-updated', updated => {
      setDisplays(prev =>
        prev.map(d =>
          d.display_number === updated.display_number ? updated : d
        )
      );
      if (updated.active) setActiveNum(updated.display_number);
    });

    return () => socket.off();
  }, []);

  function load() {
    fetchDisplays()
      .then(res => {
        setDisplays(res.data);
        const act = res.data.find(d => d.active);
        if (act) setActiveNum(act.display_number);
      })
      .catch(console.error);
  }

  function handleDelete(num) {
    deleteDisplay(num).then(load).catch(console.error);
  }

  function handleToggleMode(d) {
    patchDisplay(d.display_number, {
      mode: d.mode === 'solo' ? 'follow' : 'solo'
    }).catch(console.error);
  }

  function handleSetActive(num) {
    patchDisplay(num, { active: true }).catch(console.error);
  }

  // Find the currently active record
  const activeDisplay = displays.find(d => d.display_number === activeNum);

  // Default to first song or the activeDisplay's current_song_id
  const [selectedSongId, setSelectedSongId] = useState(
    activeDisplay?.current_song_id || songs[0].id
  );

  const selectedSong =
    songs.find(s => s.id === selectedSongId) || songs[0];

  function handleSongChange(e) {
    const id = +e.target.value;
    setSelectedSongId(id);

    if (activeNum) {
      // when you switch song, clear stanza on server
      patchDisplay(activeNum, { songId: id }).catch(console.error);
    }
  }

  function handleSelectStanza(stanza) {
    if (!activeNum) return;
    // include songId so server can store it
    patchDisplay(activeNum, {
      songId: selectedSongId,
      stanza
    }).catch(console.error);
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>PraiseCue Controller</h1>

      <CreateDisplayForm onCreated={load} />

      <DisplayList
        displays={displays}
        onDelete={handleDelete}
        onToggleMode={handleToggleMode}
        onSetActive={handleSetActive}
      />

      <h2>Choose Song</h2>
      <select
        value={selectedSongId}
        onChange={handleSongChange}
        style={{ marginBottom: 12 }}
      >
        {songs.map(s => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>

      <h2>Song Stanzas</h2>
      <SongSelector
        stanzas={selectedSong.stanzas}
        currentStanza={activeDisplay?.current_stanza}
        onSelect={handleSelectStanza}
      />
    </div>
  );
}
