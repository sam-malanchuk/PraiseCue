import { useState, useEffect } from 'react';
import { socket } from './socket';

function App() {
  const [mode, setMode] = useState('controller');
  const [text, setText] = useState('');
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    socket.on('update-slide', (data) => {
      setDisplayText(data || '');
    });
    return () => socket.off('update-slide');
  }, []);

  const sendSlide = () => {
    socket.emit('set-slide', text);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => setMode(mode === 'controller' ? 'display' : 'controller')}>
        Switch to {mode === 'controller' ? 'Display' : 'Controller'}
      </button>

      {mode === 'controller' ? (
        <div>
          <h2>Controller View</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows="4" style={{ width: '100%' }} />
          <br />
          <button onClick={sendSlide}>Show Slide</button>
        </div>
      ) : (
        <div style={{ fontSize: '3rem', marginTop: '2rem' }}>{displayText}</div>
      )}
    </div>
  );
}

export default App;
