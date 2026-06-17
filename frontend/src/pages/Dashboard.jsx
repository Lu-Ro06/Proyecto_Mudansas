import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('clienteUser');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchSolicitudes(parsedUser.id);
    }
  }, [navigate]);

  const fetchSolicitudes = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cliente/${id}/solicitudes`);
      const data = await response.json();
      if (data.success) {
        setSolicitudes(data.solicitudes);
      }
    } catch (error) {
      console.error("Error fetching solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clienteUser');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {showProfile && (
        <ProfileModal 
            user={user} 
            onClose={() => setShowProfile(false)} 
            onUpdate={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem('clienteUser', JSON.stringify(updatedUser));
            }} 
        />
      )}

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem'}}>
        <h2>Panel del Cliente - Bienvenido, {user.nombre}</h2>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button onClick={() => setShowProfile(true)} className="btn btn-outline" style={{padding: '0.4rem 0.8rem'}}>Mi Perfil</button>
          <button onClick={handleLogout} className="btn" style={{backgroundColor: 'var(--error-color)', borderColor: 'var(--error-color)'}}>Cerrar Sesión</button>
        </div>
      </div>
      
      <div className="services-grid">
        <div className="card">
          <h3>Solicitar Nueva Mudanza</h3>
          <p style={{color: 'var(--text-color-muted)', marginBottom: '1.5rem'}}>
            Llene el formulario para programar un nuevo servicio de mudanza. Obtenga su cotización y confirme.
          </p>
          <Link to="/cotizacion" className="btn" style={{width: '100%', display: 'block', textAlign: 'center'}}>Nueva Solicitud</Link>
        </div>

        <div className="card">
          <h3>Historial de Solicitudes</h3>
          <p style={{color: 'var(--text-color-muted)', marginBottom: '1.5rem'}}>
            Consulte el estado de sus servicios anteriores y actuales.
          </p>
          
          {loading ? (
            <p>Cargando solicitudes...</p>
          ) : solicitudes.length === 0 ? (
            <div style={{padding: '1rem', background: '#f8fafc', borderRadius: '6px', textAlign: 'center', color: '#64748b'}}>
              No has realizado ninguna solicitud aún.
            </div>
          ) : (
            <div style={{maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem'}}>
              {solicitudes.map(sol => (
                <div key={sol.id_solicitud} style={{background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '1rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <strong>{sol.origen.split(',')[0]} - {sol.destino.split(',')[0]}</strong>
                    <span style={{
                      color: sol.estatus === 'Pendiente' ? '#b45309' : sol.estatus === 'Aprobada' ? '#1d4ed8' : sol.estatus === 'Completada' ? '#15803d' : '#ef4444', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem'
                    }}>{sol.estatus}</span>
                  </div>
                  <p style={{fontSize: '0.85rem', color: '#64748b', margin: 0, marginBottom: '0.5rem'}}>Fecha de servicio: {new Date(sol.fecha_servicio).toLocaleDateString('es-MX')}</p>
                  <p style={{fontSize: '0.85rem', color: '#475569', margin: 0, padding: '0.4rem', background: '#f1f5f9', borderRadius: '4px'}}>
                    {sol.observaciones}
                    <div style={{ marginTop: '0.3rem', color: '#0f766e', fontWeight: 'bold' }}>
                        🚗 Carro Seleccionado: {sol.observaciones?.match(/Unidad:\s*([^,]+)/)?.[1] || 'No especificado'}
                    </div>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
