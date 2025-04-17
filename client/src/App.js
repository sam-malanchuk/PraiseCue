import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Controller from './pages/Controller';
import Display from './pages/Display';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <ChakraProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Primary controller interface */}
            <Route path="/controller" element={<Controller />} />

            {/* Display screens by ID */}
            <Route path="/display/:id" element={<Display />} />

            {/* Default to controller */}
            <Route path="*" element={<Navigate to="/controller" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </ChakraProvider>
  );
}

export default App;
