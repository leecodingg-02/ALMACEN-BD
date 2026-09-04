
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS bd_almacen_1;
CREATE DATABASE bd_almacen_1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd_almacen_1;
SET FOREIGN_KEY_CHECKS = 1;


-- NIVEL 0 · Catálogos independientes (sin FKs salientess)

CREATE TABLE rol (
    id_rol INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NULL,
    color VARCHAR(7) NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
);

CREATE TABLE categoria (
    id_categoria INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
);

CREATE TABLE marca (
    id_marca INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    pais VARCHAR(60) NULL,
    contacto VARCHAR(100) NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
);

CREATE TABLE proveedor (
    id_proveedor INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    razon_social VARCHAR(120) NOT NULL,
    nit VARCHAR(20) NOT NULL UNIQUE,
    nombre_contacto VARCHAR(100) NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(100) NULL,
    direccion VARCHAR(150) NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- NIVEL 1 · Dependen solo de catálogos del nivel 0

CREATE TABLE sucursal (
    id_suc INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    departamento VARCHAR(60) NULL,
    ciudad VARCHAR(60) NULL,
    direccion VARCHAR(120) NOT NULL,
    telefono VARCHAR(20) NULL,
    id_gerente INT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
);

-- garantia_dias reemplaza a la extinta tabla garantia.
CREATE TABLE producto (
    id_pro INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    descripcion VARCHAR(500) NULL,
    id_categoria INT NOT NULL,
    id_marca INT NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    imagen_url VARCHAR(255) NULL,
    garantia_dias INT NOT NULL DEFAULT 0,
    estado ENUM('Activo','Agotado','Suspendido') NOT NULL DEFAULT 'Activo',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    CONSTRAINT fk_producto_marca
        FOREIGN KEY (id_marca) REFERENCES marca(id_marca),
    CONSTRAINT chk_producto_precio CHECK (precio >= 0)
);


-- NIVEL 2 · Usuario (con preferencias fusionadas) y ubicaciones


CREATE TABLE usuario (
    id_usu INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tipo_doc VARCHAR(10) NOT NULL DEFAULT 'C.C',
    num_ident VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(60) NOT NULL,
    apellido VARCHAR(60) NOT NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    id_suc INT NULL,
    -- Antes en preferencia_usuario:
    alto_contraste BOOLEAN NOT NULL DEFAULT FALSE,
    tamano_fuente ENUM('normal','grande','extra-grande') NOT NULL DEFAULT 'normal',
    notificaciones_email BOOLEAN NOT NULL DEFAULT TRUE,
    estado ENUM('Activo','Inactivo','Suspendido') NOT NULL DEFAULT 'Activo',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    CONSTRAINT fk_usuario_sucursal
        FOREIGN KEY (id_suc) REFERENCES sucursal(id_suc)
);

-- Rompe la dependencia circular sucursal <-> usuario.
ALTER TABLE sucursal
    ADD CONSTRAINT fk_sucursal_gerente
        FOREIGN KEY (id_gerente) REFERENCES usuario(id_usu);

-- Direcciones de envío del cliente. departamento/ciudad como texto.
CREATE TABLE ubicacion (
    id_ubi INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_usu INT NOT NULL,
    departamento VARCHAR(60) NULL,
    ciudad VARCHAR(60) NULL,
    direccion VARCHAR(100) NOT NULL,
    complemento VARCHAR(100) NULL,
    barrio VARCHAR(60) NULL,
    codigo_postal VARCHAR(10) NULL,
    referencia VARCHAR(150) NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_ubicacion_usuario
        FOREIGN KEY (id_usu) REFERENCES usuario(id_usu)
        ON DELETE CASCADE
);


-- NIVEL 3 · Inventario, compras y ventas (cabecera)

CREATE TABLE inventario (
    id_inventario INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_pro INT NOT NULL,
    id_suc INT NOT NULL,
    ubicacion_fisica VARCHAR(60) NULL COMMENT 'Ej: Estante A-12, Bodega Pinturas B',
    cantidad INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_inventario_producto_sucursal UNIQUE (id_pro, id_suc),
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (id_pro) REFERENCES producto(id_pro),
    CONSTRAINT fk_inventario_sucursal
        FOREIGN KEY (id_suc) REFERENCES sucursal(id_suc),
    CONSTRAINT chk_inventario_cantidad CHECK (cantidad >= 0),
    CONSTRAINT chk_inventario_minimo CHECK (stock_minimo >= 0)
);



CREATE TABLE compra (
    id_compra INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_proveedor INT NOT NULL,
    id_suc INT NOT NULL,
    id_usuario INT NULL COMMENT 'Usuario del panel admin que registró la compra',
    fecha_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente','Aprobada','Recibida','Cancelada') NOT NULL DEFAULT 'Pendiente',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    numero_factura VARCHAR(40) NULL UNIQUE,
    estado_pago ENUM('En Revision','Pendiente','Pagada','Anulada') NOT NULL DEFAULT 'Pendiente',
    transportadora VARCHAR(80) NULL,
    numero_guia VARCHAR(60) NULL,
    fecha_entrega DATE NULL,
    CONSTRAINT fk_compra_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor),
    CONSTRAINT fk_compra_sucursal
        FOREIGN KEY (id_suc) REFERENCES sucursal(id_suc),
    CONSTRAINT fk_compra_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usu)
);

-- Fusiona: venta + factura_venta.
CREATE TABLE venta (
    id_venta INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_cli INT NULL,
    id_suc INT NOT NULL,
    fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente','Completada','Cancelada','Reembolsada') NOT NULL DEFAULT 'Pendiente',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    numero_factura VARCHAR(40) NULL UNIQUE,
    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (id_cli) REFERENCES usuario(id_usu),
    CONSTRAINT fk_venta_sucursal
        FOREIGN KEY (id_suc) REFERENCES sucursal(id_suc)
);

CREATE TABLE favorito (
    id_usu INT NOT NULL,
    id_pro INT NOT NULL,
    fecha_agregado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usu, id_pro),
    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (id_usu) REFERENCES usuario(id_usu)
        ON DELETE CASCADE,
    CONSTRAINT fk_favorito_producto
        FOREIGN KEY (id_pro) REFERENCES producto(id_pro)
        ON DELETE CASCADE
);


-- NIVEL 4 · Detalle de compras/ventas, pagos, envío y devoluciones


CREATE TABLE detalle_compra (
    id_detcompra INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_compra INT NOT NULL,
    id_pro INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_detalle_compra_compra
        FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_compra_producto
        FOREIGN KEY (id_pro) REFERENCES producto(id_pro),
    CONSTRAINT chk_detalle_compra_cantidad CHECK (cantidad > 0)
);

CREATE TABLE detalle_venta (
    id_detventa INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_venta INT NOT NULL,
    id_pro INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_detalle_venta_venta
        FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_venta_producto
        FOREIGN KEY (id_pro) REFERENCES producto(id_pro),
    CONSTRAINT chk_detalle_venta_cantidad CHECK (cantidad > 0)
);

CREATE TABLE pago (
    id_pago INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_venta INT NOT NULL,
    metodo ENUM('Efectivo','Tarjeta','PSE','Nequi','Daviplata','Transferencia') NOT NULL,
    proveedor_pago VARCHAR(50) NULL,
    referencia_externa VARCHAR(100) NULL,
    monto DECIMAL(12,2) NOT NULL,
    estado ENUM('Pendiente','Aprobado','Rechazado','Reembolsado','Anulado')
        NOT NULL DEFAULT 'Pendiente',
    fecha_intento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion DATETIME NULL,
    CONSTRAINT fk_pago_venta
        FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    CONSTRAINT chk_pago_monto CHECK (monto >= 0)
);


CREATE TABLE envio (
    id_envio INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_venta INT NOT NULL UNIQUE,
    transportadora VARCHAR(80) NULL,
    numero_guia VARCHAR(60) NULL UNIQUE,
    fecha_despacho DATETIME NULL,
    fecha_estimada DATE NULL,
    fecha_entrega DATETIME NULL,
    costo_envio DECIMAL(12,2) NOT NULL DEFAULT 0,
    cantidad_bultos INT NOT NULL DEFAULT 1,
    estado ENUM('Preparando','En Transito','Entregado','Devuelto','Cancelado')
        NOT NULL DEFAULT 'Preparando',
    observacion VARCHAR(255) NULL,
    CONSTRAINT fk_envio_venta
        FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    CONSTRAINT chk_envio_bultos CHECK (cantidad_bultos > 0)
);


CREATE TABLE devolucion (
    id_devolucion INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_venta INT NOT NULL,
    id_usu INT NOT NULL,
    id_pro INT NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    condicion_producto VARCHAR(60) NULL,
    estado ENUM('Solicitada','Aprobada','Rechazada','Recibida','Reembolsada')
        NOT NULL DEFAULT 'Solicitada',
    fecha_solicitud DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME NULL,
    valor_reembolso DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_devolucion_venta
        FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    CONSTRAINT fk_devolucion_usuario
        FOREIGN KEY (id_usu) REFERENCES usuario(id_usu),
    CONSTRAINT fk_devolucion_producto
        FOREIGN KEY (id_pro) REFERENCES producto(id_pro),
    CONSTRAINT chk_devolucion_cantidad CHECK (cantidad > 0)
);


-- NIVEL 5 · Bitácora de inventario


CREATE TABLE movimiento_inventario (
    id_movimiento INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_pro INT NOT NULL,
    id_suc INT NOT NULL,
    tipo_movimiento ENUM('Compra','Venta','Ajuste','Devolucion','Traslado')
        NOT NULL,
    cantidad INT NOT NULL,
    referencia_tipo VARCHAR(30) NULL,
    referencia_id INT NULL,
    id_usuario INT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion VARCHAR(255) NULL,
    CONSTRAINT fk_movimiento_producto
        FOREIGN KEY (id_pro) REFERENCES producto(id_pro),
    CONSTRAINT fk_movimiento_sucursal
        FOREIGN KEY (id_suc) REFERENCES sucursal(id_suc),
    CONSTRAINT fk_movimiento_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usu),
    CONSTRAINT chk_movimiento_cantidad CHECK (cantidad > 0)
);


-- ÍNDICES para consultas frecuentes del panel administrativo


CREATE INDEX idx_venta_fecha_estado ON venta (fecha_venta, estado);
CREATE INDEX idx_compra_fecha_estado ON compra (fecha_compra, estado);
CREATE INDEX idx_movimiento_inventario_producto_sucursal
    ON movimiento_inventario (id_pro, id_suc, fecha);
CREATE INDEX idx_producto_categoria ON producto (id_categoria);
CREATE INDEX idx_producto_marca ON producto (id_marca);
CREATE INDEX idx_usuario_rol ON usuario (id_rol);
CREATE INDEX idx_usuario_sucursal ON usuario (id_suc);
CREATE INDEX idx_ubicacion_usuario ON ubicacion (id_usu);




-- rol (AdminRoles.jsx + roles de tienda usados por usuario.js)

INSERT INTO rol (nombre, descripcion, color, estado) VALUES
    ('Administrador', 'Acceso total al sistema', '#FFC107', 'Activo'),
    ('Cliente', 'Usuario comprador de la tienda', '#4CAF50', 'Activo');

-- categoria (AdminCategorias.jsx)

INSERT INTO categoria (nombre, descripcion, estado) VALUES
    ('Herramientas', 'Herramientas manuales y eléctricas', 'Activo'),
    ('Muebles', 'Muebles para hogar y oficina', 'Activo'),
    ('Decoración', 'Artículos decorativos para el hogar', 'Activo'),
    ('Iluminación', 'Lámparas, bombillas y accesorios', 'Activo'),
    ('Baño y Cocina', 'Accesorios para baño y cocina', 'Activo'),
    ('Jardín', 'Plantas y artículos de jardinería', 'Inactivo'); -- mock: 'Suspendido'

-- marca (AdminMarcas.jsx + ArtDeco y placeholder requeridas por producto)

INSERT INTO marca (nombre, pais, contacto, estado) VALUES
    ('DeWalt', 'EE.UU.', 'ventas@dewalt.co', 'Activo'),
    ('Bosch', 'Alemania', 'bosch@bosch.co', 'Activo'),
    ('HomeStyle', 'Colombia', 'info@homestyleco.com', 'Activo'),
    ('GreenHome', 'Colombia', 'verde@greenhome.co', 'Activo'),
    ('LumEx', 'México', 'lumex@lumex.mx', 'Inactivo'), -- mock: 'Suspendido'
    ('ErgoWork', 'España', 'ergo@ergowork.es', 'Activo'),
    ('ArtDeco', NULL, NULL, 'Activo'), -- usada por AdminProductos.jsx, faltaba en AdminMarcas.jsx
    ('Sin Marca Registrada', NULL, NULL, 'Activo'); -- placeholder: el catálogo público no trae marca


-- proveedor (nombres reales de AdminCompras.jsx; NIT/contacto = FICT
INSERT INTO proveedor (razon_social, nit, nombre_contacto, telefono, correo, direccion, estado) VALUES
    ('DeWalt Colombia', '900000001-1', NULL, NULL, NULL, NULL, 'Activo'),
    ('Bosch Distribuidora', '900000002-1', NULL, NULL, NULL, NULL, 'Activo'),
    ('HomeStyle S.A.S', '900000003-1', NULL, NULL, NULL, NULL, 'Activo'),
    ('LumEx México', '900000004-1', NULL, NULL, NULL, NULL, 'Activo'),
    ('GreenHome', '900000005-1', NULL, NULL, NULL, NULL, 'Activo');
-- NIT arriba son FICTICIOS (el mock de AdminCompras.jsx solo trae el nombre del proveedor).


-- sucursal (AdminSucursales.jsx; departamento inferido por ciudad real)


INSERT INTO sucursal (nombre, departamento, ciudad, direccion, telefono, estado) VALUES
    ('Sede Principal', 'Bogotá D.C.', 'Bogotá', 'Cra 15 # 93-75', '601-234-5678', 'Activo'),
    ('Sucursal Norte', 'Antioquia', 'Medellín', 'Calle 10 # 43-22', '604-567-8901', 'Activo'),
    ('Sucursal Sur', 'Valle del Cauca', 'Cali', 'Av. 6N # 23-45', '602-345-6789', 'Activo'),
    ('Sucursal Oriente', 'Santander', 'Bucaramanga', 'Calle 36 # 12-08', '607-456-7890', 'Inactivo'); -- mock: 'Suspendido'

-- ============================================================
-- usuario · staff (AdminUsuarios.jsx). num_ident/contrasena_hash = PLACEHOLDER.
-- ============================================================
INSERT INTO usuario (tipo_doc, num_ident, nombre, apellido, correo, contrasena_hash, id_rol, id_suc, estado, fecha_registro) VALUES
    ('C.C', 'PLACEHOLDER-001', 'Carlos', 'Rodríguez', 'carlos@email.com', '$2y$10$PLACEHOLDER_HASH_CAMBIAR_EN_PRODUCCION',
        (SELECT id_rol FROM rol WHERE nombre = 'Administrador'),
        (SELECT id_suc FROM sucursal WHERE nombre = 'Sede Principal'), 'Activo', '2024-01-15');

INSERT INTO usuario (tipo_doc, num_ident, nombre, apellido, telefono, correo, contrasena_hash, id_rol, id_suc, estado) VALUES
    ('C.C', '1020304050', 'Juan', 'Pérez', '3001234567', 'juan.perez@almacen.com',
        '$2y$10$PLACEHOLDER_HASH_CAMBIAR_EN_PRODUCCION',
        (SELECT id_rol FROM rol WHERE nombre = 'Cliente'), NULL, 'Activo');


INSERT INTO ubicacion (id_usu, departamento, ciudad, direccion, es_principal) VALUES
    ((SELECT id_usu FROM usuario WHERE correo = 'juan.perez@almacen.com'), 'Bogotá D.C.', 'Bogotá', 'Carrera 7 # 45 - 20, Apto 502', TRUE),
    ((SELECT id_usu FROM usuario WHERE correo = 'juan.perez@almacen.com'), 'Antioquia', 'Medellín', 'Calle 10 # 30 - 15, El Poblado', FALSE);



INSERT INTO producto (nombre, id_categoria, id_marca, precio, garantia_dias, estado) VALUES
    ('Taladro Inalámbrico 20V', (SELECT id_categoria FROM categoria WHERE nombre='Herramientas'), (SELECT id_marca FROM marca WHERE nombre='DeWalt'), 299900, 0, 'Activo'),
    ('Sofá Modular 3 Puestos Tela Premium', (SELECT id_categoria FROM categoria WHERE nombre='Muebles'), (SELECT id_marca FROM marca WHERE nombre='HomeStyle'), 1299900, 0, 'Activo'),
    ('Lámpara Colgante Minimalista Negra', (SELECT id_categoria FROM categoria WHERE nombre='Iluminación'), (SELECT id_marca FROM marca WHERE nombre='LumEx'), 159900, 0, 'Activo'),
    ('Estantería Industrial 5 Niveles', (SELECT id_categoria FROM categoria WHERE nombre='Muebles'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 219900, 0, 'Activo'),
    ('Mesa de Centro Industrial', (SELECT id_categoria FROM categoria WHERE nombre='Muebles'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 189900, 0, 'Activo'),
    ('Silla Nórdica Gris', (SELECT id_categoria FROM categoria WHERE nombre='Muebles'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 145000, 0, 'Activo'),
    ('Lámpara de Pie Cromo', (SELECT id_categoria FROM categoria WHERE nombre='Iluminación'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 210000, 0, 'Activo'),
    ('Set de Herramientas 50 pzas', (SELECT id_categoria FROM categoria WHERE nombre='Herramientas'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 95900, 365, 'Activo'),
    ('Espejo Decorativo Redondo', (SELECT id_categoria FROM categoria WHERE nombre='Decoración'), (SELECT id_marca FROM marca WHERE nombre='ArtDeco'), 120000, 0, 'Activo'),
    ('Cuadro Minimalista Botánico', (SELECT id_categoria FROM categoria WHERE nombre='Decoración'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 85000, 0, 'Activo'),
    ('Sierra Circular 1500W', (SELECT id_categoria FROM categoria WHERE nombre='Herramientas'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 345000, 0, 'Activo'),
    ('Foco Inteligente LED RGB', (SELECT id_categoria FROM categoria WHERE nombre='Iluminación'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 45000, 0, 'Activo'),
    ('Escritorio Minimalista Blanco', (SELECT id_categoria FROM categoria WHERE nombre='Muebles'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 280000, 0, 'Activo'),
    ('Maceta de Cerámica Nórdica', (SELECT id_categoria FROM categoria WHERE nombre='Decoración'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 35000, 0, 'Activo'),
    ('Martillo de Uña Curva', (SELECT id_categoria FROM categoria WHERE nombre='Herramientas'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 25000, 1095, 'Activo'),
    ('Lámpara de Escritorio Ajustable', (SELECT id_categoria FROM categoria WHERE nombre='Iluminación'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 95000, 0, 'Activo'),
    ('Silla de Oficina Ergonómica', (SELECT id_categoria FROM categoria WHERE nombre='Muebles'), (SELECT id_marca FROM marca WHERE nombre='ErgoWork'), 450000, 0, 'Agotado'), -- AdminInventario.jsx: cantidad=0
    ('Reloj de Pared Vintage', (SELECT id_categoria FROM categoria WHERE nombre='Decoración'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 110000, 0, 'Activo'),
    ('Caja de Herramientas Metálica', (SELECT id_categoria FROM categoria WHERE nombre='Herramientas'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 135000, 0, 'Activo'),
    ('Mueble para TV Moderno', (SELECT id_categoria FROM categoria WHERE nombre='Muebles'), (SELECT id_marca FROM marca WHERE nombre='Sin Marca Registrada'), 320000, 0, 'Activo');


-- favorito (usuario.js · FAVORITOS_DEFAULT = [1, 2] de Juan Pérez)

INSERT INTO favorito (id_usu, id_pro) VALUES
    ((SELECT id_usu FROM usuario WHERE correo = 'juan.perez@almacen.com'), 1), -- Taladro Inalámbrico 20V
    ((SELECT id_usu FROM usuario WHERE correo = 'juan.perez@almacen.com'), 2); -- Sofá Modular 3 Puestos




INSERT INTO inventario (id_pro, id_suc, ubicacion_fisica, cantidad, stock_minimo) VALUES
    ((SELECT id_pro FROM producto WHERE nombre='Taladro Inalámbrico 20V'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), 'Estante A-12', 45, 10),
    ((SELECT id_pro FROM producto WHERE nombre='Sofá Modular 3 Puestos Tela Premium'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), 'Zona Muebles B', 12, 5),
    ((SELECT id_pro FROM producto WHERE nombre='Lámpara Colgante Minimalista Negra'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), 'Estante C-04', 4, 10),
    ((SELECT id_pro FROM producto WHERE nombre='Espejo Decorativo Redondo'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), 'Pasillo Decora 1', 18, 5), -- mock decía 70cm en specs vs "60cm" en AdminInventario: mismo producto, medida inconsistente entre mocks
    ((SELECT id_pro FROM producto WHERE nombre='Sierra Circular 1500W'), (SELECT id_suc FROM sucursal WHERE nombre='Sucursal Norte'), 'Estante Herram-02', 3, 8), -- mock decía "1400W" vs "1500W" del catálogo: mismo producto, potencia inconsistente entre mocks
    ((SELECT id_pro FROM producto WHERE nombre='Silla de Oficina Ergonómica'), (SELECT id_suc FROM sucursal WHERE nombre='Sucursal Sur'), 'Zona Oficina', 0, 5),
    ((SELECT id_pro FROM producto WHERE nombre='Foco Inteligente LED RGB'), (SELECT id_suc FROM sucursal WHERE nombre='Sucursal Sur'), 'Estante Luces A', 6, 15);




INSERT INTO compra (id_proveedor, id_suc, fecha_compra, estado, subtotal, impuesto, total, numero_factura, estado_pago) VALUES
    ((SELECT id_proveedor FROM proveedor WHERE razon_social='DeWalt Colombia'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), '2026-09-01', 'Recibida', 1850000, 0, 1850000, 'FC-0024', 'Pagada'),
    ((SELECT id_proveedor FROM proveedor WHERE razon_social='Bosch Distribuidora'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), '2026-08-28', 'Aprobada', 3200000, 0, 3200000, 'FC-0023', 'Pendiente'), -- mock: 'En Tránsito'
    ((SELECT id_proveedor FROM proveedor WHERE razon_social='HomeStyle S.A.S'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), '2026-08-25', 'Recibida', 5400000, 0, 5400000, 'FC-0022', 'Pagada'),
    ((SELECT id_proveedor FROM proveedor WHERE razon_social='LumEx México'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), '2026-08-20', 'Pendiente', 980000, 0, 980000, 'FC-0021', 'Pendiente'),
    ((SELECT id_proveedor FROM proveedor WHERE razon_social='GreenHome'), (SELECT id_suc FROM sucursal WHERE nombre='Sede Principal'), '2026-08-15', 'Cancelada', 420000, 0, 420000, 'FC-0020', 'Anulada'); -- mock: 'Suspendida'

