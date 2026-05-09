import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnimeDetails from './pages/AnimeDetails';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/search" element={<SearchPage />} />
          {/* Add more routes here as we build them */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
