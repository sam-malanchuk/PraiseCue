import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Controller from './pages/Controller';
import Display from './pages/Display';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/controller" />} />
      <Route path="/controller" element={<Controller />} />
      <Route path="/display/:id" element={<Display />} />
    </Routes>
  );
}

export default App;
