import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ correo: '', contrasena: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({...credentials, [e.target.name]: e.target.value});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      
      if (data.success) {
        if (data.usuario.rol === 'Admin') {
          localStorage.setItem('adminUser', JSON.stringify(data.usuario));
          navigate('/admin/panel');
        } else if (data.usuario.rol === 'Proveedor') {
          localStorage.setItem('adminUser', JSON.stringify(data.usuario));
          navigate('/provider/panel');
        } else {
          // Cliente
          localStorage.setItem('clienteUser', JSON.stringify(data.usuario));
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 0', maxWidth: '400px' }}>
      <div className="card">
        <h2 style={{borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem'}}>Iniciar Sesión</h2>
        {error && <div style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #fca5a5'}}>{error}</div>}
        <form onSubmit={handleLogin}>
          <label>Correo Electrónico</label>
          <input type="email" name="correo" onChange={handleChange} required />
          
          <label>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              name="contrasena" 
              onChange={handleChange} 
              required 
              style={{ width: '100%', paddingRight: '2.5rem' }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0'
              }}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Ingresar</button>
        </form>
        <div style={{marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}>
          <p style={{color: '#4b5563', fontSize: '0.9rem'}}>
            ¿No tiene cuenta? <Link to="/register">Regístrese aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
