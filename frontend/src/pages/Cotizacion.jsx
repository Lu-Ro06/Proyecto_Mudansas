import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '../components/Autocomplete';
import './Form.css';

const CIUDADES = [
  "Ciudad de México, CDMX, México",
  "Guadalajara, Jalisco, México",
  "Monterrey, Nuevo León, México",
  "Puebla, Puebla, México",
  "Querétaro, Querétaro, México",
  "Toluca, Estado de México, México"
];

const Cotizacion = () => {
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    distancia: '',
    unidad: 'Camioneta',
    pisos: '',
    objetos: '',
    fecha_servicio: ''
  });

  const [cotizacion, setCotizacion] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('clienteUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const calcularCotizacion = (e) => {
    e.preventDefault();
    let base = formData.unidad === 'Camión' ? 1500 : 800;
    let distCost = (Number(formData.distancia) || 10) * 15;
    let pisosCost = (Number(formData.pisos) || 0) * 200;
    let objCost = (Number(formData.objetos) || 10) * 50;

    let total = base + distCost + pisosCost + objCost;
    setCotizacion(total);
    setMessage('');
  };

  const confirmarSolicitud = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!formData.fecha_servicio) {
      setMessage('Por favor, seleccione una fecha de servicio.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: user.id,
          fecha_servicio: formData.fecha_servicio,
          origen: formData.origen,
          destino: formData.destino,
          observaciones: `Distancia: ${formData.distancia}km, Pisos: ${formData.pisos}, Objetos: ${formData.objetos}, Unidad: ${formData.unidad}, Cotización: $${cotizacion}`
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage('¡Solicitud creada exitosamente!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setMessage('Error al crear la solicitud: ' + data.message);
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '600px' }}>
      <h2 style={{borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)'}}>Cotización y Reserva de Servicio</h2>
      <div className="card">
        {message && <div style={{padding: '1rem', marginBottom: '1.5rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '6px'}}>{message}</div>}
        <form onSubmit={calcularCotizacion}>
          <label>Lugar de Origen</label>
          <Autocomplete 
            options={CIUDADES}
            name="origen"
            value={formData.origen}
            onChange={handleChange}
            placeholder="Escriba la ciudad o municipio..."
            required={true}
          />

          <label>Lugar de Destino</label>
          <Autocomplete 
            options={CIUDADES}
            name="destino"
            value={formData.destino}
            onChange={handleChange}
            placeholder="Escriba la ciudad o municipio..."
            required={true}
          />

          <label>Distancia aproximada (km)</label>
          <input name="distancia" type="number" onChange={handleChange} required />

          <label>Tipo de Unidad Requerida</label>
          <select name="unidad" onChange={handleChange}>
            <option value="Camioneta">Camioneta</option>
            <option value="Camión">Camión</option>
          </select>

          <label>Número de pisos (Origen/Destino)</label>
          <input name="pisos" type="number" onChange={handleChange} required />

          <label>Cantidad de objetos o muebles</label>
          <input name="objetos" type="number" onChange={handleChange} required />
          
          <label>Fecha de Servicio (Requerido para reservar)</label>
          <input name="fecha_servicio" type="date" onChange={handleChange} required />

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
            Generar Cotización
          </button>
        </form>

        {cotizacion !== null && (
          <div className="quote-result">
            <h3>Resultado de Cotización</h3>
            <p className="price">${cotizacion.toLocaleString('es-MX')} MXN</p>
            <p className="note">Nota: La cotización es únicamente estimada.</p>
            
            <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #bbf7d0'}}>
              {user ? (
                <button onClick={confirmarSolicitud} className="btn btn-accent" style={{width: '100%'}}>
                  Confirmar y Agendar Mudanza
                </button>
              ) : (
                <button onClick={() => navigate('/login')} className="btn" style={{width: '100%'}}>
                  Inicia Sesión para Agendar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cotizacion;
