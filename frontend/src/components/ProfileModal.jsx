import React, { useState, useEffect } from 'react';

const ProfileModal = ({ user, onClose, onUpdate }) => {
  const isCliente = user.rol === 'Cliente' || !user.rol;
  const endpoint = isCliente ? `/api/cliente/${user.id}` : `/api/usuario_interno/${user.id}`;
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: ''
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000${endpoint}`);
        const data = await response.json();
        if (data.success) {
          setFormData({
            nombre: data.usuario.nombre || '',
            correo: data.usuario.correo || '',
            telefono: data.usuario.telefono || '',
            direccion: data.usuario.direccion || '',
            contrasena: data.usuario.contrasena || ''
          });
        } else {
          setMessage('Error al cargar datos del perfil');
        }
      } catch (error) {
        setMessage('Error de conexión');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [endpoint]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Perfil actualizado exitosamente.');
        onUpdate({ ...user, nombre: formData.nombre }); // update basic info in localStorage
        setTimeout(onClose, 1500);
      } else {
        setMessage('Error al actualizar: ' + data.message);
      }
    } catch (err) {
      setMessage('Error de conexión con el servidor.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
        >
          &times;
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Mi Perfil</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isEditing ? 'var(--primary-color)' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            title="Editar Perfil"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{isEditing ? 'Cancelar Edición' : 'Editar'}</span>
          </button>
        </div>
        
        {message && <div style={{padding: '0.8rem', marginBottom: '1rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px'}}>{message}</div>}
        
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <form onSubmit={handleSave}>
            <label>Nombre Completo</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={!isEditing} />
            
            {isCliente && (
              <>
                <label>Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required disabled={!isEditing} />
              </>
            )}

            <label>Correo Electrónico</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} required disabled={!isEditing} />

            {isCliente && (
              <>
                <label>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required disabled={!isEditing} />
              </>
            )}
            
            <label>Contraseña</label>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <input 
                    type={showPassword ? "text" : "password"} 
                    name="contrasena"
                    value={formData.contrasena} 
                    onChange={handleChange} 
                    required 
                    disabled={!isEditing}
                    style={{ width: '100%', paddingRight: '2.5rem', marginBottom: 0 }}
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
            
            <label>Rol (No editable)</label>
            <input type="text" value={user.rol || 'Cliente'} disabled style={{ backgroundColor: '#f1f5f9', color: '#94a3b8' }} />

            {isEditing && (
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Guardar Cambios</button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
