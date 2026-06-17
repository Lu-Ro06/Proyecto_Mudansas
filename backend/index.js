require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mudanzas_mi_hogar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Basic route to check if API is running
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Endpoint de Login Unificado
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        // Primero verificamos si es un usuario interno (Admin o Proveedor)
        const [internalRows] = await pool.query('SELECT * FROM Usuario_Interno WHERE correo = ? AND contrasena = ?', [correo, contrasena]);
        if (internalRows.length > 0) {
            return res.json({ 
                success: true, 
                usuario: { id: internalRows[0].id_usuario, nombre: internalRows[0].nombre, rol: internalRows[0].rol } 
            });
        }
        
        // Si no, verificamos si es un cliente
        const [clientRows] = await pool.query('SELECT * FROM Cliente WHERE correo = ? AND contrasena = ?', [correo, contrasena]);
        if (clientRows.length > 0) {
            return res.json({ 
                success: true, 
                usuario: { id: clientRows[0].id_cliente, nombre: clientRows[0].nombre, rol: 'Cliente' } 
            });
        }

        // Si no se encuentra en ninguna de las dos tablas
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint para crear nuevos administradores o proveedores (Solo Admin debería hacerlo en la UI)
app.post('/api/admin/create_user', async (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Usuario_Interno (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
            [nombre, correo, contrasena, rol]
        );
        res.json({ success: true, id_usuario: result.insertId, message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint para registrar clientes nuevos
app.post('/api/register', async (req, res) => {
    const { nombre, telefono, correo, direccion, contrasena } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Cliente (nombre, telefono, correo, direccion, contrasena) VALUES (?, ?, ?, ?, ?)',
            [nombre, telefono, correo, direccion, contrasena]
        );
        res.json({ success: true, id_cliente: result.insertId, message: 'Registro exitoso' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// Endpoint para obtener solicitudes de un cliente
app.get('/api/cliente/:id/solicitudes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Solicitud_Mudanza WHERE id_cliente = ? ORDER BY fecha_solicitud DESC', [req.params.id]);
        res.json({ success: true, solicitudes: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint para crear una solicitud de mudanza
app.post('/api/solicitudes', async (req, res) => {
    const { id_cliente, fecha_servicio, origen, destino, observaciones } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Solicitud_Mudanza (id_cliente, fecha_servicio, origen, destino, observaciones) VALUES (?, ?, ?, ?, ?)',
            [id_cliente, fecha_servicio, origen, destino, observaciones]
        );
        res.json({ success: true, id_solicitud: result.insertId, message: 'Solicitud creada con éxito' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Obtener todos los proveedores
app.get('/api/admin/proveedores', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_usuario, nombre, correo FROM Usuario_Interno WHERE rol = "Proveedor"');
        res.json({ success: true, proveedores: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Obtener todas las solicitudes
app.get('/api/admin/solicitudes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, c.nombre as cliente_nombre, u.nombre as proveedor_nombre 
            FROM Solicitud_Mudanza s 
            LEFT JOIN Cliente c ON s.id_cliente = c.id_cliente 
            LEFT JOIN Usuario_Interno u ON s.id_proveedor = u.id_usuario 
            ORDER BY s.fecha_solicitud DESC
        `);
        res.json({ success: true, solicitudes: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Asignar proveedor a solicitud
app.put('/api/admin/solicitudes/:id/asignar', async (req, res) => {
    const { id_proveedor } = req.body;
    try {
        await pool.query(
            'UPDATE Solicitud_Mudanza SET id_proveedor = ?, estatus = "Aprobada" WHERE id_solicitud = ?',
            [id_proveedor, req.params.id]
        );
        res.json({ success: true, message: 'Proveedor asignado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener perfil Cliente
app.get('/api/cliente/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Cliente WHERE id_cliente = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json({ success: true, usuario: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener perfil Usuario Interno (Admin/Proveedor)
app.get('/api/usuario_interno/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Usuario_Interno WHERE id_usuario = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json({ success: true, usuario: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Editar perfil Cliente
app.put('/api/cliente/:id', async (req, res) => {
    const { nombre, telefono, correo, direccion, contrasena } = req.body;
    try {
        await pool.query(
            'UPDATE Cliente SET nombre = ?, telefono = ?, correo = ?, direccion = ?, contrasena = ? WHERE id_cliente = ?',
            [nombre, telefono, correo, direccion, contrasena, req.params.id]
        );
        res.json({ success: true, message: 'Perfil actualizado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Editar perfil Usuario Interno (Admin/Proveedor)
app.put('/api/usuario_interno/:id', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    try {
        await pool.query(
            'UPDATE Usuario_Interno SET nombre = ?, correo = ?, contrasena = ? WHERE id_usuario = ?',
            [nombre, correo, contrasena, req.params.id]
        );
        res.json({ success: true, message: 'Perfil actualizado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Proveedor: Obtener solicitudes asignadas
app.get('/api/proveedor/:id/solicitudes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, c.direccion as cliente_direccion 
            FROM Solicitud_Mudanza s 
            JOIN Cliente c ON s.id_cliente = c.id_cliente 
            WHERE s.id_proveedor = ? 
            ORDER BY s.fecha_solicitud DESC
        `, [req.params.id]);
        res.json({ success: true, solicitudes: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Proveedor: Obtener vehículos del proveedor
app.get('/api/proveedor/:id/vehiculos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Vehiculo WHERE id_proveedor = ?', [req.params.id]);
        res.json({ success: true, vehiculos: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Proveedor: Agregar vehículo
app.post('/api/proveedor/:id/vehiculos', async (req, res) => {
    const { tipo, placas, capacidad } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Vehiculo (tipo, placas, capacidad, id_proveedor) VALUES (?, ?, ?, ?)',
            [tipo, placas, capacidad, req.params.id]
        );
        res.json({ success: true, id_vehiculo: result.insertId, message: 'Vehículo agregado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Las placas ya están registradas' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// Proveedor: Eliminar vehículo
app.delete('/api/vehiculos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Vehiculo WHERE id_vehiculo = ?', [req.params.id]);
        res.json({ success: true, message: 'Vehículo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Proveedor: Marcar solicitud como Completada
app.put('/api/solicitudes/:id/completar', async (req, res) => {
    try {
        await pool.query('UPDATE Solicitud_Mudanza SET estatus = "Completada" WHERE id_solicitud = ?', [req.params.id]);
        res.json({ success: true, message: 'Solicitud marcada como completada' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
