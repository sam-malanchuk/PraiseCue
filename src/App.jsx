import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Controller from './Controller';
import Display from './Display';
import { DisplayProvider } from './DisplayContext';

function App() {
  return (
    <DisplayProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Controller />} />
          <Route path="/display/:id" element={<Display />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </DisplayProvider>
  );
}

export default App;
