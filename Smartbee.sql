-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS sistema_colmenas;
USE sistema_colmenas;

-- Tabla: colmena_ubicacion
CREATE TABLE colmena_ubicacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colmena_id INT NOT NULL,
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    descripcion TEXT,
    comuna VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: colmena
CREATE TABLE colmena (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    dueno VARCHAR(100)
);

-- Tabla: nodo_colmena
CREATE TABLE nodo_colmena (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colmena_id INT NOT NULL,
    nodo_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (colmena_id) REFERENCES colmena(id) ON DELETE CASCADE
);

-- Tabla: nodo_ubicacion
CREATE TABLE nodo_ubicacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nodo_id INT NOT NULL,
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    descripcion TEXT,
    comuna VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: nodo
CREATE TABLE nodo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL
);

-- Tabla: nodo_tipo
CREATE TABLE nodo_tipo (
    tipo VARCHAR(50) PRIMARY KEY,
    descripcion TEXT
);

-- Tabla: usuario
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL
);

-- Tabla: rol
CREATE TABLE rol (
    rol VARCHAR(50) PRIMARY KEY,
    descripcion TEXT
);

-- Tabla: mensaje
CREATE TABLE mensaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nodo_id INT NOT NULL,
    topico VARCHAR(100) NOT NULL,
    payload TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nodo_id) REFERENCES nodo(id) ON DELETE CASCADE
);

-- Agregar las claves foráneas restantes
ALTER TABLE colmena_ubicacion 
ADD FOREIGN KEY (colmena_id) REFERENCES colmena(id) ON DELETE CASCADE;

ALTER TABLE nodo_colmena 
ADD FOREIGN KEY (nodo_id) REFERENCES nodo(id) ON DELETE CASCADE;

ALTER TABLE nodo_ubicacion 
ADD FOREIGN KEY (nodo_id) REFERENCES nodo(id) ON DELETE CASCADE;

ALTER TABLE nodo 
ADD FOREIGN KEY (tipo) REFERENCES nodo_tipo(tipo) ON DELETE RESTRICT;

ALTER TABLE usuario 
ADD FOREIGN KEY (rol) REFERENCES rol(rol) ON DELETE RESTRICT;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_colmena_ubicacion_colmena_id ON colmena_ubicacion(colmena_id);
CREATE INDEX idx_colmena_ubicacion_fecha ON colmena_ubicacion(fecha);
CREATE INDEX idx_nodo_colmena_colmena_id ON nodo_colmena(colmena_id);
CREATE INDEX idx_nodo_colmena_nodo_id ON nodo_colmena(nodo_id);
CREATE INDEX idx_nodo_ubicacion_nodo_id ON nodo_ubicacion(nodo_id);
CREATE INDEX idx_nodo_ubicacion_fecha ON nodo_ubicacion(fecha);
CREATE INDEX idx_nodo_tipo ON nodo(tipo);
CREATE INDEX idx_usuario_rol ON usuario(rol);
CREATE INDEX idx_mensaje_nodo_id ON mensaje(nodo_id);
CREATE INDEX idx_mensaje_fecha ON mensaje(fecha);
CREATE INDEX idx_mensaje_topico ON mensaje(topico);

-- Datos de ejemplo para tablas de referencia
INSERT INTO rol (rol, descripcion) VALUES
('admin', 'Administrador del sistema'),
('usuario', 'Usuario estándar'),
('operador', 'Operador de colmenas');

INSERT INTO nodo_tipo (tipo, descripcion) VALUES
('sensor', 'Nodo sensor de monitoreo'),
('actuador', 'Nodo actuador de control'),
('gateway', 'Nodo gateway de comunicación');

-- Datos de ejemplo para las tablas principales
INSERT INTO colmena (descripcion, dueno) VALUES
('Colmena Principal A', 'Juan Pérez'),
('Colmena Secundaria B', 'María González'),
('Colmena Experimental C', 'Carlos Rodríguez');

INSERT INTO nodo (descripcion, tipo) VALUES
('Sensor de temperatura y humedad', 'sensor'),
('Sensor de peso', 'sensor'),
('Gateway principal', 'gateway');

INSERT INTO usuario (clave, nombre, apellido, rol) VALUES
('$2y$10$example_hash', 'Admin', 'Sistema', 'admin'),
('$2y$10$example_hash2', 'Juan', 'Pérez', 'usuario'),
('$2y$10$example_hash3', 'María', 'González', 'operador');