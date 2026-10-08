import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ExploreCars from './pages/ExploreCars';
import CarDetail from './pages/CarDetail';
import Prediction from './pages/Prediction';
import Valuation from './pages/Valuation';
import Forum from './pages/Forum';
import Compare from './pages/Compare';
import Garage from './pages/Garage';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreCars />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/valuation" element={<Valuation />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
