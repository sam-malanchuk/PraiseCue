import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DisplayManager from './components/DisplayManager';
import DisplayScreen from './components/DisplayScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DisplayManager />} />
        <Route path="/display/:display_number" element={<DisplayScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
