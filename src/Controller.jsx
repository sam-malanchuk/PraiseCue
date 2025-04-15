import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DisplayContext } from './DisplayContext';
import { sampleTexts } from './sampleData';

function Controller() {
  const { displays, setDisplays } = useContext(DisplayContext);
  const [selectedText, setSelectedText] = useState(sampleTexts[0]);
  const navigate = useNavigate();

  const handleAddDisplay = () => {
    const newId = displays.length + 1;
    const newDisplay = { id: newId, text: selectedText };
    setDisplays([...displays, newDisplay]);
    navigate(`/display/${newId}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Controller</h1>
      <div>
        <label htmlFor="text-select">Choose Display Content:</label>
        <select
          id="text-select"
          value={selectedText}
          onChange={(e) => setSelectedText(e.target.value)}
          style={{ marginLeft: '10px' }}
        >
          {sampleTexts.map((text, index) => (
            <option key={index} value={text}>
              {`Option ${index + 1}`}
            </option>
          ))}
        </select>
        <button onClick={handleAddDisplay} style={{ marginLeft: '10px' }}>
          Create New Display
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Existing Displays</h2>
        {displays.length === 0 ? (
          <p>No displays created yet.</p>
        ) : (
          <ul>
            {displays.map((display) => (
              <li key={display.id}>
                <Link to={`/display/${display.id}`}>Display {display.id}</Link> - {display.text.slice(0, 40)}...
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Controller;
