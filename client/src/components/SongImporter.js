import React, { useState } from 'react';

function parseSongMarkdown(md) {
  const lines = md.trim().split('\n');
  let title = '';
  const stanzas = [];
  let currentStanza = null;

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
    } else if (line.startsWith('## ')) {
      if (currentStanza) stanzas.push(currentStanza);
      currentStanza = { title: line.replace('## ', '').trim(), lines: [] };
    } else if (line) {
      currentStanza?.lines.push(line);
    }
  }
  if (currentStanza) stanzas.push(currentStanza);

  return { title, stanzas };
}

function SongImporter({ onImport }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);

  const handleParse = async () => {
    const parsed = parseSongMarkdown(text);
    setPreview(parsed);

    // 💥 Add this validation check here
    if (!parsed.title || !parsed.stanzas?.length) {
      alert('Invalid song format: title and stanzas are required.');
      return;
    }

    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Saved song with ID ${data.id}`);
        onImport?.(parsed); // optional callback for refreshing UI
      } else {
        console.error(data.error);
        alert(`Failed to save: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving song.');
    }
  };


  return (
    <div style={{ marginTop: 20 }}>
      <h4>Paste Song Markdown</h4>
      <textarea
        rows={10}
        style={{ width: '100%' }}
        placeholder="# Title\n## Verse 1\nLine 1\nLine 2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={handleParse} style={{ marginTop: 10 }}>
        Preview
      </button>

      {preview && (
        <div style={{ marginTop: 20 }}>
          <strong>Title:</strong> {preview.title}
          {preview.stanzas.map((s, idx) => (
            <div key={idx} style={{ marginTop: 10 }}>
              <strong>{s.title}</strong>
              <pre>{s.lines.join('\n')}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SongImporter;
