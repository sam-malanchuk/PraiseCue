import React, { useEffect, useState } from 'react';
import { fetchDisplays } from '../services/api';
import { socket } from '../services/socket';
import CreateDisplayForm from './CreateDisplayForm';
import DisplayList from './DisplayList';

export default function DisplayManager() {
  const [displays, setDisplays] = useState([]);

  useEffect(() => {
    fetchDisplays()
      .then(res => setDisplays(res.data))
      .catch(console.error);

    socket.on('display-created', d => setDisplays(prev => [...prev, d]));
    socket.on('display-deleted', ({ display_number }) =>
      setDisplays(prev => prev.filter(d => d.display_number !== display_number))
    );
    socket.on('display-updated', updated =>
      setDisplays(prev =>
        prev.map(d => d.display_number === updated.display_number ? updated : d)
      )
    );

    return () => {
      socket.off('display-created');
      socket.off('display-deleted');
      socket.off('display-updated');
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>PraiseCue Displays</h1>
      <CreateDisplayForm onCreated={() => fetchDisplays().then(r => setDisplays(r.data))} />
      <DisplayList
        displays={displays}
        onDelete={display_number =>
          import('../services/api').then(m => m.deleteDisplay(display_number))
        }
        onToggleMode={display =>
          import('../services/api').then(m =>
            m.patchDisplay(display.display_number, {
              mode: display.mode === 'solo' ? 'follow' : 'solo'
            })
          )
        }
      />
    </div>
  );
}
