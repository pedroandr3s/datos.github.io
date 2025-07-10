
-- Tabla: rol (PK = rol)
CREATE TABLE rol (
    rol INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

-- Tabla: usuario (FK = rol)
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol INT,
    FOREIGN KEY (rol) REFERENCES rol(rol)
);

-- Tabla: colmena (FK = dueno → usuario)
CREATE TABLE colmena (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    dueno INT,
    FOREIGN KEY (dueno) REFERENCES usuario(id)
);

-- Tabla: colmena_ubicacion (FK = colmena_id)
CREATE TABLE colmena_ubicacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colmena_id INT,
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    descripcion TEXT,
    comuna VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (colmena_id) REFERENCES colmena(id)
);

-- Tabla: nodo_tipo (PK = tipo)
CREATE TABLE nodo_tipo (
    tipo INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

-- Tabla: nodo (FK = tipo → nodo_tipo)
CREATE TABLE nodo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    tipo INT,
    FOREIGN KEY (tipo) REFERENCES nodo_tipo(tipo)
);

-- Tabla: nodo_colmena (con fecha incluida)
CREATE TABLE nodo_colmena (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colmena_id INT,
    nodo_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (colmena_id) REFERENCES colmena(id),
    FOREIGN KEY (nodo_id) REFERENCES nodo(id)
);

-- Tabla: nodo_ubicacion (FK = nodo_id)
CREATE TABLE nodo_ubicacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nodo_id INT,
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    descripcion TEXT,
    comuna VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nodo_id) REFERENCES nodo(id)
);

-- Tabla: mensaje (FK = nodo_id)
CREATE TABLE mensaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nodo_id INT,
    topico VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nodo_id) REFERENCES nodo(id)
);

-- ===============================
-- INSERCIÓN DE DATOS ACTUALIZADA
-- ===============================

-- Tabla: rol
INSERT INTO rol (descripcion) VALUES
('Administrador'),
('Apicultor'),
('Investigador');

-- Tabla: usuario
INSERT INTO usuario (clave, nombre, apellido, rol) VALUES
('1234', 'Pedro', 'Vera', 1),
('abcd', 'Ana', 'González', 2),
('pass', 'Luis', 'Martínez', 3);

-- Tabla: colmena
INSERT INTO colmena (descripcion, dueno) VALUES
('Colmena en zona rural', 1),
('Colmena experimental', 2);

-- Tabla: colmena_ubicacion
INSERT INTO colmena_ubicacion (colmena_id, latitud, longitud, descripcion, comuna) VALUES
(1, -36.606111, -72.103611, 'Ubicada en predio agrícola', 'Chillán'),
(2, -36.820000, -73.044444, 'Ubicada en campus universitario', 'Concepción');

-- Tabla: nodo_tipo
INSERT INTO nodo_tipo (descripcion) VALUES
('Sensor de temperatura'),
('Sensor de humedad'),
('Controlador de ventilación');

-- Tabla: nodo
INSERT INTO nodo (descripcion, tipo) VALUES
('Sensor Temp A', 1),
('Sensor Hum B', 2),
('Control Ventilador C', 3);

-- Tabla: nodo_colmena (con fecha incluida)
INSERT INTO nodo_colmena (colmena_id, nodo_id, fecha) VALUES
(1, 1, '2025-07-10 10:00:00'),
(1, 2, '2025-07-10 10:05:00'),
(2, 3, '2025-07-10 11:00:00');

-- Tabla: nodo_ubicacion
INSERT INTO nodo_ubicacion (nodo_id, latitud, longitud, descripcion, comuna) VALUES
(1, -36.606000, -72.103600, 'Dentro de la colmena 1', 'Chillán'),
(2, -36.606050, -72.103620, 'Exterior colmena 1', 'Chillán'),
(3, -36.820050, -73.044400, 'Colmena 2, módulo de control', 'Concepción');

-- Tabla: mensaje
INSERT INTO mensaje (nodo_id, topico, payload) VALUES
(1, 'temperatura', '35.2°C'),
(2, 'humedad', '82%'),
(3, 'estado', 'Ventilador encendido');
