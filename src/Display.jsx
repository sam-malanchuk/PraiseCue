// src/Display.jsx
import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DisplayContext } from './DisplayContext';

function Display() {
  const { id } = useParams();
  const { displays } = useContext(DisplayContext);
  const displayData = displays.find(d => d.id === id);

  return (
    <div style={{ padding: '20px' }}>
      {displayData ? (
        <>
          <h1>Display {displayData.id}</h1>
          <p>{displayData.text}</p>
        </>
      ) : (
        <h1>No display found for ID {id}</h1>
      )}
      <Link to="/">Back to Controller</Link>
    </div>
  );
}

export default Display;
