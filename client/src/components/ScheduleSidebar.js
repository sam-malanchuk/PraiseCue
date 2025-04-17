import React, { useEffect, useState } from 'react';

function ScheduleSidebar({ socket, activeContent }) {
  const displayId = 1;
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetch(`/api/schedules/${displayId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSchedule(data);
        } else {
          console.warn('Expected schedule to be array, got:', data);
          setSchedule([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch schedule:', err);
        setSchedule([]);
      });
  }, []);

  const saveSchedule = (updated) => {
    setSchedule(updated);
    const items = updated.map((item) => ({
      type: item.contentType,
      item_id: item.contentId
    }));

    fetch(`/api/schedules/${displayId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  };

  const addToSchedule = () => {
    if (!activeContent) return;
    const newItem = { id: Date.now(), ...activeContent };
    const updated = [...schedule, newItem];
    saveSchedule(updated);
  };

  const removeItem = (id) => {
    const updated = schedule.filter((item) => item.id !== id);
    saveSchedule(updated);
  };

  const clearAll = () => {
    saveSchedule([]);
  };

  const handleClickItem = (item) => {
    socket.emit('showContent', item);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 10, width: 250 }}>
      <h4>Schedule</h4>
      <button onClick={addToSchedule} disabled={!activeContent}>+ Add Current</button>
      <button onClick={clearAll} style={{ marginLeft: 10 }}>Clear All</button>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
        {schedule.map((item, idx) => (
          <li key={item.id || idx} style={{ marginBottom: 8 }}>
            <button onClick={() => handleClickItem(item)} style={{ width: '100%' }}>
              {item.contentType}: {item.stanzaOrVerse}
            </button>
            <button onClick={() => removeItem(item.id || idx)} style={{ marginLeft: 4 }}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleSidebar;
