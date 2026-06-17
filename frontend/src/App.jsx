import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Cotizacion from './pages/Cotizacion';
import AdminPanel from './pages/AdminPanel';
import ProviderPanel from './pages/ProviderPanel';
import AdminLogin from './pages/AdminLogin';
import Navbar from './components/Navbar';
import './App.css'; // Optional if you have specific App css

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cotizacion" element={<Cotizacion />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/provider/panel" element={<ProviderPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
