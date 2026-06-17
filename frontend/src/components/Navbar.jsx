import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="brand">
          Mi Hogar Mudanzas
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/cotizacion" className="nav-link">Cotizar</Link>
          <Link to="/login" className="nav-link">Iniciar Sesión</Link>
          <Link to="/register" className="btn-primary">Registrarse</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
