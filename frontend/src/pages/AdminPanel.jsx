import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';
import AlertModal from '../components/AlertModal';
import './AdminPanel.css';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [rol, setRol] = useState('Proveedor');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [proveedores, setProveedores] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [showProfile, setShowProfile] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => {},
        onCancel: () => {}
    });

    const closeAlert = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        const storedUser = localStorage.getItem('adminUser');
        if (!storedUser) {
            navigate('/admin/login');
        } else {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.rol !== 'Admin') {
                navigate('/admin/login');
            } else {
                setUser(parsedUser);
                fetchData();
            }
        }
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [resProv, resSol] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/proveedores`),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/solicitudes`)
            ]);
            const dataProv = await resProv.json();
            const dataSol = await resSol.json();
            if (dataProv.success) setProveedores(dataProv.proveedores);
            if (dataSol.success) setSolicitudes(dataSol.solicitudes);
        } catch (error) {
            console.error('Error fetching admin data', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/create_user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, correo, contrasena, rol })
            });
            const data = await response.json();
            if (data.success) {
                setMessage('Usuario creado exitosamente');
                setNombre(''); setCorreo(''); setContrasena('');
                fetchData(); // Refresh providers if a new one is created
            } else {
                setMessage(data.message || 'Error al crear usuario');
            }
        } catch (error) {
            setMessage('Error de conexión');
        }
    };

    const handleAsignar = async (id_solicitud, id_proveedor) => {
        if (!id_proveedor) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/solicitudes/${id_solicitud}/asignar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_proveedor })
            });
            const data = await response.json();
            if (data.success) {
                fetchData(); // Refresh data
            } else {
                setModalConfig({ isOpen: true, title: 'Error', message: 'Error al asignar proveedor: ' + data.message, type: 'alert', onConfirm: closeAlert });
            }
        } catch (error) {
            setModalConfig({ isOpen: true, title: 'Error', message: 'Error de conexión con el servidor.', type: 'alert', onConfirm: closeAlert });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    if (!user) return <div className="container" style={{padding: '2rem'}}>Cargando...</div>;

    return (
        <div className="panel-container">
            <AlertModal {...modalConfig} />
            
            {showProfile && (
                <ProfileModal 
                    user={user} 
                    onClose={() => setShowProfile(false)} 
                    onUpdate={(updatedUser) => {
                        setUser(updatedUser);
                        localStorage.setItem('adminUser', JSON.stringify(updatedUser));
                    }} 
                />
            )}

            <header className="panel-header">
                <h2>Panel de Administrador</h2>
                <div className="user-info">
                    <span>Bienvenido, {user.nombre}</span>
                    <button onClick={() => setShowProfile(true)} className="btn btn-outline" style={{padding: '0.4rem 0.8rem'}}>Mi Perfil</button>
                    <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
                </div>
            </header>
            
            <div className="panel-content">
                <div className="card">
                    <h3>Crear Nuevo Usuario Interno</h3>
                    {message && <div className="message">{message}</div>}
                    <form onSubmit={handleCreateUser} className="admin-form">
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={contrasena} 
                                    onChange={(e) => setContrasena(e.target.value)} 
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
                        </div>
                        <div className="form-group">
                            <label>Rol</label>
                            <select value={rol} onChange={(e) => setRol(e.target.value)} required>
                                <option value="Proveedor">Proveedor</option>
                                <option value="Admin">Administrador</option>
                            </select>
                        </div>
                        <button type="submit" className="action-btn">Crear Usuario</button>
                    </form>
                </div>
                
                <div className="card">
                    <h3>Gestión de Solicitudes y Proveedores</h3>
                    <p style={{marginBottom: '1rem', color: 'var(--text-color-muted)'}}>Asigna las solicitudes pendientes a tus proveedores disponibles.</p>
                    
                    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {solicitudes.length === 0 ? (
                            <p>No hay solicitudes registradas.</p>
                        ) : (
                            solicitudes.map(sol => (
                                <div key={sol.id_solicitud} style={{ background: '#f8fafc', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong>ID: {sol.id_solicitud} | Cliente: {sol.cliente_nombre}</strong>
                                        <span style={{ fontWeight: 'bold', color: sol.estatus === 'Pendiente' ? '#ea580c' : '#1e3a8a' }}>{sol.estatus}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        Ruta: {sol.origen.split(',')[0]} &rarr; {sol.destino.split(',')[0]} <br/>
                                        Fecha: {new Date(sol.fecha_servicio).toLocaleDateString('es-MX')}
                                    </p>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', padding: '0.4rem', background: '#f1f5f9', borderRadius: '4px' }}>
                                        <strong>Detalles del Cliente:</strong> {sol.observaciones}
                                        <div style={{ marginTop: '0.3rem', color: '#0f766e', fontWeight: 'bold' }}>
                                            🚗 Vehículo Solicitado: {sol.observaciones?.match(/Unidad:\s*([^,]+)/)?.[1] || 'No especificado'}
                                        </div>
                                    </div>
                                    
                                    {sol.estatus === 'Pendiente' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
                                            <select id={`prov-${sol.id_solicitud}`} style={{ marginBottom: 0, padding: '0.4rem' }}>
                                                <option value="">Seleccione un Proveedor...</option>
                                                {proveedores.map(p => (
                                                    <option key={p.id_usuario} value={p.id_usuario}>{p.nombre}</option>
                                                ))}
                                            </select>
                                            <button 
                                                className="btn btn-primary" 
                                                style={{ padding: '0.4rem 1rem' }}
                                                onClick={() => {
                                                    const select = document.getElementById(`prov-${sol.id_solicitud}`);
                                                    handleAsignar(sol.id_solicitud, select.value);
                                                }}
                                            >
                                                Asignar
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: '#10b981', margin: 0, fontWeight: '500' }}>
                                            Asignado a: {sol.proveedor_nombre}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
