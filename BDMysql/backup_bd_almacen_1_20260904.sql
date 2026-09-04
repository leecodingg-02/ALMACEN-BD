-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: bd_almacen_1
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `bd_almacen_1`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `bd_almacen_1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `bd_almacen_1`;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Herramientas','Herramientas manuales y eléctricas','Activo'),(2,'Muebles','Muebles para hogar y oficina','Activo'),(3,'Decoración','Artículos decorativos para el hogar','Activo'),(4,'Iluminación','Lámparas, bombillas y accesorios','Activo'),(5,'Baño y Cocina','Accesorios para baño y cocina','Activo'),(6,'Jardín','Plantas y artículos de jardinería','Inactivo');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra`
--

DROP TABLE IF EXISTS `compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `id_proveedor` int NOT NULL,
  `id_suc` int NOT NULL,
  `id_usuario` int DEFAULT NULL COMMENT 'Usuario del panel admin que registró la compra',
  `fecha_compra` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('Pendiente','Aprobada','Recibida','Cancelada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `impuesto` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `numero_factura` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_pago` enum('En Revision','Pendiente','Pagada','Anulada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `transportadora` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_guia` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL,
  PRIMARY KEY (`id_compra`),
  UNIQUE KEY `numero_factura` (`numero_factura`),
  KEY `fk_compra_proveedor` (`id_proveedor`),
  KEY `fk_compra_sucursal` (`id_suc`),
  KEY `fk_compra_usuario` (`id_usuario`),
  KEY `idx_compra_fecha_estado` (`fecha_compra`,`estado`),
  CONSTRAINT `fk_compra_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `fk_compra_sucursal` FOREIGN KEY (`id_suc`) REFERENCES `sucursal` (`id_suc`),
  CONSTRAINT `fk_compra_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usu`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra`
--

LOCK TABLES `compra` WRITE;
/*!40000 ALTER TABLE `compra` DISABLE KEYS */;
INSERT INTO `compra` VALUES (1,1,1,NULL,'2026-09-01 00:00:00','Recibida',1850000.00,0.00,1850000.00,'FC-0024','Pagada',NULL,NULL,NULL),(2,2,1,NULL,'2026-08-28 00:00:00','Aprobada',3200000.00,0.00,3200000.00,'FC-0023','Pendiente',NULL,NULL,NULL),(3,3,1,NULL,'2026-08-25 00:00:00','Recibida',5400000.00,0.00,5400000.00,'FC-0022','Pagada',NULL,NULL,NULL),(4,4,1,NULL,'2026-08-20 00:00:00','Pendiente',980000.00,0.00,980000.00,'FC-0021','Pendiente',NULL,NULL,NULL),(5,5,1,NULL,'2026-08-15 00:00:00','Cancelada',420000.00,0.00,420000.00,'FC-0020','Anulada',NULL,NULL,NULL);
/*!40000 ALTER TABLE `compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_compra`
--

DROP TABLE IF EXISTS `detalle_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compra` (
  `id_detcompra` int NOT NULL AUTO_INCREMENT,
  `id_compra` int NOT NULL,
  `id_pro` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detcompra`),
  KEY `fk_detalle_compra_compra` (`id_compra`),
  KEY `fk_detalle_compra_producto` (`id_pro`),
  CONSTRAINT `fk_detalle_compra_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_compra_producto` FOREIGN KEY (`id_pro`) REFERENCES `producto` (`id_pro`),
  CONSTRAINT `chk_detalle_compra_cantidad` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compra`
--

LOCK TABLES `detalle_compra` WRITE;
/*!40000 ALTER TABLE `detalle_compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `id_detventa` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_pro` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detventa`),
  KEY `fk_detalle_venta_venta` (`id_venta`),
  KEY `fk_detalle_venta_producto` (`id_pro`),
  CONSTRAINT `fk_detalle_venta_producto` FOREIGN KEY (`id_pro`) REFERENCES `producto` (`id_pro`),
  CONSTRAINT `fk_detalle_venta_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON DELETE CASCADE,
  CONSTRAINT `chk_detalle_venta_cantidad` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devolucion`
--

DROP TABLE IF EXISTS `devolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devolucion` (
  `id_devolucion` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_usu` int NOT NULL,
  `id_pro` int NOT NULL,
  `cantidad` int NOT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condicion_producto` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('Solicitada','Aprobada','Rechazada','Recibida','Reembolsada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Solicitada',
  `fecha_solicitud` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_resolucion` datetime DEFAULT NULL,
  `valor_reembolso` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_devolucion`),
  KEY `fk_devolucion_venta` (`id_venta`),
  KEY `fk_devolucion_usuario` (`id_usu`),
  KEY `fk_devolucion_producto` (`id_pro`),
  CONSTRAINT `fk_devolucion_producto` FOREIGN KEY (`id_pro`) REFERENCES `producto` (`id_pro`),
  CONSTRAINT `fk_devolucion_usuario` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`),
  CONSTRAINT `fk_devolucion_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`),
  CONSTRAINT `chk_devolucion_cantidad` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devolucion`
--

LOCK TABLES `devolucion` WRITE;
/*!40000 ALTER TABLE `devolucion` DISABLE KEYS */;
/*!40000 ALTER TABLE `devolucion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `envio`
--

DROP TABLE IF EXISTS `envio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `envio` (
  `id_envio` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `transportadora` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_guia` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_despacho` datetime DEFAULT NULL,
  `fecha_estimada` date DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `costo_envio` decimal(12,2) NOT NULL DEFAULT '0.00',
  `cantidad_bultos` int NOT NULL DEFAULT '1',
  `estado` enum('Preparando','En Transito','Entregado','Devuelto','Cancelado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Preparando',
  `observacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_envio`),
  UNIQUE KEY `id_venta` (`id_venta`),
  UNIQUE KEY `numero_guia` (`numero_guia`),
  CONSTRAINT `fk_envio_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`),
  CONSTRAINT `chk_envio_bultos` CHECK ((`cantidad_bultos` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `envio`
--

LOCK TABLES `envio` WRITE;
/*!40000 ALTER TABLE `envio` DISABLE KEYS */;
/*!40000 ALTER TABLE `envio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorito`
--

DROP TABLE IF EXISTS `favorito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorito` (
  `id_usu` int NOT NULL,
  `id_pro` int NOT NULL,
  `fecha_agregado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usu`,`id_pro`),
  KEY `fk_favorito_producto` (`id_pro`),
  CONSTRAINT `fk_favorito_producto` FOREIGN KEY (`id_pro`) REFERENCES `producto` (`id_pro`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorito_usuario` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorito`
--

LOCK TABLES `favorito` WRITE;
/*!40000 ALTER TABLE `favorito` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_inventario` int NOT NULL AUTO_INCREMENT,
  `id_pro` int NOT NULL,
  `id_suc` int NOT NULL,
  `ubicacion_fisica` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ej: Estante A-12, Bodega Pinturas B',
  `cantidad` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_inventario`),
  UNIQUE KEY `uq_inventario_producto_sucursal` (`id_pro`,`id_suc`),
  KEY `fk_inventario_sucursal` (`id_suc`),
  CONSTRAINT `fk_inventario_producto` FOREIGN KEY (`id_pro`) REFERENCES `producto` (`id_pro`),
  CONSTRAINT `fk_inventario_sucursal` FOREIGN KEY (`id_suc`) REFERENCES `sucursal` (`id_suc`),
  CONSTRAINT `chk_inventario_cantidad` CHECK ((`cantidad` >= 0)),
  CONSTRAINT `chk_inventario_minimo` CHECK ((`stock_minimo` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,1,1,'Estante A-12',45,10),(2,2,1,'Zona Muebles B',12,5),(3,3,1,'Estante C-04',4,10),(4,9,1,'Pasillo Decora 1',18,5),(5,11,2,'Estante Herram-02',3,8),(6,17,3,'Zona Oficina',0,5),(7,12,3,'Estante Luces A',6,15);
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca` (
  `id_marca` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pais` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_marca`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
INSERT INTO `marca` VALUES (1,'DeWalt','EE.UU.','ventas@dewalt.co','Activo'),(2,'Bosch','Alemania','bosch@bosch.co','Activo'),(3,'HomeStyle','Colombia','info@homestyleco.com','Activo'),(4,'GreenHome','Colombia','verde@greenhome.co','Activo'),(5,'LumEx','México','lumex@lumex.mx','Inactivo'),(6,'ErgoWork','España','ergo@ergowork.es','Activo'),(7,'ArtDeco',NULL,NULL,'Activo'),(8,'Sin Marca Registrada',NULL,NULL,'Activo');
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_inventario`
--

DROP TABLE IF EXISTS `movimiento_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_inventario` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_pro` int NOT NULL,
  `id_suc` int NOT NULL,
  `tipo_movimiento` enum('Compra','Venta','Ajuste','Devolucion','Traslado') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `referencia_tipo` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_id` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_movimiento_sucursal` (`id_suc`),
  KEY `fk_movimiento_usuario` (`id_usuario`),
  KEY `idx_movimiento_inventario_producto_sucursal` (`id_pro`,`id_suc`,`fecha`),
  CONSTRAINT `fk_movimiento_producto` FOREIGN KEY (`id_pro`) REFERENCES `producto` (`id_pro`),
  CONSTRAINT `fk_movimiento_sucursal` FOREIGN KEY (`id_suc`) REFERENCES `sucursal` (`id_suc`),
  CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usu`),
  CONSTRAINT `chk_movimiento_cantidad` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimiento_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `metodo` enum('Efectivo','Tarjeta','PSE','Nequi','Daviplata','Transferencia') COLLATE utf8mb4_unicode_ci NOT NULL,
  `proveedor_pago` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_externa` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `estado` enum('Pendiente','Aprobado','Rechazado','Reembolsado','Anulado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `fecha_intento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_confirmacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `fk_pago_venta` (`id_venta`),
  CONSTRAINT `fk_pago_venta` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`),
  CONSTRAINT `chk_pago_monto` CHECK ((`monto` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,1,'Tarjeta',NULL,NULL,289900.00,'Aprobado','2026-09-02 00:00:00','2026-09-02 00:00:00'),(2,2,'Efectivo',NULL,NULL,1250000.00,'Pendiente','2026-09-02 00:00:00',NULL),(3,3,'Transferencia',NULL,NULL,95000.00,'Pendiente','2026-09-01 00:00:00',NULL),(4,4,'Tarjeta',NULL,NULL,540000.00,'Aprobado','2026-09-01 00:00:00','2026-09-01 00:00:00'),(5,5,'Efectivo',NULL,NULL,189900.00,'Anulado','2026-08-31 00:00:00',NULL),(6,6,'Transferencia',NULL,NULL,320000.00,'Aprobado','2026-08-31 00:00:00','2026-08-31 00:00:00'),(7,7,'Tarjeta',NULL,NULL,820000.00,'Aprobado','2026-08-30 00:00:00','2026-08-30 00:00:00'),(8,8,'Transferencia',NULL,NULL,150000.00,'Pendiente','2026-08-29 00:00:00',NULL),(9,9,'Efectivo',NULL,NULL,430000.00,'Aprobado','2026-08-28 00:00:00','2026-08-28 00:00:00');
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_pro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_categoria` int NOT NULL,
  `id_marca` int NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `garantia_dias` int NOT NULL DEFAULT '0',
  `estado` enum('Activo','Agotado','Suspendido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pro`),
  KEY `idx_producto_categoria` (`id_categoria`),
  KEY `idx_producto_marca` (`id_marca`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `fk_producto_marca` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`),
  CONSTRAINT `chk_producto_precio` CHECK ((`precio` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Taladro Inalámbrico 20V',NULL,1,1,299900.00,NULL,0,'Activo','2026-09-03 19:54:56'),(2,'Sofá Modular 3 Puestos Tela Premium',NULL,2,3,1299900.00,NULL,0,'Activo','2026-09-03 19:54:56'),(3,'Lámpara Colgante Minimalista Negra',NULL,4,5,159900.00,NULL,0,'Activo','2026-09-03 19:54:56'),(4,'Estantería Industrial 5 Niveles',NULL,2,8,219900.00,NULL,0,'Activo','2026-09-03 19:54:56'),(5,'Mesa de Centro Industrial',NULL,2,8,189900.00,NULL,0,'Activo','2026-09-03 19:54:56'),(6,'Silla Nórdica Gris',NULL,2,8,145000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(7,'Lámpara de Pie Cromo',NULL,4,8,210000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(8,'Set de Herramientas 50 pzas',NULL,1,8,95900.00,NULL,365,'Activo','2026-09-03 19:54:56'),(9,'Espejo Decorativo Redondo',NULL,3,7,120000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(10,'Cuadro Minimalista Botánico',NULL,3,8,85000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(11,'Sierra Circular 1500W',NULL,1,8,345000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(12,'Foco Inteligente LED RGB',NULL,4,8,45000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(13,'Escritorio Minimalista Blanco',NULL,2,8,280000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(14,'Maceta de Cerámica Nórdica',NULL,3,8,35000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(15,'Martillo de Uña Curva',NULL,1,8,25000.00,NULL,1095,'Activo','2026-09-03 19:54:56'),(16,'Lámpara de Escritorio Ajustable',NULL,4,8,95000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(17,'Silla de Oficina Ergonómica',NULL,2,6,450000.00,NULL,0,'Agotado','2026-09-03 19:54:56'),(18,'Reloj de Pared Vintage',NULL,3,8,110000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(19,'Caja de Herramientas Metálica',NULL,1,8,135000.00,NULL,0,'Activo','2026-09-03 19:54:56'),(20,'Mueble para TV Moderno',NULL,2,8,320000.00,NULL,0,'Activo','2026-09-03 19:54:56');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `razon_social` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `nit` (`nit`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'DeWalt Colombia','900000001-1',NULL,NULL,NULL,NULL,'Activo','2026-09-03 19:54:55'),(2,'Bosch Distribuidora','900000002-1',NULL,NULL,NULL,NULL,'Activo','2026-09-03 19:54:55'),(3,'HomeStyle S.A.S','900000003-1',NULL,NULL,NULL,NULL,'Activo','2026-09-03 19:54:55'),(4,'LumEx México','900000004-1',NULL,NULL,NULL,NULL,'Activo','2026-09-03 19:54:55'),(5,'GreenHome','900000005-1',NULL,NULL,NULL,NULL,'Activo','2026-09-03 19:54:55');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador','Acceso total al sistema','#FFC107','Activo'),(2,'Cliente','Usuario comprador de la tienda','#4CAF50','Activo'),(3,'Proveedor','Usuario del portal de proveedores','#2196F3','Activo'),(4,'Supervisor','Supervisión de ventas e inventario','#3b82f6','Activo'),(5,'Vendedor','Gestión de ventas al cliente','#22c55e','Activo');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sucursal`
--

DROP TABLE IF EXISTS `sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sucursal` (
  `id_suc` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departamento` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_gerente` int DEFAULT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_suc`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `fk_sucursal_gerente` (`id_gerente`),
  CONSTRAINT `fk_sucursal_gerente` FOREIGN KEY (`id_gerente`) REFERENCES `usuario` (`id_usu`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursal`
--

LOCK TABLES `sucursal` WRITE;
/*!40000 ALTER TABLE `sucursal` DISABLE KEYS */;
INSERT INTO `sucursal` VALUES (1,'Sede Principal','Bogotá D.C.','Bogotá','Cra 15 # 93-75','601-234-5678',1,'Activo'),(2,'Sucursal Norte','Antioquia','Medellín','Calle 10 # 43-22','604-567-8901',2,'Activo'),(3,'Sucursal Sur','Valle del Cauca','Cali','Av. 6N # 23-45','602-345-6789',3,'Activo'),(4,'Sucursal Oriente','Santander','Bucaramanga','Calle 36 # 12-08','607-456-7890',4,'Inactivo');
/*!40000 ALTER TABLE `sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicacion`
--

DROP TABLE IF EXISTS `ubicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicacion` (
  `id_ubi` int NOT NULL AUTO_INCREMENT,
  `id_usu` int NOT NULL,
  `departamento` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `complemento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barrio` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_postal` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_ubi`),
  KEY `idx_ubicacion_usuario` (`id_usu`),
  CONSTRAINT `fk_ubicacion_usuario` FOREIGN KEY (`id_usu`) REFERENCES `usuario` (`id_usu`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicacion`
--

LOCK TABLES `ubicacion` WRITE;
/*!40000 ALTER TABLE `ubicacion` DISABLE KEYS */;
INSERT INTO `ubicacion` VALUES (1,6,'Bogotá D.C.','Bogotá','Carrera 7 # 45 - 20, Apto 502',NULL,NULL,NULL,NULL,1),(2,6,'Antioquia','Medellín','Calle 10 # 30 - 15, El Poblado',NULL,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `ubicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usu` int NOT NULL AUTO_INCREMENT,
  `tipo_doc` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'C.C',
  `num_ident` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_rol` int NOT NULL,
  `id_suc` int DEFAULT NULL,
  `alto_contraste` tinyint(1) NOT NULL DEFAULT '0',
  `tamano_fuente` enum('normal','grande','extra-grande') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `notificaciones_email` tinyint(1) NOT NULL DEFAULT '1',
  `estado` enum('Activo','Inactivo','Suspendido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usu`),
  UNIQUE KEY `num_ident` (`num_ident`),
  UNIQUE KEY `correo` (`correo`),
  KEY `idx_usuario_rol` (`id_rol`),
  KEY `idx_usuario_sucursal` (`id_suc`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `fk_usuario_sucursal` FOREIGN KEY (`id_suc`) REFERENCES `sucursal` (`id_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'C.C','PLACEHOLDER-001','Carlos','Rodríguez',NULL,'carlos@email.com','$2y$10$PLACEHOLDER_HASH_CAMBIAR_EN_PRODUCCION',1,1,0,'normal',1,'Activo','2024-01-15 00:00:00'),(2,'C.C','PLACEHOLDER-002','Luisa','Fernández',NULL,'luisa@email.com','$2y$10$PLACEHOLDER_HASH_CAMBIAR_EN_PRODUCCION',2,1,0,'normal',1,'Activo','2024-03-22 00:00:00'),(3,'C.C','PLACEHOLDER-003','Miguel Ángel','Torres',NULL,'miguel@email.com','$2y$10$PLACEHOLDER_HASH_CAMBIAR_EN_PRODUCCION',2,2,0,'normal',1,'Activo','2024-05-10 00:00:00'),(4,'C.C','PLACEHOLDER-004','Diana','Pérez',NULL,'diana@email.com','$2y$10$PLACEHOLDER_HASH_CAMBIAR_EN_PRODUCCION',2,3,0,'normal',1,'Suspendido','2024-07-01 00:00:00'),(5,'C.C','PLACEHOLDER-005','Andrés','Castro',NULL,'andres@email.com','$2y$10$PLACEHOLDER_HASH_CAMBIAR_EN_PRODUCCION',2,1,0,'normal',1,'Activo','2025-01-18 00:00:00'),(6,'C.C','1020304050','Johan','Pérez','3001234567','juan.perez@almacen.com','kevin123',2,NULL,0,'normal',0,'Activo','2026-09-03 19:54:56'),(8,'C.C','99999999','Prueba','Hash','3000000000','prueba.hash@test.com','$2b$10$aXw3/Wvxv5nkKdK5EbkBouv8ItQTrFHZifd11wkI2TtdOG6PIasJi',2,NULL,0,'normal',1,'Activo','2026-09-03 22:57:37');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `id_cli` int DEFAULT NULL,
  `id_suc` int NOT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('Pendiente','Completada','Cancelada','Reembolsada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `impuesto` decimal(12,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `numero_factura` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_venta`),
  UNIQUE KEY `numero_factura` (`numero_factura`),
  KEY `fk_venta_cliente` (`id_cli`),
  KEY `fk_venta_sucursal` (`id_suc`),
  KEY `idx_venta_fecha_estado` (`fecha_venta`,`estado`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`id_cli`) REFERENCES `usuario` (`id_usu`),
  CONSTRAINT `fk_venta_sucursal` FOREIGN KEY (`id_suc`) REFERENCES `sucursal` (`id_suc`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES (1,6,1,'2026-09-02 00:00:00','Completada',289900.00,0.00,0.00,289900.00,NULL),(2,NULL,1,'2026-09-02 00:00:00','Pendiente',1250000.00,0.00,0.00,1250000.00,NULL),(3,NULL,1,'2026-09-01 00:00:00','Pendiente',95000.00,0.00,0.00,95000.00,NULL),(4,NULL,1,'2026-09-01 00:00:00','Completada',540000.00,0.00,0.00,540000.00,NULL),(5,NULL,1,'2026-08-31 00:00:00','Cancelada',189900.00,0.00,0.00,189900.00,NULL),(6,NULL,1,'2026-08-31 00:00:00','Completada',320000.00,0.00,0.00,320000.00,NULL),(7,NULL,1,'2026-08-30 00:00:00','Completada',820000.00,0.00,0.00,820000.00,NULL),(8,NULL,1,'2026-08-29 00:00:00','Pendiente',150000.00,0.00,0.00,150000.00,NULL),(9,NULL,1,'2026-08-28 00:00:00','Completada',430000.00,0.00,0.00,430000.00,NULL);
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'bd_almacen_1'
--

--
-- Dumping routines for database 'bd_almacen_1'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-03 23:17:50
