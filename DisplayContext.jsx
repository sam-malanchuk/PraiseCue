import React, { createContext, useState } from 'react';

export const DisplayContext = createContext();

export function DisplayProvider({ children }) {
  const [displays, setDisplays] = useState([]);
  return (
    <DisplayContext.Provider value={{ displays, setDisplays }}>
      {children}
    </DisplayContext.Provider>
  );
}
