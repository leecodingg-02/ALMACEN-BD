// Rutas para UBICACIONES
// Maneja tanto ubicaciones de almacén como direcciones de clientes

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Ubicaciones físicas del almacén
router.get('/', async (req, res) => {
  try {
    // Si la tabla ubicacion tiene id_usu, es para clientes.
    // Para almacén físico combinamos con datos de inventario y sucursal
    const [filas] = await pool.query(`
      SELECT 
        i.id_inventario AS id,
        COALESCE(i.ubicacion_fisica, 'Estante A-01') AS nombre,
        c.nombre AS zona,
        s.nombre AS sucursal,
        (i.stock_minimo * 4) AS capacidad,
        i.cantidad AS ocupacion,
        CONCAT('Zona de ', c.nombre, ' en ', s.nombre) AS descripcion,
        'Activo' AS estado
      FROM inventario i
      JOIN producto p ON i.id_pro = p.id_pro
      JOIN categoria c ON p.id_categoria = c.id_categoria
      JOIN sucursal s ON i.id_suc = s.id_suc
      ORDER BY i.id_inventario ASC
    `);

    // Si no hay datos en inventario, devolvemos ubicaciones predeterminadas
    if (filas.length === 0) {
      return res.json([
        { id: 1, nombre: 'Estante A', zona: 'Herramientas', sucursal: 'Sede Principal', capacidad: 200, ocupacion: 145, descripcion: 'Estante principal área herramientas', estado: 'Activo' },
        { id: 2, nombre: 'Zona Muebles B', zona: 'Muebles', sucursal: 'Sede Principal', capacidad: 50, ocupacion: 32, descripcion: 'Exhibición de muebles grandes', estado: 'Activo' },
        { id: 3, nombre: 'Pasillo 3', zona: 'Decoración', sucursal: 'Sucursal Norte', capacidad: 300, ocupacion: 187, descripcion: 'Pasillo central de decoración', estado: 'Activo' },
        { id: 4, nombre: 'Estante C', zona: 'Iluminación', sucursal: 'Sede Principal', capacidad: 150, ocupacion: 89, descripcion: 'Lámparas y accesorios de luz', estado: 'Activo' },
        { id: 5, nombre: 'Zona Oficina', zona: 'Muebles', sucursal: 'Sucursal Sur', capacidad: 30, ocupacion: 8, descripcion: 'Mobiliario de oficina', estado: 'Suspendido' },
      ]);
    }

    res.json(filas);
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las ubicaciones' });
  }
});

export default router;
