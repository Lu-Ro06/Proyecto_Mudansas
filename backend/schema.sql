CREATE DATABASE IF NOT EXISTS mudanzas_mi_hogar;
USE mudanzas_mi_hogar;

CREATE TABLE IF NOT EXISTS Cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    direccion TEXT NOT NULL,
    contrasena VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Solicitud_Mudanza (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_servicio DATE NOT NULL,
    origen TEXT NOT NULL,
    destino TEXT NOT NULL,
    observaciones TEXT,
    estatus ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Completada') DEFAULT 'Pendiente',
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE IF NOT EXISTS Vehiculo (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    placas VARCHAR(50) NOT NULL UNIQUE,
    capacidad VARCHAR(50) NOT NULL,
    disponibilidad BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Conductor (
    id_conductor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    licencia VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Asignacion (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT,
    id_vehiculo INT,
    id_conductor INT,
    FOREIGN KEY (id_solicitud) REFERENCES Solicitud_Mudanza(id_solicitud),
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo),
    FOREIGN KEY (id_conductor) REFERENCES Conductor(id_conductor)
);

CREATE TABLE IF NOT EXISTS Cotizacion (
    id_cotizacion INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    kilometros DECIMAL(10,2) NOT NULL,
    tipo_unidad VARCHAR(100) NOT NULL,
    pisos INT NOT NULL,
    costo_estimado DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE IF NOT EXISTS Usuario_Interno (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('Admin', 'Proveedor') NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un admin por defecto para poder crear otros
INSERT IGNORE INTO Usuario_Interno (nombre, correo, contrasena, rol) 
VALUES ('Super Admin', 'admin@mihogar.com', 'admin123', 'Admin');
