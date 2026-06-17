import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', correo: '', direccion: '', contrasena: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(data.message || 'Error al registrar el usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 0', maxWidth: '500px' }}>
      <div className="card">
        <h2 style={{borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem'}}>Registro de Cliente</h2>
        {error && <div style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #fca5a5'}}>{error}</div>}
        {successMessage && <div style={{backgroundColor: '#dcfce7', color: '#15803d', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #bbf7d0'}}>{successMessage}</div>}
        <form onSubmit={handleRegister}>
          <label>Nombre Completo</label>
          <input type="text" name="nombre" onChange={handleChange} required />
          
          <label>Teléfono</label>
          <input type="tel" name="telefono" onChange={handleChange} required />

          <label>Correo Electrónico</label>
          <input type="email" name="correo" onChange={handleChange} required />

          <label>Dirección</label>
          <input type="text" name="direccion" onChange={handleChange} required />
          
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
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', color: '#64748b'
              }}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Registrarse</button>
        </form>
        <div style={{marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}>
          <p style={{color: '#4b5563', fontSize: '0.9rem'}}>
            ¿Ya tiene una cuenta? <Link to="/login">Inicie Sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
