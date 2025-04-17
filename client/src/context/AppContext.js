import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Create a global context for socket and content state
const AppContext = createContext();

export function AppProvider({ children }) {
  // Initialize Socket.IO connection once
  const [socket] = useState(() => io(`http://${window.location.hostname}:3001`));
  // Shared state for the currently displayed content
  const [activeContent, setActiveContent] = useState(null);
  // Track which display is currently active on this controller
  const [activeDisplayId, setActiveDisplayId] = useState(null);

  useEffect(() => {
    // Handle incoming content updates
    socket.on('contentUpdate', (data) => setActiveContent(data));
    socket.on('contentClear', () => setActiveContent(null));

    // Sync display selection across controllers
    socket.on('displaySelected', ({ displayNumber }) => {
      setActiveDisplayId(displayNumber);
    });

    // Refresh displays list on all controllers when displays change
    socket.on('displaysUpdated', () => {
      // Individual components can fetch updated list if needed
    });

    // Clean up on unmount
    return () => {
      socket.off('contentUpdate');
      socket.off('contentClear');
      socket.off('displaySelected');
      socket.off('displaysUpdated');
      socket.disconnect();
    };
  }, [socket]);

  const value = {
    socket,
    activeContent,
    activeDisplayId,
    setActiveDisplayId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook for consuming the AppContext
export function useAppContext() {
  return useContext(AppContext);
}
