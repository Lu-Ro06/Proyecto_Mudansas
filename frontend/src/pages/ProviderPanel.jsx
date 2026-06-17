import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';
import AlertModal from '../components/AlertModal';
import './AdminPanel.css'; // Reusing styles

const ProviderPanel = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [solicitudes, setSolicitudes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [nuevoVehiculo, setNuevoVehiculo] = useState({ tipo: 'Camioneta', placas: '', capacidad: '' });
    const [vehiculoMessage, setVehiculoMessage] = useState('');
    
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
            if (parsedUser.rol !== 'Proveedor') {
                navigate('/admin/login');
            } else {
                setUser(parsedUser);
                fetchSolicitudes(parsedUser.id);
                fetchVehiculos(parsedUser.id);
            }
        }
    }, [navigate]);

    const fetchSolicitudes = async (providerId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/proveedor/${providerId}/solicitudes`);
            const data = await response.json();
            if (data.success) {
                setSolicitudes(data.solicitudes);
            }
        } catch (error) {
            console.error('Error fetching solicitudes', error);
        }
    };

    const fetchVehiculos = async (providerId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/proveedor/${providerId}/vehiculos`);
            const data = await response.json();
            if (data.success) {
                setVehiculos(data.vehiculos);
            }
        } catch (error) {
            console.error('Error fetching vehiculos', error);
        }
    };

    const handleAgregarVehiculo = async (e) => {
        e.preventDefault();
        setVehiculoMessage('');
        try {
            const response = await fetch(`http://localhost:5000/api/proveedor/${user.id}/vehiculos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoVehiculo)
            });
            const data = await response.json();
            if (data.success) {
                setVehiculoMessage('Vehículo registrado correctamente');
                setNuevoVehiculo({ tipo: 'Camioneta', placas: '', capacidad: '' });
                fetchVehiculos(user.id);
            } else {
                setVehiculoMessage(data.message || 'Error al registrar vehículo');
            }
        } catch (error) {
            setVehiculoMessage('Error de conexión');
        }
    };

    const handleEliminarVehiculo = async (id_vehiculo) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Vehículo',
            message: '¿Estás seguro de que deseas eliminar este vehículo de tu flotilla?',
            type: 'confirm',
            onCancel: closeAlert,
            onConfirm: async () => {
                closeAlert();
                try {
                    const response = await fetch(`http://localhost:5000/api/vehiculos/${id_vehiculo}`, {
                        method: 'DELETE'
                    });
                    const data = await response.json();
                    if (data.success) {
                        fetchVehiculos(user.id);
                    } else {
                        setTimeout(() => setModalConfig({
                            isOpen: true, title: 'Error', message: 'Error al eliminar vehículo: ' + data.message, type: 'alert', onConfirm: closeAlert
                        }), 300);
                    }
                } catch (error) {
                    setTimeout(() => setModalConfig({
                        isOpen: true, title: 'Error', message: 'Error de conexión con el servidor.', type: 'alert', onConfirm: closeAlert
                    }), 300);
                }
            }
        });
    };

    const handleCompletarSolicitud = async (id_solicitud) => {
        setModalConfig({
            isOpen: true,
            title: 'Completar Servicio',
            message: '¿Confirmas que el servicio de mudanza ha sido completado exitosamente?',
            type: 'confirm',
            onCancel: closeAlert,
            onConfirm: async () => {
                closeAlert();
                try {
                    const response = await fetch(`http://localhost:5000/api/solicitudes/${id_solicitud}/completar`, {
                        method: 'PUT'
                    });
                    const data = await response.json();
                    if (data.success) {
                        fetchSolicitudes(user.id);
                    } else {
                        setTimeout(() => setModalConfig({
                            isOpen: true, title: 'Error', message: 'Error al completar la solicitud: ' + data.message, type: 'alert', onConfirm: closeAlert
                        }), 300);
                    }
                } catch (error) {
                    setTimeout(() => setModalConfig({
                        isOpen: true, title: 'Error', message: 'Error de conexión con el servidor.', type: 'alert', onConfirm: closeAlert
                    }), 300);
                }
            }
        });
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
                <h2>Panel de Proveedor</h2>
                <div className="user-info">
                    <span>Bienvenido, {user.nombre}</span>
                    <button onClick={() => setShowProfile(true)} className="btn btn-outline" style={{padding: '0.4rem 0.8rem'}}>Mi Perfil</button>
                    <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
                </div>
            </header>
            
            <div className="panel-content">
                <div className="card">
                    <h3>Solicitudes de Servicio Asignadas</h3>
                    <p style={{marginBottom: '1rem', color: 'var(--text-color-muted)'}}>Aquí se muestran las mudanzas que te han sido asignadas por el administrador.</p>
                    
                    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {solicitudes.length === 0 ? (
                            <p>No tienes ninguna solicitud asignada en este momento.</p>
                        ) : (
                            solicitudes.map(sol => (
                                <div key={sol.id_solicitud} style={{ background: '#f8fafc', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong>Ruta: {sol.origen.split(',')[0]} &rarr; {sol.destino.split(',')[0]}</strong>
                                        <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{sol.estatus}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
                                        <strong>Fecha agendada:</strong> {new Date(sol.fecha_servicio).toLocaleDateString('es-MX')}
                                    </p>
                                    <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem', padding: '0.5rem', background: '#e2e8f0', borderRadius: '4px' }}>
                                        <strong>Detalles del Cliente:</strong><br/>
                                        Nombre: {sol.cliente_nombre}<br/>
                                        Teléfono: {sol.cliente_telefono}<br/>
                                        Dirección: {sol.cliente_direccion}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#475569', padding: '0.5rem', background: '#fef3c7', borderRadius: '4px' }}>
                                        <strong>Requerimientos de la Mudanza:</strong><br/>
                                        {sol.observaciones}
                                        <br/>
                                        <strong style={{color: '#d97706', marginTop: '0.5rem', display: 'inline-block'}}>
                                            🚗 Carro seleccionado: {sol.observaciones?.match(/Unidad:\s*([^,]+)/)?.[1] || 'No especificado'}
                                        </strong>
                                    </div>
                                    
                                    {sol.estatus !== 'Completada' && (
                                        <button 
                                            onClick={() => handleCompletarSolicitud(sol.id_solicitud)}
                                            className="btn btn-primary" 
                                            style={{ marginTop: '1rem', width: '100%', background: '#10b981', borderColor: '#10b981' }}
                                        >
                                            Marcar como Terminada
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                <div className="card">
                    <h3>Mis Vehículos</h3>
                    <p style={{marginBottom: '1.5rem', color: 'var(--text-color-muted)'}}>Registra los vehículos que tienes disponibles para realizar los servicios.</p>
                    
                    {vehiculoMessage && <div style={{padding: '0.8rem', marginBottom: '1rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px'}}>{vehiculoMessage}</div>}
                    
                    <form onSubmit={handleAgregarVehiculo} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Tipo de Unidad</label>
                            <select value={nuevoVehiculo.tipo} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, tipo: e.target.value})} style={{ marginBottom: 0 }}>
                                <option value="Camioneta">Camioneta</option>
                                <option value="Camión">Camión</option>
                            </select>
                        </div>
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Placas</label>
                            <input type="text" value={nuevoVehiculo.placas} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, placas: e.target.value})} placeholder="Ej: ABC-1234" required style={{ marginBottom: 0 }} />
                        </div>
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Capacidad (kg)</label>
                            <input type="text" value={nuevoVehiculo.capacidad} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, capacidad: e.target.value})} placeholder="Ej: 3500" required style={{ marginBottom: 0 }} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 1.5rem' }}>Añadir</button>
                    </form>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {vehiculos.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No tienes vehículos registrados.</p>
                        ) : (
                            vehiculos.map(v => (
                                <div key={v.id_vehiculo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '0.5rem' }}>
                                    <div>
                                        <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{v.tipo === 'Camión' ? '🚚' : '🚐'} {v.tipo}</strong>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', marginTop: '0.2rem' }}>Placas: {v.placas} | Capacidad: {v.capacidad}kg</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ padding: '0.3rem 0.8rem', background: v.disponibilidad ? '#dcfce7' : '#fee2e2', color: v.disponibilidad ? '#15803d' : '#b91c1c', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                            {v.disponibilidad ? 'Disponible' : 'Ocupado'}
                                        </span>
                                        <button 
                                            onClick={() => handleEliminarVehiculo(v.id_vehiculo)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem', padding: '0.2rem' }}
                                            title="Eliminar vehículo"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderPanel;
