import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena })
            });
            const data = await response.json();
            
            if (data.success) {
                // Store user info
                localStorage.setItem('adminUser', JSON.stringify(data.usuario));
                if (data.usuario.rol === 'Admin') {
                    navigate('/admin/panel');
                } else if (data.usuario.rol === 'Proveedor') {
                    navigate('/provider/panel');
                }
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <h2>Acceso Restringido</h2>
                <p>Administradores y Proveedores</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={correo} 
                            onChange={(e) => setCorreo(e.target.value)} 
                            required 
                            placeholder="usuario@mihogar.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={contrasena} 
                                onChange={(e) => setContrasena(e.target.value)} 
                                required 
                                placeholder="********"
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
                    </div>
                    <button type="submit" className="admin-login-btn">Ingresar</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
