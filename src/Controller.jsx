// src/Controller.jsx
import React, { useState, useContext } from 'react';
import { DisplayContext } from './DisplayContext';
import { getDB, saveDB } from './db';
import { sampleTexts, sampleBible, sampleSongs } from './sampleData';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Controller.css';

const socket = io('http://localhost:3001');

function Controller() {
  const { displays, setDisplays } = useContext(DisplayContext);
  const [activeTab, setActiveTab] = useState('Bible');
  const [displayCount, setDisplayCount] = useState(1);
  const [moduleAssignments, setModuleAssignments] = useState([
    { id: 1, module: 'Bible' },
  ]);
  const navigate = useNavigate();

  const handleDisplayCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setDisplayCount(count);
    const updatedAssignments = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      module: moduleAssignments[i]?.module || 'Bible'
    }));
    setModuleAssignments(updatedAssignments);
  };

  const handleModuleChange = (id, module) => {
    setModuleAssignments(prev =>
      prev.map(d => (d.id === id ? { ...d, module } : d))
    );
  };

  const tabContent = {
    Bible: (
      <div>
        <h2>Sample Bible Content</h2>
        <pre>{sampleBible.join('\n')}</pre>
      </div>
    ),
    Songbook: (
      <div>
        <h2>Sample Songs</h2>
        <pre>{sampleSongs.join('\n')}</pre>
      </div>
    ),
    Slideshow: (
      <div>
        <h2>Slideshow Placeholder</h2>
        <p>Image and video background integration live here.</p>
      </div>
    )
  };

  return (
    <div className="controller-container">
      <div className="top-bar">
        <div className="tabs">
          {['Bible', 'Songbook', 'Slideshow'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="settings-button">
          <label htmlFor="display-count">Displays:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={displayCount}
            onChange={handleDisplayCountChange}
          />
        </div>
      </div>

      <div className="main-content">
        <div className="tab-content">{tabContent[activeTab]}</div>
        <div className="right-sidebar">
          <h3>Display Assignments</h3>
          {moduleAssignments.map(d => (
            <div key={d.id}>
              <label>Display {d.id}: </label>
              <select
                value={d.module}
                onChange={(e) => handleModuleChange(d.id, e.target.value)}
              >
                <option value="Bible">Bible</option>
                <option value="Songbook">Songbook</option>
                <option value="Slideshow">Slideshow</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Controller;
