import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Sistema de Gestión de Mudanzas "Mi Hogar"</h1>
          <p>
            Ofrecemos servicios profesionales de mudanzas residenciales y corporativas.
            Calidad, seguridad y eficiencia en cada traslado.
          </p>
          <div className="hero-actions">
            <Link to="/cotizacion" className="btn">Cotizar Servicio</Link>
            <Link to="/register" className="btn btn-outline">Registrarse</Link>
          </div>
        </div>
      </section>

      <section className="services container">
        <h2 className="section-title">Nuestros Servicios</h2>
        <div className="services-grid">
          <div className="card">
            <h3>Mudanzas Residenciales</h3>
            <p>Servicio integral para el traslado de bienes de su hogar con el mayor cuidado.</p>
          </div>
          <div className="card">
            <h3>Mudanzas Corporativas</h3>
            <p>Traslados de oficinas y equipos de trabajo de manera eficiente.</p>
          </div>
          <div className="card">
            <h3>Cobertura y Unidades</h3>
            <p>Contamos con camiones y camionetas adaptados a sus necesidades de carga.</p>
          </div>
        </div>
      </section>
      
      <section className="contact container" style={{marginTop: '2rem'}}>
        <h2>Información de Contacto</h2>
        <p><strong>Teléfono:</strong> (55) 1234-5678</p>
        <p><strong>Correo Electrónico:</strong> contacto@mihogarmudanzas.com</p>
        <p><strong>Horario de Atención:</strong> Lunes a Viernes de 9:00 a 18:00 hrs.</p>
      </section>
    </div>
  );
};

export default Home;
