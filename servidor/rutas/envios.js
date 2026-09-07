// Rutas para ENVIOS
// Maneja la tabla envio: despachos asociados a una venta con guía, transportadora y estado

import { Router } from 'express';
import pool from '../conexion.js';

const router = Router();

// Obtener todos los envíos con su venta, cliente y sucursal asociados
router.get('/', async (req, res) => {
  try {
    const [envios] = await pool.query(`
      SELECT
        e.id_envio AS id,
        e.id_venta,
        e.transportadora,
        e.numero_guia AS guia,
        e.fecha_despacho,
        e.fecha_estimada,
        e.fecha_entrega,
        e.costo_envio,
        e.cantidad_bultos,
        e.estado,
        e.observacion,
        CONCAT('ORD-', v.id_venta) AS orden,
        COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Cliente Mostrador') AS cliente,
        s.nombre AS sucursal,
        v.total
      FROM envio e
      JOIN venta v ON e.id_venta = v.id_venta
      LEFT JOIN usuario u ON v.id_cli = u.id_usu
      LEFT JOIN sucursal s ON v.id_suc = s.id_suc
      ORDER BY e.id_envio DESC
    `);
    res.json(envios);
  } catch (error) {
    console.error('Error al obtener envíos:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar los envíos' });
  }
});

// Obtener el detalle de un envío por su ID
router.get('/:id', async (req, res) => {
  try {
    const [filas] = await pool.query(`
      SELECT
        e.id_envio AS id,
        e.id_venta,
        e.transportadora,
        e.numero_guia AS guia,
        e.fecha_despacho,
        e.fecha_estimada,
        e.fecha_entrega,
        e.costo_envio,
        e.cantidad_bultos,
        e.estado,
        e.observacion,
        CONCAT('ORD-', v.id_venta) AS orden,
        COALESCE(CONCAT(u.nombre, ' ', u.apellido), 'Cliente Mostrador') AS cliente
      FROM envio e
      JOIN venta v ON e.id_venta = v.id_venta
      LEFT JOIN usuario u ON v.id_cli = u.id_usu
      WHERE e.id_envio = ?
    `, [req.params.id]);

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }
    res.json(filas[0]);
  } catch (error) {
    console.error('Error al obtener envío:', error.message);
    res.status(500).json({ error: 'No se pudo obtener el envío' });
  }
});

// Crear un envío asociado a una venta
router.post('/', async (req, res) => {
  try {
    const {
      id_venta,
      transportadora = null,
      numero_guia = null,
      fecha_despacho = null,
      fecha_estimada = null,
      costo_envio = 0,
      cantidad_bultos = 1,
      observacion = null,
      estado = 'Preparando'
    } = req.body;

    if (!id_venta) {
      return res.status(400).json({ error: 'El id_venta es obligatorio para crear un envío' });
    }

    const [resultado] = await pool.query(`
      INSERT INTO envio (id_venta, transportadora, numero_guia, fecha_despacho, fecha_estimada, costo_envio, cantidad_bultos, observacion, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id_venta, transportadora, numero_guia, fecha_despacho, fecha_estimada, costo_envio, cantidad_bultos, observacion, estado]);

    res.status(201).json({ id_envio: resultado.insertId, id_venta, estado });
  } catch (error) {
    console.error('Error al crear envío:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un envío para esta venta' });
    }
    res.status(500).json({ error: 'No se pudo crear el envío' });
  }
});

// Actualizar datos de un envío (transportadora, guía, fechas, costo, bultos, observación, estado)
router.put('/:id', async (req, res) => {
  try {
    const {
      transportadora,
      numero_guia,
      fecha_despacho,
      fecha_estimada,
      fecha_entrega,
      costo_envio,
      cantidad_bultos,
      observacion,
      estado
    } = req.body;

    await pool.query(`
      UPDATE envio SET
        transportadora = COALESCE(?, transportadora),
        numero_guia = COALESCE(?, numero_guia),
        fecha_despacho = COALESCE(?, fecha_despacho),
        fecha_estimada = COALESCE(?, fecha_estimada),
        fecha_entrega = COALESCE(?, fecha_entrega),
        costo_envio = COALESCE(?, costo_envio),
        cantidad_bultos = COALESCE(?, cantidad_bultos),
        observacion = COALESCE(?, observacion),
        estado = COALESCE(?, estado)
      WHERE id_envio = ?
    `, [transportadora, numero_guia, fecha_despacho, fecha_estimada, fecha_entrega,
        costo_envio, cantidad_bultos, observacion, estado, req.params.id]);

    res.json({ id_envio: Number(req.params.id), mensaje: 'Envío actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar envío:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El número de guía ya está en uso' });
    }
    res.status(500).json({ error: 'No se pudo actualizar el envío' });
  }
});

// Avanzar el estado de un envío de forma controlada
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const ahora = new Date();

    if (!estado) {
      return res.status(400).json({ error: 'El estado es obligatorio' });
    }

    // Si pasa a Entregado, registrar la fecha de entrega automáticamente
    let query = 'UPDATE envio SET estado = ? WHERE id_envio = ?';
    let params = [estado, req.params.id];
    if (estado === 'Entregado') {
      query = 'UPDATE envio SET estado = ?, fecha_entrega = ? WHERE id_envio = ?';
      params = [estado, ahora, req.params.id];
    }

    await pool.query(query, params);
    res.json({ id_envio: Number(req.params.id), estado });
  } catch (error) {
    console.error('Error al cambiar estado del envío:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el estado del envío' });
  }
});

export default router;