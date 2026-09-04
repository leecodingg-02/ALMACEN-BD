// Rutas para COMPRAS
// Permite consultar y registrar las órdenes de compra a proveedores

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todas las compras registradas con nombre del proveedor
router.get('/', async (req, res) => {
  try {
    const [compras] = await pool.query(`
      SELECT 
        c.id_compra AS id,
        DATE_FORMAT(c.fecha_compra, '%Y-%m-%d') AS fecha,
        pr.razon_social AS proveedor,
        c.id_proveedor,
        c.total,
        COALESCE(COUNT(dc.id_detcompra), 1) AS items,
        c.estado,
        COALESCE(c.numero_factura, CONCAT('FC-', LPAD(c.id_compra, 4, '0'))) AS factura,
        c.estado_pago
      FROM compra c
      LEFT JOIN proveedor pr ON c.id_proveedor = pr.id_proveedor
      LEFT JOIN detalle_compra dc ON c.id_compra = dc.id_compra
      GROUP BY c.id_compra, c.fecha_compra, pr.razon_social, c.id_proveedor, c.total, c.estado, c.numero_factura, c.estado_pago
      ORDER BY c.fecha_compra DESC, c.id_compra DESC
    `);
    res.json(compras);
  } catch (error) {
    console.error('Error al obtener compras:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las compras' });
  }
});

// Registrar una nueva compra
router.post('/', async (req, res) => {
  try {
    const {
      proveedor, // Nombre o ID
      id_proveedor,
      id_suc = 1,
      total,
      items = 1,
      estado = 'Pendiente',
      factura = `FC-${Date.now().toString().slice(-4)}`
    } = req.body;

    let provId = id_proveedor;

    // Si pasaron el nombre del proveedor en vez de ID, buscarlo o crearlo
    if (!provId && proveedor) {
      const [prov] = await pool.query('SELECT id_proveedor FROM proveedor WHERE razon_social = ? LIMIT 1', [proveedor]);
      if (prov.length > 0) {
        provId = prov[0].id_proveedor;
      } else {
        const [nuevoProv] = await pool.query(
          'INSERT INTO proveedor (razon_social, nit) VALUES (?, ?)',
          [proveedor, `NIT-${Date.now()}`]
        );
        provId = nuevoProv.insertId;
      }
    }

    const [resultado] = await pool.query(`
      INSERT INTO compra (id_proveedor, id_suc, total, subtotal, estado, numero_factura, estado_pago)
      VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')
    `, [provId || 1, id_suc, total, total, estado, factura]);

    res.status(201).json({
      id: resultado.insertId,
      fecha: new Date().toISOString().split('T')[0],
      proveedor,
      total,
      items,
      estado,
      factura
    });
  } catch (error) {
    console.error('Error al registrar compra:', error.message);
    res.status(500).json({ error: 'No se pudo guardar la compra' });
  }
});

// Cambiar estado de una compra (Aprobada, Recibida, Cancelada)
router.put('/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    await pool.query('UPDATE compra SET estado = ? WHERE id_compra = ?', [estado, req.params.id]);
    res.json({ mensaje: 'Compra actualizada', estado });
  } catch (error) {
    console.error('Error al actualizar compra:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar la compra' });
  }
});

export default router;
