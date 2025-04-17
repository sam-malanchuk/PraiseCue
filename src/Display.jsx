// src/Display.jsx
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DisplayContext } from './DisplayContext';

function Display() {
  const { id } = useParams();
  const { displays } = useContext(DisplayContext);
  const display = displays.find(d => d.id === id);

  if (!display) return <div>Display not found</div>;

  const { module, text, background } = display;

  const backgroundStyle = {
    backgroundColor: background.type === 'color' ? background.value : 'transparent',
    backgroundImage: background.type === 'image' ? `url(${background.value})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2.5rem'
  };

  return (
    <div style={backgroundStyle}>
      {background.type === 'video' && (
        <video autoPlay muted loop playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }}>
          <source src={background.value} type="video/mp4" />
        </video>
      )}
      <div>
        <h1>{module}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default Display;

