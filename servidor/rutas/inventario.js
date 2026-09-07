// Rutas para INVENTARIO
// Permite consultar y actualizar el stock de productos por sucursal

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todo el inventario con nombres de productos y sucursales
router.get('/', async (req, res) => {
  try {
    const [filas] = await pool.query(`
      SELECT 
        i.id_inventario AS id,
        p.id_pro,
        p.nombre AS producto,
        s.id_suc,
        s.nombre AS sucursal,
        COALESCE(i.ubicacion_fisica, 'Bodega Principal') AS ubicacion,
        i.cantidad,
        i.stock_minimo AS minimo,
        CASE 
          WHEN i.cantidad = 0 THEN 'Suspendido'
          WHEN i.cantidad <= i.stock_minimo THEN 'Bajo'
          ELSE 'OK'
        END AS estado
      FROM inventario i
      JOIN producto p ON i.id_pro = p.id_pro
      JOIN sucursal s ON i.id_suc = s.id_suc
      ORDER BY i.id_inventario ASC
    `);
    res.json(filas);
  } catch (error) {
    console.error('Error al obtener inventario:', error.message);
    res.status(500).json({ error: 'No se pudo cargar el inventario' });
  }
});

// Actualizar cantidad o ubicación física de un registro de inventario
router.put('/:id', async (req, res) => {
  try {
    const { cantidad, minimo, ubicacion } = req.body;
    await pool.query(`
      UPDATE inventario SET
        cantidad = COALESCE(?, cantidad),
        stock_minimo = COALESCE(?, stock_minimo),
        ubicacion_fisica = COALESCE(?, ubicacion_fisica)
      WHERE id_inventario = ?
    `, [cantidad, minimo, ubicacion, req.params.id]);

    res.json({ mensaje: 'Inventario actualizado correctamente', id: Number(req.params.id) });
  } catch (error) {
    console.error('Error al actualizar inventario:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el inventario' });
  }
});

// Registrar un nuevo producto en inventario
router.post('/', async (req, res) => {
  try {
    const { id_pro, id_suc = 1, ubicacion = 'Bodega Principal', cantidad = 0, minimo = 5 } = req.body;
    const [resultado] = await pool.query(`
      INSERT INTO inventario (id_pro, id_suc, ubicacion_fisica, cantidad, stock_minimo)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        cantidad = cantidad + VALUES(cantidad),
        ubicacion_fisica = VALUES(ubicacion_fisica)
    `, [id_pro, id_suc, ubicacion, cantidad, minimo]);

    res.status(201).json({ id: resultado.insertId, id_pro, id_suc, cantidad, minimo });
  } catch (error) {
    console.error('Error al agregar a inventario:', error.message);
    res.status(500).json({ error: 'No se pudo guardar el inventario' });
  }
});

export default router;
