import React, { useState } from 'react';

function AnnouncementImporter() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async () => {
    if (!title || !body) {
      alert('Both title and body are required');
      return;
    }

    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Saved announcement ID ${data.id}`);
      setTitle('');
      setBody('');
    } else {
      alert('Error: ' + data.error);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h4>New Announcement</h4>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <textarea
        rows={5}
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{ width: '100%' }}
      />
      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        Save Announcement
      </button>
    </div>
  );
}

export default AnnouncementImporter;
